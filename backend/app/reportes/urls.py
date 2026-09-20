from django.urls import path
from .views import (
    ReporteCesareasView,
    ReporteRNBajoPesoView,
    ReporteDiasHospitalizacionView,
    ReporteExcelView,
    ReportePDFView,
)

urlpatterns = [
    path('cesareas/', ReporteCesareasView.as_view(), name='reporte_cesareas'),
    path('bajo-peso/', ReporteRNBajoPesoView.as_view(), name='reporte_bajo_peso'),
    path('dias-hospitalizacion/', ReporteDiasHospitalizacionView.as_view(), name='reporte_hospitalizacion'),
    path('excel/', ReporteExcelView.as_view(), name='reporte_excel'),
    path('pdf/', ReportePDFView.as_view(), name='reporte_pdf'),
]
