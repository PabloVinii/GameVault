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

def join_unique_platforms(platform_objs):
    """Recebe a lista de plataformas vinda da RAWG e devolve uma string
    única (sem duplicatas) separada por vírgula, mantendo a ordem original."""
    names = [p['platform']['name'] for p in platform_objs] if platform_objs else []
    # dict.fromkeys() preserva a ordem de inserção e remove duplicatas
    return ", ".join(dict.fromkeys(names))

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

    if not data.get('results'):
        return None

    jogo_raw = data['results'][0]
    rawg_id = jogo_raw['id']
    title = jogo_raw['name']
    cover_url = jogo_raw.get('background_image') or ''
    genre = jogo_raw['genres'][0]['name'] if jogo_raw.get('genres') else ''
    platform = join_unique_platforms(jogo_raw.get('platforms'))

    game, _ = Game.objects.get_or_create(
        rawg_id=rawg_id,
        defaults={
            'title': title,
            'cover_url': cover_url,
            'genre': genre,
            'platform': platform,
        }
    )
    return game

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
            'key': RAWG_API_KEY,
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
        results = [
            {
                'rawg_id': g['id'],
                'title':   g['name'],
                'cover_url': g.get('background_image'),
                'rating': g.get('rating'),
                'genre':  g['genres'][0]['name'] if g.get('genres') else '',
                'platform': join_unique_platforms(g.get('platforms')),
            }
            for g in data.get('results', [])
        ]

        payload = {
            'results': results,
            'count':   data.get('count', 0),
            'page':    page,
            'page_size': page_size,
        }
        cache.set(cache_key, payload, 60 * 10)  # 10 min
        return Response(payload)

class GameInfoView(APIView):
    def get(self, request, rawg_id):
        cache_key = f'game_info_{rawg_id}'
        cached_data = cache.get(cache_key)
        if cached_data:
            return Response(cached_data)

        url = f'https://api.rawg.io/api/games/{rawg_id}?key={RAWG_API_KEY}'
        res = requests.get(url)
        if res.status_code != 200:
            return Response({'error': 'Jogo não encontrado na RAWG'}, status=404)

        data = res.json()
        game_data = {
            'rawg_id': data['id'],
            'title': data['name'],
            'cover_url': data.get('background_image'),
            'rating': data.get('rating'),
            'genre': data['genres'][0]['name'] if data.get('genres') else '',
            'platform': join_unique_platforms(data.get('platforms')),
            'description': data.get('description_raw', ''),
            'released': data.get('released'),
            'metacritic': data.get('metacritic'),
            'tags': data.get('tags', []),
            'ratings': data.get('ratings', []),
            'developers': data.get('developers', []),
            'publishers': data.get('publishers', []),
            'website': data.get('website'),
            'stores': data.get('stores', []),
        }

        cache.set(cache_key, game_data, timeout=60 * 60)  # 1 h
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

class SuggestedGamesView(APIView):
    def get(self, request, rawg_id):
        API_KEY = os.getenv('RAWG_API_KEY')
        url = f'https://api.rawg.io/api/games/{rawg_id}?key={API_KEY}'
        res = requests.get(url)

        if res.status_code != 200:
            return Response({'error': 'Jogo não encontrado'}, status=404)

        game = res.json()
        tags = [t['slug'] for t in game.get('tags', [])][:2]
        genre = game['genres'][0]['slug'] if game.get('genres') else ''

        params = {
            'key': API_KEY,
            'page_size': 6,
            'ordering': '-rating',
            'exclude_additions': True,
        }
        if tags:
            params['tags'] = ','.join(tags)
        elif genre:
            params['genres'] = genre

        similar = requests.get('https://api.rawg.io/api/games', params=params).json()
        results = [
            {
                'rawg_id': g['id'],
                'title': g['name'],
                'cover_url': g.get('background_image'),
                'rating': g.get('rating'),
            }
            for g in similar.get('results', []) if g['id'] != int(rawg_id)
        ][:4]

        return Response(results)
    
class GameAchievementsView(APIView):
    def get(self, request, rawg_id):
        cache_key = f"achievements_{rawg_id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        url = f"https://api.rawg.io/api/games/{rawg_id}/achievements"
        params = {"key": RAWG_API_KEY, "page_size": 40}

        achievements = []
        while url:
            res = requests.get(url, params=params)
            if res.status_code != 200:
                return Response({"error": "Conquistas não disponíveis"}, status=404)

            data = res.json()

            achievements.extend(
                {
                    "id": a["id"],
                    "name": a["name"],
                    "description": a.get("description", ""),
                    "image": a.get("image"),
                }
                for a in data.get("results", [])
            )
            
            url = data.get("next")
            params = None 

        cache.set(cache_key, achievements, 60 * 60)  # 1 h
        return Response(achievements)

class GameTrailerView(APIView):
    def get(self, request, rawg_id):
        cache_key = f"trailer_{rawg_id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        url = f"https://api.rawg.io/api/games/{rawg_id}/movies?key={RAWG_API_KEY}"
        res = requests.get(url)

        if res.status_code != 200:
            return Response({'error': 'Trailer não disponível'}, status=404)

        data = res.json()
        results = data.get('results', [])
        if not results:
            return Response([])

        trailer = results[0]
        payload = {
            'name': trailer.get('name'),
            'preview': trailer.get('preview'),
            'video_url': trailer.get('data', {}).get('max'),
        }

        cache.set(cache_key, payload, 60 * 60)
        return Response(payload)


class GameScreenshotsView(APIView):
    def get(self, request, rawg_id):
        cache_key = f"screenshots_{rawg_id}"
        cached = cache.get(cache_key)
        if cached:
            return Response(cached)

        url = f"https://api.rawg.io/api/games/{rawg_id}/screenshots?key={RAWG_API_KEY}"
        res = requests.get(url)
        if res.status_code != 200:
            return Response([], status=404)

        data = res.json()
        screenshots = [{"id": sc["id"], "image": sc["image"]} for sc in data.get("results", [])]

        cache.set(cache_key, screenshots, 60 * 60)
        return Response(screenshots)
