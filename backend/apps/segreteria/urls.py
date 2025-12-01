from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TodoViewSet, DocumentViewSet

router = DefaultRouter()
router.register(r'todos', TodoViewSet, basename='todo')           # /api/segreteria/todos/
router.register(r'documents', DocumentViewSet, basename='document')  # /api/segreteria/documents/

urlpatterns = router.urls