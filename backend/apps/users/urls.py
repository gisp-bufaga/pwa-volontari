"""
URLs for users app (authentication endpoints)
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    LoginView, LogoutView, ProfileView, ChangePasswordView,
    UserViewSet, WorkAreaViewSet, BulkActionsView,
    CSVImportPreviewView, CSVImportConfirmView, ExportUsersView
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
    
    # Bulk Actions & Import/Export
    path('bulk-actions/', BulkActionsView.as_view(), name='bulk_actions'),
    path('import/preview/', CSVImportPreviewView.as_view(), name='import_preview'),
    path('import/confirm/', CSVImportConfirmView.as_view(), name='import_confirm'),
    path('export/', ExportUsersView.as_view(), name='export_users'),
    
    # Users and Work Areas (REST endpoints)
    path('', include(router.urls)),
    path('work-areas/', views.get_work_areas, name='work-areas'),
]