"""
Stock and StockMove views.
"""
from rest_framework import permissions
from rest_framework.decorators import action
from ..models.stock import Stock
from ..models.stock_move import StockMove
from ..serializers.stock import StockSerializer, StockMoveSerializer
from apps.commons.viewsets import BaseModelViewSet
from apps.commons.responses import success_response, create_response
from apps.commons.permissions import HasRole
from ..services.stock_service import StockService


class StockViewSet(BaseModelViewSet):
    queryset = Stock.objects.select_related('product', 'warehouse').all()
    serializer_class = StockSerializer
    filterset_fields = ['product', 'warehouse']
    permission_classes = [permissions.IsAuthenticated(), HasRole(['admin', 'warehouser'])]

    @action(detail=False, methods=['post'])
    def initialize(self, request):
        """批量初始化库存"""
        items = request.data.get('items', [])
        moves = []
        for item in items:
            move = StockService.adjust_stock(
                product_id=item['product_id'],
                warehouse_id=item['warehouse_id'],
                quantity=item['quantity'],
                move_type='IN',
                reference_type='initial',
                reference_id=0,
                unit_price=item.get('unit_price'),
                location_id=item.get('location_id'),
                remark=item.get('remark', '系统初始库存'),
                created_by=request.user,
            )
            moves.append(move)
        return create_response({'moves_created': len(moves)})


class StockMoveViewSet(BaseModelViewSet):
    queryset = StockMove.objects.select_related('product', 'warehouse', 'created_by').all()
    serializer_class = StockMoveSerializer
    filterset_fields = ['move_type', 'product', 'warehouse']
    ordering = ['-created_at']
    permission_classes = [permissions.IsAuthenticated(), HasRole(['admin', 'warehouser'])]
