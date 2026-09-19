from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q
from django.http import FileResponse
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.units import inch
from io import BytesIO
import uuid
from .models import Alta, HistorialAlta
from .serializers import AltaSerializer, HistorialAltaSerializer, AltaPendienteSerializer
from app.recien_nacidos.models import RecienNacido
from app.pacientes.models import Paciente

class AltaViewSet(viewsets.ModelViewSet):
    queryset = Alta.objects.all()
    serializer_class = AltaSerializer

    @action(detail=False, methods=['get'])
    def pendientes(self, request):
        altas = Alta.objects.filter(
            Q(alta_clinica_confirmada=False) | Q(alta_administrativa_confirmada=False)
        ).select_related('paciente', 'recien_nacido')
        serializer = AltaPendienteSerializer(altas, many=True)
        return Response(serializer.data)

    
    @action(detail=False, methods=['post'])
    def verificar_registros(self, request):
        paciente_id = request.data.get('paciente_id')
        rn_id = request.data.get('rn_id')
        
        pendientes = []
        
        # Verificar paciente
        if paciente_id:
            paciente = Paciente.objects.get(id=paciente_id)
            if not hasattr(paciente, 'antecedentes'):
                pendientes.append('Antecedentes clínicos de la madre')
            if not paciente.partos.exists():
                pendientes.append('Registro de parto')
        
        # Verificar RN
        if rn_id:
            rn = RecienNacido.objects.get(id=rn_id)
            if not rn.apgar_1:
                pendientes.append('APGAR del Recién Nacido')
            if not rn.peso:
                pendientes.append('Peso del Recién Nacido')
            if not rn.talla:
                pendientes.append('Talla del Recién Nacido')
        
        if pendientes:
            return Response({
                'completo': False,
                'pendientes': pendientes,
                'mensaje': f'Faltan los siguientes registros: {", ".join(pendientes)}'
            }, status=status.HTTP_200_OK)
        
        return Response({
            'completo': True,
            'mensaje': 'Todos los registros están completos'
        })
    
    @action(detail=True, methods=['post'])
    def confirmar_alta_clinica(self, request, pk=None):
        alta = self.get_object()
        
        # Verificar que el médico tenga permiso
        if request.user.perfil.rol not in ['MEDICO', 'JEFATURA', 'ADMIN_SISTEMA']:
            return Response({'error': 'No tienes permisos para confirmar alta clínica'}, status=status.HTTP_403_FORBIDDEN)
        
        alta.alta_clinica_confirmada = True
        alta.fecha_alta_clinica = timezone.now()
        alta.medico_responsable = request.user
        alta.save()
        
        # Registrar en historial
        HistorialAlta.objects.create(
            alta=alta,
            accion='ALTA_CLINICA',
            usuario=request.user.username,
            detalles='Alta clínica confirmada'
        )
        
        return Response({'mensaje': 'Alta clínica confirmada exitosamente'})
    
    @action(detail=True, methods=['post'])
    def confirmar_alta_administrativa(self, request, pk=None):
        alta = self.get_object()
        
        # Verificar que el administrativo tenga permiso
        if request.user.perfil.rol not in ['ADMINISTRATIVO', 'JEFATURA', 'ADMIN_SISTEMA']:
            return Response({'error': 'No tienes permisos para confirmar alta administrativa'}, status=status.HTTP_403_FORBIDDEN)
        
        # Verificar que el alta clínica esté confirmada
        if not alta.alta_clinica_confirmada:
            return Response({'error': 'El alta clínica debe ser confirmada primero por el médico'}, status=status.HTTP_400_BAD_REQUEST)
        
        alta.alta_administrativa_confirmada = True
        alta.fecha_alta_administrativa = timezone.now()
        alta.administrativo_responsable = request.user
        alta.save()
        
        # Registrar en historial
        HistorialAlta.objects.create(
            alta=alta,
            accion='ALTA_ADMINISTRATIVA',
            usuario=request.user.username,
            detalles='Alta administrativa confirmada'
        )
        
        return Response({'mensaje': 'Alta administrativa confirmada exitosamente'})
    
    @action(detail=True, methods=['get'])
    def generar_certificado(self, request, pk=None):
        alta = self.get_object()
        
        if not alta.alta_clinica_confirmada or not alta.alta_administrativa_confirmada:
            return Response({'error': 'El alta clínica y administrativa deben estar confirmadas'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generar PDF
        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)
        
        # Título
        c.setFont("Helvetica-Bold", 16)
        c.drawString(1*inch, 10*inch, "CERTIFICADO DE ALTA")
        
        # Datos
        c.setFont("Helvetica", 12)
        y = 9*inch
        
        c.drawString(1*inch, y, f"Paciente: {alta.paciente.nombre} {alta.paciente.apellido}")
        y -= 0.5*inch
        c.drawString(1*inch, y, f"RUT: {alta.paciente.rut}")
        y -= 0.5*inch
        c.drawString(1*inch, y, f"Fecha de Ingreso: {alta.paciente.fecha_creacion.strftime('%d/%m/%Y')}")
        y -= 0.5*inch
        c.drawString(1*inch, y, f"Fecha de Alta: {alta.fecha_alta_administrativa.strftime('%d/%m/%Y')}")
        y -= 0.5*inch
        
        if alta.recien_nacido:
            c.drawString(1*inch, y, f"Recién Nacido: {alta.recien_nacido.numero_interno}")
            y -= 0.5*inch
            c.drawString(1*inch, y, f"Peso: {alta.recien_nacido.peso} kg")
            y -= 0.5*inch
            c.drawString(1*inch, y, f"Talla: {alta.recien_nacido.talla} cm")
            y -= 0.5*inch
            c.drawString(1*inch, y, f"APGAR: {alta.recien_nacido.apgar_1}/{alta.recien_nacido.apgar_5}/{alta.recien_nacido.apgar_10}")
            y -= 0.5*inch
        
        # Firmas
        c.drawString(1*inch, 2*inch, f"Médico: {alta.medico_responsable.get_full_name() if alta.medico_responsable else 'No especificado'}")
        c.drawString(4.5*inch, 2*inch, f"Administrativo: {alta.administrativo_responsable.get_full_name() if alta.administrativo_responsable else 'No especificado'}")
        
        # QR
        if alta.recien_nacido and alta.recien_nacido.codigo_qr:
            c.drawString(1*inch, 1*inch, "Código QR de verificación:")
            # Nota: Para incrustar QR real se necesita convertir la imagen
        
        c.save()
        buffer.seek(0)
        
        # Guardar el PDF
        nombre_pdf = f"certificado_alta_{alta.id}_{uuid.uuid4().hex[:8]}.pdf"
        alta.certificado_generado = True
        alta.certificado_pdf = nombre_pdf
        alta.fecha_certificado = timezone.now()
        alta.save()
        
        return FileResponse(buffer, as_attachment=True, filename=nombre_pdf)