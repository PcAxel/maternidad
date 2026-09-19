from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils.dateparse import parse_date
from datetime import datetime
from app.partos.models import Parto
from app.recien_nacidos.models import RecienNacido
from app.altas.models import Alta

class ReporteCesareasView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return Response({'error': 'Se requieren fechas de inicio y fin'}, status=400)
        
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)
        
        partos = Parto.objects.filter(
            fecha_creacion__date__gte=fecha_inicio,
            fecha_creacion__date__lte=fecha_fin
        )
        
        total_partos = partos.count()
        cesareas = partos.filter(tipo='Cesárea').count()
        naturales = partos.filter(tipo='Natural').count()
        
        tasa_cesareas = (cesareas / total_partos * 100) if total_partos > 0 else 0
        
        return Response({
            'total_partos': total_partos,
            'cesareas': cesareas,
            'naturales': naturales,
            'tasa_cesareas': round(tasa_cesareas, 2),
            'periodo': {
                'inicio': fecha_inicio.strftime('%d/%m/%Y'),
                'fin': fecha_fin.strftime('%d/%m/%Y')
            }
        })

class ReporteRNBajoPesoView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return Response({'error': 'Se requieren fechas de inicio y fin'}, status=400)
        
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)
        
        rn = RecienNacido.objects.filter(
            fecha_nacimiento__date__gte=fecha_inicio,
            fecha_nacimiento__date__lte=fecha_fin
        )
        
        total_rn = rn.count()
        bajo_peso = rn.filter(peso__lt=2.5).count()
        
        porcentaje = (bajo_peso / total_rn * 100) if total_rn > 0 else 0
        
        return Response({
            'total_rn': total_rn,
            'bajo_peso': bajo_peso,
            'porcentaje': round(porcentaje, 2),
            'periodo': {
                'inicio': fecha_inicio.strftime('%d/%m/%Y'),
                'fin': fecha_fin.strftime('%d/%m/%Y')
            }
        })

class ReporteDiasHospitalizacionView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')
        
        if not fecha_inicio or not fecha_fin:
            return Response({'error': 'Se requieren fechas de inicio y fin'}, status=400)
        
        try:
            fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)
        
        altas = Alta.objects.filter(
            fecha_alta_administrativa__date__gte=fecha_inicio,
            fecha_alta_administrativa__date__lte=fecha_fin,
            alta_administrativa_confirmada=True
        )
        
        total_dias = 0
        for alta in altas:
            if alta.paciente.fecha_creacion and alta.fecha_alta_administrativa:
                dias = (alta.fecha_alta_administrativa - alta.paciente.fecha_creacion).days
                total_dias += dias
        
        promedio = total_dias / altas.count() if altas.count() > 0 else 0
        
        return Response({
            'total_altas': altas.count(),
            'total_dias': total_dias,
            'promedio_dias': round(promedio, 2),
            'periodo': {
                'inicio': fecha_inicio.strftime('%d/%m/%Y'),
                'fin': fecha_fin.strftime('%d/%m/%Y')
            }
        })
from django.http import HttpResponse
import pandas as pd

class ReporteExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if not fecha_inicio or not fecha_fin:
            return Response({'error': 'Se requieren fechas de inicio y fin'}, status=400)

        try:
            f_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            f_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)

        # Filtramos los partos dentro del rango de fechas
        partos = Parto.objects.filter(
            fecha_creacion__date__gte=f_inicio,
            fecha_creacion__date__lte=f_fin
        )

        # Convertimos los datos a un formato tabular para Excel
        data = list(partos.values('id', 'tipo', 'estado', 'fecha_creacion'))
        
        if not data:
            # Si no hay datos, devolvemos un DataFrame vacío pero con columnas claras
            df = pd.DataFrame(columns=['ID', 'Tipo', 'Estado', 'Fecha Creación'])
        else:
            df = pd.DataFrame(data)
            # Renombramos columnas para que el reporte Excel se vea profesional
            df = df.rename(columns={
                'id': 'ID Parto',
                'tipo': 'Tipo de Parto',
                'estado': 'Estado',
                'fecha_creacion': 'Fecha de Creación'
            })

        # Generamos el archivo Excel binario en memoria usando pandas y openpyxl
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=Reporte_Maternidad_{fecha_inicio}_al_{fecha_fin}.xlsx'
        
        df.to_excel(response, index=False, engine='openpyxl')
        return response
class ReporteExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        fecha_inicio = request.query_params.get('fecha_inicio')
        fecha_fin = request.query_params.get('fecha_fin')

        if not fecha_inicio or not fecha_fin:
            return Response({'error': 'Se requieren fechas de inicio y fin'}, status=400)

        try:
            f_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
            f_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
        except ValueError:
            return Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)

        # Filtramos los partos dentro del rango de fechas
        partos = Parto.objects.filter(
            fecha_creacion__date__gte=f_inicio,
            fecha_creacion__date__lte=f_fin
        )

        # Convertimos los datos a una lista de diccionarios
        data = list(partos.values('id', 'tipo', 'estado', 'fecha_creacion'))
        
        if not data:
            df = pd.DataFrame(columns=['ID Parto', 'Tipo de Parto', 'Estado', 'Fecha de Creación'])
        else:
            df = pd.DataFrame(data)
            df = df.rename(columns={
                'id': 'ID Parto',
                'tipo': 'Tipo de Parto',
                'estado': 'Estado',
                'fecha_creacion': 'Fecha de Creación'
            })
            
            # 💡 SOLUCIÓN: Limpiar la zona horaria de las columnas de tipo fecha para que Excel las acepte
            for col in df.select_dtypes(include=['datetimetz', 'datetime']).columns:
                df[col] = df[col].dt.tz_localize(None)

        # Generamos el archivo Excel binario en memoria
        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        response['Content-Disposition'] = f'attachment; filename=Reporte_Maternidad_{fecha_inicio}_al_{fecha_fin}.xlsx'
        
        df.to_excel(response, index=False, engine='openpyxl')
        return response