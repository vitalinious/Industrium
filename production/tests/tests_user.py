from rest_framework import status
from rest_framework.test import APIClient
from django.urls import reverse
from .base import BaseTestCase
from django.contrib.auth import get_user_model

User = get_user_model()

class UserTests(BaseTestCase):

    def test_user_creation(self):
        """Тест Створення користувачів: перевірка ролей і коректності створення"""
        self.assertEqual(self.manager.role, "Manager")
        self.assertEqual(self.worker.role, "Worker")
        print("\nТест 'Створення користувачів' пройдено успішно")

    def test_get_user_profile(self):
        """Тест Отримання профілю авторизованого користувача"""
        url = reverse('user-profile')
        client = APIClient()
        client.force_authenticate(user=self.manager)
        response = client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('username', response.data)
        self.assertEqual(response.data['username'], self.manager.username)
        print("\nТест 'Отримання профілю користувача' пройдено успішно")

    def test_unauthenticated_profile_access(self):
        """Тест Доступ до профілю без авторизації має заборонятись"""
        url = reverse('user-profile')
        client = APIClient()  # без авторизації
        response = client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        print("\nТест 'Доступ без авторизації до профілю заборонено' пройдено успішно")

    def test_user_list_visible_to_manager(self):
        """Тест Отримання списку користувачів доступне менеджеру"""
        url = reverse('user-list')
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(response.data), 1)
        print("\nТест 'Список користувачів доступний менеджеру' пройдено успішно")


    def test_worker_cannot_create_user(self):
        """Тест Створення нового користувача заборонено робітнику"""
        url = reverse('user-list')
        data = {
            "first_name": "Новий",
            "last_name": "Користувач",
            "email": "new@site.com",
            "phone_number": "+380123456789",
            "department": self.department.id,
            "position": self.position.id,
            "role": "Worker"
        }
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("\nТест 'Робітнику заборонено створювати користувача' пройдено успішно")

    def test_manager_can_update_user(self):
        """Тест Менеджер може оновити дані користувача"""
        url = reverse('user-detail', args=[self.worker.id])
        data = {"first_name": "Оновлено"}
        response = self.client_manager.patch(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.worker.refresh_from_db()
        self.assertEqual(self.worker.first_name, "Оновлено")
        print("\nТест 'Менеджер може оновити користувача' пройдено успішно")
