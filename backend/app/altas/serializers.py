from rest_framework import serializers
from .models import Alta, HistorialAlta

class HistorialAltaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialAlta
        fields = '__all__'
        read_only_fields = ['alta']

class AltaSerializer(serializers.ModelSerializer):
    historial = HistorialAltaSerializer(many=True, read_only=True)

    class Meta:
        model = Alta
        fields = '__all__'
        read_only_fields = [
            'alta_clinica_confirmada', 'fecha_alta_clinica', 'medico_responsable',
            'alta_administrativa_confirmada', 'fecha_alta_administrativa', 'administrativo_responsable',
            'certificado_generado', 'certificado_pdf', 'fecha_certificado',
        ]
