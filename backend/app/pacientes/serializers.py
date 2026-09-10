from rest_framework import serializers
from .models import Paciente, AntecedenteClinico

class AntecedenteClinicoSerializer(serializers.ModelSerializer):
    class Meta:
        model = AntecedenteClinico
        fields = '__all__'
        read_only_fields = ['paciente']

class PacienteSerializer(serializers.ModelSerializer):
    antecedentes = AntecedenteClinicoSerializer(read_only=True)
    
    class Meta:
        model = Paciente
        fields = '__all__'
    
    def validate_rut(self, value):
        # Validación básica de RUT
        if not value:
            raise serializers.ValidationError("El RUT es obligatorio")
        return value
    
    def validate_edad(self, value):
        if value < 12 or value > 60:
            raise serializers.ValidationError("La edad debe estar entre 12 y 60 años")
        return value