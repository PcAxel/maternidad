from django.contrib.auth.models import User
from django.db import models

class PerfilUsuario(models.Model):
    ROLES = [
        ('ADMINISTRATIVO', 'Administrativo'),
        ('MATRONA', 'Matrona'),
        ('MEDICO', 'Médico'),
        ('ENFERMERO', 'Enfermero'),
        ('JEFATURA', 'Jefatura'),
        ('GERENCIA', 'Gerencia'),
        ('ADMIN_SISTEMA', 'Administrador del Sistema'),
    ]
    
    usuario = models.OneToOneField(User, on_delete=models.CASCADE, related_name='perfil')
    rol = models.CharField(max_length=20, choices=ROLES)
    telefono = models.CharField(max_length=15, blank=True)
    especialidad = models.CharField(max_length=100, blank=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"{self.usuario.username} - {self.rol}"