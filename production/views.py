from django.shortcuts import render

from rest_framework.views     import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, ProfileSerializer
from .models import User
from .permissions import IsChief


@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django!"})

class RegisterUserView(generics.CreateAPIView):
    queryset         = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated, IsChief]
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)