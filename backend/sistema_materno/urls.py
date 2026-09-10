from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/pacientes/', include('app.pacientes.urls')),
    path('api/partos/', include('app.partos.urls')),
    path('api/recien-nacidos/', include('app.recien_nacidos.urls')),
    path('api/altas/', include('app.altas.urls')),
    path('api/reportes/', include('app.reportes.urls')),
    path('api/usuarios/', include('app.usuarios.urls')),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)