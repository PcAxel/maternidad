from rest_framework import serializers
from .models import Alta, HistorialAlta

class HistorialAltaSerializer(serializers.ModelSerializer):
    class Meta:
        model = HistorialAlta
        fields = '__all__'
        read_only_fields = ['alta']

class AltaSerializer(serializers.ModelSerializer):
    historial = HistorialAltaSerializer(many=True, read_only=True)
    
    # Inyectamos estos campos mágicos para que React los reciba listos
    paciente_nombre = serializers.SerializerMethodField()
    recien_nacido_numero = serializers.SerializerMethodField()

    class Meta:
        model = Alta
        fields = '__all__'
        read_only_fields = [
            'alta_clinica_confirmada', 'fecha_alta_clinica', 'medico_responsable',
            'alta_administrativa_confirmada', 'fecha_alta_administrativa', 'administrativo_responsable',
            'certificado_generado', 'certificado_pdf', 'fecha_certificado',
        ]

    def get_paciente_nombre(self, obj):
        # Capturamos el RUT y el Nombre desde la tabla Paciente
        rut_paciente = getattr(obj.paciente, 'rut', 'Sin RUT')
        return f"{obj.paciente.nombre} {obj.paciente.apellido} (RUT: {rut_paciente})"

    def get_recien_nacido_numero(self, obj):
        if obj.recien_nacido:
            return obj.recien_nacido.numero_interno
        return None

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
        rut_paciente = getattr(obj.paciente, 'rut', 'Sin RUT')
        return f"{obj.paciente.nombre} {obj.paciente.apellido} (RUT: {rut_paciente})"

    def get_recien_nacido_numero(self, obj):
        if obj.recien_nacido:
            return obj.recien_nacido.numero_interno
        return None