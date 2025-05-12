from django.contrib import admin
from .models import (
    Position, Department, User, Project, Order, Task,
    Material, Product, Equipment, Report,
    MaterialUsageLog, EmployeePerformance
)

admin.site.register(Position)
admin.site.register(Department)
admin.site.register(Material)
admin.site.register(Product)
admin.site.register(Equipment)

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('username', 'first_name', 'last_name', 'email', 'phone_number', 'role', 'position', 'department', 'is_staff')
    list_filter = ('role', 'position', 'department', 'is_staff')
    search_fields = ('username', 'first_name', 'last_name', 'email', 'phone_number')
    ordering = ('username',)

@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = ('name',  'start_date', 'end_date', 'status')
    list_filter = ('status',)

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('number', 'client', 'project', 'created_at', 'due_date', 'status')
    list_filter = ('status',)

@admin.register(Task)
class TaskAdmin(admin.ModelAdmin):
    list_display = ('title', 'assignee', 'project', 'order', 'priority', 'status', 'due_date')
    list_filter = ('status', 'priority', 'project', 'order')

@admin.register(Report)
class ReportAdmin(admin.ModelAdmin):
    list_display = ('title', 'report_type', 'created_by', 'created_at')
    list_filter = ('report_type',)

@admin.register(MaterialUsageLog)
class MaterialUsageLogAdmin(admin.ModelAdmin):
    list_display = ('material', 'used_by', 'task', 'quantity', 'usage_date')
    list_filter = ('material', 'used_by')

@admin.register(EmployeePerformance)
class EmployeePerformanceAdmin(admin.ModelAdmin):
    list_display = ('employee', 'date', 'completed_tasks', 'avg_completion_time', 'efficiency_score')
    list_filter = ('employee', 'date')