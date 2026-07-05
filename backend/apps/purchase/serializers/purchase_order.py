"""
PurchaseOrder serializers.
"""
from rest_framework import serializers
from ..models.purchase_order import PurchaseOrder, PurchaseOrderLine
from apps.commons.serializers.base import BaseModelSerializer


class PurchaseOrderLineSerializer(BaseModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)

    class Meta:
        model = PurchaseOrderLine
        fields = '__all__'
        read_only_fields = ('received_qty',)


class PurchaseOrderListSerializer(BaseModelSerializer):
    """轻盈列表序列化器 — 不含嵌套行"""
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = ('id', 'order_no', 'supplier_name', 'warehouse_name', 'order_date',
                  'status', 'total_amount', 'created_by_name', 'created_at')
        read_only_fields = fields


class PurchaseOrderDetailSerializer(BaseModelSerializer):
    """详情序列化器 — 含嵌套行"""
    lines = PurchaseOrderLineSerializer(many=True, read_only=True)
    supplier_name = serializers.CharField(source='supplier.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = PurchaseOrder
        fields = '__all__'
        read_only_fields = ('order_no', 'status', 'total_amount', 'created_at', 'updated_at',
                            'created_by', 'updated_by',)
