"""
Warehouse and Location models.
"""
from django.db import models


class Warehouse(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='仓库编码')
    name = models.CharField(max_length=200, verbose_name='仓库名称')
    address = models.TextField(blank=True, verbose_name='地址')
    is_active = models.BooleanField(default=True, verbose_name='启用')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_warehouse'
        verbose_name = '仓库'
        verbose_name_plural = '仓库'

    def __str__(self):
        return f'[{self.code}] {self.name}'


class Location(models.Model):
    warehouse = models.ForeignKey(Warehouse, on_delete=models.PROTECT,
                                  related_name='locations', verbose_name='所属仓库')
    code = models.CharField(max_length=50, verbose_name='货位编码')
    name = models.CharField(max_length=200, blank=True, verbose_name='货位名称')
    is_active = models.BooleanField(default=True, verbose_name='启用')

    class Meta:
        db_table = 'inventory_location'
        unique_together = ('warehouse', 'code')
        verbose_name = '货位'
        verbose_name_plural = '货位'

    def __str__(self):
        return f'{self.warehouse.code}-{self.code}'
