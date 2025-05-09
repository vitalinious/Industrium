from django.shortcuts import render
from rest_framework import viewsets
from rest_framework.views     import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .serializers import RegisterSerializer, ProfileSerializer, PositionSerializer, DepartmentSerializer, EmployeeSerializer
from .models import User, Position, Department, User
from .permissions import IsChief

class RegisterUserView(generics.CreateAPIView):
    queryset         = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [IsAuthenticated, IsChief]
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)
    
class PositionViewSet(viewsets.ModelViewSet):
    serializer_class = PositionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Position.objects.all()
        name_param = self.request.query_params.get('name')
        if name_param:
            names = [n.strip() for n in name_param.split(',') if n.strip()]
            queryset = queryset.filter(name__in=names)
        return queryset
    
class DepartmentViewSet(viewsets.ModelViewSet):
    serializer_class = DepartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        queryset = Department.objects.all()
        name_param = self.request.query_params.get('name')
        if name_param:
            names = [n.strip() for n in name_param.split(',') if n.strip()]
            queryset = queryset.filter(name__in=names)
        return queryset
    
class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]
    
@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suggest_positions(request):
    name_query = request.GET.get('name', '')
    if name_query:
        positions = Position.objects.filter(name__icontains=name_query)[:10]
        data = PositionSerializer(positions, many=True).data
        return Response(data)
    return Response([])

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suggest_departments(request):
    name_query = request.GET.get('name', '')
    if name_query:
        qs = Department.objects.filter(name__icontains=name_query)[:10]
        data = DepartmentSerializer(qs, many=True).data
        return Response(data)
    return Response([])