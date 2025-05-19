from django.urls import reverse
from rest_framework import status
from datetime import date
from .base import BaseTestCase
from ..models import Task

class TaskTests(BaseTestCase):

    def setUp(self):
        super().setUp()
        self.task = Task.objects.create(
            title="Базова задача",
            creator=self.manager,
            assignee=self.worker,
            status="Planned",
            due_date=date(2025, 6, 1)
        )

    def test_create_task(self):
        url = reverse('tasks-list')
        data = {
            "title": "Нова задача",
            "description": "Опис задачі",
            "assignee": self.worker.id,
            "priority": 2,
            "due_date": "2025-06-15"
        }
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("\nТест 'Створення задачі керівником' пройдено успішно")

    def test_create_task_as_worker_forbidden(self):
        url = reverse('tasks-list')
        data = {
            "title": "Спроба робітника",
            "description": "Не має прав",
            "assignee": self.worker.id,
            "priority": 1,
            "due_date": "2025-06-15"
        }
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("\nТест 'Заборона створення задачі робітником' пройдено успішно")

    def test_get_tasks(self):
        url = reverse('tasks-list')
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        print("\nТест 'Отримання списку задач' пройдено успішно")

    def test_update_task(self):
        url = reverse('tasks-detail', args=[self.task.id])
        data = {
            "title": "Оновлена задача",
            "description": "Оновлений опис",
            "assignee": self.worker.id,
            "priority": 3,
            "due_date": "2025-06-20"
        }
        response = self.client_manager.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Оновлена задача")
        print("\nТест 'Оновлення задачі керівником' пройдено успішно")

    def test_delete_task(self):
        task = Task.objects.create(
            title="Тимчасова задача",
            creator=self.manager,
            assignee=self.worker,
            due_date=date(2025, 6, 30)
        )
        url = reverse('tasks-detail', args=[task.id])
        response = self.client_manager.delete(url)
        self.assertEqual(response.status_code, 204)
        print("\nТест 'Видалення задачі керівником' пройдено успішно")

    def test_mark_task_done_by_assignee(self):
        url = reverse('tasks-mark-done', args=[self.task.id])
        response = self.client_worker.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertTrue(self.task.is_done)
        print("\nТест 'Позначення задачі як виконано виконавцем' пройдено успішно")

    def test_submit_complete_by_assignee(self):
        url = reverse('tasks-submit-complete', args=[self.task.id])
        response = self.client_worker.post(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.task.refresh_from_db()
        self.assertEqual(self.task.status, "PendingConfirmation")
        print("\nТест 'Надсилання задачі на підтвердження' пройдено успішно")

    def test_worker_cannot_access_task_not_assigned(self):
        """Тест Неможливість доступу працівника до чужої задачі"""
        other_worker = self.create_user("worker2", "worker2@mail.com", "Worker")
        task = Task.objects.create(
            title="Чужа задача",
            creator=self.manager,
            assignee=self.manager,
            due_date=date(2025, 7, 1)
        )
        url = reverse('tasks-detail', args=[task.id])
        client = self.create_client_for_user(other_worker)
        response = client.get(url)
        self.assertIn(response.status_code, [403, 404])
        print("\nТест 'Захист від доступу до чужої задачі для працівника' пройдено успішно")
