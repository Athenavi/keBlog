"""
SalesOrder service — business logic with stock validation.
"""
from django.db import transaction
from apps.commons.services.sequence_service import SequenceService
from apps.inventory.services.stock_service import StockService
from apps.inventory.models.stock import Stock
from apps.commons.exceptions import BusinessException
from apps.commons.services.state_machine import StateMachine
from apps.commons.services.status_log_service import StatusLogService
from ..models.sales_order import SalesOrder, SalesOrderLine


class SalesOrderService:

    @staticmethod
    @transaction.atomic
    def create_order(data, user):
        """创建销售订单"""
        order_no = SequenceService.next_number('SO')

        order = SalesOrder.objects.create(
            order_no=order_no,
            customer_id=data['customer_id'],
            warehouse_id=data['warehouse_id'],
            order_date=data.get('order_date'),
            remark=data.get('remark', ''),
            created_by=user,
            updated_by=user,
        )

        total_amount = 0
        for i, line_data in enumerate(data.get('lines', []), start=1):
            subtotal = line_data['quantity'] * line_data['unit_price']
            total_amount += subtotal
            SalesOrderLine.objects.create(
                order=order,
                line_no=i,
                product_id=line_data['product_id'],
                quantity=line_data['quantity'],
                uom_id=line_data['uom_id'],
                unit_price=line_data['unit_price'],
                tax_rate=line_data.get('tax_rate', 0),
                subtotal=subtotal,
                remark=line_data.get('remark', ''),
            )

        order.total_amount = total_amount
        order.save(update_fields=['total_amount'])
        return order

    @staticmethod
    @transaction.atomic
    def submit_order(order_id, user):
        order = SalesOrder.objects.select_for_update().get(id=order_id)
        StateMachine.check_transition(order.status, 'submit')

        old_status = order.status
        order.status = 'pending'
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'submit', old_status, 'pending', user)
        return order

    @staticmethod
    @transaction.atomic
    def approve_order(order_id, user):
        """审核销售订单 — 校验可用库存"""
        order = SalesOrder.objects.select_for_update().get(id=order_id)
        StateMachine.check_transition(order.status, 'approve')

        # 逐行校验库存是否足够
        insufficient = []
        for line in order.lines.all():
            try:
                stock = Stock.objects.select_for_update().get(
                    product=line.product,
                    warehouse=order.warehouse,
                )
                if stock.quantity < line.quantity:
                    insufficient.append({
                        'product': line.product.name,
                        'available': float(stock.quantity),
                        'required': float(line.quantity),
                    })
            except Stock.DoesNotExist:
                insufficient.append({
                    'product': line.product.name,
                    'available': 0,
                    'required': float(line.quantity),
                })

        if insufficient:
            items_str = '; '.join(
                [f'{i["product"]}: 可用{i["available"]}, 需要{i["required"]}'
                 for i in insufficient]
            )
            raise BusinessException(f'库存不足无法审核: {items_str}')

        old_status = order.status
        order.status = 'confirmed'
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'approve', old_status, 'confirmed', user)
        return order

    @staticmethod
    @transaction.atomic
    def reject_order(order_id, user):
        order = SalesOrder.objects.select_for_update().get(id=order_id)
        StateMachine.check_transition(order.status, 'reject')

        old_status = order.status
        order.status = 'draft'
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'reject', old_status, 'draft', user)
        return order

    @staticmethod
    @transaction.atomic
    def cancel_order(order_id, user):
        order = SalesOrder.objects.select_for_update().get(id=order_id)
        StateMachine.check_transition(order.status, 'cancel')

        old_status = order.status
        order.status = 'cancelled'
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'cancel', old_status, 'cancelled', user)
        return order

    @staticmethod
    @transaction.atomic
    def deliver_order(order_id, user):
        """确认出库 — 逐行写入 StockMove（type=OUT）"""
        order = SalesOrder.objects.select_for_update().get(id=order_id)

        if order.status not in ('confirmed', 'partially_delivered'):
            raise BusinessException('只有已审核或部分出库的订单才能出库')

        all_done = True
        for line in order.lines.all():
            remaining = line.quantity - line.delivered_qty
            if remaining > 0:
                StockService.adjust_stock(
                    product_id=line.product_id,
                    warehouse_id=order.warehouse_id,
                    quantity=float(remaining),
                    move_type='OUT',
                    reference_type='sales_order',
                    reference_id=order.id,
                    reference_line_id=line.id,
                    unit_price=float(line.unit_price),
                    remark=f'销售出库: {order.order_no}',
                    created_by=user,
                )
                line.delivered_qty = line.quantity
                line.save(update_fields=['delivered_qty'])

            if line.delivered_qty < line.quantity:
                all_done = False

        old_status = order.status
        new_status = 'done' if all_done else 'partially_delivered'
        order.status = new_status
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'deliver', old_status, new_status, user)
        return order
