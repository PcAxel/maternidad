from rest_framework.routers import DefaultRouter
from .views import PartoViewSet

router = DefaultRouter()
router.register(r'', PartoViewSet, basename='parto')

urlpatterns = router.urls
