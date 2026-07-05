"""
Voucher views.
"""
from rest_framework import permissions
from ..models.voucher import Voucher
from ..serializers.voucher import VoucherSerializer
from apps.commons.viewsets import BaseModelViewSet
from apps.commons.permissions import HasRole


class VoucherViewSet(BaseModelViewSet):
    queryset = Voucher.objects.prefetch_related('lines').all()
    serializer_class = VoucherSerializer
    filterset_fields = ['voucher_type']
    search_fields = ['voucher_no', 'order_no']
    ordering = ['-created_at']
    permission_classes = [permissions.IsAuthenticated(), HasRole(['admin', 'finance_ro'])]
