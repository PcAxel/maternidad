from rest_framework.routers import DefaultRouter
from .views import AltaViewSet

router = DefaultRouter()
router.register(r'', AltaViewSet, basename='alta')

urlpatterns = router.urls
