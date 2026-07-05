"""
SalesOrder serializers.
"""
from rest_framework import serializers
from ..models.sales_order import SalesOrder, SalesOrderLine
from apps.commons.serializers.base import BaseModelSerializer


class SalesOrderLineSerializer(BaseModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_code = serializers.CharField(source='product.code', read_only=True)

    class Meta:
        model = SalesOrderLine
        fields = '__all__'
        read_only_fields = ('delivered_qty',)


class SalesOrderListSerializer(BaseModelSerializer):
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = SalesOrder
        fields = ('id', 'order_no', 'customer_name', 'warehouse_name', 'order_date',
                  'status', 'total_amount', 'created_by_name', 'created_at')
        read_only_fields = fields


class SalesOrderDetailSerializer(BaseModelSerializer):
    lines = SalesOrderLineSerializer(many=True, read_only=True)
    customer_name = serializers.CharField(source='customer.name', read_only=True)
    warehouse_name = serializers.CharField(source='warehouse.name', read_only=True)
    created_by_name = serializers.CharField(source='created_by.username', read_only=True)

    class Meta:
        model = SalesOrder
        fields = '__all__'
        read_only_fields = ('order_no', 'status', 'total_amount', 'created_at', 'updated_at',
                            'created_by', 'updated_by',)
