from rest_framework import viewsets, permissions
from .models import Game
from .serializers import GameSerializer

class GameViewSet(viewsets.ModelViewSet):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Game.objects.filter(user=self.request.user).order_by('-date_added')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
