from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .base import BaseTestCase
from ..models import Position

class PositionTests(BaseTestCase):

    def test_create_position(self):
        """Тест Створення посади керівником"""
        url = reverse('position-list')
        data = {
            "name": "Аналітик",
            "department": self.department.id
        }
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("\nТест 'Створення посади керівником' пройдено успішно")

    def test_create_position_as_worker_forbidden(self):
        """Тест Заборона створення посади робітником"""
        url = reverse('position-list')
        data = {
            "name": "Тестова посада",
            "department": self.department.id
        }
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("\nТест 'Заборона створення посади робітником' пройдено успішно")

    def test_get_positions(self):
        """Тест Отримання списку посад"""
        url = reverse('position-list')
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        print("\nТест 'Отримання списку посад' пройдено успішно")

    def test_update_position(self):
        """Тест Оновлення посади керівником"""
        position = self.position
        url = reverse('position-detail', args=[position.id])
        data = {
            "name": "Оновлена посада",
            "department": self.department.id
        }
        response = self.client_manager.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Оновлена посада")
        print("\nТест 'Оновлення посади керівником' пройдено успішно")

    def test_delete_position(self):
        """Тест Видалення посади керівником"""
        position = Position.objects.create(name="Тимчасова", department=self.department)
        url = reverse('position-detail', args=[position.id])
        response = self.client_manager.delete(url)
        self.assertEqual(response.status_code, 204)
        print("\nТест 'Видалення посади керівником' пройдено успішно")