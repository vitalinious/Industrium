from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import RegisterUserView, ProfileView, PositionViewSet, DepartmentViewSet, EmployeeViewSet, suggest_positions, suggest_departments, suggest_employees

router = DefaultRouter()
router.register(r'positions', PositionViewSet, basename='position')
router.register(r'departments', DepartmentViewSet, basename='department')
router.register(r'employees', EmployeeViewSet, basename='user')

urlpatterns = [
    path('auth/create-employee/', RegisterUserView.as_view(), name='create-employee'),
    path('auth/profile/',         ProfileView.as_view(),      name='user-profile'),
    
    path('positions/suggest/',      suggest_positions,        name='suggest-positions'),
    path('departments/suggest/',    suggest_departments,      name='suggest-departments'),
    path('employees/suggest/',      suggest_employees,        name='employees-suggest'),
    
    path('', include(router.urls)),
]