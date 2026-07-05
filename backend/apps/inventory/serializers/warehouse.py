"""
Warehouse serializer.
"""
from rest_framework import serializers
from ..models.warehouse import Warehouse


class WarehouseSerializer(serializers.ModelSerializer):
    class Meta:
        model = Warehouse
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at',)
