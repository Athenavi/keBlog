"""
Inventory app URL routing.
"""
from rest_framework.routers import DefaultRouter
from .views.product import ProductViewSet
from .views.warehouse import WarehouseViewSet
from .views.stock import StockViewSet, StockMoveViewSet

router = DefaultRouter()
router.register(r'products', ProductViewSet, basename='product')
router.register(r'warehouses', WarehouseViewSet, basename='warehouse')
router.register(r'stock', StockViewSet, basename='stock')
router.register(r'stock-moves', StockMoveViewSet, basename='stock-move')

urlpatterns = router.urls
