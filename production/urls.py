from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (CustomTokenView, ProfileView,
                    PositionViewSet, DepartmentViewSet,
                    EmployeeViewSet, ProjectViewSet,
                    ProjectCommentViewSet, AttachmentViewSet,
                    TaskViewSet, TaskCommentViewSet,
                    suggest_positions, suggest_departments,
                    suggest_employees, suggest_project,
                    suggest_employees_filtered, my_tasks,
                    unread_notifications, dashboard_summary,
                    suggest_tasks)

router = DefaultRouter()
router.register(r'positions',       PositionViewSet,            basename='position')
router.register(r'departments',     DepartmentViewSet,          basename='department')
router.register(r'employees',       EmployeeViewSet,            basename='user')
router.register(r'projects',        ProjectViewSet,             basename='project')
router.register(r'project-comments',ProjectCommentViewSet,      basename='project-comments')
router.register(r'task-comments',   TaskCommentViewSet,         basename='task-comments')
router.register(r'attachments',     AttachmentViewSet)
router.register(r'tasks',           TaskViewSet,                basename='tasks')

urlpatterns = [
    path('api/token/',              CustomTokenView.as_view(),  name='token_obtain_pair'),
    path('auth/profile/',           ProfileView.as_view(),      name='user-profile'),
    
    path('positions/suggest/',      suggest_positions,          name='suggest-positions'),
    path('departments/suggest/',    suggest_departments,        name='suggest-departments'),
    path('employees/suggest/',      suggest_employees,          name='employees-suggest'),
    path('projects/suggest/',       suggest_project,            name='projects-suggest'),
    path('employees/filtered/',     suggest_employees_filtered, name='suggest-employees-filtered'),
    path('tasks/my/',               my_tasks,                   name='my-tasks'),
    path('notifications/unread/',   unread_notifications,       name='unread-notifications'),
    path('dashboard/summary/',      dashboard_summary,          name='dashboard-summary'),
    path('tasks/suggest/',          suggest_tasks,              name='tasks-suggest'),
    
    path('', include(router.urls)),
]