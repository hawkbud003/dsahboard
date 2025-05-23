from api import auth, profile, views
from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r"campaigns", views.CampaignViewSet, basename="campaign")
router.register(
    r"campaign-images", views.CampaignImageViewSet, basename="campaign-image"
)
router.register(
    r"campaign-video", views.CampaignVideoViewSet, basename="campaign-video"
)
router.register(r"keywords", views.KeywordViewSet, basename="keyword")
router.register(
    r"proximityStore", views.ProximityStoreViewSet, basename="proximityStore"
)
router.register(r"proximity", views.ProximityViewSet, basename="proximity")
router.register(r"weather", views.WeatherViewSet, basename="weather")
router.register(r"biddingDetails", views.BiddingDetailsViewSet, basename="biddingDetails")
router.register(r"tag_tacker", views.tag_trackerViewSet, basename="tag_tacker")
router.register(r'creatives', views.CreativeViewSet, basename='creative')
urlpatterns = [
    path('dashboard/performance/', views.get_campaign_performance, name='campaign-performance'),
    path('dashboard/status-distribution/', views.get_campaign_status_distribution, name='campaign-status-distribution'),
    path('dashboard/type-distribution/', views.get_campaign_type_distribution, name='campaign-type-distribution'),
    path('dashboard/metrics/', views.get_campaign_metrics, name='campaign-metrics'),
    path("health/", views.health_check),
    path("creative_list/", views.creative_list_all),
    path('get-csv/<int:campaign_id>', views.FileGetView.as_view(), name='mymodel-csv'),
    path("login/", views.login_page, name="login"),

  
    path("admin/", admin.site.urls),
    path("age/", views.age_api, name="age_api"),
    path("brandSafety/", views.brandSafety_api, name="brandSafety_api"),
    path("viewability/", views.Viewability_api, name="Viewability_api"),
    path("buyType/", views.BuyType_api, name="BuyType_api"),
    path("devicePrice/", views.DevicePrice_api, name="DevicePrice_api"),
    path("device/", views.Device_api, name="Device_api"),
    path("distinctInterest/", views.DistinctInterest_api, name="DistinctInterest_api"),
    path("carrierData/", views.CarrierData_api, name="CarrierData_api"),
    path("environment/", views.Environment_api, name="Environment_api"),
    path("exchange/", views.Exchange_api, name="Exchange_api"),
    path("language/", views.Language_api, name="Language_api"),
    path("impression/", views.Impression_api, name="Impression_api"),
    path("api/register/", auth.RegisterView.as_view(), name="register"),
    path("api/logout/", auth.LogoutView.as_view(), name="logout"),
    path(
        "api/forgot-password/",
        auth.ForgotPasswordView.as_view(),
        name="forgot_password",
    ),
    path(
        "api/user/change-password/",
        auth.ChangePasswordAPIView.as_view(),
        name="change_password",
    ),
    path("", views.home, name="home"),
    path(
        "api/update-password/",
        auth.UpdatePasswordView.as_view(),
        name="update_password",
    ),
    path(
        "api/user/update/", profile.UserUpdateAPIView.as_view(), name="update_profile"
    ),
    path(
        "api/token/", auth.CustomTokenObtainPairView.as_view(), name="token_obtain_pair"
    ),
    path(
        "api/token/refresh/",
        auth.CustomTokenRefreshView.as_view(),
        name="token_refresh",
    ),
    path(
        "api/token/verify/", auth.CustomTokenVerifyView.as_view(), name="token_verify"
    ),
    path(
        "api/fetch_user_campgain/",
        views.fetch_user_campgain,
        name="fetch_user_campgain",
    ),
    path("api/location/", views.location, name="location"),
    path("api/target_type/", views.target_type_view, name="target_type"),
    path("api/profile/", profile.profile_api, name="profile"),
    path("api/users/", profile.UserAPIView.as_view(), name="user-list"),
    path("api/users/<int:pk>/", profile.UserAPIView.as_view(), name="user-detail"),
    path("api/", include(router.urls)),
]
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
