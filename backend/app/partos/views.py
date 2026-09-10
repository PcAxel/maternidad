from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from .models import Parto, ComplicacionParto
from .serializers import PartoSerializer, ComplicacionPartoSerializer
from app.recien_nacidos.models import RecienNacido

class PartoViewSet(viewsets.ModelViewSet):
    queryset = Parto.objects.all()
    serializer_class = PartoSerializer
    
    @action(detail=True, methods=['post'])
    def finalizar(self, request, pk=None):
        parto = self.get_object()
        
        # Verificar que el parto tenga RN registrado
        rn = RecienNacido.objects.filter(parto=parto).first()
        if not rn:
            return Response(
                {'error': 'No se puede finalizar el parto sin un Recién Nacido registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar que tenga APGAR
        if not rn.apgar_1:
            return Response(
                {'error': 'El Recién Nacido no tiene APGAR registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Verificar complicaciones
        if parto.tiene_complicaciones and not parto.detalle_complicaciones.exists():
            return Response(
                {'warning': 'El parto tiene complicaciones marcadas pero no están registradas'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        parto.estado = 'FINALIZADO'
        parto.save()
        return Response({'message': 'Parto finalizado exitosamente'})
    
    @action(detail=True, methods=['post'])
    def agregar_complicacion(self, request, pk=None):
        parto = self.get_object()
        serializer = ComplicacionPartoSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(parto=parto)
            parto.tiene_complicaciones = True
            parto.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)