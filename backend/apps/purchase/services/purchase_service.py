"""
PurchaseOrder service — business logic and transaction management.
"""
from django.db import transaction
from apps.commons.services.sequence_service import SequenceService
from apps.inventory.services.stock_service import StockService
from apps.commons.exceptions import BusinessException
from apps.commons.services.state_machine import StateMachine
from apps.commons.services.status_log_service import StatusLogService
from ..models.purchase_order import PurchaseOrder, PurchaseOrderLine


class PurchaseOrderService:

    @staticmethod
    @transaction.atomic
    def create_order(data, user):
        """创建采购订单"""
        order_no = SequenceService.next_number('PO')

        order = PurchaseOrder.objects.create(
            order_no=order_no,
            supplier_id=data['supplier_id'],
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
            PurchaseOrderLine.objects.create(
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
        """提交审核"""
        order = PurchaseOrder.objects.select_for_update().get(id=order_id)
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
        """审核通过"""
        order = PurchaseOrder.objects.select_for_update().get(id=order_id)
        StateMachine.check_transition(order.status, 'approve')

        old_status = order.status
        order.status = 'confirmed'
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'approve', old_status, 'confirmed', user)
        return order

    @staticmethod
    @transaction.atomic
    def reject_order(order_id, user):
        """驳回"""
        order = PurchaseOrder.objects.select_for_update().get(id=order_id)
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
        """取消"""
        order = PurchaseOrder.objects.select_for_update().get(id=order_id)
        StateMachine.check_transition(order.status, 'cancel')

        old_status = order.status
        order.status = 'cancelled'
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'cancel', old_status, 'cancelled', user)
        return order

    @staticmethod
    @transaction.atomic
    def receive_order(order_id, user):
        """确认入库 — 逐行写入 StockMove"""
        order = PurchaseOrder.objects.select_for_update().get(id=order_id)

        if order.status not in ('confirmed', 'partially_received'):
            raise BusinessException('只有已审核或部分入库的订单才能入库')

        all_done = True
        for line in order.lines.all():
            remaining = line.quantity - line.received_qty
            if remaining > 0:
                StockService.adjust_stock(
                    product_id=line.product_id,
                    warehouse_id=order.warehouse_id,
                    quantity=float(remaining),
                    move_type='IN',
                    reference_type='purchase_order',
                    reference_id=order.id,
                    reference_line_id=line.id,
                    unit_price=float(line.unit_price),
                    remark=f'采购入库: {order.order_no}',
                    created_by=user,
                )
                line.received_qty = line.quantity
                line.save(update_fields=['received_qty'])

            if line.received_qty < line.quantity:
                all_done = False

        old_status = order.status
        new_status = 'done' if all_done else 'partially_received'
        order.status = new_status
        order.updated_by = user
        order.save(update_fields=['status', 'updated_by'])

        StatusLogService.log(order, 'receive', old_status, new_status, user)
        return order
