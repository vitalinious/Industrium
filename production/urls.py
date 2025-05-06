from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterUserView, ProfileView, PositionViewSet

router = DefaultRouter()
router.register(r'positions', PositionViewSet, basename='position')

urlpatterns = [
    path('auth/create-employee/', RegisterUserView.as_view(), name='create-employee'),
    path('auth/profile/',         ProfileView.as_view(),      name='user-profile'),
    path('', include(router.urls)),
]