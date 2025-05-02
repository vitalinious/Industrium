from django.contrib import admin
from .models import (
    User, Workshop, Worker, Task, Document,
    Equipment, Material, MaterialUsage, PerformanceReport
)
from django.contrib.auth.admin import UserAdmin

admin.site.register(User)
admin.site.register(Workshop)
admin.site.register(Worker)
admin.site.register(Task)
admin.site.register(Document)
admin.site.register(Equipment)
admin.site.register(Material)
admin.site.register(MaterialUsage)
admin.site.register(PerformanceReport)