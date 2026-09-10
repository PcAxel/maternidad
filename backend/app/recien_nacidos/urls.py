from rest_framework.routers import DefaultRouter
from .views import RecienNacidoViewSet

router = DefaultRouter()
router.register(r'', RecienNacidoViewSet, basename='recien-nacido')

urlpatterns = router.urls
