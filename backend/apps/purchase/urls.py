"""
Purchase app URL routing.
"""
from rest_framework.routers import DefaultRouter
from .views.purchase_order import PurchaseOrderViewSet

router = DefaultRouter()
router.register(r'orders', PurchaseOrderViewSet, basename='purchase-order')

urlpatterns = router.urls
