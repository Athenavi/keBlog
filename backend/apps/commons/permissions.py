"""
Custom permissions for RBAC.
"""
from rest_framework.permissions import BasePermission


class HasRole(BasePermission):
    """检查用户是否拥有指定角色（满足其一即可）"""

    def __init__(self, roles: list):
        self.required_roles = roles

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_roles = request.user.roles.values_list('code', flat=True)
        return bool(set(self.required_roles) & set(user_roles))


class HasPermission(BasePermission):
    """检查用户是否拥有指定权限（满足其一即可）"""

    def __init__(self, permissions: list):
        self.required_permissions = permissions

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        user_perms = request.user.get_all_permissions()
        return bool(set(self.required_permissions) & set(user_perms))


class IsAdmin(BasePermission):
    """仅管理员可访问"""

    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.is_superuser
