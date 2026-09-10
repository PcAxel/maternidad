from django.db import models
from app.pacientes.models import Paciente
from django.contrib.auth.models import User

TIPO_PARTO = [
    ('NATURAL', 'Parto Natural'),
    ('CESAREA', 'Cesárea'),
    ('INSTRUMENTAL', 'Parto Instrumental'),
]

COMPLICACIONES = [
    ('HEMORRAGIA', 'Hemorragia'),
    ('SUFRIMIENTO_FETAL', 'Sufrimiento Fetal'),
    ('PROLAPSO_CORDON', 'Prolapso de Cordón'),
    ('DISTOCIA_HOMBROS', 'Distocia de Hombros'),
    ('ROTURA_UTERINA', 'Rotura Uterina'),
    ('OTROS', 'Otros'),
]

class Parto(models.Model):
    paciente = models.ForeignKey(Paciente, on_delete=models.CASCADE, related_name='partos')
    tipo = models.CharField(max_length=20, choices=TIPO_PARTO)
    fecha_inicio = models.DateTimeField()
    fecha_termino = models.DateTimeField()
    duracion_estimada = models.IntegerField(help_text='Duración estimada en minutos', default=120)
    
    # Complicaciones
    tiene_complicaciones = models.BooleanField(default=False)
    complicaciones = models.JSONField(default=list, blank=True)
    
    # Personal clínico
    matrona = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='partos_matrona')
    medico = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='partos_medico')
    enfermero = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='partos_enfermero')
    
    observaciones = models.TextField(blank=True)
    estado = models.CharField(max_length=20, default='EN_PROCESO', choices=[
        ('EN_PROCESO', 'En Proceso'),
        ('FINALIZADO', 'Finalizado'),
        ('CANCELADO', 'Cancelado')
    ])
    
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Parto {self.id} - {self.paciente.nombre} - {self.tipo}"

class ComplicacionParto(models.Model):
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='detalle_complicaciones')
    tipo = models.CharField(max_length=50, choices=COMPLICACIONES)
    descripcion = models.TextField()
    fecha_registro = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.tipo} - {self.parto.id}"