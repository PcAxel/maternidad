from django.urls import path
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from .views import UsuarioViewSet, MyTokenObtainPairView

router = DefaultRouter()
router.register(r'', UsuarioViewSet, basename='usuario')

urlpatterns = [
    path('login/', MyTokenObtainPairView.as_view(), name='usuario-login'),
    path('login/refresh/', TokenRefreshView.as_view(), name='usuario-login-refresh'),
] + router.urls
