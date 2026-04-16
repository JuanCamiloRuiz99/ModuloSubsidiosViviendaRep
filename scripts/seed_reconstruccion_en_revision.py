#!/usr/bin/env python
"""
seed_reconstruccion_en_revision.py
===================================
Agrega 10 postulaciones en estado EN_REVISION al programa existente
"Reconstruccion de vivienda 2026" (id=21, codigo=2026BS2F8D).

Cada postulación incluye:
  • Ciudadano titular
  • Postulacion (estado EN_REVISION, sin funcionario asignado)
  • GestionHogarEtapa1 (datos del predio, ubicación en Popayán, Cauca)
  • 2-3 MiembroHogar

Ejecución (desde la carpeta backend/):
    python ../scripts/seed_reconstruccion_en_revision.py
"""

import os
import sys
import django
from datetime import date
from decimal import Decimal

# ── Django setup ──────────────────────────────────────────────────────────── #

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

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
# 1. Programa y etapa existentes                                               #
# ═════════════════════════════════════════════════════════════════════════════ #

programa = Programa.objects.get(codigo_programa='2026BS2F8D')
print(f'ℹ️   Programa: {programa.nombre} (id={programa.id})')

etapa1 = Etapa.objects.get(programa=programa, numero_etapa=1)
print(f'ℹ️   Etapa 1: id={etapa1.id}, módulo={etapa1.modulo_principal}')

# ═════════════════════════════════════════════════════════════════════════════ #
# 2. Datos de las 10 postulaciones                                             #
# ═════════════════════════════════════════════════════════════════════════════ #

POSTULACIONES = [
    # ── 1. Familia Bermúdez Vargas ────────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0001',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700001',
            'primer_nombre': 'Carlos',
            'segundo_nombre': 'Andrés',
            'primer_apellido': 'Bermúdez',
            'segundo_apellido': 'Vargas',
            'fecha_nacimiento': date(1978, 3, 12),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3104001001',
            'correo_electronico': 'carlos.bermudez@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 3',
            'barrio_vereda': 'Barrio El Lago',
            'direccion': 'Cll 14 # 5-20',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000300010001',
            'matricula_inmobiliaria': '120-70001',
            'avaluo_catastral': '45000000',
            'numero_matricula_agua': 'AC-2026-070001',
            'numero_contrato_energia': 'CE-2026-070001',
            'tiempo_residencia': '12 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700001',
                'primer_nombre': 'Carlos', 'segundo_nombre': 'Andrés',
                'primer_apellido': 'Bermúdez', 'segundo_apellido': 'Vargas',
                'fecha_nacimiento': date(1978, 3, 12),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('1200000'),
                'fuente_ingresos': 'Construcción',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('28.50'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700101',
                'primer_nombre': 'Marta', 'segundo_nombre': 'Lucía',
                'primer_apellido': 'Ospina', 'segundo_apellido': 'Rojas',
                'fecha_nacimiento': date(1981, 7, 25),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'DESEMPLEADO',
                'ingresos_mensuales': Decimal('0'),
                'fuente_ingresos': '',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('28.50'),
            },
        ],
    },

    # ── 2. Familia Castaño Pino ───────────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0002',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700002',
            'primer_nombre': 'Rosa',
            'segundo_nombre': 'Elena',
            'primer_apellido': 'Castaño',
            'segundo_apellido': 'Pino',
            'fecha_nacimiento': date(1969, 11, 8),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3154001002',
            'correo_electronico': 'rosa.castano@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 7',
            'barrio_vereda': 'Barrio Alfonso López',
            'direccion': 'Cra 12 # 8-30',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '19001000000700010002',
            'matricula_inmobiliaria': '120-70002',
            'avaluo_catastral': '52000000',
            'numero_matricula_agua': 'AC-2026-070002',
            'numero_contrato_energia': 'CE-2026-070002',
            'tiempo_residencia': '20 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700002',
                'primer_nombre': 'Rosa', 'segundo_nombre': 'Elena',
                'primer_apellido': 'Castaño', 'segundo_apellido': 'Pino',
                'fecha_nacimiento': date(1969, 11, 8),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1160000'),
                'fuente_ingresos': 'Costura y confección',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('18.20'),
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '2070000201',
                'primer_nombre': 'Diego', 'segundo_nombre': '',
                'primer_apellido': 'Castaño', 'segundo_apellido': 'Pino',
                'fecha_nacimiento': date(2008, 4, 15),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('18.20'),
            },
        ],
    },

    # ── 3. Familia Muñoz Hurtado ──────────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0003',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700003',
            'primer_nombre': 'Jorge',
            'segundo_nombre': 'Iván',
            'primer_apellido': 'Muñoz',
            'segundo_apellido': 'Hurtado',
            'fecha_nacimiento': date(1975, 6, 22),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3204001003',
            'correo_electronico': 'jorge.munoz@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Timbío',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 2',
            'barrio_vereda': 'Barrio Bello Horizonte',
            'direccion': 'Tv 9 # 3-18',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000200010003',
            'matricula_inmobiliaria': '120-70003',
            'avaluo_catastral': '39000000',
            'numero_matricula_agua': 'AC-2026-070003',
            'numero_contrato_energia': 'CE-2026-070003',
            'tiempo_residencia': '8 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700003',
                'primer_nombre': 'Jorge', 'segundo_nombre': 'Iván',
                'primer_apellido': 'Muñoz', 'segundo_apellido': 'Hurtado',
                'fecha_nacimiento': date(1975, 6, 22),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Primaria incompleta',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('900000'),
                'fuente_ingresos': 'Agricultura',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('15.80'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700301',
                'primer_nombre': 'Lidia', 'segundo_nombre': 'Marcela',
                'primer_apellido': 'Fierro', 'segundo_apellido': 'Gómez',
                'fecha_nacimiento': date(1979, 2, 14),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'DESEMPLEADO',
                'ingresos_mensuales': Decimal('0'),
                'fuente_ingresos': '',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('15.80'),
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '2070030201',
                'primer_nombre': 'Samuel', 'segundo_nombre': '',
                'primer_apellido': 'Muñoz', 'segundo_apellido': 'Fierro',
                'fecha_nacimiento': date(2018, 9, 5),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('15.80'),
            },
        ],
    },

    # ── 4. Familia Güetio Valencia ────────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0004',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700004',
            'primer_nombre': 'Amparo',
            'segundo_nombre': 'del Carmen',
            'primer_apellido': 'Güetio',
            'segundo_apellido': 'Valencia',
            'fecha_nacimiento': date(1965, 8, 30),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3164001004',
            'correo_electronico': 'amparo.guetio@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 6',
            'barrio_vereda': 'Barrio Los Robles',
            'direccion': 'Cll 20 # 10-55',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000600010004',
            'matricula_inmobiliaria': '120-70004',
            'avaluo_catastral': '41000000',
            'numero_matricula_agua': 'AC-2026-070004',
            'numero_contrato_energia': 'CE-2026-070004',
            'tiempo_residencia': '25 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700004',
                'primer_nombre': 'Amparo', 'segundo_nombre': 'del Carmen',
                'primer_apellido': 'Güetio', 'segundo_apellido': 'Valencia',
                'fecha_nacimiento': date(1965, 8, 30),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'PENSIONADO',
                'ingresos_mensuales': Decimal('1000000'),
                'fuente_ingresos': 'Pensión',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('30.10'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700401',
                'primer_nombre': 'Hernán', 'segundo_nombre': '',
                'primer_apellido': 'Güetio', 'segundo_apellido': 'Martínez',
                'fecha_nacimiento': date(1990, 5, 17),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1160000'),
                'fuente_ingresos': 'Mecánica',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('30.10'),
            },
        ],
    },

    # ── 5. Familia Perdomo Anacona ────────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0005',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700005',
            'primer_nombre': 'Pedro',
            'segundo_nombre': 'Antonio',
            'primer_apellido': 'Perdomo',
            'segundo_apellido': 'Anacona',
            'fecha_nacimiento': date(1983, 1, 19),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3174001005',
            'correo_electronico': 'pedro.perdomo@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Silvia',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 4',
            'barrio_vereda': 'Barrio San Ignacio',
            'direccion': 'Cra 6 # 22-10',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '19001000000400010005',
            'matricula_inmobiliaria': '120-70005',
            'avaluo_catastral': '55000000',
            'numero_matricula_agua': 'AC-2026-070005',
            'numero_contrato_energia': 'CE-2026-070005',
            'tiempo_residencia': '10 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700005',
                'primer_nombre': 'Pedro', 'segundo_nombre': 'Antonio',
                'primer_apellido': 'Perdomo', 'segundo_apellido': 'Anacona',
                'fecha_nacimiento': date(1983, 1, 19),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Universitario',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('2000000'),
                'fuente_ingresos': 'Empleo formal',
                'pertenece_sisben': True, 'grupo_sisben': 'C', 'puntaje_sisben': Decimal('45.60'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700501',
                'primer_nombre': 'Sandra', 'segundo_nombre': 'Milena',
                'primer_apellido': 'Ruiz', 'segundo_apellido': 'Chaux',
                'fecha_nacimiento': date(1986, 10, 3),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1500000'),
                'fuente_ingresos': 'Docencia',
                'pertenece_sisben': True, 'grupo_sisben': 'C', 'puntaje_sisben': Decimal('45.60'),
            },
        ],
    },

    # ── 6. Familia Imbachí Cuetia ─────────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0006',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700006',
            'primer_nombre': 'Leonor',
            'segundo_nombre': 'Del Pilar',
            'primer_apellido': 'Imbachí',
            'segundo_apellido': 'Cuetia',
            'fecha_nacimiento': date(1971, 4, 27),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3184001006',
            'correo_electronico': 'leonor.imbachi@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'RURAL',
            'tipo_predio': 'Casa',
            'comuna': '',
            'barrio_vereda': 'Vereda La Rejoya',
            'direccion': 'Km 4 vía Popayán-Timbío',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000010000010006',
            'matricula_inmobiliaria': '120-70006',
            'avaluo_catastral': '30000000',
            'numero_matricula_agua': 'AC-2026-070006',
            'numero_contrato_energia': 'CE-2026-070006',
            'tiempo_residencia': '30 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700006',
                'primer_nombre': 'Leonor', 'segundo_nombre': 'Del Pilar',
                'primer_apellido': 'Imbachí', 'segundo_apellido': 'Cuetia',
                'fecha_nacimiento': date(1971, 4, 27),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Primaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('800000'),
                'fuente_ingresos': 'Venta de productos agrícolas',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('12.40'),
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '2070000601',
                'primer_nombre': 'Yesenia', 'segundo_nombre': '',
                'primer_apellido': 'Imbachí', 'segundo_apellido': 'Cuetia',
                'fecha_nacimiento': date(2005, 3, 11),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('12.40'),
            },
        ],
    },

    # ── 7. Familia Bolaños Figueroa ───────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0007',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700007',
            'primer_nombre': 'Rodrigo',
            'segundo_nombre': 'Alfonso',
            'primer_apellido': 'Bolaños',
            'segundo_apellido': 'Figueroa',
            'fecha_nacimiento': date(1980, 9, 14),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3194001007',
            'correo_electronico': 'rodrigo.bolanos@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 8',
            'barrio_vereda': 'Barrio Camilo Torres',
            'direccion': 'Cll 6N # 2-44',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '19001000000800010007',
            'matricula_inmobiliaria': '120-70007',
            'avaluo_catastral': '48000000',
            'numero_matricula_agua': 'AC-2026-070007',
            'numero_contrato_energia': 'CE-2026-070007',
            'tiempo_residencia': '7 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700007',
                'primer_nombre': 'Rodrigo', 'segundo_nombre': 'Alfonso',
                'primer_apellido': 'Bolaños', 'segundo_apellido': 'Figueroa',
                'fecha_nacimiento': date(1980, 9, 14),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1400000'),
                'fuente_ingresos': 'Electricidad',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('32.70'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700701',
                'primer_nombre': 'Nohora', 'segundo_nombre': 'Cecilia',
                'primer_apellido': 'Pantoja', 'segundo_apellido': 'Erazo',
                'fecha_nacimiento': date(1982, 12, 2),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'DESEMPLEADO',
                'ingresos_mensuales': Decimal('0'),
                'fuente_ingresos': '',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('32.70'),
            },
        ],
    },

    # ── 8. Familia Semanate Palechor ──────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0008',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700008',
            'primer_nombre': 'Cecilia',
            'segundo_nombre': 'Inés',
            'primer_apellido': 'Semanate',
            'segundo_apellido': 'Palechor',
            'fecha_nacimiento': date(1967, 7, 9),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3114001008',
            'correo_electronico': 'cecilia.semanate@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Rosas',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 1',
            'barrio_vereda': 'Barrio Bolívar',
            'direccion': 'Cra 3 # 1-50',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000100010008',
            'matricula_inmobiliaria': '120-70008',
            'avaluo_catastral': '36000000',
            'numero_matricula_agua': 'AC-2026-070008',
            'numero_contrato_energia': 'CE-2026-070008',
            'tiempo_residencia': '22 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700008',
                'primer_nombre': 'Cecilia', 'segundo_nombre': 'Inés',
                'primer_apellido': 'Semanate', 'segundo_apellido': 'Palechor',
                'fecha_nacimiento': date(1967, 7, 9),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Primaria incompleta',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': Decimal('700000'),
                'fuente_ingresos': 'Lavandería',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('10.90'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700801',
                'primer_nombre': 'Fabio', 'segundo_nombre': 'José',
                'primer_apellido': 'Semanate', 'segundo_apellido': 'López',
                'fecha_nacimiento': date(1993, 6, 21),
                'parentesco': 'HIJO', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'DESEMPLEADO',
                'ingresos_mensuales': Decimal('0'),
                'fuente_ingresos': '',
                'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('10.90'),
            },
        ],
    },

    # ── 9. Familia Portilla Sánchez ───────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0009',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700009',
            'primer_nombre': 'Gustavo',
            'segundo_nombre': 'Adolfo',
            'primer_apellido': 'Portilla',
            'segundo_apellido': 'Sánchez',
            'fecha_nacimiento': date(1977, 2, 28),
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3124001009',
            'correo_electronico': 'gustavo.portilla@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 9',
            'barrio_vereda': 'Barrio Las Américas',
            'direccion': 'Cll 13N # 7-22',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '19001000000900010009',
            'matricula_inmobiliaria': '120-70009',
            'avaluo_catastral': '50000000',
            'numero_matricula_agua': 'AC-2026-070009',
            'numero_contrato_energia': 'CE-2026-070009',
            'tiempo_residencia': '14 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700009',
                'primer_nombre': 'Gustavo', 'segundo_nombre': 'Adolfo',
                'primer_apellido': 'Portilla', 'segundo_apellido': 'Sánchez',
                'fecha_nacimiento': date(1977, 2, 28),
                'parentesco': 'PADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Universitario',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('2500000'),
                'fuente_ingresos': 'Contador',
                'pertenece_sisben': True, 'grupo_sisben': 'C', 'puntaje_sisben': Decimal('48.30'),
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700901',
                'primer_nombre': 'Viviana', 'segundo_nombre': 'Paola',
                'primer_apellido': 'Garzon', 'segundo_apellido': 'Tovar',
                'fecha_nacimiento': date(1980, 8, 16),
                'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Universitario',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1800000'),
                'fuente_ingresos': 'Enfermería',
                'pertenece_sisben': True, 'grupo_sisben': 'C', 'puntaje_sisben': Decimal('48.30'),
            },
        ],
    },

    # ── 10. Familia Yule Ascue ────────────────────────────────────────────
    {
        'radicado': 'RAD-RCV-202604-0010',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '20700010',
            'primer_nombre': 'María',
            'segundo_nombre': 'Eugenia',
            'primer_apellido': 'Yule',
            'segundo_apellido': 'Ascue',
            'fecha_nacimiento': date(1988, 5, 3),
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3134001010',
            'correo_electronico': 'maria.yule@correo.com',
            'departamento_nacimiento': 'Cauca',
            'municipio_nacimiento': 'Jambaló',
        },
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayán',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Comuna 5',
            'barrio_vereda': 'Barrio El Triunfo',
            'direccion': 'Cra 15 # 6-38',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '19001000000500010010',
            'matricula_inmobiliaria': '120-70010',
            'avaluo_catastral': '37000000',
            'numero_matricula_agua': 'AC-2026-070010',
            'numero_contrato_energia': 'CE-2026-070010',
            'tiempo_residencia': '6 años',
            'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '20700010',
                'primer_nombre': 'María', 'segundo_nombre': 'Eugenia',
                'primer_apellido': 'Yule', 'segundo_apellido': 'Ascue',
                'fecha_nacimiento': date(1988, 5, 3),
                'parentesco': 'MADRE', 'es_cabeza_hogar': True,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': Decimal('1160000'),
                'fuente_ingresos': 'Tienda de barrio',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('22.80'),
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '2070001001',
                'primer_nombre': 'Sofía', 'segundo_nombre': '',
                'primer_apellido': 'Yule', 'segundo_apellido': 'Ascue',
                'fecha_nacimiento': date(2019, 11, 28),
                'parentesco': 'HIJA', 'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria incompleta',
                'situacion_laboral': '',
                'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('22.80'),
            },
        ],
    },
]

# ═════════════════════════════════════════════════════════════════════════════ #
# 3. Crear postulaciones                                                       #
# ═════════════════════════════════════════════════════════════════════════════ #

print(f'\n{"═" * 60}')
print('Creando postulaciones...')
print(f'{"═" * 60}')

creadas = 0
for i, datos in enumerate(POSTULACIONES, start=1):
    radicado = datos['radicado']
    tit = datos['titular']

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

    # Postulación en estado REGISTRADA
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
print(f'   Estado: REGISTRADA')
print(f'{"═" * 60}')
