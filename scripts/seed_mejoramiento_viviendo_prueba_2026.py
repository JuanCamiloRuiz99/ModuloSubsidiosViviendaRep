#!/usr/bin/env python
"""
seed_mejoramiento_viviendo_prueba_2026.py
==========================================
Crea el programa de prueba "Mejoramiento de Viviendo Prueba 2026" con 10 postulaciones
en estado APROBADA.

Ejecución (desde la carpeta backend/):
    python ../scripts/seed_mejoramiento_viviendo_prueba_2026.py
"""

import os
import sys
import django
from datetime import date
from seed_setup import setup_django_path

# ── Django setup ──────────────────────────────────────────────────────────── #
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
setup_django_path()
django.setup()

from infrastructure.database.models import (
    Programa,
    Etapa,
    Ciudadano,
    Postulacion,
    GestionHogarEtapa1,
    MiembroHogar,
)

# ── Programa ───────────────────────────────────────────────────────────────── #
programa, creado = Programa.objects.get_or_create(
    codigo_programa='2026MEJVIV',
    defaults={
        'nombre': 'Mejoramiento de Viviendo Prueba 2026',
        'descripcion': 'Programa de prueba para subsidio de mejoramiento de vivienda 2026.',
        'entidad_responsable': 'Secretaría de Vivienda y Hábitat',
        'estado': 'ACTIVO',
    },
)
if creado:
    print(f'✅ Programa creado: {programa.nombre} (id={programa.id})')
else:
    print(f'ℹ️  Programa ya existe: {programa.nombre} (id={programa.id})')

etapa, _ = Etapa.objects.get_or_create(
    programa=programa,
    numero_etapa=1,
    defaults={
        'modulo_principal': 'REGISTRO_HOGAR',
        'activo_logico': True,
    },
)

POSTULACIONES = [
    {
        'radicado': 'RAD-MEV-202604-0001',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000001',
            'primer_nombre': 'Jaime',
            'segundo_nombre': 'Andrés',
            'primer_apellido': 'Pérez',
            'segundo_apellido': 'Martínez',
            'fecha_nacimiento': date(1980, 2, 14),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000001',
            'correo_electronico': 'jaime.perez@example.com',
        },
        'gestion': {
            'departamento': 'Antioquia',
            'municipio': 'Medellín',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'direccion': 'Calle 10 # 22-15',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '05001000010000010001',
            'matricula_inmobiliaria': '120-10001',
            'numero_matricula_agua': 'AC-2026-010001',
            'numero_contrato_energia': 'CE-2026-010001',
            'tiempo_residencia': '10 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0002',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000002',
            'primer_nombre': 'María',
            'segundo_nombre': 'Isabel',
            'primer_apellido': 'García',
            'segundo_apellido': 'López',
            'fecha_nacimiento': date(1978, 7, 21),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000002',
            'correo_electronico': 'maria.garcia@example.com',
        },
        'gestion': {
            'departamento': 'Cundinamarca',
            'municipio': 'Soacha',
            'zona': 'URBANA',
            'tipo_predio': 'Apartamento',
            'direccion': 'Carrera 8 # 12-40',
            'estrato': '2',
            'es_propietario': False,
            'numero_predial': '25001000020000020002',
            'matricula_inmobiliaria': '120-20002',
            'numero_matricula_agua': 'AC-2026-020002',
            'numero_contrato_energia': 'CE-2026-020002',
            'tiempo_residencia': '4 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0003',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000003',
            'primer_nombre': 'Carlos',
            'segundo_nombre': 'Eduardo',
            'primer_apellido': 'Ramírez',
            'segundo_apellido': 'Ruiz',
            'fecha_nacimiento': date(1986, 5, 10),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000003',
            'correo_electronico': 'carlos.ramirez@example.com',
        },
        'gestion': {
            'departamento': 'Valle del Cauca',
            'municipio': 'Cali',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'direccion': 'Calle 25 # 18-50',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '76001000030000030003',
            'matricula_inmobiliaria': '120-30003',
            'numero_matricula_agua': 'AC-2026-030003',
            'numero_contrato_energia': 'CE-2026-030003',
            'tiempo_residencia': '8 años',
            'tiene_dependientes': False,
            'personas_con_discapacidad_hogar': False,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0004',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000004',
            'primer_nombre': 'Sofía',
            'segundo_nombre': 'María',
            'primer_apellido': 'Ríos',
            'segundo_apellido': 'Durán',
            'fecha_nacimiento': date(1991, 9, 5),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000004',
            'correo_electronico': 'sofia.rios@example.com',
        },
        'gestion': {
            'departamento': 'Boyacá',
            'municipio': 'Tunja',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'direccion': 'Carrera 12 # 9-26',
            'estrato': '2',
            'es_propietario': False,
            'numero_predial': '15001000040000040004',
            'matricula_inmobiliaria': '120-40004',
            'numero_matricula_agua': 'AC-2026-040004',
            'numero_contrato_energia': 'CE-2026-040004',
            'tiempo_residencia': '6 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0005',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000005',
            'primer_nombre': 'Juan',
            'segundo_nombre': 'Sebastián',
            'primer_apellido': 'Quintero',
            'segundo_apellido': 'Gómez',
            'fecha_nacimiento': date(1979, 11, 30),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000005',
            'correo_electronico': 'juan.quintero@example.com',
        },
        'gestion': {
            'departamento': 'Santander',
            'municipio': 'Bucaramanga',
            'zona': 'URBANA',
            'tipo_predio': 'Apartamento',
            'direccion': 'Calle 45 # 22-50',
            'estrato': '3',
            'es_propietario': True,
            'numero_predial': '68001000050000050005',
            'matricula_inmobiliaria': '120-50005',
            'numero_matricula_agua': 'AC-2026-050005',
            'numero_contrato_energia': 'CE-2026-050005',
            'tiempo_residencia': '12 años',
            'tiene_dependientes': False,
            'personas_con_discapacidad_hogar': False,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0006',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000006',
            'primer_nombre': 'Ana',
            'segundo_nombre': 'Lucía',
            'primer_apellido': 'Mejía',
            'segundo_apellido': 'Arteaga',
            'fecha_nacimiento': date(1984, 3, 18),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000006',
            'correo_electronico': 'ana.mejia@example.com',
        },
        'gestion': {
            'departamento': 'Tolima',
            'municipio': 'Ibagué',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'direccion': 'Carrera 7 # 15-40',
            'estrato': '2',
            'es_propietario': False,
            'numero_predial': '73001000060000060006',
            'matricula_inmobiliaria': '120-60006',
            'numero_matricula_agua': 'AC-2026-060006',
            'numero_contrato_energia': 'CE-2026-060006',
            'tiempo_residencia': '7 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0007',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000007',
            'primer_nombre': 'Ricardo',
            'segundo_nombre': 'Andrés',
            'primer_apellido': 'Cruz',
            'segundo_apellido': 'Valencia',
            'fecha_nacimiento': date(1987, 8, 22),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000007',
            'correo_electronico': 'ricardo.cruz@example.com',
        },
        'gestion': {
            'departamento': 'Nariño',
            'municipio': 'Pasto',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'direccion': 'Calle 18 # 5-30',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '52001000070000070007',
            'matricula_inmobiliaria': '120-70007',
            'numero_matricula_agua': 'AC-2026-070007',
            'numero_contrato_energia': 'CE-2026-070007',
            'tiempo_residencia': '9 años',
            'tiene_dependientes': False,
            'personas_con_discapacidad_hogar': False,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0008',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000008',
            'primer_nombre': 'Valentina',
            'segundo_nombre': 'Sofía',
            'primer_apellido': 'Álvarez',
            'segundo_apellido': 'Gómez',
            'fecha_nacimiento': date(1993, 12, 9),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000008',
            'correo_electronico': 'valentina.alvarez@example.com',
        },
        'gestion': {
            'departamento': 'Cesar',
            'municipio': 'Valledupar',
            'zona': 'URBANA',
            'tipo_predio': 'Apartamento',
            'direccion': 'Carrera 5 # 19-12',
            'estrato': '2',
            'es_propietario': False,
            'numero_predial': '20001000080000080008',
            'matricula_inmobiliaria': '120-80008',
            'numero_matricula_agua': 'AC-2026-080008',
            'numero_contrato_energia': 'CE-2026-080008',
            'tiempo_residencia': '5 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0009',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000009',
            'primer_nombre': 'Fernando',
            'segundo_nombre': 'Gonzalo',
            'primer_apellido': 'Ruiz',
            'segundo_apellido': 'Castillo',
            'fecha_nacimiento': date(1982, 4, 4),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000009',
            'correo_electronico': 'fernando.ruiz@example.com',
        },
        'gestion': {
            'departamento': 'Magdalena',
            'municipio': 'Santa Marta',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'direccion': 'Calle 21 # 7-15',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '47001000090000090009',
            'matricula_inmobiliaria': '120-90009',
            'numero_matricula_agua': 'AC-2026-090009',
            'numero_contrato_energia': 'CE-2026-090009',
            'tiempo_residencia': '11 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
        },
    },
    {
        'radicado': 'RAD-MEV-202604-0010',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '109000010',
            'primer_nombre': 'Lorena',
            'segundo_nombre': 'Patricia',
            'primer_apellido': 'Mendoza',
            'segundo_apellido': 'Sánchez',
            'fecha_nacimiento': date(1989, 6, 26),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3100000010',
            'correo_electronico': 'lorena.mendoza@example.com',
        },
        'gestion': {
            'departamento': 'Caldas',
            'municipio': 'Manizales',
            'zona': 'URBANA',
            'tipo_predio': 'Apartamento',
            'direccion': 'Carrera 10 # 14-22',
            'estrato': '2',
            'es_propietario': False,
            'numero_predial': '17001000100000100010',
            'matricula_inmobiliaria': '120-100010',
            'numero_matricula_agua': 'AC-2026-100010',
            'numero_contrato_energia': 'CE-2026-100010',
            'tiempo_residencia': '3 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
        },
    },
]

creadas = 0
existentes = 0

for item in POSTULACIONES:
    if GestionHogarEtapa1.objects.filter(numero_radicado=item['radicado']).exists():
        existentes += 1
        print(f'  ⏭️  Radicado {item["radicado"]} ya existe, se omite.')
        continue

    c_data = item['titular']
    ciudadano, _ = Ciudadano.objects.get_or_create(
        tipo_documento=c_data['tipo_documento'],
        numero_documento=c_data['numero_documento'],
        defaults={
            'primer_nombre': c_data['primer_nombre'],
            'segundo_nombre': c_data.get('segundo_nombre', ''),
            'primer_apellido': c_data['primer_apellido'],
            'segundo_apellido': c_data.get('segundo_apellido', ''),
            'fecha_nacimiento': c_data['fecha_nacimiento'],
            'sexo': c_data['sexo'],
            'nacionalidad': c_data['nacionalidad'],
            'telefono': c_data.get('telefono', ''),
            'correo_electronico': c_data.get('correo_electronico', ''),
        },
    )

    postulacion = Postulacion.objects.create(
        programa=programa,
        etapa_actual=etapa,
        estado='APROBADA',
    )

    gestion = GestionHogarEtapa1.objects.create(
        numero_radicado=item['radicado'],
        postulacion=postulacion,
        etapa=etapa,
        ciudadano=ciudadano,
        departamento=item['gestion']['departamento'],
        municipio=item['gestion']['municipio'],
        zona=item['gestion']['zona'],
        tipo_predio=item['gestion'].get('tipo_predio', ''),
        direccion=item['gestion']['direccion'],
        estrato=item['gestion'].get('estrato', ''),
        es_propietario=item['gestion'].get('es_propietario', False),
        numero_predial=item['gestion'].get('numero_predial', ''),
        matricula_inmobiliaria=item['gestion'].get('matricula_inmobiliaria', ''),
        numero_matricula_agua=item['gestion'].get('numero_matricula_agua', ''),
        numero_contrato_energia=item['gestion'].get('numero_contrato_energia', ''),
        tiempo_residencia=item['gestion'].get('tiempo_residencia', ''),
        tiene_dependientes=item['gestion'].get('tiene_dependientes', False),
        personas_con_discapacidad_hogar=item['gestion'].get('personas_con_discapacidad_hogar', False),
        acepta_terminos_condiciones=True,
    )

    MiembroHogar.objects.create(
        postulacion=gestion,
        tipo_documento=c_data['tipo_documento'],
        numero_documento=c_data['numero_documento'],
        primer_nombre=c_data['primer_nombre'],
        segundo_nombre=c_data.get('segundo_nombre', ''),
        primer_apellido=c_data['primer_apellido'],
        segundo_apellido=c_data.get('segundo_apellido', ''),
        fecha_nacimiento=c_data['fecha_nacimiento'],
        parentesco='OTRO',
        es_cabeza_hogar=True,
        situacion_laboral='INDEPENDIENTE',
    )

    creadas += 1
    print(f'  ✅ {item["radicado"]} — {c_data["primer_nombre"]} {c_data["primer_apellido"]}')

print(f'\n📊 Resultado: {creadas} postulaciones creadas, {existentes} ya existían.')
print(f'   Programa: {programa.nombre} (id={programa.id}, código={programa.codigo_programa})')
