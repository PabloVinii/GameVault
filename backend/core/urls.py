from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import GameViewSet, AddGameToUserView, UserGameViewSet, DiscoverGamesView, GameInfoView

router = DefaultRouter()
router.register(r'games', GameViewSet, basename='games')
router.register(r'usergames', UserGameViewSet, basename='usergames')

urlpatterns = router.urls + [
    path('add-game/', AddGameToUserView.as_view(), name='add-game'),
]

urlpatterns += [
    path('discover-games/', DiscoverGamesView.as_view(), name='discover-games'),
]

urlpatterns += [
    path('game-info/<int:rawg_id>/', GameInfoView.as_view(), name='game-info'),
]
