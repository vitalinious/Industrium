from django.test import TestCase
from rest_framework.test import APIClient
from ..models import User, Department, Position

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

        # Клієнти API з авторизацією
        self.client_manager = APIClient()
        self.client_manager.force_authenticate(user=self.manager)

        self.client_worker = APIClient()
        self.client_worker.force_authenticate(user=self.worker)