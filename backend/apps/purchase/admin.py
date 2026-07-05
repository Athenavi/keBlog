from django.contrib import admin
from .models import PurchaseOrder, PurchaseOrderLine


class PurchaseOrderLineInline(admin.TabularInline):
    model = PurchaseOrderLine
    extra = 1


@admin.register(PurchaseOrder)
class PurchaseOrderAdmin(admin.ModelAdmin):
    list_display = ('order_no', 'supplier', 'warehouse', 'order_date', 'status', 'total_amount', 'created_by')
    list_filter = ('status',)
    search_fields = ('order_no', 'supplier__name')
    inlines = [PurchaseOrderLineInline]
    readonly_fields = ('order_no', 'total_amount', 'created_at', 'updated_at')
