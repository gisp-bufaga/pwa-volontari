from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityViewSet

router = DefaultRouter()
router.register(r'', ActivityViewSet, basename='activity')   # /api/activities/

# ⚠️ SHIFT ROUTES - DA IMPLEMENTARE NELLO SPRINT 2B
# router.register(r'shifts', ShiftViewSet, basename='shift')

urlpatterns = router.urls