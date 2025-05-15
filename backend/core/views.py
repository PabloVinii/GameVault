from rest_framework import viewsets, permissions
from django.contrib.auth.models import User
from django.core.cache import cache
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


class DiscoverGamesView(APIView):
    def get(self, request):
        term   = request.query_params.get('search', '').strip()
        genre  = request.query_params.get('genre', '').lower()
        order  = request.query_params.get('ordering', '-rating')
        page   = int(request.query_params.get('page', 1))
        page_size = int(request.query_params.get('page_size', 20))

        cache_key = f'discover_{term}_{genre}_{order}_{page}'
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        params = {
            'key': os.getenv('RAWG_API_KEY'),
            'page_size': page_size,
            'page': page,
            'ordering': order,
        }
        if term:
            params['search'] = term
        if genre:
            params['genres'] = genre 

        res = requests.get('https://api.rawg.io/api/games', params=params)
        if res.status_code != 200:
            return Response({'error': 'RAWG error'}, status=502)

        data = res.json()
        results = [{
            'rawg_id': g['id'],
            'title':   g['name'],
            'cover_url': g['background_image'],
            'rating': g['rating'],
            'genre':  g['genres'][0]['name'] if g['genres'] else '',
            'platform': g['platforms'][0]['platform']['name'] if g['platforms'] else ''
        } for g in data['results']]

        payload = {
            'results': results,
            'count':   data.get('count', 0),
            'page':    page,
            'page_size': page_size,
        }
        cache.set(cache_key, payload, 60*10)
        return Response(payload)


    
class GameInfoView(APIView):
    def get(self, request, rawg_id):
        cache_key = f'game_info_{rawg_id}'
        cached_data = cache.get(cache_key)

        if cached_data:
            return Response(cached_data)

        API_KEY = os.getenv('RAWG_API_KEY')
        url = f'https://api.rawg.io/api/games/{rawg_id}?key={API_KEY}'
        res = requests.get(url)

        if res.status_code != 200:
            return Response({'error': 'Jogo não encontrado na RAWG'}, status=404)

        data = res.json()
        game_data = {
            'rawg_id': data['id'],
            'title': data['name'],
            'cover_url': data.get('background_image'),
            'rating': data.get('rating'),
            'genre': data['genres'][0]['name'] if data['genres'] else '',
            'platform': data['platforms'][0]['platform']['name'] if data['platforms'] else '',
            'description': data.get('description_raw', ''),
        }

        cache.set(cache_key, game_data, timeout=60 * 60)  # 1 hora de cache
        return Response(game_data)
    
class RegisterView(APIView):
    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email    = request.data.get('email')

        if not username or not password or not email:
            return Response({'error': 'Preencha todos os campos'}, status=400)

        if User.objects.filter(username=username).exists():
            return Response({'error': 'Usuário já existe'}, status=400)

        if User.objects.filter(email=email).exists():
            return Response({'error': 'Já existe uma conta com esse email'}, status=400)

        User.objects.create_user(username=username, password=password, email=email)

        return Response({'message': 'Usuário criado com sucesso'}, status=201)
