"""
Finance app URL routing.
"""
from rest_framework.routers import DefaultRouter
from .views.voucher import VoucherViewSet

router = DefaultRouter()
router.register(r'vouchers', VoucherViewSet, basename='voucher')

urlpatterns = router.urls
