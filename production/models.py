from django.db import models
from django.contrib.auth.models import AbstractUser

# Користувач з ролями
class User(AbstractUser):
    ROLE_CHOICES = [
        ('chief', 'Начальник виробництва'),
        ('admin', 'Адміністратор'),
        ('director', 'Керівник вищої ланки'),
    ]
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)

# Цех
class Workshop(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)

    def __str__(self):
        return self.name

# Працівник
class Worker(models.Model):
    full_name = models.CharField(max_length=100)
    position = models.CharField(max_length=100)
    phone = models.CharField(max_length=20, blank=True)
    workshop = models.ForeignKey(Workshop, on_delete=models.CASCADE)

    def __str__(self):
        return self.full_name

# Завдання
class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    deadline = models.DateField()
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, choices=[
        ('pending', 'Очікує'),
        ('in_progress', 'Виконується'),
        ('done', 'Виконано'),
        ('delayed', 'Затримано')
    ])
    workshop = models.ForeignKey(Workshop, on_delete=models.SET_NULL, null=True)
    assigned_workers = models.ManyToManyField(Worker)

    def __str__(self):
        return self.title

# Документація
class Document(models.Model):
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to='docs/')
    created_at = models.DateTimeField(auto_now_add=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='documents')

# Обладнання
class Equipment(models.Model):
    name = models.CharField(max_length=100)
    serial_number = models.CharField(max_length=100)
    is_active = models.BooleanField(default=True)
    workshop = models.ForeignKey(Workshop, on_delete=models.SET_NULL, null=True)

# Матеріал
class Material(models.Model):
    name = models.CharField(max_length=100)
    unit = models.CharField(max_length=20)
    quantity_in_stock = models.FloatField()
    last_updated = models.DateTimeField(auto_now=True)

# Використання матеріалів
class MaterialUsage(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    material = models.ForeignKey(Material, on_delete=models.CASCADE)
    quantity_used = models.FloatField()
    used_at = models.DateTimeField(auto_now_add=True)

# Звітність
class PerformanceReport(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    task = models.ForeignKey(Task, on_delete=models.CASCADE)
    efficiency_percent = models.FloatField()
    notes = models.TextField(blank=True)
