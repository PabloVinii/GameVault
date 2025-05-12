from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import GameViewSet

router = DefaultRouter()
router.register(r'games', GameViewSet, basename='games')

urlpatterns = router.urls
