"""
Warehouse views.
"""
from rest_framework import permissions
from ..models.warehouse import Warehouse
from ..serializers.warehouse import WarehouseSerializer
from apps.commons.viewsets import BaseModelViewSet
from apps.commons.permissions import HasRole


class WarehouseViewSet(BaseModelViewSet):
    queryset = Warehouse.objects.all()
    serializer_class = WarehouseSerializer
    search_fields = ['code', 'name']
    ordering = ['code']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            self.permission_classes = [permissions.IsAuthenticated(), HasRole(['admin'])]
        else:
            self.permission_classes = [permissions.IsAuthenticated()]
        return super().get_permissions()
