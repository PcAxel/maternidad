from django.urls import path
from .views import (
    ReporteCesareasView,
    ReporteRNBajoPesoView,
    ReporteDiasHospitalizacionView,
    ReporteExcelView
)

urlpatterns = [
    path('cesareas/', ReporteCesareasView.as_view(), name='reporte-cesareas'),
    path('bajo-peso/', ReporteRNBajoPesoView.as_view(), name='reporte-bajo-peso'),
    path('dias-hospitalizacion/', ReporteDiasHospitalizacionView.as_view(), name='reporte-dias-hospitalizacion'),
    path('excel/', ReporteExcelView.as_view(), name='reporte-excel'),
]