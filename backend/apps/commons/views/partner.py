"""
Partner views.
"""
from rest_framework import viewsets
from ..models.partner import Partner
from ..serializers.partner import PartnerSerializer
from ..viewsets import BaseModelViewSet
from ..permissions import HasRole
from rest_framework import permissions


class PartnerViewSet(BaseModelViewSet):
    queryset = Partner.objects.all()
    serializer_class = PartnerSerializer
    filterset_fields = ['type', 'is_active']
    search_fields = ['code', 'name', 'contact_person', 'phone']
    ordering_fields = ['code', 'name', 'created_at']
    ordering = ['-created_at']

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            self.permission_classes = [HasRole(['admin', 'purchaser', 'salesperson'])]
        else:
            self.permission_classes = [permissions.IsAuthenticated()]
        return super().get_permissions()
