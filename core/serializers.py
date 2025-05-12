from rest_framework import serializers
from .models import Game

class GameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Game
        fields = ['id', 'title', 'platform', 'genre', 'status', 'rating', 'review', 'date_added']
        read_only_fields = ['id', 'date_added']
