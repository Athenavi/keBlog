"""
StockMove — the core inventory transaction log.

Golden rule: inventory quantity is NEVER modified directly.
Every in/out operation writes a StockMove record.
"""
from django.db import models


class StockMove(models.Model):
    """库存移动流水 — 核心表"""
    MOVE_TYPE_CHOICES = [
        ('IN', '入库'),
        ('OUT', '出库'),
    ]

    move_type = models.CharField(max_length=10, choices=MOVE_TYPE_CHOICES, verbose_name='移动类型')
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, verbose_name='商品')
    warehouse = models.ForeignKey('inventory.Warehouse', on_delete=models.PROTECT, verbose_name='仓库')
    location = models.ForeignKey('inventory.Location', on_delete=models.SET_NULL,
                                 null=True, blank=True, verbose_name='货位')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='移动数量')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, null=True, blank=True, verbose_name='移动单价')
    reference_type = models.CharField(max_length=50, verbose_name='来源单据类型')
    reference_id = models.BigIntegerField(verbose_name='来源单据ID')
    reference_line_id = models.BigIntegerField(null=True, blank=True, verbose_name='来源单据行ID')
    remark = models.TextField(blank=True, verbose_name='备注')
    created_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True, verbose_name='操作人')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'inventory_stock_move'
        verbose_name = '库存移动流水'
        verbose_name_plural = '库存移动流水'
        indexes = [
            models.Index(fields=['product', 'warehouse']),
            models.Index(fields=['move_type']),
            models.Index(fields=['created_at']),
            models.Index(fields=['reference_type', 'reference_id']),
        ]

    def __str__(self):
        return f'{self.get_move_type_display()} {self.product.name} x{self.quantity} ({self.created_at:%Y-%m-%d %H:%M})'
