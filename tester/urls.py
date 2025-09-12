
from django.urls import path
from .views import APIProxyView, api_proxy_fallback, home

urlpatterns = [
    path('', home, name='home'),
    path('api/proxy/', APIProxyView.as_view(), name='api_proxy'),
    # Keep the fallback for compatibility
    path('api/proxy/fallback/', api_proxy_fallback, name='api_proxy_fallback'),
]