from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, RegexValidator

class Paciente(models.Model):
    # El Regex ahora es flexible: acepta el RUT con o sin puntos, con o sin guion.
    rut = models.CharField(
        max_length=12,
        unique=True,
        validators=[RegexValidator(r'^\d{1,2}\.?\d{3}\.?\d{3}-?[\dkK]$', 'RUT inválido')]
    )
    nombre = models.CharField(max_length=100)
    apellido = models.CharField(max_length=100)
    fecha_nacimiento = models.DateField()
    
    # Ampliamos ligeramente el margen de edad para evitar bloqueos por cálculo
    edad = models.IntegerField(validators=[MinValueValidator(10), MaxValueValidator(65)])
    
    direccion = models.TextField()
    telefono = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    activo = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.nombre} {self.apellido} - {self.rut}"

class AntecedenteClinico(models.Model):
    paciente = models.OneToOneField(Paciente, on_delete=models.CASCADE, related_name='antecedentes')
    
    # Controles prenatales
    controles_prenatales = models.JSONField(default=list, blank=True)
    numero_controles = models.IntegerField(default=0)
    
    # Historial de embarazos
    numero_partos = models.IntegerField(default=0)
    numero_cesareas = models.IntegerField(default=0)
    numero_abortos = models.IntegerField(default=0)
    
    # Patologías
    tiene_hipertension = models.BooleanField(default=False)
    tiene_diabetes_gestacional = models.BooleanField(default=False)
    tiene_preclampsia = models.BooleanField(default=False)
    otras_patologias = models.TextField(blank=True)
    
    # Grupo sanguíneo
    grupo_sanguineo = models.CharField(
        max_length=3,
        choices=[
            ('A+', 'A+'), ('A-', 'A-'),
            ('B+', 'B+'), ('B-', 'B-'),
            ('AB+', 'AB+'), ('AB-', 'AB-'),
            ('O+', 'O+'), ('O-', 'O-')
        ],
        blank=True,
        null=True
    )
    
    observaciones = models.TextField(blank=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Antecedentes de {self.paciente.nombre} {self.paciente.apellido}"