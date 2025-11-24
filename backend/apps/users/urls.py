"""
URLs for users app (authentication endpoints)
"""

from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
# from .views import LoginView, LogoutView, UserProfileView

urlpatterns = [
    # JWT Authentication
    # path('login/', LoginView.as_view(), name='login'),
    # path('logout/', LogoutView.as_view(), name='logout'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # path('profile/', UserProfileView.as_view(), name='profile'),
]

# Views will be implemented in Sprint 1
