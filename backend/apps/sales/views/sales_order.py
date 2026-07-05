"""
SalesOrder views.
"""
from rest_framework import permissions
from rest_framework.decorators import action
from ..models.sales_order import SalesOrder
from ..serializers.sales_order import SalesOrderListSerializer, SalesOrderDetailSerializer
from ..services.sales_service import SalesOrderService
from apps.commons.viewsets import BaseModelViewSet
from apps.commons.responses import success_response
from apps.commons.permissions import HasRole


class SalesOrderViewSet(BaseModelViewSet):
    queryset = SalesOrder.objects.select_related(
        'customer', 'warehouse', 'created_by'
    ).prefetch_related('lines', 'lines__product').all()
    filterset_fields = ['status', 'customer']
    search_fields = ['order_no', 'customer__name']
    ordering = ['-created_at']

    def get_serializer_class(self):
        if self.action == 'list':
            return SalesOrderListSerializer
        return SalesOrderDetailSerializer

    def get_permissions(self):
        if self.action in ('create', 'update', 'partial_update', 'destroy'):
            self.permission_classes = [permissions.IsAuthenticated(), HasRole(['admin', 'salesperson'])]
        else:
            self.permission_classes = [permissions.IsAuthenticated()]
        return super().get_permissions()

    def perform_create(self, serializer):
        order = SalesOrderService.create_order(self.request.data, self.request.user)
        serializer.instance = order

    @action(detail=True, methods=['post'])
    def submit(self, request, pk=None):
        order = SalesOrderService.submit_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def approve(self, request, pk=None):
        order = SalesOrderService.approve_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def reject(self, request, pk=None):
        order = SalesOrderService.reject_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        order = SalesOrderService.cancel_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})

    @action(detail=True, methods=['post'])
    def deliver(self, request, pk=None):
        order = SalesOrderService.deliver_order(pk, request.user)
        return success_response({'id': order.id, 'status': order.status})
