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
    
# --- NUEVOS CAMPOS CLÍNICOS (PABELLÓN Y PARTO RESPETADO) ---
    PARIDAD_CHOICES = [
        ('PRIMIGESTA', 'Primigesta'),
        ('MULTIPARA', 'Multípara'),
    ]
    ANESTESIA_CHOICES = [
        ('EPIDURAL', 'Epidural'),
        ('RAQUIDEA', 'Raquídea'),
        ('LOCAL', 'Local'),
        ('GENERAL', 'General'),
        ('NINGUNA', 'Sin Anestesia'),
    ]

    paridad = models.CharField(
        max_length=20, 
        choices=PARIDAD_CHOICES, 
        default='PRIMIGESTA', 
        null=True, 
        blank=True
    )
    semanas_gestacion = models.PositiveIntegerField(
        default=38, 
        null=True, 
        blank=True,
        help_text="Semanas de gestación al ingreso"
    )
    tipo_anestesia = models.CharField(
        max_length=20, 
        choices=ANESTESIA_CHOICES, 
        default='EPIDURAL', 
        null=True, 
        blank=True
    )
    profesional_responsable = models.CharField(
        max_length=150, 
        default='Matrona de Turno', 
        null=True, 
        blank=True
    )
    acompanamiento_parto = models.BooleanField(
        default=True,
        help_text="¿Contó con acompañamiento en preparto/parto?"
    )
    apego_temprano = models.BooleanField(
        default=True,
        help_text="¿Se realizó apego temprano en sala?"
    )
    
# --- NUEVOS CAMPOS: PROTOCOLO DE PARTO Y ALUMBRAMIENTO ---
    INICIO_PRESENTACION_CHOICES = [
        ('ESPONTANEO_CEFALICA', 'Espontáneo - Cefálica'),
        ('INDUCIDO_CEFALICA', 'Inducido - Cefálica'),
        ('PODALICA_OTRA', 'Podálica / Otra presentación'),
    ]
    PERINE_CHOICES = [
        ('INTACTO', 'Intacto (Sin lesiones)'),
        ('EPISIOTOMIA', 'Episiotomía realizada'),
        ('DESGARRO', 'Desgarro perineal'),
    ]

    inicio_presentacion = models.CharField(
        max_length=30,
        choices=INICIO_PRESENTACION_CHOICES,
        default='ESPONTANEO_CEFALICA',
        null=True,
        blank=True
    )
    estado_perineal = models.CharField(
        max_length=20,
        choices=PERINE_CHOICES,
        default='INTACTO',
        null=True,
        blank=True
    )
    alumbramiento_completo = models.BooleanField(
        default=True,
        help_text="¿Se verificó alumbramiento placentario completo?"
    )
    indicaciones_postparto = models.TextField(
        default='',
        null=True,
        blank=True,
        help_text="Evolución intraparto e indicaciones de puerperio"
    )
    
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