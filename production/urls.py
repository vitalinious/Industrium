from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (RegisterUserView, ProfileView,
                    PositionViewSet, DepartmentViewSet,
                    EmployeeViewSet, ProjectViewSet,
                    suggest_positions, suggest_departments,
                    suggest_employees, suggest_project)

router = DefaultRouter()
router.register(r'positions',       PositionViewSet,            basename='position')
router.register(r'departments',     DepartmentViewSet,          basename='department')
router.register(r'employees',       EmployeeViewSet,            basename='user')
router.register(r'projects',        ProjectViewSet,             basename='project')

urlpatterns = [
    path('auth/create-employee/',   RegisterUserView.as_view(), name='create-employee'),
    path('auth/profile/',           ProfileView.as_view(),      name='user-profile'),
    
    path('positions/suggest/',      suggest_positions,          name='suggest-positions'),
    path('departments/suggest/',    suggest_departments,        name='suggest-departments'),
    path('employees/suggest/',      suggest_employees,          name='employees-suggest'),
    path('projects/suggest/',       suggest_project,            name='projects-suggest'),
    
    path('', include(router.urls)),
]