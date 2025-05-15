from django.shortcuts import render
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import CustomTokenObtainPairSerializer
from django.contrib.contenttypes.models import ContentType
from rest_framework.exceptions import ValidationError


from .serializers import (
    ProfileSerializer,
    PositionSerializer, DepartmentSerializer,
    EmployeeSerializer, ProjectSerializer,
    TaskSerializer, CommentSerializer,
    AttachmentSerializer, TaskNotificationSerializer
)

from .models import Position, Department, Project, Task, Comments, Attachment, TaskNotification
from .permissions import IsManagerOrReadOnly
from django.contrib.auth import get_user_model

User = get_user_model()

class CustomTokenView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    
class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = ProfileSerializer(request.user)
        return Response(serializer.data)


class PositionViewSet(viewsets.ModelViewSet):
    queryset = Position.objects.all()
    serializer_class = PositionSerializer
    permission_classes = [IsManagerOrReadOnly]

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
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        queryset = Department.objects.all()
        name_param = self.request.query_params.get('name')
        if name_param:
            names = [n.strip() for n in name_param.split(',') if n.strip()]
            queryset = queryset.filter(name__in=names)
        return queryset


class EmployeeViewSet(viewsets.ModelViewSet):
    serializer_class = EmployeeSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = User.objects.all().order_by('-date_joined')
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


class ProjectViewSet(viewsets.ModelViewSet):
    queryset = Project.objects.all()
    serializer_class = ProjectSerializer
    permission_classes = [IsManagerOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset().order_by('-created_at')
        params = self.request.query_params

        dept = params.get('department')
        if dept:
            qs = qs.filter(department_id=dept)

        status_param = params.get('status')
        if status_param:
            sts = [s.strip() for s in status_param.split(',') if s.strip()]
            qs = qs.filter(status__in=sts)

        ids = params.get('ids')
        if ids:
            id_list = [int(i) for i in ids.split(',') if i.isdigit()]
            qs = qs.filter(id__in=id_list)

        start_from = params.get('start_from')
        if start_from:
            qs = qs.filter(start_date__gte=start_from)

        start_to = params.get('start_to')
        if start_to:
            qs = qs.filter(start_date__lte=start_to)

        return qs

    def perform_create(self, serializer):
        serializer.save(last_modified_by=self.request.user)

    def perform_update(self, serializer):
        serializer.save(last_modified_by=self.request.user)
    
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def complete(self, request, pk=None):
        project = self.get_object()

        # Перевірка ролі
        if not User.objects.filter(role='Manager'):
            return Response({'detail': 'Тільки керівник може завершити проєкт'}, status=403)

        # Перевірка на наявність активних задач
        active_tasks = Task.objects.filter(project=project).exclude(status='Completed')
        if active_tasks.exists():
            return Response({'detail': 'Неможливо завершити проєкт: є незавершені задачі'}, status=400)

        project.status = 'Completed'
        project.save()
        return Response({'status': 'completed'})


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated, IsManagerOrReadOnly]

    def get_queryset(self):
        qs = super().get_queryset()
        params = self.request.query_params

        project = params.get('project')
        if project:
            qs = qs.filter(project_id=project)

        order = params.get('order')
        if order:
            qs = qs.filter(order_id=order)

        status_param = params.get('status')
        if status_param:
            qs = qs.filter(status__in=[s.strip() for s in status_param.split(',')])

        assignee = params.get('assignee')
        if assignee:
            qs = qs.filter(assignee_id=assignee)

        priority = params.get('priority')
        if priority:
            qs = qs.filter(priority=priority)

        created_from = params.get('created_from')
        if created_from:
            qs = qs.filter(created_at__date__gte=created_from)

        created_to = params.get('created_to')
        if created_to:
            qs = qs.filter(created_at__date__lte=created_to)

        return qs

    def perform_create(self, serializer):
        serializer.save(creator=self.request.user)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def mark_done(self, request, pk=None):
        task = self.get_object()
        if request.user != task.assignee:
            return Response({'detail': 'Access denied'}, status=403)
        task.is_done = True
        task.save()
        return Response({'detail': 'Позначено як виконано'})

    @action(detail=True, methods=['post'], url_path='submit-complete', permission_classes=[IsAuthenticated])
    def submit_complete(self, request, pk=None):
        task = self.get_object()

        if request.user != task.assignee:
            return Response({'detail': 'Недостатньо прав'}, status=403)

        if task.status == 'Completed':
            return Response({'detail': 'Задача вже підтверджена'}, status=400)
        
        # Тут логіка менеджера (тимчасово можна задати просто superuser або staff)
        managers = User.objects.filter(role='Manager')
        if not managers.exists():
            return Response({'detail': 'Керівників не знайдено'}, status=400)

        for manager in managers:
            TaskNotification.objects.create(
                task=task,
                sender=request.user,
                recipient=manager,
            )

        # Змінюємо статус задачі
        task.status = 'PendingConfirmation'
        task.save(update_fields=['status'])

        return Response({'status': 'submitted на підтвердження'})

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def confirm_done(self, request, pk=None):
        task = self.get_object()

        if not request.user.groups.filter(name='Manager').exists():
            return Response({'detail': 'Лише керівник може підтвердити'}, status=403)

        task.status = 'Completed'
        task.save(update_fields=['status'])

        TaskNotification.objects.filter(task=task).update(is_read=True)

        return Response({'status': 'confirmed'})
    
    @action(detail=True, methods=['post'], url_path='confirm-complete')
    def confirm_complete(self, request, pk=None):
        task = self.get_object()
        task.status = 'Completed'
        task.save()

        # видалити всі сповіщення про задачу
        TaskNotification.objects.filter(task=task).delete()

        return Response({'status': 'confirmed'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='reject-complete')
    def reject_complete(self, request, pk=None):
        task = self.get_object()
        reason = request.data.get('reason', '')
        task.status = 'InProgress'
        task.save()

        TaskNotification.objects.filter(task=task).delete()

        # можна зберегти reason в окрему модель або лог
        return Response({'status': 'rejected', 'reason': reason}, status=status.HTTP_200_OK)
        
from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets
from .models import Comments
from .serializers import CommentSerializer

class ProjectCommentViewSet(viewsets.ModelViewSet):
    queryset = Comments.objects.all()
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        from django.contrib.contenttypes.models import ContentType
        project_type = ContentType.objects.get(app_label='production', model='project')
        return Comments.objects.filter(content_type=project_type)

    def perform_create(self, serializer):
        from django.contrib.contenttypes.models import ContentType
        serializer.save(
            author=self.request.user,
            content_type=ContentType.objects.get(app_label='production', model='project')
        )
        
class TaskCommentViewSet(viewsets.ModelViewSet):
    serializer_class = CommentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        task_type = ContentType.objects.get_for_model(Task)
        object_id = self.request.query_params.get('object_id')

        if self.action == 'list' and object_id:
            return Comments.objects.filter(
                content_type=task_type,
                object_id=object_id
            ).order_by('-created_at')

        return Comments.objects.filter(content_type=task_type)

    def perform_create(self, serializer):
        content_type = ContentType.objects.get_for_model(Task)
        serializer.save(author=self.request.user, content_type=content_type)

    def perform_create(self, serializer):
        content_type = ContentType.objects.get_for_model(Task)
        serializer.save(author=self.request.user, content_type=content_type)

class AttachmentViewSet(viewsets.ModelViewSet):
    queryset = Attachment.objects.all()
    serializer_class = AttachmentSerializer
    permission_classes = [IsAuthenticated]

    def create(self, request, *args, **kwargs):
        print("🔹 Incoming data:", request.data)

        model = request.data.get('content_type_model')
        app = request.data.get('content_type_app')
        object_id = request.data.get('object_id')

        if not all([model, app, object_id]):
            raise ValidationError('Missing required fields')

        try:
            ct = ContentType.objects.get(app_label=app, model=model)
        except ContentType.DoesNotExist:
            raise ValidationError('Invalid content_type')

        # створюємо змінювану копію request.data
        data = request.data.copy()
        data['content_type'] = ct.id
        data['object_id'] = object_id

        serializer = self.get_serializer(data=data)
        if not serializer.is_valid():
            print("❌ Serializer errors:", serializer.errors)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        serializer.save(uploaded_by=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    

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
        qs = User.objects.filter(last_name__icontains=q)[:10]
        data = [
            {
                'id': u.id,
                'full_name': f"{u.last_name} {u.first_name} {u.middle_name or ''}".strip()
            }
            for u in qs
        ]
        return Response(data)
    return Response([])


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def suggest_project(request):
    q = request.query_params.get('name', '').strip()
    if not q:
        return Response([])
    matches = Project.objects.filter(name__icontains=q)[:10]
    return Response([{'id': p.id, 'name': p.name} for p in matches])

@api_view(['GET'])
def suggest_employees_filtered(request):
    dept = request.GET.get('department')
    pos  = request.GET.get('position')

    qs = User.objects.all()
    if dept:
        qs = qs.filter(department_id=dept)
    if pos:
        qs = qs.filter(position_id=pos)

    data = [{'id': u.id, 'name': f"{u.last_name} {u.first_name}"} for u in qs]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def my_tasks(request):
    tasks = Task.objects.filter(assignee=request.user)
    serializer = TaskSerializer(tasks, many=True)
    return Response(serializer.data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def unread_notifications(request):
    qs = TaskNotification.objects.filter(recipient=request.user, is_read=False)\
                                 .select_related('task', 'sender')\
                                 .order_by('-created_at')
    return Response(TaskNotificationSerializer(qs, many=True).data)

from django.db.models import Count, Q
from datetime import datetime, timedelta
from django.utils import timezone

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    today = timezone.now().date()
    start_of_month = today.replace(day=1)

    tasks = Task.objects.filter(created_at__date__gte=start_of_month)

    tasks_done = tasks.filter(status='Completed').count()
    tasks_in_progress = tasks.filter(status='InProgress').count()
    tasks_overdue = tasks.filter(status='PendingConfirmation', due_date__lt=today).count()
    
    uncompleted_tasks_count = tasks.filter(status__in=['InProgress', 'PendingConfirmation']).count()
    projects = Project.objects.filter(status__in=['InProgress', 'Planned'])
    projects_progress = []
    
    for project in projects:
        total = Task.objects.filter(project=project).count()
        completed = Task.objects.filter(project=project, status='Completed').count()
        percent = round((completed / total * 100), 1) if total > 0 else 0
        projects_progress.append({
            'id': project.id,
            'name': project.name,
            'percent': percent
        })

    # Групування по тижнях
    weekly_tasks = []
    for i in range(4):
        week_start = start_of_month + timedelta(weeks=i)
        week_end = week_start + timedelta(days=6)
        count = tasks.filter(created_at__date__range=(week_start, week_end)).count()
        weekly_tasks.append({"week": f"{i+1} тиждень", "tasks": count})

    active_projects = Project.objects.filter(status__in=['InProgress', 'Planned'], start_date__gte=start_of_month).count()
    completed_projects = Project.objects.filter(status='Completed', end_date__gte=start_of_month).count()

    # Найближчі задачі (до дедлайну менше 7 днів)
    deadline_threshold = today + timedelta(days=30)
    upcoming = Task.objects.filter(
        due_date__lte=deadline_threshold,
        due_date__gte=today,
    ).select_related('assignee')
    upcoming_serialized = TaskSerializer(upcoming, many=True, context={'request': request}).data

    return Response({
        "tasks_done": tasks_done,
        "tasks_in_progress": tasks_in_progress,
        "tasks_overdue": tasks_overdue,
        "weekly_tasks": weekly_tasks,
        "active_projects": active_projects,
        "completed_projects": completed_projects,
        "upcoming_tasks": upcoming_serialized,
        "uncompleted_tasks_count": uncompleted_tasks_count,
        "projects_progress": projects_progress,
    })
