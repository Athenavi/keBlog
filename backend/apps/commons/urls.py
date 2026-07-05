"""
Commons app URL routing.
"""
from rest_framework.routers import DefaultRouter
from .views.partner import PartnerViewSet

router = DefaultRouter()
router.register(r'partners', PartnerViewSet, basename='partner')

urlpatterns = router.urls
