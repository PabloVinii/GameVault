from rest_framework import viewsets, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import Game, UserGame
from .serializers import GameSerializer, UserGameSerializer
import requests
import os

RAWG_API_KEY = os.getenv('RAWG_API_KEY')

class GameViewSet(viewsets.ModelViewSet):
    serializer_class = GameSerializer
    permission_classes = [permissions.IsAuthenticated]
    queryset = Game.objects.all()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class UserGameViewSet(viewsets.ModelViewSet):
    serializer_class = UserGameSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserGame.objects.filter(user=self.request.user).select_related('game')
    

def get_or_create_game_by_name(game_name):
    url = f'https://api.rawg.io/api/games?search={game_name}&key={RAWG_API_KEY}'
    response = requests.get(url)
    data = response.json()

    if data['results']:
        jogo_raw = data['results'][0]  
        rawg_id = jogo_raw['id']
        title = jogo_raw['name']
        cover_url = jogo_raw['background_image'] or ''
        genre = jogo_raw['genres'][0]['name'] if jogo_raw['genres'] else ''
        platform = jogo_raw['platforms'][0]['platform']['name'] if jogo_raw['platforms'] else ''

        game, created = Game.objects.get_or_create(
            rawg_id=rawg_id,
            defaults={
                'title': title,
                'cover_url': cover_url,
                'genre': genre,
                'platform': platform,
            }
        )
        return game
    else:
        return None

class AddGameToUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        game_name = request.data.get('title')
        game_status = request.data.get('status')
        rating = request.data.get('rating')
        review = request.data.get('review', '')

        if not game_name or not game_status:
            return Response({'error': 'Dados obrigatórios faltando.'}, status=400)

        game = get_or_create_game_by_name(game_name)
        if not game:
            return Response({'error': 'Jogo não encontrado.'}, status=404)

        user_game, created = UserGame.objects.get_or_create(
            user=request.user,
            game=game,
            defaults={
                'status': game_status,
                'rating': rating,
                'review': review,
            }
        )

        if not created:
            return Response({'error': 'Esse jogo já está na sua lista.'}, status=400)

        serializer = UserGameSerializer(user_game)
        return Response(serializer.data, status=201)
