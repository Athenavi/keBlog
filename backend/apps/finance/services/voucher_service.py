"""
Voucher auto-generation service.
"""
from django.db import transaction
from ..models.voucher import Voucher, VoucherLine
from apps.commons.services.sequence_service import SequenceService


class VoucherService:
    """凭证生成服务 — 出入库时自动生成会计分录"""

    @staticmethod
    @transaction.atomic
    def create_purchase_in_voucher(stock_move, order_no):
        """采购入库凭证：借 库存商品 / 贷 应付账款"""
        amount = float(stock_move.quantity) * float(stock_move.unit_price or 0)
        voucher_no = SequenceService.next_number('VO')

        voucher = Voucher.objects.create(
            voucher_no=voucher_no,
            voucher_type='purchase_in',
            stock_move=stock_move,
            order_no=order_no,
            total_amount=amount,
            created_by=stock_move.created_by,
        )

        VoucherLine.objects.create(
            voucher=voucher, account_code='1403', account_name='库存商品',
            direction='debit', amount=amount,
        )
        VoucherLine.objects.create(
            voucher=voucher, account_code='2202', account_name='应付账款',
            direction='credit', amount=amount,
        )
        return voucher

    @staticmethod
    @transaction.atomic
    def create_sales_out_voucher(stock_move, order_no):
        """销售出库凭证：借 主营业务成本 / 贷 库存商品"""
        amount = float(stock_move.quantity) * float(stock_move.unit_price or 0)
        voucher_no = SequenceService.next_number('VO')

        voucher = Voucher.objects.create(
            voucher_no=voucher_no,
            voucher_type='sales_out',
            stock_move=stock_move,
            order_no=order_no,
            total_amount=amount,
            created_by=stock_move.created_by,
        )

        VoucherLine.objects.create(
            voucher=voucher, account_code='6401', account_name='主营业务成本',
            direction='debit', amount=amount,
        )
        VoucherLine.objects.create(
            voucher=voucher, account_code='1403', account_name='库存商品',
            direction='credit', amount=amount,
        )
        return voucher
