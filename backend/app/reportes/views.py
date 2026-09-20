from datetime import datetime
from io import BytesIO

import pandas as pd
from django.http import HttpResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter

from app.partos.models import Parto
from app.recien_nacidos.models import RecienNacido
from app.altas.models import Alta

TIPOS_PARTO_VALIDOS = ['NATURAL', 'CESAREA', 'INSTRUMENTAL']

PATOLOGIA_CAMPOS = {
    'hipertension': 'tiene_hipertension',
    'diabetes_gestacional': 'tiene_diabetes_gestacional',
    'preclampsia': 'tiene_preclampsia',
}


def parsear_filtros_comunes(request):
    """Lee y valida fecha_inicio, fecha_fin, tipo_parto y patologia.
    Devuelve (filtros_dict, error_response). Si error_response no es None,
    la vista debe retornarlo de inmediato."""
    fecha_inicio = request.query_params.get('fecha_inicio')
    fecha_fin = request.query_params.get('fecha_fin')

    if not fecha_inicio or not fecha_fin:
        return None, Response({'error': 'Se requieren fechas de inicio y fin'}, status=400)

    try:
        fecha_inicio = datetime.strptime(fecha_inicio, '%Y-%m-%d')
        fecha_fin = datetime.strptime(fecha_fin, '%Y-%m-%d')
    except ValueError:
        return None, Response({'error': 'Formato de fecha inválido. Use YYYY-MM-DD'}, status=400)

    tipo_parto = request.query_params.get('tipo_parto')
    if tipo_parto and tipo_parto not in TIPOS_PARTO_VALIDOS:
        return None, Response(
            {'error': f'tipo_parto inválido. Opciones: {", ".join(TIPOS_PARTO_VALIDOS)}'},
            status=400,
        )

    patologia = request.query_params.get('patologia')
    if patologia and patologia not in PATOLOGIA_CAMPOS:
        return None, Response(
            {'error': f'patologia inválida. Opciones: {", ".join(PATOLOGIA_CAMPOS.keys())}'},
            status=400,
        )

    return {
        'fecha_inicio': fecha_inicio,
        'fecha_fin': fecha_fin,
        'tipo_parto': tipo_parto,
        'patologia': patologia,
    }, None


def calcular_cesareas(filtros):
    partos = Parto.objects.filter(
        fecha_creacion__date__gte=filtros['fecha_inicio'],
        fecha_creacion__date__lte=filtros['fecha_fin'],
    )
    if filtros['tipo_parto']:
        partos = partos.filter(tipo=filtros['tipo_parto'])
    if filtros['patologia']:
        campo = PATOLOGIA_CAMPOS[filtros['patologia']]
        partos = partos.filter(**{f'paciente__antecedentes__{campo}': True})

    total_partos = partos.count()
    cesareas = partos.filter(tipo='CESAREA').count()
    naturales = partos.filter(tipo='NATURAL').count()
    tasa_cesareas = (cesareas / total_partos * 100) if total_partos > 0 else 0

    return {
        'total_partos': total_partos,
        'cesareas': cesareas,
        'naturales': naturales,
        'tasa_cesareas': round(tasa_cesareas, 2),
    }


def calcular_bajo_peso(filtros):
    rn = RecienNacido.objects.filter(
        fecha_nacimiento__date__gte=filtros['fecha_inicio'],
        fecha_nacimiento__date__lte=filtros['fecha_fin'],
    )
    if filtros['tipo_parto']:
        rn = rn.filter(parto__tipo=filtros['tipo_parto'])
    if filtros['patologia']:
        campo = PATOLOGIA_CAMPOS[filtros['patologia']]
        rn = rn.filter(**{f'paciente_madre__antecedentes__{campo}': True})

    total_rn = rn.count()
    bajo_peso = rn.filter(peso__lt=2.5).count()
    porcentaje = (bajo_peso / total_rn * 100) if total_rn > 0 else 0

    return {
        'total_rn': total_rn,
        'bajo_peso': bajo_peso,
        'porcentaje': round(porcentaje, 2),
    }


def calcular_dias_hospitalizacion(filtros):
    altas = Alta.objects.filter(
        fecha_alta_administrativa__date__gte=filtros['fecha_inicio'],
        fecha_alta_administrativa__date__lte=filtros['fecha_fin'],
        alta_administrativa_confirmada=True,
    )
    if filtros['tipo_parto']:
        altas = altas.filter(recien_nacido__parto__tipo=filtros['tipo_parto'])
    if filtros['patologia']:
        campo = PATOLOGIA_CAMPOS[filtros['patologia']]
        altas = altas.filter(**{f'paciente__antecedentes__{campo}': True})

    total_dias = 0
    for alta in altas:
        if alta.paciente.fecha_creacion and alta.fecha_alta_administrativa:
            total_dias += (alta.fecha_alta_administrativa - alta.paciente.fecha_creacion).days

    total_altas = altas.count()
    promedio = total_dias / total_altas if total_altas > 0 else 0

    return {
        'total_altas': total_altas,
        'total_dias': total_dias,
        'promedio_dias': round(promedio, 2),
    }


def _periodo(filtros):
    return {
        'inicio': filtros['fecha_inicio'].strftime('%d/%m/%Y'),
        'fin': filtros['fecha_fin'].strftime('%d/%m/%Y'),
    }


class ReporteCesareasView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtros, error = parsear_filtros_comunes(request)
        if error:
            return error
        data = calcular_cesareas(filtros)
        data['periodo'] = _periodo(filtros)
        return Response(data)


class ReporteRNBajoPesoView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtros, error = parsear_filtros_comunes(request)
        if error:
            return error
        data = calcular_bajo_peso(filtros)
        data['periodo'] = _periodo(filtros)
        return Response(data)


class ReporteDiasHospitalizacionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtros, error = parsear_filtros_comunes(request)
        if error:
            return error
        data = calcular_dias_hospitalizacion(filtros)
        data['periodo'] = _periodo(filtros)
        return Response(data)


class ReporteExcelView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtros, error = parsear_filtros_comunes(request)
        if error:
            return error

        partos = Parto.objects.filter(
            fecha_creacion__date__gte=filtros['fecha_inicio'],
            fecha_creacion__date__lte=filtros['fecha_fin'],
        )
        if filtros['tipo_parto']:
            partos = partos.filter(tipo=filtros['tipo_parto'])
        if filtros['patologia']:
            campo = PATOLOGIA_CAMPOS[filtros['patologia']]
            partos = partos.filter(**{f'paciente__antecedentes__{campo}': True})

        data = list(partos.values('id', 'tipo', 'estado', 'fecha_creacion'))

        if not data:
            df = pd.DataFrame(columns=['ID Parto', 'Tipo de Parto', 'Estado', 'Fecha de Creación'])
        else:
            df = pd.DataFrame(data)
            df = df.rename(columns={
                'id': 'ID Parto',
                'tipo': 'Tipo de Parto',
                'estado': 'Estado',
                'fecha_creacion': 'Fecha de Creación',
            })
            for col in df.select_dtypes(include=['datetimetz', 'datetime']).columns:
                df[col] = df[col].dt.tz_localize(None)

        response = HttpResponse(
            content_type='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        )
        nombre = f"Reporte_Maternidad_{request.query_params.get('fecha_inicio')}_al_{request.query_params.get('fecha_fin')}.xlsx"
        response['Content-Disposition'] = f'attachment; filename={nombre}'
        df.to_excel(response, index=False, engine='openpyxl')
        return response


class ReportePDFView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        filtros, error = parsear_filtros_comunes(request)
        if error:
            return error

        cesareas = calcular_cesareas(filtros)
        bajo_peso = calcular_bajo_peso(filtros)
        dias = calcular_dias_hospitalizacion(filtros)
        periodo = _periodo(filtros)

        buffer = BytesIO()
        c = canvas.Canvas(buffer, pagesize=letter)

        c.setFont("Helvetica-Bold", 16)
        c.drawString(1 * 72, 10 * 72, "REPORTE DE INDICADORES - MATERNIDAD")

        c.setFont("Helvetica", 11)
        y = 9.3 * 72
        c.drawString(1 * 72, y, f"Periodo: {periodo['inicio']} - {periodo['fin']}")
        y -= 0.3 * 72
        if filtros['tipo_parto']:
            c.drawString(1 * 72, y, f"Filtro tipo de parto: {filtros['tipo_parto']}")
            y -= 0.3 * 72
        if filtros['patologia']:
            c.drawString(1 * 72, y, f"Filtro patología: {filtros['patologia']}")
            y -= 0.3 * 72

        y -= 0.3 * 72
        c.setFont("Helvetica-Bold", 13)
        c.drawString(1 * 72, y, "Tasa de cesáreas")
        y -= 0.3 * 72
        c.setFont("Helvetica", 11)
        c.drawString(1 * 72, y, f"Total partos: {cesareas['total_partos']}  |  Cesáreas: {cesareas['cesareas']}  |  Naturales: {cesareas['naturales']}")
        y -= 0.25 * 72
        c.drawString(1 * 72, y, f"Tasa de cesáreas: {cesareas['tasa_cesareas']}%")

        y -= 0.5 * 72
        c.setFont("Helvetica-Bold", 13)
        c.drawString(1 * 72, y, "Recién nacidos con bajo peso")
        y -= 0.3 * 72
        c.setFont("Helvetica", 11)
        c.drawString(1 * 72, y, f"Total RN: {bajo_peso['total_rn']}  |  Bajo peso (<2.5kg): {bajo_peso['bajo_peso']}  ({bajo_peso['porcentaje']}%)")

        y -= 0.5 * 72
        c.setFont("Helvetica-Bold", 13)
        c.drawString(1 * 72, y, "Días de hospitalización")
        y -= 0.3 * 72
        c.setFont("Helvetica", 11)
        c.drawString(1 * 72, y, f"Total altas: {dias['total_altas']}  |  Promedio de días: {dias['promedio_dias']}")

        c.save()
        buffer.seek(0)

        nombre = f"Reporte_Maternidad_{request.query_params.get('fecha_inicio')}_al_{request.query_params.get('fecha_fin')}.pdf"
        return HttpResponse(
            buffer.getvalue(),
            content_type='application/pdf',
            headers={'Content-Disposition': f'attachment; filename={nombre}'},
        )
