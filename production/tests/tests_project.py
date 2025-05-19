from django.urls import reverse
from rest_framework import status
from datetime import date
from django.core.files.uploadedfile import SimpleUploadedFile
from .base import BaseTestCase
from ..models import Project, Task

class ProjectTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.start_date = date(2025, 1, 1)
        self.project = Project.objects.create(
            name="Базовий проєкт",
            start_date=self.start_date
        )

    def test_create_project(self):
        url = reverse('project-list')
        data = {
            "name": "Новий проєкт",
            "description": "Опис тестового проєкту",
            "start_date": str(self.start_date),
            "end_date": "2025-12-31"
        }
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['end_date'], "2025-12-31")

        project_id = response.data['id']
        project = Project.objects.get(id=project_id)
        self.assertEqual(project.last_modified_by, self.manager)
        print("\nТест 'Створення проєкту керівником' пройдено успішно")

    def test_create_project_as_worker_forbidden(self):
        url = reverse('project-list')
        data = {
            "name": "Спроба робітника",
            "description": "Не має прав",
            "start_date": str(self.start_date)
        }
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("\nТест 'Заборона створення проєкту робітником' пройдено успішно")

    def test_get_projects(self):
        Project.objects.create(name="Ще один", start_date=self.start_date)
        url = reverse('project-list')
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        print("\nТест 'Отримання списку проєктів' пройдено успішно")

    def test_update_project(self):
        url = reverse('project-detail', args=[self.project.id])
        data = {
            "name": "Оновлений проєкт",
            "description": "Змінено опис",
            "start_date": str(self.start_date),
            "end_date": "2025-12-31"
        }
        response = self.client_manager.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Оновлений проєкт")
        self.assertEqual(response.data['end_date'], "2025-12-31")

        self.project.refresh_from_db()
        self.assertEqual(self.project.last_modified_by, self.manager)
        print("\nТест 'Оновлення проєкту керівником' пройдено успішно")

    def test_delete_project(self):
        project = Project.objects.create(name="Тимчасовий", start_date=self.start_date)
        url = reverse('project-detail', args=[project.id])
        response = self.client_manager.delete(url)
        self.assertEqual(response.status_code, 204)
        print("\nТест 'Видалення проєкту керівником' пройдено успішно")

    def test_add_project_comment(self):
        url = reverse('project-comments-list')
        data = {
            "content": "Це тестовий коментар",
            "object_id": self.project.id
        }
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['content'], "Це тестовий коментар")
        print("\nТест 'Додавання коментаря до проєкту' пройдено успішно")

    def test_add_project_file(self):
        url = reverse('attachment-list')
        file = SimpleUploadedFile("test.txt", b"file content")
        data = {
            "file": file,
            "description": "Тестовий файл",
            "object_id": self.project.id,
            "content_type_model": "project",
            "content_type_app": "production"
        }
        response = self.client_manager.post(url, data, format='multipart')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['description'], "Тестовий файл")
        print("\nТест 'Додавання файлу до проєкту' пройдено успішно")

    def test_confirm_project_completion(self):
        task = Task.objects.create(
            title="Завершена задача",
            creator=self.manager,
            assignee=self.worker,
            project=self.project,
            status="Completed",
            due_date=date(2023, 1, 1)
        )
        task.save(force_update=True)
        url = reverse('project-complete', args=[self.project.id])
        response = self.client_manager.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        self.project.refresh_from_db()
        self.assertEqual(self.project.status, "Completed")
        print("\nТест 'Підтвердження завершення проєкту керівником' пройдено успішно")

    def test_forbid_completion_with_active_tasks(self):
        Task.objects.create(
            title="Незавершена задача",
            creator=self.manager,
            assignee=self.worker,
            project=self.project,
            status="InProgress"
        )

        url = reverse('project-complete', args=[self.project.id])
        response = self.client_manager.post(url)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

        self.project.refresh_from_db()
        self.assertNotEqual(self.project.status, "Completed")
        print("\nТест 'Заборона завершення проєкту з незавершеними задачами' пройдено успішно")
