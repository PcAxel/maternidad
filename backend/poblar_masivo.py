import os
import django
import random
import base64
from io import BytesIO
from datetime import datetime, timedelta
import qrcode

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'sistema_materno.settings')
django.setup()

from django.utils.timezone import make_aware
from app.partos.models import Parto
from app.pacientes.models import Paciente
from app.recien_nacidos.models import RecienNacido

def generar_qr(numero_interno, rut_madre):
    qr_data = f"RN:{numero_interno}|Madre:{rut_madre}"
    qr = qrcode.make(qr_data)
    buffer = BytesIO()
    qr.save(buffer, format='PNG')
    return base64.b64encode(buffer.getvalue()).decode()

def ejecutar():
    print("🚀 Iniciando población masiva de 300 registros (Septiembre - Diciembre 2026)...")
    
    paciente_ejemplo = Paciente.objects.first()
    if not paciente_ejemplo:
        paciente_ejemplo = Paciente.objects.create(
            nombre="Paciente", apellido="Prueba Masiva", 
            rut=f"12345{random.randint(100,999)}-9", edad=28
        )

    for i in range(300):
        mes_elegido = random.choices([9, 10, 11, 12], weights=[40, 35, 15, 10])[0]
        dia = random.randint(1, 28) if mes_elegido in [11, 12] else random.randint(1, 30)
        
        fecha_bruta = datetime(2026, mes_elegido, dia, random.randint(0, 20), random.randint(0, 59))
        fecha_inicio_parto = make_aware(fecha_bruta)
        fecha_termino_parto = fecha_inicio_parto + timedelta(hours=random.randint(1, 3))
        
        tipo_parto = 'CESAREA' if random.random() < 0.32 else 'NATURAL'

        parto = Parto.objects.create(
            paciente=paciente_ejemplo,
            fecha_inicio=fecha_inicio_parto,
            fecha_termino=fecha_termino_parto,
            tipo=tipo_parto,
            estado='FINALIZADO',
            tiene_complicaciones=False
        )

        es_bajo_peso = random.random() < 0.12
        peso = round(random.uniform(1.9, 2.45), 2) if es_bajo_peso else round(random.uniform(2.6, 4.2), 2)
        
        num_interno = f"RN-{i+1000}"

        RecienNacido.objects.create(
            parto=parto,
            paciente_madre=paciente_ejemplo,
            numero_interno=num_interno,
            peso=peso,
            talla=50.0,
            apgar_1=8,
            apgar_5=9,
            apgar_10=10,
            condicion_al_nacer='Sano',
            estado='HOSPITALIZADO',
            codigo_qr=generar_qr(num_interno, paciente_ejemplo.rut) # ¡Aquí está la solución al error del QR!
        )

    print("✅ ¡300 registros masivos inyectados con éxito absoluto!")

if __name__ == '__main__':
    ejecutar()