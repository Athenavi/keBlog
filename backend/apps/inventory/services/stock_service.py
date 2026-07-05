"""
StockService — the ONLY way to modify inventory.
All stock adjustments go through this service.
"""
from django.db import transaction, models
from ..models.stock import Stock
from ..models.stock_move import StockMove
from apps.commons.exceptions import InsufficientStockError


class StockService:
    """库存操作服务 — 所有库存变动必须通过此类"""

    @staticmethod
    @transaction.atomic
    def adjust_stock(
            product_id: int,
            warehouse_id: int,
            quantity: float,
            move_type: str,
            reference_type: str,
            reference_id: int,
            reference_line_id: int = None,
            location_id: int = None,
            unit_price: float = None,
            remark: str = '',
            created_by=None,
    ):
        """
        调整库存（核心方法）

        Args:
            product_id: 商品 ID
            warehouse_id: 仓库 ID
            quantity: 移动数量（正值）
            move_type: 'IN' 入库 / 'OUT' 出库
            reference_type: 来源单据类型标识
            reference_id: 来源单据 ID
            reference_line_id: 来源单据行 ID（可选）
            location_id: 货位 ID（可选）
            unit_price: 移动时单价（可选）
            remark: 备注
            created_by: 操作用户
        """
        # 1. 锁定库存行（防止并发）
        stock, _ = Stock.objects.select_for_update().get_or_create(
            product_id=product_id,
            warehouse_id=warehouse_id,
            defaults={'quantity': 0},
        )

        # 2. 出库时检查库存是否足够
        if move_type == 'OUT' and stock.quantity < quantity:
            product_name = stock.product.name
            raise InsufficientStockError(product_name, float(stock.quantity), quantity)

        # 3. 创建 StockMove 流水记录
        move = StockMove.objects.create(
            move_type=move_type,
            product_id=product_id,
            warehouse_id=warehouse_id,
            location_id=location_id,
            quantity=quantity,
            unit_price=unit_price,
            reference_type=reference_type,
            reference_id=reference_id,
            reference_line_id=reference_line_id,
            remark=remark,
            created_by=created_by,
        )

        # 4. 从 StockMove 重新计算库存（避免累积误差）
        total_in = StockMove.objects.filter(
            product_id=product_id,
            warehouse_id=warehouse_id,
            move_type='IN',
        ).aggregate(total=models.Sum('quantity'))['total'] or 0

        total_out = StockMove.objects.filter(
            product_id=product_id,
            warehouse_id=warehouse_id,
            move_type='OUT',
        ).aggregate(total=models.Sum('quantity'))['total'] or 0

        stock.quantity = total_in - total_out
        stock.save(update_fields=['quantity', 'updated_at'])

        return move

    @staticmethod
    def get_stock(product_id=None, warehouse_id=None):
        """查询库存汇总"""
        qs = Stock.objects.select_related('product', 'warehouse').all()
        if product_id:
            qs = qs.filter(product_id=product_id)
        if warehouse_id:
            qs = qs.filter(warehouse_id=warehouse_id)
        return qs.filter(quantity__gt=0)

    @staticmethod
    def get_stock_moves(product_id=None, warehouse_id=None, move_type=None,
                        date_from=None, date_to=None):
        """查询库存流水"""
        qs = StockMove.objects.select_related('product', 'warehouse', 'created_by').all()
        if product_id:
            qs = qs.filter(product_id=product_id)
        if warehouse_id:
            qs = qs.filter(warehouse_id=warehouse_id)
        if move_type:
            qs = qs.filter(move_type=move_type)
        if date_from:
            qs = qs.filter(created_at__gte=date_from)
        if date_to:
            qs = qs.filter(created_at__lte=date_to)
        return qs.order_by('-created_at')
