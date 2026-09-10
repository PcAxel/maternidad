from django.urls import path
from .views import ReporteCesareasView, ReporteRNBajoPesoView, ReporteDiasHospitalizacionView

urlpatterns = [
    path('cesareas/', ReporteCesareasView.as_view(), name='reporte-cesareas'),
    path('rn-bajo-peso/', ReporteRNBajoPesoView.as_view(), name='reporte-rn-bajo-peso'),
    path('dias-hospitalizacion/', ReporteDiasHospitalizacionView.as_view(), name='reporte-dias-hospitalizacion'),
]
