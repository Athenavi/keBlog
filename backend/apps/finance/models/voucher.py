"""
Voucher and VoucherLine models — accounting entries.
"""
from django.db import models


class Voucher(models.Model):
    VOUCHER_TYPES = [
        ('purchase_in', '采购入库'),
        ('sales_out', '销售出库'),
        ('stock_adjust', '库存调整'),
    ]

    voucher_no = models.CharField(max_length=50, unique=True, verbose_name='凭证号')
    voucher_type = models.CharField(max_length=20, choices=VOUCHER_TYPES, verbose_name='凭证类型')
    stock_move = models.ForeignKey('inventory.StockMove', on_delete=models.SET_NULL,
                                   null=True, blank=True, verbose_name='关联库存移动')
    order_no = models.CharField(max_length=50, blank=True, verbose_name='来源单号')
    total_amount = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='金额')
    voucher_date = models.DateField(auto_now_add=True, verbose_name='凭证日期')
    remark = models.TextField(blank=True, verbose_name='备注')
    created_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True, verbose_name='制单人')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'finance_voucher'
        verbose_name = '会计凭证'
        verbose_name_plural = '会计凭证'

    def __str__(self):
        return f'{self.voucher_no} ({self.get_voucher_type_display()})'


class VoucherLine(models.Model):
    """凭证分录行"""
    DIRECTION_CHOICES = [
        ('debit', '借方'),
        ('credit', '贷方'),
    ]

    voucher = models.ForeignKey(Voucher, on_delete=models.CASCADE, related_name='lines', verbose_name='凭证')
    account_code = models.CharField(max_length=20, verbose_name='科目编码')
    account_name = models.CharField(max_length=100, verbose_name='科目名称')
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES, verbose_name='方向')
    amount = models.DecimalField(max_digits=14, decimal_places=2, verbose_name='金额')

    class Meta:
        db_table = 'finance_voucherline'
        verbose_name = '凭证分录行'
        verbose_name_plural = '凭证分录行'

    def __str__(self):
        return f'{self.account_name} ({self.get_direction_display()}) {self.amount}'
