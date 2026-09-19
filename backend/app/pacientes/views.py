from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import Paciente, AntecedenteClinico
from .serializers import PacienteSerializer, AntecedenteClinicoSerializer
from rest_framework.permissions import IsAuthenticated
from app.usuarios.permissions import IsAdministrativo, IsMatrona

class PacienteViewSet(viewsets.ModelViewSet):
    queryset = Paciente.objects.filter(activo=True)
    serializer_class = PacienteSerializer
    permission_classes = [IsAuthenticated]

    def get_permissions(self):
        # El administrativo ingresa/edita los datos básicos del paciente.
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [IsAuthenticated(), IsAdministrativo()]
        # La matrona (o médico) es quien completa los antecedentes clínicos.
        if self.action == 'antecedentes':
            return [IsAuthenticated(), IsMatrona()]
        # Consultar la ficha (listar, ver detalle, historial) queda abierto
        # a cualquier usuario autenticado del equipo clínico-administrativo.
        return [IsAuthenticated()]

    def get_queryset(self):
        queryset = super().get_queryset()
        busqueda = self.request.query_params.get('busqueda', '')
        if busqueda:
            queryset = queryset.filter(
                Q(rut__icontains=busqueda) |
                Q(nombre__icontains=busqueda) |
                Q(apellido__icontains=busqueda)
            )
        return queryset
    
    @action(detail=True, methods=['post'])
    def antecedentes(self, request, pk=None):
        paciente = self.get_object()
        serializer = AntecedenteClinicoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(paciente=paciente)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def historial_completo(self, request, pk=None):
        paciente = self.get_object()
        data = {
            'paciente': PacienteSerializer(paciente).data,
            'antecedentes': AntecedenteClinicoSerializer(paciente.antecedentes).data if hasattr(paciente, 'antecedentes') else None,
            'partos': paciente.partos.values(),
            'altas': paciente.altas.values(),
        }
        return Response(data)