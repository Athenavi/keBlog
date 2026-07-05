"""
Stock — cached aggregate of StockMove.
"""
from django.db import models


class Stock(models.Model):
    """库存汇总表 — 通过 StockMove 流水实时计算"""
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, verbose_name='商品')
    warehouse = models.ForeignKey('inventory.Warehouse', on_delete=models.PROTECT, verbose_name='仓库')
    location = models.ForeignKey('inventory.Location', on_delete=models.SET_NULL,
                                 null=True, blank=True, verbose_name='货位')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='当前库存量')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'inventory_stock'
        unique_together = ('product', 'warehouse', 'location')
        verbose_name = '库存'
        verbose_name_plural = '库存'
        indexes = [
            models.Index(fields=['product', 'warehouse']),
        ]

    def __str__(self):
        return f'{self.product.name} @ {self.warehouse.name}: {self.quantity}'
