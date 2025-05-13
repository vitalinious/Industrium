from django.contrib import admin
from .models import (
    Position, Department, User, Project, Order, Task,
    Material, Product, Equipment, Report,
    MaterialUsageLog, EmployeePerformance,
    Comments, Attachment, TaskNotification
)


@admin.register(Position)
class PositionAdmin(admin.ModelAdmin):
    list_display = ('name', 'department')
    list_filter = ('department',)
    search_fields = ('name',)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'manager')
    search_fields = ('name',)
    autocomplete_fields = ('manager',)


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'position', 'department', 'is_staff')
    list_filter = ('role', 'position', 'department', 'is_staff')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')
    ordering = ('username',)
    autocomplete_fields = ('position', 'department')


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name', 'start_date', 'end_date', 'status', 'last_modified_by', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'description')
    autocomplete_fields = ('last_modified_by',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('number', 'client', 'project', 'created_at', 'due_date', 'status')
    list_filter = ('status',)
    autocomplete_fields = ('client', 'project')
    search_fields = ('number',)


@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assignee', 'project', 'order', 'priority', 'status', 'due_date')
    list_filter = ('status', 'priority', 'project', 'order')
    search_fields = ('title', 'description')
    autocomplete_fields = ('creator', 'assignee', 'project', 'order')


@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'created_by', 'created_at')
    list_filter = ('report_type',)
    search_fields = ('title', 'description')
    autocomplete_fields = ('created_by', 'project', 'order')


@admin.register(Material)
class MaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'unit', 'cost')
    search_fields = ('name',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('name', 'sku', 'price', 'stock')
    search_fields = ('name', 'sku')


@admin.register(Equipment)
class EquipmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'serial_number', 'model', 'location', 'status', 'last_maintenance')
    search_fields = ('name', 'serial_number', 'model')


@admin.register(MaterialUsageLog)
class MaterialUsageLogAdmin(admin.ModelAdmin):
    list_display = ('material', 'used_by', 'task', 'quantity', 'usage_date')
    list_filter = ('material', 'used_by')
    autocomplete_fields = ('material', 'used_by', 'task')


@admin.register(EmployeePerformance)
class EmployeePerformanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'completed_tasks', 'avg_completion_time', 'efficiency_score')
    list_filter = ('employee', 'date')
    autocomplete_fields = ('employee',)


@admin.register(Comments)
class CommentsAdmin(admin.ModelAdmin):
    list_display = ('author', 'content', 'created_at', 'content_type', 'object_id')
    list_filter = ('content_type', 'created_at')
    search_fields = ('content',)
    autocomplete_fields = ('author',)


@admin.register(Attachment)
class AttachmentAdmin(admin.ModelAdmin):
    list_display = ('file', 'description', 'uploaded_by', 'uploaded_at', 'content_type', 'object_id')
    list_filter = ('content_type', 'uploaded_at')
    autocomplete_fields = ('uploaded_by',)


@admin.register(TaskNotification)
class TaskNotificationAdmin(admin.ModelAdmin):
    list_display = ('task', 'sender', 'recipient', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    autocomplete_fields = ('task', 'sender', 'recipient')
