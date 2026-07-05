"""
Product serializer.
"""
from rest_framework import serializers
from ..models.product import Product
from apps.commons.serializers.base import BaseModelSerializer


class ProductSerializer(BaseModelSerializer):
    uom_name = serializers.CharField(source='uom.short_name', read_only=True)
    category_name = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('created_at', 'updated_at', 'created_by', 'updated_by')

    @staticmethod
    def get_category_name(obj):
        return obj.get_category_display() if hasattr(obj, 'get_category_display') else obj.category
