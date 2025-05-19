from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .base import BaseTestCase
from ..models import Department

class DepartmentTests(BaseTestCase):
    
    def test_create_department(self):
        """Тест Створення відділу керівником"""
        url = reverse('department-list')
        data = {"name": "Новий відділ"}
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("\nТест 'Створення відділу керівником' пройдено успішно")

    def test_create_department_as_worker_forbidden(self):
        """Тест Заборона створення відділу робітником"""
        url = reverse('department-list')
        data = {"name": "Спроба від робітника"}
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("\nТест 'Заборона створення відділу робітником' пройдено успішно")

    def test_get_department(self):
        """Тест Отримання списку відділів"""
        url = reverse('department-list')
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertGreater(len(response.data), 0)
        print("\nТест 'Отримання списку відділів' пройдено успішно")

    def test_update_department(self):
        """Тест Оновлення відділу менеджером"""
        dept = self.department
        url = reverse('department-detail', args=[dept.id])
        data = {"name": "Оновлений відділ"}
        response = self.client_manager.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Оновлений відділ")
        print("\nТест 'Оновлення відділу керівником' пройдено успішно")

    def test_delete_department(self):
        new_dep = Department.objects.create(name="Тимчасовий")
        url = reverse('department-detail', args=[new_dep.id])
        response = self.client_manager.delete(url)
        self.assertEqual(response.status_code, 204)
        print("\nТест 'Видалення відділу керівником' пройдено успішно")