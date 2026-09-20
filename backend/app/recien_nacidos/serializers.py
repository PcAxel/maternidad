from rest_framework import serializers
from .models import RecienNacido, ControlPosteriorRN


class ControlPosteriorRNSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlPosteriorRN
        fields = '__all__'


class RecienNacidoSerializer(serializers.ModelSerializer):
    controles = ControlPosteriorRNSerializer(many=True, read_only=True)
    codigo_qr_base64 = serializers.SerializerMethodField()
    paciente_madre_nombre = serializers.SerializerMethodField()
    parto_tipo = serializers.CharField(source='parto.tipo', read_only=True)

    class Meta:
        model = RecienNacido
        fields = '__all__'
        read_only_fields = ['numero_interno', 'codigo_qr', 'paciente_madre']

    def get_codigo_qr_base64(self, obj):
        return obj.codigo_qr or None

    def get_paciente_madre_nombre(self, obj):
        return f"{obj.paciente_madre.nombre} {obj.paciente_madre.apellido}"

    def validate_apgar_1(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("El APGAR debe estar entre 0 y 10")
        return value

    def validate_apgar_5(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("El APGAR debe estar entre 0 y 10")
        return value

    def validate_apgar_10(self, value):
        if value < 0 or value > 10:
            raise serializers.ValidationError("El APGAR debe estar entre 0 y 10")
        return value
