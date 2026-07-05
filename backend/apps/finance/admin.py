from django.contrib import admin
from .models import Voucher, VoucherLine


class VoucherLineInline(admin.TabularInline):
    model = VoucherLine
    extra = 0
    readonly_fields = ('account_code', 'account_name', 'direction', 'amount')


@admin.register(Voucher)
class VoucherAdmin(admin.ModelAdmin):
    list_display = ('voucher_no', 'voucher_type', 'total_amount', 'voucher_date', 'created_by')
    list_filter = ('voucher_type',)
    search_fields = ('voucher_no', 'order_no')
    inlines = [VoucherLineInline]
    readonly_fields = ('voucher_no', 'total_amount', 'voucher_date', 'created_at')
