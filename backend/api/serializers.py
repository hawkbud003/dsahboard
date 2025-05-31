from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from storages.backends.s3boto3 import S3Boto3Storage
from .models import (Campaign, CampaignImage, Keyword, Location, UserType, CampaignVideo, Creative,
                     proximity, proximity_store, target_type, weather, UserProfile, Bidding_detail,  BrandSafety,
    BuyType,
    Viewability,tag_tracker,CampaignFile, UserWallet)



class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'first_name', 'last_name', 'email')

class CustomTokenObtainPairSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        if not username or not password:
            raise serializers.ValidationError("Both username and password are required.")

        user = authenticate(username=username, password=password)
        if user is None:
            try:
                user = User.objects.get(email=username)
                if not user.check_password(password):
                    raise serializers.ValidationError("Invalid credentials")
            except User.DoesNotExist:
                raise serializers.ValidationError("Invalid credentials")

        refresh = RefreshToken.for_user(user)
        try:
            user_type = UserType.objects.get(user=user)
            is_pm = user_type.user_type_pm
        except UserType.DoesNotExist:
            is_pm = False

        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user_type": is_pm,
        }


class UpdateProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["email", "first_name", "last_name"]

    def validate_email(self, value):
        # Ensure the email is unique for other users
        if User.objects.filter(email=value).exclude(pk=self.instance.pk).exists():
            raise serializers.ValidationError("This email is already taken.")
        return value


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ["city", "phone_no", "company_name","gst","logo"]


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    class Meta:
        model = User
        fields = ["id", "username", "email", "first_name", "last_name", "date_joined", "profile"]


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(required=True, write_only=True)
    new_password = serializers.CharField(required=True, write_only=True)
    confirm_new_password = serializers.CharField(required=True, write_only=True)

    def validate(self, data):
        user = self.context["request"].user
        if not user.check_password(data["old_password"]):
            raise serializers.ValidationError(
                {"old_password": "Old password is not correct."}
            )
        if data["new_password"] != data["confirm_new_password"]:
            raise serializers.ValidationError(
                {"confirm_new_password": "Passwords do not match."}
            )
        try:
            validate_password(data["new_password"], user)
        except ValidationError as e:
            raise serializers.ValidationError({"new_password": e.messages})
        return data

    def save(self):
        user = self.context["request"].user
        user.set_password(self.validated_data["new_password"])
        user.save()
        return user


class LocationSerializer(serializers.ModelSerializer):
    population = serializers.SerializerMethodField()
    
    class Meta:
        model = Location
        fields = ["id", "country", "state", "city", "tier", "population"]
    
    def get_population(self, obj):
        # Convert population string to integer by removing commas and converting to int
        try:
            # Remove commas from the population string
            population_str = obj.population.replace(',', '')
            # Convert to integer
            return int(population_str)
        except (ValueError, AttributeError):
            # Return 0 if conversion fails
            return 0


class target_typeSerializer(serializers.ModelSerializer):
    class Meta:
        model = target_type
        fields = ["id", "category", "subcategory"]

class BiddingDetailsSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bidding_detail
        fields = ["id", "buy_type", "unit_rate"]


class CampaignImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignImage
        fields = ["id", "image", "created_at"]


class CampaignVideoSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignVideo
        fields = ["id", "video", "created_at"]



class CampaignFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = CampaignFile
        fields = "__all__"
        

class KeywordSerializer(serializers.ModelSerializer):
    class Meta:
        model = Keyword
        fields = ["id", "file", "keywords"]

    def validate(self, data):
        # Check if both 'file' and 'keywords' are empty
        if not data.get("file") and not data.get("keywords"):
            raise serializers.ValidationError(
                "Either 'file' or 'keywords' must be provided."
            )
        return data


class ProximityStoreSerializer(serializers.ModelSerializer):
    class Meta:
        model = proximity_store
        fields = ["id", "file"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["file"].required = True


class ProximitySerializer(serializers.ModelSerializer):
    class Meta:
        model = proximity
        fields = ["id", "file"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["file"].required = True


class WeatherSerializer(serializers.ModelSerializer):
    class Meta:
        model = weather
        fields = ["id", "file"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["file"].required = True

class tag_trackerSerializer(serializers.ModelSerializer):
    class Meta:
        model = tag_tracker
        fields = ["id", "file"]

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.fields["file"].required = True

class CreativeSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = Creative
        fields = ['id', 'name', 'creative_type', 'file', 'description']

class CampaignSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    images = CampaignImageSerializer(many=True, read_only=True)
    keywords = KeywordSerializer(many=True, read_only=True)
    proximity_store = ProximityStoreSerializer(many=True, read_only=True)
    proximity = ProximitySerializer(many=True, read_only=True)
    weather = WeatherSerializer(many=True, read_only=True)
    location = LocationSerializer(many=True, read_only=True)
    target_type = target_typeSerializer(many=True, read_only=True)
    video = CampaignVideoSerializer(many=True, read_only=True)
    tag_tracker = tag_trackerSerializer(many=True, read_only=True)
    creative = CreativeSerializer(many=True, read_only=True)
    campaign_files = CampaignFileSerializer(many=True, read_only=True)
    
    class Meta:
        model = Campaign
        fields = "__all__"




        

class CampaignCreateUpdateSerializer(serializers.ModelSerializer):
    images = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CampaignImage.objects.all(), required=False
    )
    video = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CampaignVideo.objects.all(), required=False
    )
    keywords = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Keyword.objects.all(), required=False
    )
    target_type = serializers.PrimaryKeyRelatedField(
        many=True, queryset=target_type.objects.all(), required=False
    )

    location = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Location.objects.all(), required=False
    )
    proximity_store = serializers.PrimaryKeyRelatedField(
        many=True, queryset=proximity_store.objects.all(), required=False
    )
    proximity = serializers.PrimaryKeyRelatedField(
        many=True, queryset=proximity.objects.all(), required=False
    )
    weather = serializers.PrimaryKeyRelatedField(
        many=True, queryset=weather.objects.all(), required=False
    )
    tag_tracker = serializers.PrimaryKeyRelatedField(
        many=True, queryset=tag_tracker.objects.all(), required=False
    )
    creative = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Creative.objects.all(), required=False
    )
    class Meta:
        model = Campaign
        fields = "__all__"

    def create(self, validated_data):
        images = validated_data.pop("images", [])
        video = validated_data.pop("video", [])
        keywords = validated_data.pop("keywords", [])
        location = validated_data.pop("location", [])
        proximity_store = validated_data.pop("proximity_store", [])
        proximity = validated_data.pop("proximity", [])
        weather = validated_data.pop("weather", [])
        target_type = validated_data.pop("target_type", [])
        tag_tracker = validated_data.pop("tag_tracker", [])
        creative = validated_data.pop("creative", [])
        
        campaign = Campaign.objects.create(**validated_data)
        campaign.location.set(location)
        campaign.images.set(images)
        campaign.keywords.set(keywords)
        campaign.proximity_store.set(proximity_store)
        campaign.proximity.set(proximity)
        campaign.weather.set(weather)
        campaign.target_type.set(target_type)
        campaign.video.set(video)
        campaign.tag_tracker.set(tag_tracker)
        campaign.creative.set(creative)
        
        return campaign


class UserUpdateSerializer(serializers.ModelSerializer):
    city = serializers.CharField(source="profile.city", required=False)
    phone_no = serializers.CharField(source="profile.phone_no", required=False)
    company_name = serializers.CharField(source="profile.company_name", required=False)
    gst = serializers.CharField(source="profile.gst", required=False)
    logo = serializers.ImageField(source="profile.logo", required=False)
    

    class Meta:
        model = User
        fields = ["email", "first_name", "last_name", "city", "phone_no","company_name","gst","logo"]

    def update(self, instance, validated_data):
        profile_data = validated_data.pop("profile", {})
        instance.email = validated_data.get("email", instance.email)
        instance.first_name = validated_data.get("first_name", instance.first_name)
        instance.last_name = validated_data.get("last_name", instance.last_name)
        instance.save()

        profile = instance.profile
        profile.city = profile_data.get("city", profile.city)
        profile.phone_no = profile_data.get("phone_no", profile.phone_no)
        profile.company_name = profile_data.get("company_name", profile.company_name)
        profile.gst = profile_data.get("gst", profile.gst)
        profile.logo = profile_data.get("logo", profile.logo)

        profile.save()

        return instance

class UserWalletSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = UserWallet
        fields = ['id', 'user', 'user_id', 'amount', 'created_at', 'updated_at']

class UserWalletUpdateSerializer(serializers.Serializer):
    user_id = serializers.IntegerField()
    amount = serializers.DecimalField(max_digits=10, decimal_places=2)
    action = serializers.ChoiceField(choices=['add', 'subtract'])

    def validate(self, data):
        try:
            user = User.objects.get(id=data['user_id'])
            if not UserWallet.objects.filter(user=user).exists():
                UserWallet.objects.create(user=user)
        except User.DoesNotExist:
            raise serializers.ValidationError("User does not exist")
        return data
