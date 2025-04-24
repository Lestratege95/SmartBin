from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views.bin import BinViewSet

router = DefaultRouter()
router.register(r'bins', BinViewSet)

urlpatterns = [
    path('', include(router.urls)),
] 