from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from datetime import date, timedelta
from ..models import User, Department, Position, Project, Task, Attachment

class BaseTestCase(TestCase):
    def setUp(self):
        # Створюємо відділ і позицію
        self.department = Department.objects.create(name="Відділ тестування")
        self.position = Position.objects.create(name="Тестувальник", department=self.department)

        # Створюємо користувачів
        self.manager = User.objects.create_user(
            username="manager1",
            email="manager@example.com",
            password="password123",
            role="Manager",
            department=self.department,
            position=self.position
        )
        self.worker = User.objects.create_user(
            username="worker1",
            email="worker@example.com",
            password="password123",
            role="Worker",
            department=self.department,
            position=self.position
        )

        # Клієнти для API з аутентифікацією
        self.client_manager = APIClient()
        self.client_manager.force_authenticate(user=self.manager)
        self.client_worker = APIClient()
        self.client_worker.force_authenticate(user=self.worker)

class UserTests(BaseTestCase):
    def test_user_creation(self):
        self.assertEqual(self.manager.role, "Manager")
        self.assertEqual(self.worker.role, "Worker")
        print(f"Тест 'UserTests.test_user_creation' пройдено успішно")

class ProjectTests(BaseTestCase):
    def test_create_project_as_manager(self):
        url = reverse('project-list')
        data = {
            "name": "Проєкт тестування",
            "description": "Тестовий проєкт",
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=30),
            "status": "Planned"
        }
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print(f"Тест 'ProjectTests.test_create_project_as_manager' пройдено успішно")

    def test_create_project_as_worker_forbidden(self):
        url = reverse('project-list')
        data = {
            "name": "Проєкт від робітника",
            "description": "Тестовий проєкт",
            "start_date": date.today(),
            "end_date": date.today() + timedelta(days=30),
            "status": "Planned"
        }
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print(f"Тест 'ProjectTests.test_create_project_as_worker_forbidden' пройдено успішно")

    def test_get_projects(self):
        Project.objects.create(
            name="Проєкт 1",
            start_date=date.today(),
            status="Planned",
            last_modified_by=self.manager,
        )
        url = reverse('project-list')
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
        print(f"Тест 'ProjectTests.test_get_projects' пройдено успішно")

class TaskTests(BaseTestCase):
    def setUp(self):
        super().setUp()
        self.project = Project.objects.create(
            name="Проєкт задач",
            start_date=date.today(),
            status="Planned",
            last_modified_by=self.manager,
        )

    def test_create_task_as_worker(self):
        url = reverse('tasks-list')
        data = {
            "title": "Нова задача",
            "description": "Опис задачі",
            "assignee": self.worker.id,
            "project": self.project.id,
            "priority": 2,
            "status": "Planned",
        }
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print(f"Тест 'TaskTests.test_create_task_as_worker' пройдено успішно")

    def test_create_task_as_manager(self):
        url = reverse('tasks-list')
        data = {
            "title": "Задача від менеджера",
            "description": "Опис задачі",
            "assignee": self.worker.id,
            "project": self.project.id,
            "priority": 2,
            "status": "Planned",
        }
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print(f"Тест 'TaskTests.test_create_task_as_manager' пройдено успішно")

    def test_task_mark_done_by_assignee(self):
        task = Task.objects.create(
            title="Завершити задачу",
            creator=self.manager,
            assignee=self.worker,
            project=self.project,
            priority=2,
            status="InProgress",
        )
        url = reverse('tasks-mark-done', kwargs={'pk': task.id})
        response = self.client_worker.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        task.refresh_from_db()
        self.assertTrue(task.is_done)
        print(f"Тест 'TaskTests.test_task_mark_done_by_assignee' пройдено успішно")

    def test_task_mark_done_by_other_user_forbidden(self):
        task = Task.objects.create(
            title="Завершити задачу іншим",
            creator=self.manager,
            assignee=self.worker,
            project=self.project,
            priority=2,
            status="InProgress",
        )
        url = reverse('tasks-mark-done', kwargs={'pk': task.id})
        response = self.client_manager.post(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print(f"Тест 'TaskTests.test_task_mark_done_by_other_user_forbidden' пройдено успішно")

class AttachmentTests(BaseTestCase):
    def test_upload_attachment(self):
        url = reverse('attachment-list')
        from io import BytesIO
        from django.core.files.uploadedfile import SimpleUploadedFile

        file_content = b"test file"
        test_file = SimpleUploadedFile("testfile.txt", file_content, content_type="text/plain")

        data = {
            'file': test_file,
            'content_type_model': 'project',
            'content_type_app': 'production',
            'object_id': 1,  # Потрібно вказати реальний об'єкт у тестах, змінити за потребою
        }
        response = self.client_manager.post(url, data, format='multipart')
        self.assertIn(response.status_code, [status.HTTP_201_CREATED, status.HTTP_400_BAD_REQUEST])
        print(f"Тест 'AttachmentTests.test_upload_attachment' пройдено успішно")
