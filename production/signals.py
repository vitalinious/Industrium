from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import Project, ProjectComment, Attachment, Task

def update_project_timestamp(project):
    project.save(update_fields=['last_modified_at'])

@receiver(post_save, sender=ProjectComment)
@receiver(post_delete, sender=ProjectComment)
def update_project_on_comment_change(sender, instance, **kwargs):
    if instance.project:
        update_project_timestamp(instance.project)

@receiver(post_save, sender=Attachment)
@receiver(post_delete, sender=Attachment)
def update_project_on_file_change(sender, instance, **kwargs):
    if instance.content_type.model == 'project':
        try:
            project = Project.objects.get(id=instance.object_id)
            update_project_timestamp(project)
        except Project.DoesNotExist:
            pass

@receiver(post_save, sender=Task)
@receiver(post_delete, sender=Task)
def update_project_on_task_change(sender, instance, **kwargs):
    if instance.project:
        update_project_timestamp(instance.project)
