"""
Unit of Measure models.
"""
from django.db import models


class UOM(models.Model):
    """计量单位"""
    name = models.CharField(max_length=50, unique=True, verbose_name='单位名称')
    short_name = models.CharField(max_length=10, verbose_name='简称')
    category = models.CharField(max_length=50, blank=True, verbose_name='单位类别')

    class Meta:
        db_table = 'commons_uom'
        verbose_name = '计量单位'
        verbose_name_plural = '计量单位'

    def __str__(self):
        return f'{self.name}({self.short_name})'


class UOMConversion(models.Model):
    """单位换算关系"""
    product = models.ForeignKey('inventory.Product', on_delete=models.CASCADE,
                                related_name='uom_conversions', verbose_name='商品')
    from_uom = models.ForeignKey(UOM, on_delete=models.CASCADE,
                                 related_name='from_conversions', verbose_name='原单位')
    to_uom = models.ForeignKey(UOM, on_delete=models.CASCADE,
                               related_name='to_conversions', verbose_name='目标单位')
    ratio = models.DecimalField(max_digits=12, decimal_places=6, verbose_name='换算比例')

    class Meta:
        db_table = 'commons_uom_conversion'
        unique_together = ('product', 'from_uom', 'to_uom')
        verbose_name = '单位换算'
        verbose_name_plural = '单位换算'
