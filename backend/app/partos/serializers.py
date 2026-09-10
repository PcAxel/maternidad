from rest_framework import serializers
from .models import Parto, ComplicacionParto
from app.pacientes.models import Paciente

class ComplicacionPartoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComplicacionParto
        fields = '__all__'

class PartoSerializer(serializers.ModelSerializer):
    complicaciones_detalle = ComplicacionPartoSerializer(many=True, read_only=True)
    paciente_nombre = serializers.CharField(source='paciente.nombre', read_only=True)
    
    class Meta:
        model = Parto
        fields = '__all__'
    
    def validate(self, data):
        if data.get('fecha_termino') and data.get('fecha_inicio'):
            if data['fecha_termino'] < data['fecha_inicio']:
                raise serializers.ValidationError("La fecha de término no puede ser anterior a la fecha de inicio")
        return data