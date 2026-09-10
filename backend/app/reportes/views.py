from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.db.models import Count, Avg, Q
from django.utils import timezone
from datetime import datetime, timedelta
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
        cesareas = partos.filter(tipo='CESAREA').count()
        naturales = partos.filter(tipo='NATURAL').count()
        
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