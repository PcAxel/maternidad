from rest_framework import serializers
from .models import RecienNacido, ControlPosteriorRN
import qrcode
from io import BytesIO
import base64

class ControlPosteriorRNSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlPosteriorRN
        fields = '__all__'

class RecienNacidoSerializer(serializers.ModelSerializer):
    controles = ControlPosteriorRNSerializer(many=True, read_only=True)
    codigo_qr_base64 = serializers.SerializerMethodField()
    
    class Meta:
        model = RecienNacido
        fields = '__all__'
        read_only_fields = ['numero_interno', 'codigo_qr']
    
    def get_codigo_qr_base64(self, obj):
        if obj.codigo_qr:
            return obj.codigo_qr
        return None
    
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