from rest_framework.routers import DefaultRouter
from django.urls import path
from .views import GameViewSet, AddGameToUserView, UserGameViewSet, DiscoverGamesView, GameInfoView, RegisterView, SuggestedGamesView, GameAchievementsView

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

urlpatterns += [
    path('register/', RegisterView.as_view(), name='register'),
]

urlpatterns += [
    path('suggested-games/<int:rawg_id>/', SuggestedGamesView.as_view(), name='suggested-games'),
]

urlpatterns += [
    path('game-achievements/<int:rawg_id>/', GameAchievementsView.as_view(), name='game-achievements'),
]
