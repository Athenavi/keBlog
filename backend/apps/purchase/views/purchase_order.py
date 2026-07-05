"""
PurchaseOrder views.
"""
from rest_framework import permissions
from rest_framework.decorators import action
from ..models.purchase_order import PurchaseOrder
from ..serializers.purchase_order import PurchaseOrderListSerializer, PurchaseOrderDetailSerializer
from ..services.purchase_service import PurchaseOrderService
from apps.commons.viewsets import BaseModelViewSet
from apps.commons.responses import success_response
from apps.commons.permissions import HasRole


class PurchaseOrderViewSet(BaseModelViewSet):
    queryset = PurchaseOrder.objects.select_related(
        'supplier', 'warehouse', 'created_by'
    ).prefetch_related('lines', 'lines__product').all()
    filterset_fields = ['status', 'supplier']
    search_fields = ['order_no', 'supplier__name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return PurchaseOrderListSerializer
        return PurchaseOrderDetailSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            self.permission_classes = [permissions.IsAuthenticated(), HasRole(['admin', 'purchaser'])]
        else:
            self.permission_classes = [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        order = PurchaseOrderService.create_order(self.request.data, self.request.user)
        serializer.instance = order

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        order = PurchaseOrderService.submit_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        order = PurchaseOrderService.approve_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        order = PurchaseOrderService.reject_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = PurchaseOrderService.cancel_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def receive(self, request, pk=None):
        order = PurchaseOrderService.receive_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})
