"""
URL configuration for PWA Volontari project
"""

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView
from .views import home

urlpatterns = [
    # Home
    path('', home, name='home'),

    # Admin
    path('admin/', admin.site.urls),
  
    
    # API Documentation
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
    
    # API endpoints
    path('api/auth/', include('apps.users.urls')),
    #path('api/segreteria/', include('apps.segreteria.urls')),
    #path('api/activities/', include('apps.activities.urls')),
    #path('api/forniture/', include('apps.forniture.urls')),
    #path('api/vehicles/', include('apps.vehicles.urls')),
    #path('api/checklist/', include('apps.checklist.urls')),
    #path('api/reports/', include('apps.reports.urls')),
    #path('api/notifications/', include('apps.notifications.urls')),
    #path('api/vestiario/', include('apps.vestiario.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
    
    # Debug Toolbar
    try:
        import debug_toolbar
        urlpatterns = [path('__debug__/', include(debug_toolbar.urls))] + urlpatterns
    except ImportError:
        pass

# Admin site customization
admin.site.site_header = "PWA Volontari - Amministrazione"
admin.site.site_title = "PWA Volontari Admin"
admin.site.index_title = "Gestione Sistema"
