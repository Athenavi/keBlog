"""
Custom User Model — extended from day one.
"""
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    phone = models.CharField(max_length=20, unique=True, null=True, blank=True, verbose_name='手机号')
    employee_id = models.CharField(max_length=50, unique=True, null=True, blank=True, verbose_name='工号')
    department = models.CharField(max_length=100, blank=True, verbose_name='部门')
    avatar = models.URLField(blank=True, verbose_name='头像')
    is_online = models.BooleanField(default=False, verbose_name='在线状态')
    roles = models.ManyToManyField('commons.Role', blank=True, verbose_name='角色')

    class Meta:
        db_table = 'users_user'
        verbose_name = '用户'
        verbose_name_plural = '用户'
        indexes = [
            models.Index(fields=['employee_id']),
            models.Index(fields=['phone']),
        ]

    def __str__(self):
        name = self.get_full_name() or self.employee_id or self.username
        return f'{name} ({self.department or "未分配部门"})'
