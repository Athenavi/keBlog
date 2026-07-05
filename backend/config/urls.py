"""
Main URL configuration for erp project.
"""
from django.contrib import admin
from django.urls import path, include
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

urlpatterns = [
    path('admin/', admin.site.urls),

    # API v1
    path('api/v1/auth/', include('apps.commons.auth_urls')),
    path('api/v1/commons/', include('apps.commons.urls')),
    path('api/v1/inventory/', include('apps.inventory.urls')),
    path('api/v1/purchase/', include('apps.purchase.urls')),
    path('api/v1/sales/', include('apps.sales.urls')),
    path('api/v1/finance/', include('apps.finance.urls')),

    # API Docs (Swagger)
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger'),
]
