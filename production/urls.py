from django.urls import path
from .views import hello_world, RegisterView
from .views import RegisterView, profile

urlpatterns = [
    path('',hello_world, name='hello_world'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/profile/',   profile,               name='profile'),
]