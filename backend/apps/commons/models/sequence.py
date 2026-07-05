"""
Sequence — thread-safe document number generator.
"""
from django.db import models


class Sequence(models.Model):
    """编号序列表 — 用于生成带前缀的业务单据号"""
    prefix = models.CharField(max_length=10, verbose_name='前缀')
    year = models.IntegerField(verbose_name='年')
    month = models.IntegerField(verbose_name='月')
    day = models.IntegerField(verbose_name='日')
    last_number = models.IntegerField(default=0, verbose_name='最后号码')

    class Meta:
        db_table = 'commons_sequence'
        unique_together = ('prefix', 'year', 'month', 'day')
        verbose_name = '编号序列'
        verbose_name_plural = '编号序列'
