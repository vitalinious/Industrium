from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import Position, Department, Project
from django.contrib.auth import get_user_model
import random
import string

User = get_user_model()

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role  # 👈 Додаємо роль до токена
        return token

class ProfileSerializer(serializers.ModelSerializer):
    position = serializers.StringRelatedField()

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'middle_name', 'phone_number', 'position', 'date_joined'
        ]

class PositionSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all()
    )
    department_name = serializers.CharField(
        source='department.name',
        read_only=True
    )

    class Meta:
        model = Position
        fields = ['id', 'name', 'department', 'department_name']
        read_only_fields = ['id']
        
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']
        
class EmployeeSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=False)
    username = serializers.CharField(read_only=True)

    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    position   = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all())
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_name   = serializers.CharField(source='position.name',   read_only=True)
    full_name = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format='%d.%m.%Y', read_only=True)

    class Meta:
        model = User
        fields = [
            'id','username','password',
            'first_name','last_name','middle_name','full_name',
            'email','phone_number',
            'department','department_name',
            'position','position_name',
            'role','date_joined',
        ]
        read_only_fields = ['id','username','date_joined',
                            'department_name','position_name','full_name']

    def get_full_name(self, obj):
        return ' '.join(filter(None, [obj.last_name, obj.first_name, obj.middle_name]))

    def create(self, validated_data):
        pwd = validated_data.pop('password', None)
        if not pwd:
            pwd = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        email = validated_data.get('email','')
        local = email.split('@')[0]
        suffix = ''.join(random.choices(string.digits, k=3))
        uname = f"{local}#{suffix}"

        user = User.objects.create(username=uname, **validated_data)
        user.set_password(pwd)
        user.save()

        self._generated_username = uname
        self._generated_password = pwd
        return user

    def to_representation(self, instance):
        data = super().to_representation(instance)
        if hasattr(self, '_generated_username'):
            data['username'] = self._generated_username
            data['password'] = self._generated_password
        return data
    
class ProjectSerializer(serializers.ModelSerializer):
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    department_name = serializers.CharField(source='department.name', read_only=True)
    # Додаємо поле для отримання підписаного статусу
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description',
            'department', 'department_name',
            'start_date', 'end_date',
            'status', 'status_display',
        ]
        read_only_fields = ['id', 'department_name', 'status_display']
