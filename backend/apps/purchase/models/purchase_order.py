"""
PurchaseOrder and PurchaseOrderLine models.
"""
from django.db import models


class PurchaseOrder(models.Model):
    STATUS_CHOICES = [
        ('draft', '草稿'),
        ('pending', '待审核'),
        ('confirmed', '已审核'),
        ('partially_received', '部分入库'),
        ('done', '已完成'),
        ('cancelled', '已取消'),
    ]

    order_no = models.CharField(max_length=50, unique=True, verbose_name='采购单号')
    supplier = models.ForeignKey('commons.Partner', on_delete=models.PROTECT,
                                 limit_choices_to={'type__in': ['supplier', 'both']},
                                 verbose_name='供应商')
    warehouse = models.ForeignKey('inventory.Warehouse', on_delete=models.PROTECT, verbose_name='收货仓库')
    order_date = models.DateField(verbose_name='订单日期')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft', verbose_name='状态')
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='总金额')
    remark = models.TextField(blank=True, verbose_name='备注')
    created_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True,
                                   related_name='purchase_orders_created')
    updated_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True,
                                   related_name='purchase_orders_updated')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'purchase_purchaseorder'
        verbose_name = '采购订单'
        verbose_name_plural = '采购订单'
        indexes = [
            models.Index(fields=['order_no']),
            models.Index(fields=['status']),
            models.Index(fields=['supplier']),
        ]

    def __str__(self):
        return f'{self.order_no} ({self.get_status_display()})'


class PurchaseOrderLine(models.Model):
    order = models.ForeignKey(PurchaseOrder, on_delete=models.CASCADE, related_name='lines', verbose_name='采购订单')
    line_no = models.IntegerField(verbose_name='行号')
    product = models.ForeignKey('inventory.Product', on_delete=models.PROTECT, verbose_name='商品')
    quantity = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='数量')
    received_qty = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='已入库数量')
    uom = models.ForeignKey('commons.UOM', on_delete=models.PROTECT, verbose_name='单位')
    unit_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name='单价')
    tax_rate = models.DecimalField(max_digits=5, decimal_places=2, default=0, verbose_name='税率(%)')
    subtotal = models.DecimalField(max_digits=14, decimal_places=2, default=0, verbose_name='小计')
    remark = models.TextField(blank=True, verbose_name='备注')

    class Meta:
        db_table = 'purchase_purchaseorderline'
        unique_together = ('order', 'line_no')
        verbose_name = '采购订单行'
        verbose_name_plural = '采购订单行'

    def __str__(self):
        return f'{self.order.order_no} - L{self.line_no}: {self.product.name}'
