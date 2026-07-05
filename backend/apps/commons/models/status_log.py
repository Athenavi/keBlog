"""
Status log — tracks every state transition.
"""
from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType


class StatusLog(models.Model):
    """状态变更日志 — 记录所有单据的状态转换"""
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    from_status = models.CharField(max_length=30, verbose_name='原状态')
    to_status = models.CharField(max_length=30, verbose_name='新状态')
    action = models.CharField(max_length=30, verbose_name='操作')
    remark = models.TextField(blank=True, verbose_name='备注')
    operator = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True, verbose_name='操作人')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'commons_status_log'
        ordering = ['-created_at']
        verbose_name = '状态变更日志'
        verbose_name_plural = '状态变更日志'
