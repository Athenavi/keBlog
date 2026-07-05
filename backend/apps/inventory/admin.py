from django.contrib import admin
from .models import Product, Warehouse, Location, Stock, StockMove


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'category', 'uom', 'purchase_price', 'sale_price', 'is_active')
    list_filter = ('category', 'is_active')
    search_fields = ('code', 'name', 'spec')


@admin.register(Warehouse)
class WarehouseAdmin(admin.ModelAdmin):
    list_display = ('code', 'name', 'is_active')
    search_fields = ('code', 'name')


@admin.register(Location)
class LocationAdmin(admin.ModelAdmin):
    list_display = ('warehouse', 'code', 'name', 'is_active')
    list_filter = ('warehouse',)


@admin.register(Stock)
class StockAdmin(admin.ModelAdmin):
    list_display = ('product', 'warehouse', 'quantity')
    search_fields = ('product__name', 'product__code')


@admin.register(StockMove)
class StockMoveAdmin(admin.ModelAdmin):
    list_display = ('move_type', 'product', 'warehouse', 'quantity', 'reference_type', 'reference_id', 'created_by',
                    'created_at')
    list_filter = ('move_type', 'reference_type')
    readonly_fields = ('created_at',)
