from django.urls import reverse
from rest_framework import status
from rest_framework.test import APIClient
from .base import BaseTestCase

class DepartmentTests(BaseTestCase):
    def test_get_departments(self):
        # Попередньо створюємо 1 відділ у setUp базового класу
        url = reverse('department-list')
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(len(response.data) >= 1)
        print("Тест 'Отримання списку відділів' пройдено успішно")

    def test_create_department_as_manager(self):
        url = reverse('department-list')
        data = {"name": "Новий відділ"}
        response = self.client_manager.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        print("Тест 'Створення відділу менеджером' пройдено успішно")

    def test_create_department_as_worker_forbidden(self):
        url = reverse('department-list')
        data = {"name": "Спроба від робітника"}
        response = self.client_worker.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("Тест 'Заборона створення відділу робітником' пройдено успішно")

    def test_update_department_as_manager(self):
        dept = self.department
        url = reverse('department-detail', args=[dept.id])
        data = {"name": "Оновлений відділ"}
        response = self.client_manager.put(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], "Оновлений відділ")
        print("Тест 'Оновлення відділу менеджером' пройдено успішно")

    def test_delete_department_as_manager(self):
        dept = self.department

        # Видаляємо користувачів та позиції, щоб зняти залежність
        dept.users.all().delete()
        dept.positions.all().delete()

        url = reverse('department-detail', args=[dept.id])
        response = self.client_manager.delete(url)
        self.assertIn(response.status_code, [status.HTTP_204_NO_CONTENT, status.HTTP_200_OK])
        print("Тест 'Видалення відділу менеджером' пройдено успішно")

    def test_delete_department_as_worker_forbidden(self):
        dept = self.department
        url = reverse('department-detail', args=[dept.id])
        response = self.client_worker.delete(url)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        print("Тест 'Заборона видалення відділу робітником' пройдено успішно")

    def test_get_department_detail(self):
        dept = self.department
        url = reverse('department-detail', args=[dept.id])
        response = self.client_manager.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], dept.name)
        print("Тест 'Отримання детальної інформації про відділ' пройдено успішно")
