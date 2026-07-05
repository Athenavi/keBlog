"""
Partner (Customer / Supplier) model.
"""
from django.db import models


class Partner(models.Model):
    """合作伙伴 — 既是客户也是供应商"""
    PARTNER_TYPE_CHOICES = [
        ('customer', '客户'),
        ('supplier', '供应商'),
        ('both', '既是客户又是供应商'),
    ]

    code = models.CharField(max_length=50, unique=True, verbose_name='编码')
    name = models.CharField(max_length=200, verbose_name='名称')
    type = models.CharField(max_length=20, choices=PARTNER_TYPE_CHOICES, verbose_name='类型')
    contact_person = models.CharField(max_length=100, blank=True, verbose_name='联系人')
    phone = models.CharField(max_length=20, blank=True, verbose_name='电话')
    email = models.EmailField(blank=True, verbose_name='邮箱')
    address = models.TextField(blank=True, verbose_name='地址')
    credit_limit = models.DecimalField(max_digits=12, decimal_places=2, default=0, verbose_name='信用额度')
    is_active = models.BooleanField(default=True, verbose_name='启用')
    remark = models.TextField(blank=True, verbose_name='备注')
    created_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True, related_name='+')
    updated_by = models.ForeignKey('commons.User', on_delete=models.SET_NULL, null=True, related_name='+')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'commons_partner'
        verbose_name = '合作伙伴'
        verbose_name_plural = '合作伙伴'
        indexes = [
            models.Index(fields=['type']),
            models.Index(fields=['code']),
        ]

    def __str__(self):
        return f'[{self.get_type_display()}] {self.name}'
