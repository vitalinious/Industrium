from django.shortcuts import render

# industrium/views.py
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import generics
from .serializers import RegisterSerializer
from .models import User
from .permissions import IsChief
from rest_framework.permissions import IsAuthenticated

@api_view(['GET'])
def hello_world(request):
    return Response({"message": "Hello from Django!"})

class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated, IsChief]