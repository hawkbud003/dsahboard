from django.contrib import admin

from .models import (
    UserWallet,
    Campaign,
    CampaignImage,
    CampaignVideo,
    CityData,
    Keyword,
    Location,
    UserProfile,
    UserType,
    target_type,
    Age,
    CarrierData,
    Environment,
    Exchange,
    Language,
    Impression,
    DevicePrice,
    Device,
    DistinctInterest,
    BrandSafety,
    BuyType,
    Bidding_detail,
    Viewability,
    weather,
    tag_tracker,
    CampaignFile,
    Creative
)


class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id","user", "city", "phone_no","company_name","gst")
    search_fields = ("user","company_name")
    list_filter = ("user",)
    ordering = ("user",)


class UserTypeAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "user_type_pm")
    search_fields = ("user",)
    list_filter = ("user",)
    ordering = ("user",)

class AgeAdmin(admin.ModelAdmin):
    list_display = ("id","age","label")

class Bidding_detailAdmin(admin.ModelAdmin):
    list_display = ("id", "buy_type","unit_rate")

class LanguageAdmin(admin.ModelAdmin):
    list_display = ("language", "iso_code", "label")
    search_fields = ("language",)
    list_filter = ("language",)
    ordering = ("language",)

class ExchangeAdmin(admin.ModelAdmin):
    list_display = ("exchange", "label")
    search_fields = ("exchange",)
    list_filter = ("exchange",)
    ordering = ("exchange",)

class CarrierDataAdmin(admin.ModelAdmin):
    list_display = ("carrier", "label")

class EnvironmentAdmin(admin.ModelAdmin):
    list_display = ("env", "label")


class BrandSafetyAdmin(admin.ModelAdmin):
    list_display = ("value", "label")

class BuyTypeAdmin(admin.ModelAdmin):
    list_display = ("value", "label")

class ViewabilityAdmin(admin.ModelAdmin):
    list_display = ("value", "label")

class target_typeAdmin(admin.ModelAdmin):
    list_display = ("category", "subcategory")




class LocationAdmin(admin.ModelAdmin):
    list_display = ("country", "state", "city", "tier", "population")
    search_fields = ("country",)
    list_filter = ("country",)
    ordering = ("country",)


class CampaignAdmin(admin.ModelAdmin):
    list_display = ('id', "name", "objective", "start_time", "end_time", "status")
    search_fields = ("name", "objective", "status")
    list_filter = ("name", "objective", "status")
    ordering = ("name", "objective", "status")


class CampaignVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "video", "created_at")


class DistinctInterestAdmin(admin.ModelAdmin):
    list_display = ("id", "interest", "label")


class DeviceAdmin(admin.ModelAdmin):
    list_display=("id", "device", "label")

class DevicePriceAdmin(admin.ModelAdmin):
    list_display=("id", "price", "label")    

class KeywordAdmin(admin.ModelAdmin):
    list_display = ("id", "file", "uploaded_at", "keywords")

class CampaignImageAdmin(admin.ModelAdmin):
    list_display = ("id", "image", "created_at")
    

class CampaignFileAdmin(admin.ModelAdmin):
    list_display = ("id", "campaign", "created_at","updated_at","file")    


admin.site.register(CampaignFile,CampaignFileAdmin)
admin.site.register(weather)
admin.site.register(UserWallet)
admin.site.register(tag_tracker)
admin.site.register(UserType, UserTypeAdmin)
admin.site.register(UserProfile, UserProfileAdmin)
admin.site.register(Campaign,CampaignAdmin)
admin.site.register(Location, LocationAdmin)
admin.site.register(target_type, target_typeAdmin)
admin.site.register(CampaignImage, CampaignImageAdmin)
admin.site.register(Keyword,KeywordAdmin)
admin.site.register(Age, AgeAdmin)
admin.site.register(CarrierData, CarrierDataAdmin)
admin.site.register(Environment, EnvironmentAdmin)
admin.site.register(Exchange, ExchangeAdmin)
admin.site.register(Language, LanguageAdmin)
admin.site.register(Impression)
admin.site.register(DevicePrice, DevicePriceAdmin)
admin.site.register(Device, DeviceAdmin)
admin.site.register(DistinctInterest, DistinctInterestAdmin)
admin.site.register(CampaignVideo, CampaignVideoAdmin)
admin.site.register(BrandSafety, BrandSafetyAdmin)
admin.site.register(BuyType, BuyTypeAdmin)
admin.site.register(Bidding_detail, Bidding_detailAdmin)
admin.site.register(Viewability, ViewabilityAdmin)

@admin.register(Creative)
class CreativeAdmin(admin.ModelAdmin):
    list_display = ('name', 'user', 'creative_type')
    list_filter = ('creative_type', 'created_at')
    search_fields = ('name', 'user__username')
    readonly_fields = ('created_at', 'updated_at')

    

@admin.register(CityData)
class CityDataAdmin(admin.ModelAdmin):
    list_display = ("city", "state", "country", "tier", "city_population")
    search_fields = ("city", "state", "country", "tier")
