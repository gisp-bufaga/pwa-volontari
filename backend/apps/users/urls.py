"""
URLs for users app (authentication endpoints)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView, LogoutView, ProfileView, ChangePasswordView,
    UserViewSet, WorkAreaViewSet
)

router = DefaultRouter()
router.register('users', UserViewSet, basename='user')
router.register('work-areas', WorkAreaViewSet, basename='workarea')

urlpatterns = [
    # Authentication
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('change-password/', ChangePasswordView.as_view(), name='change_password'),
    
    # Users and Work Areas (REST endpoints)
    path('', include(router.urls)),
]