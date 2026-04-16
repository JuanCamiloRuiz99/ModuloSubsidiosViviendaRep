#!/usr/bin/env python
"""
seed_10_postulaciones.py
========================
Crea un programa de prueba "Subsidio Vivienda Nueva 2026" con 3 etapas
y 10 postulaciones en estado REGISTRADA (recién ingresadas).

Cada postulación incluye:
  • Ciudadano titular
  • Postulacion (estado REGISTRADA, sin funcionario asignado)
  • GestionHogarEtapa1 (datos del predio, ubicación en Popayán, Cauca)
  • 2-4 MiembroHogar (cabeza de hogar + familiares)

Ejecución (desde la carpeta backend/):
    python ../scripts/seed_10_postulaciones.py
"""

import os
import sys
import django
from datetime import date
from decimal import Decimal

# ── Django setup ──────────────────────────────────────────────────────────── #

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Asegurar que backend/ esté en sys.path
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
sys.path.insert(0, backend_dir)

django.setup()

from infrastructure.database.models import (
    Programa,
    Etapa,
    Ciudadano,
    Postulacion,
    GestionHogarEtapa1,
    MiembroHogar,
)

# ── Helpers ───────────────────────────────────────────────────────────────── #

def ok(msg):   print(f'  ✅ {msg}')
def info(msg): print(f'  ℹ️  {msg}')

# ═════════════════════════════════════════════════════════════════════════════ #
# 1. Programa                                                                  #
# ═════════════════════════════════════════════════════════════════════════════ #

programa, creado = Programa.objects.get_or_create(
    codigo_programa='2026SVNUEVA',
    defaults={
        'nombre': 'Subsidio Vivienda Nueva 2026',
        'descripcion': (
            'Programa de subsidio para adquisición de vivienda nueva destinado '
            'a familias de estratos 1 y 2 del municipio de Popayán.'
        ),
        'entidad_responsable': 'Secretaría de Vivienda y Hábitat',
        'estado': 'ACTIVO',
    },
)
tag = '✅ Creado' if creado else 'ℹ️  Ya existe'
print(f'{tag} → Programa: {programa.nombre} (id={programa.id})')

# ═════════════════════════════════════════════════════════════════════════════ #
# 2. Etapas (3)                                                                #
# ═════════════════════════════════════════════════════════════════════════════ #

ETAPAS_DEF = [
    (1, 'REGISTRO_HOGAR'),
    (2, 'VISITA_TECNICA'),
    (3, 'GESTION_DOCUMENTAL_INTERNA'),
]

etapas = {}
for num, modulo in ETAPAS_DEF:
    etapa, creado = Etapa.objects.get_or_create(
        programa=programa,
        numero_etapa=num,
        defaults={
            'modulo_principal': modulo,
            'activo_logico': True,
            'finalizada': False,
        },
    )
    etapas[num] = etapa
    tag = '✅' if creado else 'ℹ️ '
    print(f'  {tag} Etapa {num}: {modulo} (id={etapa.id})')

etapa1 = etapas[1]

# ═════════════════════════════════════════════════════════════════════════════ #
# 3. Datos de las 10 postulaciones                                             #
# ═════════════════════════════════════════════════════════════════════════════ #

POSTULACIONES = [
    # ── 1. Familia Salazar Mosquera ───────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0001',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10681001',
            'primer_nombre': 'Luis',
            'segundo_nombre': 'Alberto',
            'primer_apellido': 'Salazar',
            'segundo_apellido': 'Mosquera',
            'fecha_nacimiento': date(1982, 4, 18),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3201234001',
            'correo_electronico': 'luis.salazar@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Lote',
            'comuna': 'Comuna 5',
            'barrio_vereda': 'Barrio La Esmeralda',
            'direccion': 'Cra 8 # 12-45',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000500010001',
            'matricula_inmobiliaria': '120-90001',
            'avaluo_catastral': '38000000',
            'numero_matricula_agua': 'AC-2026-010001',
            'numero_contrato_energia': 'CE-2026-010001',
            'tiempo_residencia': '15 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10681001',
                'primer_nombre': 'Luis', 'segundo_nombre': 'Alberto',
                'primer_apellido': 'Salazar', 'segundo_apellido': 'Mosquera',
                'fecha_nacimiento': date(1982, 4, 18),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('1300000'),
                'fuente_ingresos': 'Oficios varios',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('26.40'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10681101',
                'primer_nombre': 'Ana', 'segundo_nombre': 'Patricia',
                'primer_apellido': 'Mosquera', 'segundo_apellido': 'López',
                'fecha_nacimiento': date(1985, 9, 3),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1160000'),
                'fuente_ingresos': 'Empleo en panadería',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('26.40'),
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1061801001',
                'primer_nombre': 'Valentina', 'segundo_nombre': '',
                'primer_apellido': 'Salazar', 'segundo_apellido': 'Mosquera',
                'fecha_nacimiento': date(2012, 1, 20),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('26.40'),
            },
        ],
    },

    # ── 2. Familia Torres Agredo ──────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0002',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10682002',
            'primer_nombre': 'Gloria',
            'segundo_nombre': 'Esperanza',
            'primer_apellido': 'Torres',
            'segundo_apellido': 'Agredo',
            'fecha_nacimiento': date(1973, 12, 5),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3151234002',
            'correo_electronico': 'gloria.torres@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 7',
            'barrio_vereda': 'Barrio Los Hoyos',
            'direccion': 'Calle 18 # 3-22',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000700020002',
            'matricula_inmobiliaria': '120-90002',
            'avaluo_catastral': '28000000',
            'numero_matricula_agua': 'AC-2026-010002',
            'numero_contrato_energia': 'CE-2026-010002',
            'tiempo_residencia': '22 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10682002',
                'primer_nombre': 'Gloria', 'segundo_nombre': 'Esperanza',
                'primer_apellido': 'Torres', 'segundo_apellido': 'Agredo',
                'fecha_nacimiento': date(1973, 12, 5),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('850000'),
                'fuente_ingresos': 'Venta de frutas',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('15.80'),
                'es_victima_conflicto': True, 'es_desplazado': True,
                'municipio_origen': 'El Tambo', 'departamento_origen': 'Cauca',
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10682102',
                'primer_nombre': 'José', 'segundo_nombre': 'Hernán',
                'primer_apellido': 'Agredo', 'segundo_apellido': 'Yela',
                'fecha_nacimiento': date(1948, 7, 19),
                'parentesco': 'ABUELO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Sin escolaridad',
                'situacion_laboral': 'DESEMPLEADO',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('10.50'),
                'tiene_discapacidad': True, 'grado_discapacidad': 'Movilidad reducida',
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1061802002',
                'primer_nombre': 'Camila', 'segundo_nombre': 'Andrea',
                'primer_apellido': 'Torres', 'segundo_apellido': 'Agredo',
                'fecha_nacimiento': date(2009, 5, 14),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('15.80'),
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '1061802003',
                'primer_nombre': 'Mateo', 'segundo_nombre': '',
                'primer_apellido': 'Torres', 'segundo_apellido': 'Agredo',
                'fecha_nacimiento': date(2020, 3, 8),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('15.80'),
            },
        ],
    },

    # ── 3. Familia Velasco Guzmán ─────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0003',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10683003',
            'primer_nombre': 'Pedro',
            'segundo_nombre': 'Nel',
            'primer_apellido': 'Velasco',
            'segundo_apellido': 'Guzmán',
            'fecha_nacimiento': date(1979, 8, 25),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3001234003',
            'correo_electronico': 'pedro.velasco@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Timbío',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 3',
            'barrio_vereda': 'Barrio Pandiguando',
            'direccion': 'Cra 5 # 22-10',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '19001000000300030003',
            'matricula_inmobiliaria': '120-90003',
            'avaluo_catastral': '52000000',
            'numero_matricula_agua': 'AC-2026-010003',
            'numero_contrato_energia': 'CE-2026-010003',
            'tiempo_residencia': '8 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10683003',
                'primer_nombre': 'Pedro', 'segundo_nombre': 'Nel',
                'primer_apellido': 'Velasco', 'segundo_apellido': 'Guzmán',
                'fecha_nacimiento': date(1979, 8, 25),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1500000'),
                'fuente_ingresos': 'Construcción',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('30.20'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10683103',
                'primer_nombre': 'Diana', 'segundo_nombre': 'Marcela',
                'primer_apellido': 'Guzmán', 'segundo_apellido': 'Orozco',
                'fecha_nacimiento': date(1981, 2, 12),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('800000'),
                'fuente_ingresos': 'Costura y confección',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('30.20'),
            },
        ],
    },

    # ── 4. Familia Hurtado Sánchez ────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0004',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10684004',
            'primer_nombre': 'Carmen',
            'segundo_nombre': 'Elena',
            'primer_apellido': 'Hurtado',
            'segundo_apellido': 'Sánchez',
            'fecha_nacimiento': date(1968, 1, 30),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3109876004',
            'correo_electronico': 'carmen.hurtado@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 9',
            'barrio_vereda': 'Barrio Lomas de Granada',
            'direccion': 'Calle 45N # 1-90',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000900040004',
            'matricula_inmobiliaria': '120-90004',
            'avaluo_catastral': '25000000',
            'numero_matricula_agua': 'AC-2026-010004',
            'numero_contrato_energia': 'CE-2026-010004',
            'tiempo_residencia': '30 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10684004',
                'primer_nombre': 'Carmen', 'segundo_nombre': 'Elena',
                'primer_apellido': 'Hurtado', 'segundo_apellido': 'Sánchez',
                'fecha_nacimiento': date(1968, 1, 30),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Primaria incompleta',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('700000'),
                'fuente_ingresos': 'Venta de alimentos',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('14.60'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10684104',
                'primer_nombre': 'Andrés', 'segundo_nombre': 'Felipe',
                'primer_apellido': 'Hurtado', 'segundo_apellido': 'Sánchez',
                'fecha_nacimiento': date(1996, 11, 17),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'DESEMPLEADO',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('14.60'),
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1061804004',
                'primer_nombre': 'Sofía', 'segundo_nombre': 'Alejandra',
                'primer_apellido': 'Hurtado', 'segundo_apellido': 'Sánchez',
                'fecha_nacimiento': date(2011, 6, 22),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('14.60'),
            },
        ],
    },

    # ── 5. Familia Narváez Cerón ──────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0005',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10685005',
            'primer_nombre': 'Ricardo',
            'segundo_nombre': '',
            'primer_apellido': 'Narváez',
            'segundo_apellido': 'Cerón',
            'fecha_nacimiento': date(1990, 5, 7),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3221234005',
            'correo_electronico': 'ricardo.narvaez@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Piendamó',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'RURAL',
            'tipo_predio': 'Lote',
            'barrio_vereda': 'Vereda San Bernardino',
            'direccion': 'Km 5 vía al sur',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000100050005',
            'matricula_inmobiliaria': '120-90005',
            'avaluo_catastral': '18000000',
            'numero_matricula_agua': '',
            'numero_contrato_energia': 'CE-2026-010005',
            'tiempo_residencia': '5 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10685005',
                'primer_nombre': 'Ricardo', 'segundo_nombre': '',
                'primer_apellido': 'Narváez', 'segundo_apellido': 'Cerón',
                'fecha_nacimiento': date(1990, 5, 7),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('1100000'),
                'fuente_ingresos': 'Agricultura',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('22.10'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10685105',
                'primer_nombre': 'Yesenia', 'segundo_nombre': '',
                'primer_apellido': 'Cerón', 'segundo_apellido': 'Burbano',
                'fecha_nacimiento': date(1992, 10, 15),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('600000'),
                'fuente_ingresos': 'Venta de leche',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('22.10'),
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '1061805005',
                'primer_nombre': 'Santiago', 'segundo_nombre': '',
                'primer_apellido': 'Narváez', 'segundo_apellido': 'Cerón',
                'fecha_nacimiento': date(2021, 8, 30),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('22.10'),
            },
        ],
    },

    # ── 6. Familia Muñoz Escobar ──────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0006',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10686006',
            'primer_nombre': 'Martha',
            'segundo_nombre': 'Cecilia',
            'primer_apellido': 'Muñoz',
            'segundo_apellido': 'Escobar',
            'fecha_nacimiento': date(1976, 3, 14),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3169876006',
            'correo_electronico': 'martha.munoz@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 4',
            'barrio_vereda': 'Barrio Bolívar',
            'direccion': 'Cra 7 # 8-56',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '19001000000400060006',
            'matricula_inmobiliaria': '120-90006',
            'avaluo_catastral': '42000000',
            'numero_matricula_agua': 'AC-2026-010006',
            'numero_contrato_energia': 'CE-2026-010006',
            'tiempo_residencia': '18 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10686006',
                'primer_nombre': 'Martha', 'segundo_nombre': 'Cecilia',
                'primer_apellido': 'Muñoz', 'segundo_apellido': 'Escobar',
                'fecha_nacimiento': date(1976, 3, 14),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('1200000'),
                'fuente_ingresos': 'Peluquería a domicilio',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('28.00'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10686106',
                'primer_nombre': 'Julián', 'segundo_nombre': 'David',
                'primer_apellido': 'Escobar', 'segundo_apellido': 'Muñoz',
                'fecha_nacimiento': date(2000, 12, 1),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Universitaria incompleta',
                'situacion_laboral': 'DESEMPLEADO',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('28.00'),
            },
        ],
    },

    # ── 7. Familia Burbano Chávez ─────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0007',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10687007',
            'primer_nombre': 'Hernando',
            'segundo_nombre': '',
            'primer_apellido': 'Burbano',
            'segundo_apellido': 'Chávez',
            'fecha_nacimiento': date(1965, 9, 11),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3001234007',
            'correo_electronico': 'hernando.burbano@correo.com',
            'departamento_nacimiento': 'Nariño',
            'municipio_nacimiento': 'Pasto',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 8',
            'barrio_vereda': 'Barrio Yanaconas',
            'direccion': 'Calle 60N # 24-12',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000800070007',
            'matricula_inmobiliaria': '120-90007',
            'avaluo_catastral': '30000000',
            'numero_matricula_agua': 'AC-2026-010007',
            'numero_contrato_energia': 'CE-2026-010007',
            'tiempo_residencia': '25 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10687007',
                'primer_nombre': 'Hernando', 'segundo_nombre': '',
                'primer_apellido': 'Burbano', 'segundo_apellido': 'Chávez',
                'fecha_nacimiento': date(1965, 9, 11),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('900000'),
                'fuente_ingresos': 'Moto-taxi',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('18.70'),
                'tiene_discapacidad': True, 'grado_discapacidad': 'Auditiva parcial',
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10687107',
                'primer_nombre': 'Blanca', 'segundo_nombre': 'Inés',
                'primer_apellido': 'Chávez', 'segundo_apellido': 'Erazo',
                'fecha_nacimiento': date(1970, 4, 28),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Sin escolaridad',
                'situacion_laboral': 'DESEMPLEADO',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('18.70'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10687207',
                'primer_nombre': 'Esteban', 'segundo_nombre': '',
                'primer_apellido': 'Burbano', 'segundo_apellido': 'Chávez',
                'fecha_nacimiento': date(1998, 7, 5),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1160000'),
                'fuente_ingresos': 'Trabajador en fábrica',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('18.70'),
            },
        ],
    },

    # ── 8. Familia Caicedo Pino ───────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0008',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10688008',
            'primer_nombre': 'Adriana',
            'segundo_nombre': 'Lucía',
            'primer_apellido': 'Caicedo',
            'segundo_apellido': 'Pino',
            'fecha_nacimiento': date(1987, 6, 19),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3181234008',
            'correo_electronico': 'adriana.caicedo@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Santander de Quilichao',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Apartamento',
            'comuna': 'Comuna 2',
            'barrio_vereda': 'Barrio Santa Librada',
            'direccion': 'Calle 5 # 15-30 Apto 201',
            'estrato': '2',
            'es_propietario': False,
            'numero_predial': '19001000000200080008',
            'matricula_inmobiliaria': '',
            'avaluo_catastral': '',
            'numero_matricula_agua': 'AC-2026-010008',
            'numero_contrato_energia': 'CE-2026-010008',
            'tiempo_residencia': '3 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10688008',
                'primer_nombre': 'Adriana', 'segundo_nombre': 'Lucía',
                'primer_apellido': 'Caicedo', 'segundo_apellido': 'Pino',
                'fecha_nacimiento': date(1987, 6, 19),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1300000'),
                'fuente_ingresos': 'Empleada doméstica',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('25.30'),
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1061808008',
                'primer_nombre': 'Isabela', 'segundo_nombre': '',
                'primer_apellido': 'Caicedo', 'segundo_apellido': 'Pino',
                'fecha_nacimiento': date(2010, 2, 14),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('25.30'),
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '1061808009',
                'primer_nombre': 'Samuel', 'segundo_nombre': 'Darío',
                'primer_apellido': 'Caicedo', 'segundo_apellido': 'Pino',
                'fecha_nacimiento': date(2019, 11, 3),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('25.30'),
            },
        ],
    },

    # ── 9. Familia Rengifo Córdoba ────────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0009',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10689009',
            'primer_nombre': 'Oscar',
            'segundo_nombre': 'Iván',
            'primer_apellido': 'Rengifo',
            'segundo_apellido': 'Córdoba',
            'fecha_nacimiento': date(1984, 10, 2),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3009876009',
            'correo_electronico': 'oscar.rengifo@correo.com',
            'departamento_nacimiento': 'Valle del Cauca',
            'municipio_nacimiento': 'Buenaventura',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 6',
            'barrio_vereda': 'Barrio El Recuerdo',
            'direccion': 'Cra 10 # 71N-15',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000600090009',
            'matricula_inmobiliaria': '120-90009',
            'avaluo_catastral': '35000000',
            'numero_matricula_agua': 'AC-2026-010009',
            'numero_contrato_energia': 'CE-2026-010009',
            'tiempo_residencia': '10 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10689009',
                'primer_nombre': 'Oscar', 'segundo_nombre': 'Iván',
                'primer_apellido': 'Rengifo', 'segundo_apellido': 'Córdoba',
                'fecha_nacimiento': date(1984, 10, 2),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('1400000'),
                'fuente_ingresos': 'Carpintería',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.50'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10689109',
                'primer_nombre': 'Leidy', 'segundo_nombre': 'Johanna',
                'primer_apellido': 'Córdoba', 'segundo_apellido': 'Mina',
                'fecha_nacimiento': date(1986, 3, 18),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('700000'),
                'fuente_ingresos': 'Lavado de ropa',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.50'),
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1061809009',
                'primer_nombre': 'Kevin', 'segundo_nombre': 'Andrés',
                'primer_apellido': 'Rengifo', 'segundo_apellido': 'Córdoba',
                'fecha_nacimiento': date(2008, 12, 25),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.50'),
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '1061809010',
                'primer_nombre': 'Luna', 'segundo_nombre': 'Sofía',
                'primer_apellido': 'Rengifo', 'segundo_apellido': 'Córdoba',
                'fecha_nacimiento': date(2022, 4, 10),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.50'),
            },
        ],
    },

    # ── 10. Familia Zúñiga Betancourt ────────────────────────────────────
    {
        'radicado': 'RAD-SVN-202604-0010',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10690010',
            'primer_nombre': 'Esperanza',
            'segundo_nombre': '',
            'primer_apellido': 'Zúñiga',
            'segundo_apellido': 'Betancourt',
            'fecha_nacimiento': date(1971, 7, 23),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3171234010',
            'correo_electronico': 'esperanza.zuniga@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'RURAL',
            'tipo_predio': 'Casa',
            'barrio_vereda': 'Vereda Torres',
            'direccion': 'Km 3 vía Timbío',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000100100010',
            'matricula_inmobiliaria': '120-90010',
            'avaluo_catastral': '20000000',
            'numero_matricula_agua': '',
            'numero_contrato_energia': 'CE-2026-010010',
            'tiempo_residencia': '35 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10690010',
                'primer_nombre': 'Esperanza', 'segundo_nombre': '',
                'primer_apellido': 'Zúñiga', 'segundo_apellido': 'Betancourt',
                'fecha_nacimiento': date(1971, 7, 23),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Sin escolaridad',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('500000'),
                'fuente_ingresos': 'Cultivo de hortalizas',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('12.80'),
                'es_victima_conflicto': True, 'es_desplazado': True,
                'municipio_origen': 'Argelia', 'departamento_origen': 'Cauca',
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10690110',
                'primer_nombre': 'Diego', 'segundo_nombre': 'Armando',
                'primer_apellido': 'Zúñiga', 'segundo_apellido': 'Betancourt',
                'fecha_nacimiento': date(1995, 1, 9),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('800000'),
                'fuente_ingresos': 'Jornalero agrícola',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('12.80'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '10690210',
                'primer_nombre': 'Paola', 'segundo_nombre': '',
                'primer_apellido': 'Zúñiga', 'segundo_apellido': 'Betancourt',
                'fecha_nacimiento': date(1999, 8, 17),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'DESEMPLEADO',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('12.80'),
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '1061810010',
                'primer_nombre': 'Tomás', 'segundo_nombre': '',
                'primer_apellido': 'Zúñiga', 'segundo_apellido': 'Betancourt',
                'fecha_nacimiento': date(2023, 6, 5),
                'parentesco': 'NIETO', 'es_cabeza_hogar': False,
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('12.80'),
            },
        ],
    },
]


# ═════════════════════════════════════════════════════════════════════════════ #
# 4. Crear registros en BD                                                     #
# ═════════════════════════════════════════════════════════════════════════════ #

creadas = 0

for i, datos in enumerate(POSTULACIONES, start=1):
    radicado = datos['radicado']
    tit = datos['titular']

    # ¿Ya existe esta postulación?
    if GestionHogarEtapa1.objects.filter(numero_radicado=radicado).exists():
        info(f'[{i:02d}] Ya existe radicado {radicado} — omitido')
        continue

    print(f'\n── [{i:02d}] Familia {tit["primer_apellido"]} {tit["segundo_apellido"]} ──')

    # Ciudadano titular
    ciudadano, c_nuevo = Ciudadano.objects.get_or_create(
        tipo_documento=tit['tipo_documento'],
        numero_documento=tit['numero_documento'],
        defaults={k: v for k, v in tit.items() if k not in ('tipo_documento', 'numero_documento')},
    )
    ok(f'Ciudadano: {ciudadano} {"(nuevo)" if c_nuevo else "(existente)"}')

    # Postulación
    postulacion = Postulacion.objects.create(
        programa=programa,
        etapa_actual=etapa1,
        estado='REGISTRADA',
    )
    ok(f'Postulación id={postulacion.id} — estado=REGISTRADA')

    # Gestión hogar etapa 1
    predio = datos['predio']
    gestion = GestionHogarEtapa1.objects.create(
        postulacion=postulacion,
        etapa=etapa1,
        ciudadano=ciudadano,
        numero_radicado=radicado,
        **predio,
    )
    ok(f'GestionHogar radicado={radicado}')

    # Miembros del hogar
    for m in datos['miembros']:
        MiembroHogar.objects.create(postulacion=gestion, **m)
    ok(f'{len(datos["miembros"])} miembro(s) del hogar')

    creadas += 1

# ── Resumen ───────────────────────────────────────────────────────────────── #

print(f'\n{"═" * 60}')
print(f'✅ Programa: {programa.nombre} (id={programa.id})')
print(f'✅ Postulaciones creadas: {creadas} de {len(POSTULACIONES)}')
print(f'   Estado: REGISTRADA (sin funcionario asignado)')
print(f'{"═" * 60}')
