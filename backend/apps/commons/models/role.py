"""
Role model — RBAC extension over Django's built-in Group/Permission.
"""
from django.db import models
from django.contrib.auth.models import Permission


class Role(models.Model):
    """角色 — RBAC 核心"""
    name = models.CharField(max_length=150, verbose_name='角色名称')
    code = models.CharField(max_length=100, unique=True, verbose_name='角色编码')
    description = models.TextField(blank=True, verbose_name='角色描述')
    permissions = models.ManyToManyField(Permission, blank=True, verbose_name='权限')
    is_system = models.BooleanField(default=False, verbose_name='系统角色')

    class Meta:
        db_table = 'commons_role'
        verbose_name = '角色'
        verbose_name_plural = '角色'

    def __str__(self):
        return self.name
