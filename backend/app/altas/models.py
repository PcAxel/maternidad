from django.db import models
from app.pacientes.models import Paciente
from app.recien_nacidos.models import RecienNacido
from django.contrib.auth.models import User

class Alta(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='altas')
    recien_nacido = models.ForeignKey(RecienNacido, on_delete=models.CASCADE, related_name='altas', null=True, blank=True)
    
    # Alta clínica
    alta_clinica_confirmada = models.BooleanField(default=False)
    fecha_alta_clinica = models.DateTimeField(null=True, blank=True)
    medico_responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='altas_clinicas')
    
    # Alta administrativa
    alta_administrativa_confirmada = models.BooleanField(default=False)
    fecha_alta_administrativa = models.DateTimeField(null=True, blank=True)
    administrativo_responsable = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='altas_administrativas')
    
    # Certificado
    certificado_generado = models.BooleanField(default=False)
    certificado_pdf = models.FileField(upload_to='certificados/', null=True, blank=True)
    fecha_certificado = models.DateTimeField(null=True, blank=True)
    
    # Tipo de alta
    TIPO_ALTA = [
        ('MADRE', 'Solo Madre'),
        ('RN', 'Solo Recién Nacido'),
        ('AMBOS', 'Madre y Recién Nacido'),
    ]
    tipo_alta = models.CharField(max_length=10, choices=TIPO_ALTA)
    
    observaciones = models.TextField(blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Alta {self.id} - {self.paciente.nombre}"

class HistorialAlta(models.Model):
    alta = models.ForeignKey(Alta, on_delete=models.CASCADE, related_name='historial')
    accion = models.CharField(max_length=50)
    usuario = models.CharField(max_length=100)
    fecha = models.DateTimeField(auto_now_add=True)
    detalles = models.TextField(blank=True)
    
    def __str__(self):
        return f"{self.accion} - {self.usuario} - {self.fecha}"