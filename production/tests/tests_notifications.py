from django.test import TestCase
from rest_framework.test import APIClient
from .base import BaseTestCase  # Припускаємо, що BaseTestCase містить спільні налаштування і створення користувачів
from rest_framework import status

class UserTests(BaseTestCase):

    def test_user_creation(self):
        """Тест Створення користувачів: перевірка ролей і коректності створення"""
        self.assertEqual(self.manager.role, "Manager")
        self.assertEqual(self.worker.role, "Worker")
        print("Тест 'Створення користувачів' пройдено успішно")

    def test_get_user_profile(self):
        """Тест Отримання профілю авторизованого користувача"""
        url = '/auth/profile/'
        client = APIClient()
        client.force_authenticate(user=self.manager)
        response = client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data)
        self.assertEqual(response.data['username'], self.manager.username)
        print("Тест 'Отримання профілю користувача' пройдено успішно")

    def test_unauthenticated_profile_access(self):
        """Тест Доступ до профілю без авторизації має заборонятись"""
        url = '/auth/profile/'
        client = APIClient()
        response = client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        print("Тест 'Доступ без авторизації до профілю заборонено' пройдено успішно")