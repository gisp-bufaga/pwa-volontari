from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ActivityViewSet, ShiftViewSet

router = DefaultRouter()
router.register(r'', ActivityViewSet, basename='activity')  # /api/activities/
router.register(r'shifts', ShiftViewSet, basename='shift')   # /api/activities/shifts/

urlpatterns = router.urls