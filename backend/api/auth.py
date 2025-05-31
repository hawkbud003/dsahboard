import logging

from django.conf import settings
from django.contrib.auth.models import User
from django.core.mail import send_mail
from rest_framework import status
from rest_framework.exceptions import AuthenticationFailed
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView, TokenVerifyView

from .models import UserType, UserProfile,UserWallet
from .serializers import (ChangePasswordSerializer,
                          CustomTokenObtainPairSerializer)

logger = logging.getLogger(__name__)


# Utility Functions
def success_response(message, data=None, status_code=status.HTTP_200_OK):
    response_data = {
        "status": "success",
        "message": message,
    }
    if data is not None:
        response_data["data"] = data
    
    response = Response(response_data, status=status_code)
    # Add CORS headers
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    response_data = {
        "status": "error",
        "message": message,
    }
    response = Response(response_data, status=status_code)
    # Add CORS headers
    response["Access-Control-Allow-Origin"] = "*"
    response["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

from rest_framework.parsers import MultiPartParser, FormParser

class RegisterView(APIView):
    permission_classes = [AllowAny]
    parser_classes = (MultiPartParser, FormParser)  
    def post(self, request):
        password = request.data.get("password")
        email = request.data.get("email")
        first_name = request.data.get("first_name")
        last_name = request.data.get("last_name")
        company_name = request.data.get("company_name")
        gst   = request.data.get("gst")
        logo = request.FILES.get("logo")
        username = email
        if not username or not password or not email:
            return error_response("All fields are required.")

        if "@" not in email:
            return error_response(
                "Invalid email format. Please include '@' in the email address."
            )
    
        if User.objects.filter(username=username).exists():
            return error_response("Username already exists.")
        
        if logo:
            # Optional: Add file validation for the logo
            if not logo.name.endswith(('.png', '.jpg', '.jpeg')):
                return error_response("Invalid logo format. Only PNG, JPG, JPEG allowed.")
        try:
            user = User.objects.create_user(
                username=username,
                password=password,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            UserType.objects.create(user=user)
            UserWallet.objects.create(user=user,amount=0)
            user_profile = UserProfile.objects.create(user=user, company_name=company_name, gst=gst)
            if logo:
                user_profile.logo = logo  # Assuming the 'logo' field is added in the UserProfile model
                user_profile.save()
            return success_response(
                "User created successfully.", {"id": user.id}, status.HTTP_201_CREATED
            )
        except Exception as e:
            logger.error(f"Error creating user: {e}")
            return error_response("Failed to create user.")


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        refresh_token = request.data.get("refresh")
        if not refresh_token:
            return error_response("Refresh token is required.")

        try:
            token = RefreshToken(refresh_token)
            token.blacklist()
            return success_response("Logout successful.")
        except Exception as e:
            logger.error(f"Error during logout: {e}")
            return error_response("Invalid token.")


class ForgotPasswordView(APIView):
    def post(self, request):
        email = request.data.get("email")
        if not email:
            return error_response("Email is required.")

        user = User.objects.filter(email=email).first()
        if not user:
            return error_response(
                "No user found with this email.", status.HTTP_404_NOT_FOUND
            )

        try:
            reset_link = f"http://example.com/reset-password/{user.id}/"  # Replace with actual frontend link
            send_mail(
                subject="Password Reset Request",
                message=f"Hi {user.username},\n\nUse the following link to reset your password:\n{reset_link}",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
            )
            return success_response("Password reset link sent to your email.")
        except Exception as e:
            logger.error(f"Error sending password reset email: {e}")
            return error_response("Failed to send email.")


class UpdatePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        current_password = request.data.get("current_password")
        new_password = request.data.get("new_password")

        if not current_password or not new_password:
            return error_response(
                "Both current_password and new_password are required."
            )

        if len(new_password) < 8:
            return error_response("New password must be at least 8 characters long.")

        user = request.user
        if not user.check_password(current_password):
            return error_response("Current password is incorrect.")

        user.set_password(new_password)
        user.save()
        return success_response("Password updated successfully.")


class ChangePasswordAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request, *args, **kwargs):
        serializer = ChangePasswordSerializer(
            data=request.data, context={"request": request}
        )
        if serializer.is_valid():
            serializer.save()
            return success_response("Password updated successfully", serializer.data)
        return error_response(serializer.errors)


class CustomTokenObtainPairView(APIView):
    permission_classes = [AllowAny]
    
    def options(self, request, *args, **kwargs):
        response = Response(status=status.HTTP_200_OK)
        response["Access-Control-Allow-Origin"] = "*"
        response["Access-Control-Allow-Methods"] = "POST, OPTIONS"
        response["Access-Control-Allow-Headers"] = "Content-Type, Authorization, X-Requested-With"
        response["Access-Control-Max-Age"] = "86400"  # 24 hours
        return response
    
    def post(self, request, *args, **kwargs):
        # Add CORS headers to the request
        request.META['HTTP_ACCESS_CONTROL_ALLOW_ORIGIN'] = '*'
        
        serializer = CustomTokenObtainPairSerializer(data=request.data)
        if serializer.is_valid():
            try:
                data = serializer.validated_data
                response = success_response("Token generated successfully", data)
                # Add CORS headers to the response
                response["Access-Control-Allow-Origin"] = "*"
                response["Access-Control-Allow-Credentials"] = "true"
                return response
            except Exception as e:
                logger.error(f"Error generating token: {e}")
                error_resp = error_response("Failed to generate token", status.HTTP_401_UNAUTHORIZED)
                error_resp["Access-Control-Allow-Origin"] = "*"
                return error_resp
        
        error_resp = error_response(serializer.errors, status.HTTP_400_BAD_REQUEST)
        error_resp["Access-Control-Allow-Origin"] = "*"
        return error_resp


class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            # Attempt to refresh the token
            return super().post(request, *args, **kwargs)
        except TokenError:
            return Response(
                {
                    "message": "Your refresh token is invalid or has expired.",
                    "success": False,
                    "data": [],
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except AuthenticationFailed:
            return Response(
                {
                    "message": "Authentication failed. Please check your credentials.",
                    "success": False,
                    "data": [],
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )


class CustomTokenVerifyView(TokenVerifyView):
    def post(self, request, *args, **kwargs):
        try:
            # Attempt to verify the token
            return super().post(request, *args, **kwargs)
        except TokenError:
            # Catch TokenError and return a custom error message
            return Response(
                {
                    "message": "Token verification failed. The token may be invalid or expired.",
                    "success": False,
                    "data": [],
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
        except AuthenticationFailed:
            # Handle general authentication failure
            return Response(
                {
                    "message": "Authentication failed. Please check your token.",
                    "success": False,
                    "data": [],
                },
                status=status.HTTP_401_UNAUTHORIZED,
            )
