"""
Product model.
"""
from django.db import models


class Product(models.Model):
    code = models.CharField(max_length=50, unique=True, verbose_name='商品编码')
    name = models.CharField(max_length=200, verbose_name='商品名称')
    spec = models.CharField(max_length=500, blank=True, verbose_name='规格型号')
    category = models.CharField(max_length=100, blank=True, verbose_name='商品分类')
    uom = models.ForeignKey('commons.UOM', on_delete=models.PROTECT, verbose_name='基本计量单位')
    purchase_price = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='采购价')
    sale_price = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='销售价')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='税率(%)')
    is_active = models.BooleanField(default=True, verbose_name='启用')
    remark = models.TextField(blank=True, verbose_name='备注')
    created_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True, related_name='+')
    updated_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_product'
        verbose_name = '商品'
        verbose_name_plural = '商品'
        indexes = [
            models.Index(fields=['code']),
            models.Index(fields=['category']),
        ]

    def __str__(self):
        return f'[{self.code}] {self.name}'
