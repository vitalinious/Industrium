from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.contenttypes.models import ContentType
from django.contrib.auth.password_validation import validate_password
from django.contrib.auth import get_user_model
from .models import (Position, Department,
                     Project, Attachment,
                     Comments, Task,
                     TaskNotification)

import random
import string

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
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
    department = serializers.PrimaryKeyRelatedField(queryset=Department.objects.all())
    department_name = serializers.CharField(source='department.name', read_only=True)

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
    position = serializers.PrimaryKeyRelatedField(queryset=Position.objects.all())
    department_name = serializers.CharField(source='department.name', read_only=True)
    position_name = serializers.CharField(source='position.name', read_only=True)
    full_name = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format='%d.%m.%Y', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password',
            'first_name', 'last_name', 'middle_name', 'full_name',
            'email', 'phone_number',
            'department', 'department_name',
            'position', 'position_name',
            'role', 'date_joined',
        ]
        read_only_fields = [
            'id', 'username', 'date_joined',
            'department_name', 'position_name', 'full_name'
        ]

    def get_full_name(self, obj):
        return ' '.join(filter(None, [obj.last_name, obj.first_name, obj.middle_name]))

    def create(self, validated_data):
        pwd = validated_data.pop('password', None)
        if not pwd:
            pwd = ''.join(random.choices(string.ascii_letters + string.digits, k=10))

        email = validated_data.get('email', '')
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



class CommentSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()
    created_at = serializers.DateTimeField(format="%d.%m.%Y %H:%M", read_only=True)

    content_type = serializers.PrimaryKeyRelatedField(
        queryset=ContentType.objects.all(),
        write_only=True,
        required=False  # ← ключовий рядок
    )
    object_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Comments
        fields = [
            'id', 'author', 'author_name', 'content',
            'created_at', 'content_type', 'object_id'
        ]
        read_only_fields = ['id', 'author', 'author_name', 'created_at']

    def get_author_name(self, obj):
        return f"{obj.author.last_name} {obj.author.first_name}"


class AttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Attachment
        fields = '__all__'
        read_only_fields = ['uploaded_at', 'uploaded_by']

from django.contrib.contenttypes.models import ContentType
from .models import Comments
from .serializers import CommentSerializer

class TaskSerializer(serializers.ModelSerializer):
    creator_name = serializers.SerializerMethodField()
    assignee_name = serializers.SerializerMethodField()
    project_name = serializers.CharField(source='project.name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    comments = CommentSerializer(many=True, read_only=True)
    files = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            'id', 'title', 'description',
            'creator', 'creator_name',
            'assignee', 'assignee_name',
            'project', 'project_name',
            'order','priority',
            'status', 'status_display',
            'created_at', 'due_date',
            'comments', 'files',
        ]
        read_only_fields = ['creator', 'creator_name', 'status_display', 'project_name', 'assignee_name', 'created_at']

    def get_creator_name(self, obj):
        return f"{obj.creator.last_name} {obj.creator.first_name}"

    def get_assignee_name(self, obj):
        return f"{obj.assignee.last_name} {obj.assignee.first_name}" if obj.assignee else None
    
    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)
        
    def get_files(self, obj):
        ct = ContentType.objects.get_for_model(Task)
        attachments = Attachment.objects.filter(content_type=ct, object_id=obj.id)
        return AttachmentSimpleSerializer(attachments, many=True, context=self.context).data

class AttachmentSimpleSerializer(serializers.ModelSerializer):
    uploaded_by = serializers.StringRelatedField()
    uploaded_by_id = serializers.IntegerField(source='uploaded_by.id')
    file = serializers.SerializerMethodField()

    class Meta:
        model = Attachment
        fields = ['id', 'file', 'description', 'uploaded_by', 'uploaded_by_id']

    def get_file(self, obj):
        request = self.context.get('request')
        if request is not None:
            return request.build_absolute_uri(obj.file.url)
        return obj.file.url
        
class ProjectSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    last_modified_by_name = serializers.SerializerMethodField()
    last_modified_at = serializers.DateTimeField(format="%d.%m.%Y %H:%M", read_only=True)
    tasks = TaskSerializer(many=True, read_only=True)
    comments = serializers.SerializerMethodField()
    files = serializers.SerializerMethodField()
    formatted_last_modified = serializers.ReadOnlyField()

    class Meta:
        model = Project
        fields = [
            'id', 'name', 'description',
            'start_date', 'end_date',
            'status', 'status_display',
            'last_modified_by_name', 'last_modified_at',
            'tasks', 'comments', 'files', 'formatted_last_modified'
        ]
        read_only_fields = [
            'id', 'status_display', 'last_modified_by_name',
            'last_modified_at', 'tasks', 'comments', 'files'
        ]

    def get_last_modified_by_name(self, obj):
        if obj.last_modified_by:
            return f"{obj.last_modified_by.last_name} {obj.last_modified_by.first_name}"
        return None

    def get_comments(self, obj):
        content_type = ContentType.objects.get_for_model(obj.__class__)
        comments = Comments.objects.filter(content_type=content_type, object_id=obj.id).order_by('-created_at')
        return CommentSerializer(comments, many=True, context=self.context).data
    
    def get_files(self, obj):
        ct = ContentType.objects.get_for_model(Project)
        attachments = Attachment.objects.filter(content_type=ct, object_id=obj.id)
        return AttachmentSimpleSerializer(attachments, many=True, context=self.context).data

    
class TaskNotificationSerializer(serializers.ModelSerializer):
    task_title = serializers.CharField(source='task.title', read_only=True)
    task_id = serializers.IntegerField(source='task.id', read_only=True)
    sender_name = serializers.SerializerMethodField()

    class Meta:
        model = TaskNotification
        fields = ['id', 'task_id', 'task_title', 'sender_name', 'created_at']

    def get_sender_name(self, obj):
        return f"{obj.sender.last_name} {obj.sender.first_name}"
        
