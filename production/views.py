from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views     import APIView
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .serializers import (RegisterSerializer, ProfileSerializer,
                          PositionSerializer, DepartmentSerializer,
                          EmployeeSerializer, ProjectSerializer)

from .models import Position, Department, Project

from .permissions import IsChief
import random
import string
from django.contrib.auth import get_user_model

User = get_user_model()

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
    queryset = Position.objects.all()
    serializer_class = PositionSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        dept_id = self.request.query_params.get('department')
        if dept_id:
            qs = qs.filter(department_id=dept_id)

        name_param = self.request.query_params.get('name')
        if name_param:
            names = [n.strip() for n in name_param.split(',') if n.strip()]
            qs = qs.filter(name__in=names)

        return qs
    
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
    serializer_class = EmployeeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = User.objects.all()
        params = self.request.query_params

        ids_param = params.get('ids')
        if ids_param:
            try:
                ids = [int(i) for i in ids_param.split(',') if i.strip().isdigit()]
                qs = qs.filter(pk__in=ids)
            except ValueError:
                pass

        dept = params.get('department')
        if dept:
            qs = qs.filter(department_id=dept)

        pos = params.get('position')
        if pos:
            qs = qs.filter(position_id=pos)

        joined_from = params.get('joined_from')
        if joined_from:
            qs = qs.filter(date_joined__date__gte=joined_from)
        joined_to = params.get('joined_to')
        if joined_to:
            qs = qs.filter(date_joined__date__lte=joined_to)

        return qs

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(
            serializer.data,
            status=status.HTTP_201_CREATED,
            headers=self.get_success_headers(serializer.data)
        )

class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        dept = params.get('department')
        if dept:
            qs = qs.filter(department_id=dept)

        status_param = params.get('status')
        if status_param:
            sts = [s.strip() for s in status_param.split(',') if s.strip()]
            qs = qs.filter(status__in=sts)

        return qs


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

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suggest_employees(request):
    q = request.GET.get('name', '')
    if q:
        qs = User.objects.filter(
            last_name__icontains=q
        )[:10]
        data = [
            {
                'id': u.id,
                'full_name': f"{u.last_name} {u.first_name} {u.middle_name or ''}".strip()
            }
            for u in qs
        ]
        return Response(data)
    return Response([])