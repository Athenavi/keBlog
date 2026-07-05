"""
Product views.
"""
from rest_framework import permissions
from ..models.product import Product
from ..serializers.product import ProductSerializer
from apps.commons.viewsets import BaseModelViewSet
from apps.commons.permissions import HasRole


class ProductViewSet(BaseModelViewSet):
    queryset = Product.objects.select_related('uom').all()
    serializer_class = ProductSerializer
    filterset_fields = ['category', 'is_active']
    search_fields = ['code', 'name', 'spec']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            self.permission_classes = [permissions.IsAuthenticated(), HasRole(['admin', 'purchaser'])]
        else:
            self.permission_classes = [permissions.IsAuthenticated()]
        return super().get_permissions()
