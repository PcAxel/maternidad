import uuid
from django.db import models
from app.partos.models import Parto
from django.core.validators import MinValueValidator, MaxValueValidator

class RecienNacido(models.Model):
    parto = models.ForeignKey(Parto, on_delete=models.CASCADE, related_name='recien_nacidos')
    paciente_madre = models.ForeignKey('pacientes.Paciente', on_delete=models.CASCADE)
    
    # Identificador único
    codigo_qr = models.CharField(max_length=100, unique=True, blank=True)
    numero_interno = models.CharField(max_length=20, unique=True, blank=True)
    
    # Datos clínicos
    peso = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(0.5), MaxValueValidator(6.0)])
    talla = models.DecimalField(max_digits=5, decimal_places=2, validators=[MinValueValidator(30), MaxValueValidator(60)])
    
    # APGAR
    apgar_1 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    apgar_5 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    apgar_10 = models.IntegerField(validators=[MinValueValidator(0), MaxValueValidator(10)])
    
    CONDICION = [
        ('BUENA', 'Buena'),
        ('REGULAR', 'Regular'),
        ('MALA', 'Mala'),
    ]
    condicion_al_nacer = models.CharField(max_length=20, choices=CONDICION)
    
    # Derivaciones
    derivado = models.BooleanField(default=False)
    servicio_derivacion = models.CharField(max_length=100, blank=True)
    fecha_derivacion = models.DateTimeField(null=True, blank=True)
    motivo_derivacion = models.TextField(blank=True)
    
    # Estado
    estado = models.CharField(max_length=20, default='HOSPITALIZADO', choices=[
        ('HOSPITALIZADO', 'Hospitalizado'),
        ('DERIVADO', 'Derivado'),
        ('ALTA', 'Alta'),
    ])
    
    fecha_nacimiento = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def save(self, *args, **kwargs):
        # Autogenerar un codigo_qr único si viene vacío
        if not self.codigo_qr:
            self.codigo_qr = str(uuid.uuid4())
            
        # Autogenerar un numero_interno único si viene vacío (ej: RN-A1B2C3D4)
        if not self.numero_interno:
            self.numero_interno = f"RN-{str(uuid.uuid4())[:8].upper()}"
            
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"RN {self.numero_interno} - {self.paciente_madre.nombre}"

class ControlPosteriorRN(models.Model):
    recien_nacido = models.ForeignKey(RecienNacido, on_delete=models.CASCADE, related_name='controles')
    fecha_control = models.DateTimeField(auto_now_add=True)
    
    # Vacunas
    vacuna_bcg = models.BooleanField(default=False)
    fecha_bcg = models.DateField(null=True, blank=True)
    lote_bcg = models.CharField(max_length=50, blank=True)
    
    vacuna_hepatitis_b = models.BooleanField(default=False)
    fecha_hepatitis_b = models.DateField(null=True, blank=True)
    lote_hepatitis_b = models.CharField(max_length=50, blank=True)
    
    # Exámenes
    tamizaje_neonatal = models.BooleanField(default=False)
    fecha_tamizaje = models.DateField(null=True, blank=True)
    resultado_tamizaje = models.CharField(max_length=100, blank=True)
    
    # Crecimiento
    peso_actual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    talla_actual = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    
    observaciones = models.TextField(blank=True)
    responsable = models.CharField(max_length=100)

    def __str__(self):
        return f"Control de {self.recien_nacido.numero_interno} - {self.fecha_control}"