from django.contrib import admin
from .models import SalesOrder, SalesOrderLine


class SalesOrderLineInline(admin.TabularInline):
    model = SalesOrderLine
    extra = 1


@admin.register(SalesOrder)
class SalesOrderAdmin(admin.ModelAdmin):
    list_display = ('order_no', 'customer', 'warehouse', 'order_date', 'status', 'total_amount', 'created_by')
    list_filter = ('status',)
    search_fields = ('order_no', 'customer__name')
    inlines = [SalesOrderLineInline]
    readonly_fields = ('order_no', 'total_amount', 'created_at', 'updated_at')
