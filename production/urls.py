from django.urls import path
from .views import RegisterUserView, ProfileView

urlpatterns = [
    path('auth/create-employee/', RegisterUserView.as_view(), name='create-employee'),
    path('auth/profile/',         ProfileView.as_view(),      name='profile'),
]