from django.db import models
from django.contrib.auth.models import AbstractUser
from datetime import date
from django.utils import timezone
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils.timezone import localtime
from django.contrib.contenttypes.fields import GenericRelation

# === Довідкові таблиці ===
class Department(models.Model):
    name = models.CharField(max_length=100, unique=True)
    manager = models.ForeignKey('User', null=True, blank=True, on_delete=models.SET_NULL, related_name='managed_departments')

    def __str__(self):
        return self.name
    
class Position(models.Model):
    name = models.CharField(max_length=150)
    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='positions'
    )

    def __str__(self):
        return self.name

# === Користувачі ===
class User(AbstractUser):
    position = models.ForeignKey(Position, on_delete=models.PROTECT, related_name='users')
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='users')
    phone_number = models.CharField(max_length=20, blank=True)
    middle_name = models.CharField(max_length=150, blank=True)
    email = models.EmailField(unique=True)
    date_joined = models.DateTimeField(auto_now_add=True)

    ROLE_CHOICES = [
        ('Manager', 'Керівник'),
        ('Worker', 'Працівник'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='Worker', db_index=True)

    class Meta:
        indexes = [
            models.Index(fields=['department']),
            models.Index(fields=['position']),
            models.Index(fields=['role']),
        ]

# === Виробничі об'єкти ===
class Project(models.Model):
    STATUS_CHOICES = [
        ('Planned', 'Заплановано'),
        ('InProgress', 'В роботі'),
        ('Completed', 'Завершено'),
    ]
    name = models.CharField(max_length=200, db_index=True)
    description = models.TextField(blank=True)
    start_date = models.DateField()
    end_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planned', db_index=True)
    last_modified_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='modified_projects')
    last_modified_at = models.DateTimeField(auto_now=True)
    created_at = models.DateTimeField(auto_now_add=True)
    

    def save(self, *args, **kwargs):
        if not self.status or self._status_auto():
            today = date.today()
            if self.start_date > today:
                self.status = 'Planned'
            elif self.end_date and self.end_date < today:
                self.status = 'Completed'
            else:
                self.status = 'InProgress'
        super().save(*args, **kwargs)

    def _status_auto(self):
        if not self.pk:
            return True
        old = Project.objects.filter(pk=self.pk).first()
        return old and old.status == self.status

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-created_at']
    
    @property
    def formatted_last_modified(self):
        if self.last_modified_at:
            return localtime(self.last_modified_at).strftime('%d.%m.%Y %H:%M')
        return ''

class Order(models.Model):
    STATUS_CHOICES = [
        ('New', 'Нове'),
        ('InProgress', 'В роботі'),
        ('Done', 'Виконано'),
    ]
    number = models.CharField(max_length=20, unique=True)
    client = models.ForeignKey(User, on_delete=models.PROTECT, related_name='orders')
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='orders')
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='New', db_index=True)

    def save(self, *args, **kwargs):
        if not self.status or self._status_auto():
            today = date.today()
            if self.due_date and self.due_date < today:
                self.status = 'Done'
            elif self.created_at.date() <= today:
                self.status = 'InProgress'
            else:
                self.status = 'New'
        super().save(*args, **kwargs)

    def _status_auto(self):
        if not self.pk:
            return True
        old = Order.objects.filter(pk=self.pk).first()
        return old and old.status == self.status

    def __str__(self):
        return self.number


class Task(models.Model):
    PRIORITY_CHOICES = [
        (1, 'Низький'),
        (2, 'Середній'),
        (3, 'Високий'),
    ]
    STATUS_CHOICES = [
        ('Planned', 'Заплановано'),
        ('InProgress', 'В роботі'),
        ('PendingConfirmation', 'Очікує підтвердження'),
        ('Completed', 'Завершено'),
    ]
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    creator = models.ForeignKey(User, on_delete=models.PROTECT, related_name='created_tasks')
    assignee = models.ForeignKey(User, on_delete=models.PROTECT, related_name='assigned_tasks')
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='tasks')
    order = models.ForeignKey(Order, null=True, blank=True, on_delete=models.SET_NULL, related_name='tasks')
    priority = models.IntegerField(choices=PRIORITY_CHOICES, default=2, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Planned', db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateField(null=True, blank=True)
    is_done = models.BooleanField(default=False)
    is_confirmed = models.BooleanField(default=False)
    comments = GenericRelation('production.Comments', related_query_name='task_comments')
    attachment_set = GenericRelation('production.Attachment', related_query_name='task_attachments')

    class Meta:
        indexes = [
            models.Index(fields=['creator']),
            models.Index(fields=['assignee']),
            models.Index(fields=['project']),
            models.Index(fields=['order']),
            models.Index(fields=['status']),
        ]

    def save(self, *args, **kwargs):
        if not self.status or self._status_auto():
            today = timezone.now().date()
            if self.due_date and self.due_date < today:
                self.status = 'Completed'
            else:
                self.status = 'InProgress'
        super().save(*args, **kwargs)
        
    def _status_auto(self):
        if not self.pk:
            return True
        old = Task.objects.filter(pk=self.pk).first()
        return old and old.status == self.status

    def __str__(self):
        return self.title

class Comments(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')

    def __str__(self):
        return f'Comment by {self.author} on {self.content_object}'
 
class Attachment(models.Model):
    file = models.FileField(upload_to='attachments/')
    description = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)

    # Generic relation
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
       
# === Матеріали та товари ===
class Material(models.Model):
    name = models.CharField(max_length=200, unique=True)
    unit = models.CharField(max_length=50)
    cost = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name

class Product(models.Model):
    name  = models.CharField(max_length=200, db_index=True)
    sku   = models.CharField(max_length=50, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    stock = models.IntegerField()

    def __str__(self):
        return self.name

# === Обладнання ===
class Equipment(models.Model):
    name = models.CharField(max_length=200)
    serial_number = models.CharField(max_length=100, unique=True)
    model = models.CharField(max_length=100, blank=True)
    location = models.CharField(max_length=200, blank=True)
    status = models.CharField(max_length=100, default='В робочому стані')
    last_maintenance = models.DateField(null=True, blank=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.serial_number})"

# === Звіти ===
class Report(models.Model):
    REPORT_TYPE_CHOICES = [
        ('Project', 'Проєктний звіт'),
        ('Order', 'Звіт по замовленню'),
        ('Task', 'Звіт по задачах'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reports')
    project = models.ForeignKey(Project, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports')
    order = models.ForeignKey(Order, null=True, blank=True, on_delete=models.SET_NULL, related_name='reports')
    created_at = models.DateTimeField(auto_now_add=True)
    report_type = models.CharField(max_length=20, choices=REPORT_TYPE_CHOICES, db_index=True)
    file = models.FileField(upload_to='reports/', null=True, blank=True)

    class Meta:
        indexes = [
            models.Index(fields=['report_type']),
            models.Index(fields=['created_by']),
        ]

    def __str__(self):
        return self.title

# === Лог витрат матеріалів ===
class MaterialUsageLog(models.Model):
    material = models.ForeignKey(Material, on_delete=models.PROTECT, related_name='usage_logs')
    task = models.ForeignKey(Task, on_delete=models.SET_NULL, null=True, blank=True, related_name='material_usages')
    used_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='material_actions')
    quantity = models.PositiveIntegerField()
    usage_date = models.DateTimeField(auto_now_add=True)
    note = models.TextField(blank=True)

    def __str__(self):
        return f"{self.material.name} – {self.quantity} од. – {self.usage_date.date()}"

# === Оцінка ефективності працівників ===
class EmployeePerformance(models.Model):
    employee = models.ForeignKey(User, on_delete=models.CASCADE, related_name='performance_records')
    date = models.DateField()
    completed_tasks = models.PositiveIntegerField(default=0)
    avg_completion_time = models.DurationField(null=True, blank=True)
    efficiency_score = models.DecimalField(max_digits=5, decimal_places=2)
    note = models.TextField(blank=True)

    class Meta:
        unique_together = ('employee', 'date')
        indexes = [models.Index(fields=['employee', 'date'])]

    def __str__(self):
        return f"{self.employee.username} - {self.date} - {self.efficiency_score}%"
    
class TaskNotification(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='notifications')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_notifications')
    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='received_notifications')
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)