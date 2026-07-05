"""
Sales app URL routing.
"""
from rest_framework.routers import DefaultRouter
from .views.sales_order import SalesOrderViewSet

router = DefaultRouter()
router.register(r'orders', SalesOrderViewSet, basename='sales-order')

urlpatterns = router.urls
