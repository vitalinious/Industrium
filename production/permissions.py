from rest_framework.permissions import BasePermission, SAFE_METHODS

class IsManagerOrReadOnly(BasePermission):
    """
    Дозволяє повний доступ лише керівникам. Іншим — лише читання.
    """
    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.role == 'Manager'

class IsWorker(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'Worker'