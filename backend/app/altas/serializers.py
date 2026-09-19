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


class AltaPendienteSerializer(serializers.ModelSerializer):
    paciente_nombre = serializers.SerializerMethodField()
    recien_nacido_numero = serializers.SerializerMethodField()

    class Meta:
        model = Alta
        fields = [
            'id', 'paciente_nombre', 'recien_nacido_numero',
            'alta_clinica_confirmada', 'alta_administrativa_confirmada',
        ]

    def get_paciente_nombre(self, obj):
        return f"{obj.paciente.nombre} {obj.paciente.apellido}"

    def get_recien_nacido_numero(self, obj):
        return obj.recien_nacido.numero_interno if obj.recien_nacido else None
