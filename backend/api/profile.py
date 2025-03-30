import logging

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import UserProfile,UserType
from .serializers import UserSerializer, UserUpdateSerializer

logger = logging.getLogger(__name__)


def success_response(message, data=None, status_code=status.HTTP_200_OK):
    """Utility for generating a consistent success response."""
    return Response(
        {"message": message, "data": data, "success": True}, status=status_code
    )


def error_response(message, status_code=status.HTTP_400_BAD_REQUEST):
    """Utility for generating a consistent error response."""
    return Response(
        {"message": message, "success": False, "data": []}, status=status_code
    )


class UserUpdateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def put(self, request):
        user = request.user
        serializer = UserUpdateSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"message": "User updated successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return error_response(serializer.errors)


class UserPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = "page_size"
    max_page_size = 100


class UserAPIView(APIView):
    def get(self, request, pk=None):
        """
        Handles GET requests for retrieving a single user or a paginated list of users.
        """
        if pk:
            # Fetch a specific user by primary key (pk)
            try:
                user = User.objects.get(pk=pk)
                serializer = UserSerializer(user)
                return Response(serializer.data, status=status.HTTP_200_OK)
            except User.DoesNotExist:
                return Response(
                    {"error": "User not found"}, status=status.HTTP_404_NOT_FOUND
                )
        else:
            # Fetch all users and apply pagination
            users = User.objects.all()
            paginator = UserPagination()
            paginated_users = paginator.paginate_queryset(users, request)
            serializer = UserSerializer(paginated_users, many=True)
            return paginator.get_paginated_response(serializer.data)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def profile_api(request):
    user_profile = UserProfile.objects.filter(user=request.user).first()
    user_type = UserType.objects.filter(user=request.user).first()

    # Initialize default values
    city = ""
    phone_no = ""
    company_name = ""
    gst = ""
    logo = ""

    if user_profile:
        city = user_profile.city
        phone_no = user_profile.phone_no
        company_name = user_profile.company_name
        gst = user_profile.gst
        # Check if logo exists and return its URL
        if user_profile.logo:
            # Build an absolute URL if needed
            logo = request.build_absolute_uri(user_profile.logo.url)
        print(f"City: {city}, Phone No: {phone_no}")

    data = {
        "id": request.user.id,
        "username": request.user.username,
        "first_name": request.user.first_name,
        "last_name": request.user.last_name,
        "email": request.user.email,
        "city": city,
        "phone_no": phone_no,
        "company_name": company_name,
        "gst": gst,
        "logo": logo,
        "user_type": user_type.user_type_pm if user_type else None
    }
    return success_response("Data successfully fetched", data)


