from django.urls import path
from .views import hello_world, RegisterView

urlpatterns = [
    path('',hello_world, name='hello_world'),
    path('auth/register/', RegisterView.as_view(), name='register'),
]