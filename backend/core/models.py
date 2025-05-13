from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
    rawg_id = models.IntegerField(unique=True)
    title = models.CharField(max_length=200)
    cover_url = models.URLField(blank=True)
    genre = models.CharField(max_length=100, blank=True)
    platform = models.CharField(max_length=100, blank=True)

    def __str__(self):
        return self.title

class UserGame(models.Model):
    STATUS_CHOICES = [
        ('played', 'Jogado'),
        ('playing', 'Jogando'),
        ('wishlist', 'Wishlist'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    game = models.ForeignKey(Game, on_delete=models.CASCADE)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    rating = models.IntegerField(null=True, blank=True)
    review = models.TextField(blank=True)
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'game')

