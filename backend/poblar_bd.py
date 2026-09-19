import os
import django
import random
from datetime import datetime

# Configuramos el entorno de Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'backend.settings') # Cambia 'backend.settings' por el nombre real si es distinto
django.setup()

from app.partos.models import Parto
from app.pacientes.models import Paciente
from app.recien_nacidos.models import RecienNacido

def ejecutar():
    print("Iniciando población masiva de datos (Septiembre - Diciembre 2026)...")
    
    paciente_ejemplo = Paciente.objects.first()
    if not paciente_ejemplo:
        paciente_ejemplo = Paciente.objects.create(
            nombres="Paciente", apellidos="Prueba Masiva", 
            rut=f"12345{random.randint(100,999)}-9", edad=28
        )

    total_registros = 300
    for i in range(total_registros):
        # Concentramos más datos en Septiembre (9) y Octubre (10)
        mes_elegido = random.choices([9, 10, 11, 12], weights=[40, 35, 15, 10])[0]
        dia = random.randint(1, 28) if mes_elegido in [11, 12] else random.randint(1, 30)
        
        fecha_parto = datetime(2026, mes_elegido, dia, random.randint(0, 23), random.randint(0, 59))
        
        tipo_parto = 'CESAREA' if random.random() < 0.32 else 'VAGINAL'

        parto = Parto.objects.create(
            paciente=paciente_ejemplo,
            fecha=fecha_parto,
            tipo_parto=tipo_parto,
            observaciones=f"Registro masivo automático n° {i+1}"
        )

        es_bajo_peso = random.random() < 0.12
        peso = random.randint(1900, 2450) if es_bajo_peso else random.randint(2600, 4200)
        sexo = random.choice(['Masculino', 'Femenino'])

        RecienNacido.objects.create(
            parto=parto,
            peso=peso,
            sexo=sexo,
            estatus_salud='ESTABLE'
        )

    print("¡300 registros masivos inyectados con éxito!")

if __name__ == '__main__':
    ejecutar()