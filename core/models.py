from django.db import models
from django.contrib.auth.models import User

class Game(models.Model):
    STATUS_CHOICES = [
        ('played', 'Jogado'),
        ('playing', 'Jogando'),
        ('wishlist', 'Wishlist'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="games")
    title = models.CharField(max_length=100)
    platform = models.CharField(max_length=50)
    genre = models.CharField(max_length=50)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES)
    rating = models.IntegerField(null=True, blank=True)
    review = models.TextField(blank=True)
    date_added = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.title} ({self.platform})"
