from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
import qrcode
from io import BytesIO
import base64
import uuid
from .models import RecienNacido, ControlPosteriorRN
from .serializers import RecienNacidoSerializer, ControlPosteriorRNSerializer

class RecienNacidoViewSet(viewsets.ModelViewSet):
    queryset = RecienNacido.objects.all()
    serializer_class = RecienNacidoSerializer
    
    def perform_create(self, serializer):
        # Generar número interno único
        numero_interno = f"RN-{timezone.now().year}-{uuid.uuid4().hex[:6].upper()}"
        instance = serializer.save(numero_interno=numero_interno)
        
        # Generar código QR
        qr_data = f"RN:{instance.numero_interno}|Madre:{instance.paciente_madre.rut}"
        qr = qrcode.make(qr_data)
        buffer = BytesIO()
        qr.save(buffer, format='PNG')
        qr_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        instance.codigo_qr = qr_base64
        instance.save()
    
    @action(detail=True, methods=['post'])
    def alerta_apgar(self, request, pk=None):
        rn = self.get_object()
        apgar = rn.apgar_1
        if apgar < 5:
            return Response({
                'alerta': 'CRITICA',
                'mensaje': f'¡ALERTA! APGAR bajo detectado: {apgar}. Se requiere intervención médica inmediata',
                'accion': 'Notificar al médico y a neonatología'
            }, status=status.HTTP_200_OK)
        return Response({'mensaje': 'APGAR dentro de parámetros normales'})
    
    @action(detail=True, methods=['post'])
    def derivar(self, request, pk=None):
        rn = self.get_object()
        servicio = request.data.get('servicio')
        motivo = request.data.get('motivo', '')
        
        if not servicio:
            return Response({'error': 'El servicio de derivación es obligatorio'}, status=status.HTTP_400_BAD_REQUEST)
        
        rn.derivado = True
        rn.servicio_derivacion = servicio
        rn.motivo_derivacion = motivo
        rn.fecha_derivacion = timezone.now()
        rn.estado = 'DERIVADO'
        rn.save()
        
        return Response({
            'mensaje': f'RN derivado a {servicio} exitosamente',
            'fecha': rn.fecha_derivacion
        })
    
    @action(detail=True, methods=['post'])
    def registrar_control(self, request, pk=None):
        rn = self.get_object()
        serializer = ControlPosteriorRNSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(recien_nacido=rn)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)