from django.urls import path
from . import views

urlpatterns = [
    path('', views.home, name='home'),
    path('api/proxy/', views.api_proxy, name='api_proxy'),
]