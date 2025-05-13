from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Project, Task, Comments, Attachment

def update_project_timestamp(project):
    project.save(update_fields=['last_modified_at'])

# 🟠 Оновлення проєкту при зміні коментаря
@receiver(post_save, sender=Comments)
@receiver(post_delete, sender=Comments)
def update_project_on_comment_change(sender, instance, **kwargs):
    if instance.content_type.model == 'project':
        try:
            project = Project.objects.get(id=instance.object_id)
            update_project_timestamp(project)
        except Project.DoesNotExist:
            pass

# 🟡 Оновлення проєкту при додаванні/видаленні файлу
@receiver(post_save, sender=Attachment)
@receiver(post_delete, sender=Attachment)
def update_project_on_file_change(sender, instance, **kwargs):
    if instance.content_type.model == 'project':
        try:
            project = Project.objects.get(id=instance.object_id)
            update_project_timestamp(project)
        except Project.DoesNotExist:
            pass

# 🔵 Оновлення проєкту при зміні задачі
@receiver(post_save, sender=Task)
@receiver(post_delete, sender=Task)
def update_project_on_task_change(sender, instance, **kwargs):
    if instance.project:
        update_project_timestamp(instance.project)
