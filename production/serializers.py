from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import User
from .models import Position
from .models import Department

class RegisterSerializer(serializers.ModelSerializer):
    password2 = serializers.CharField(write_only=True)

    class Meta:
        model  = User
        fields = [
            'username', 'password', 'password2',
            'first_name', 'last_name', 'middle_name',
            'email', 'phone_number', 'department', 'position',
            'role',
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'role':     {'read_only': True},
        }

    def validate(self, data):
        if data['password'] != data.pop('password2'):
            raise serializers.ValidationError("Passwords must match")
        return data

    def create(self, validated_data):
        validated_data['role'] = 'employee'
        user = User.objects.create_user(**validated_data)
        return user

class ProfileSerializer(serializers.ModelSerializer):
    position = serializers.StringRelatedField()

    class Meta:
        model = User
        fields = [
            'username', 'email', 'first_name', 'last_name',
            'middle_name', 'phone_number', 'position', 'date_joined'
        ]

class PositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Position
        fields = ['id', 'name']
        
class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name']