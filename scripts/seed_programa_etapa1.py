#!/usr/bin/env python
"""
seed_programa_etapa1.py
=======================
Crea un programa con solo Etapa 1 activa y 10 postulaciones REGISTRADA.
"""

import os, sys, django
from datetime import date
from decimal import Decimal
from seed_setup import setup_django_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
setup_django_path()
django.setup()

from infrastructure.database.models import (
    Programa, Etapa, Ciudadano, Postulacion, GestionHogarEtapa1, MiembroHogar,
)

def ok(msg):   print(f'  ✅ {msg}')
def info(msg): print(f'  ℹ️  {msg}')

# ── Programa ──────────────────────────────────────────────────────────────── #

programa, creado = Programa.objects.get_or_create(
    codigo_programa='2026MHOGAR',
    defaults={
        'nombre': 'Mejoramiento de Hogar 2026',
        'descripcion': 'Programa de subsidio para mejoramiento de vivienda en zonas vulnerables del municipio de Popayán.',
        'entidad_responsable': 'Secretaría de Infraestructura y Vivienda',
        'estado': 'ACTIVO',
    },
)
print(f'{"✅ Creado" if creado else "ℹ️  Ya existe"} → Programa: {programa.nombre} (id={programa.id})')

# ── Etapas (solo etapa 1 activa) ─────────────────────────────────────────── #

etapa1, c = Etapa.objects.get_or_create(
    programa=programa, numero_etapa=1,
    defaults={'modulo_principal': 'REGISTRO_HOGAR', 'activo_logico': True, 'finalizada': False},
)
print(f'  {"✅" if c else "ℹ️ "} Etapa 1: REGISTRO_HOGAR — activa')

etapa2, c = Etapa.objects.get_or_create(
    programa=programa, numero_etapa=2,
    defaults={'modulo_principal': 'VISITA_TECNICA', 'activo_logico': False, 'finalizada': False},
)
print(f'  {"✅" if c else "ℹ️ "} Etapa 2: VISITA_TECNICA — inactiva')

etapa3, c = Etapa.objects.get_or_create(
    programa=programa, numero_etapa=3,
    defaults={'modulo_principal': 'GESTION_DOCUMENTAL_INTERNA', 'activo_logico': False, 'finalizada': False},
)
print(f'  {"✅" if c else "ℹ️ "} Etapa 3: GESTION_DOCUMENTAL_INTERNA — inactiva')

# ── 10 Postulaciones ─────────────────────────────────────────────────────── #

POSTULACIONES = [
    {
        'radicado': 'RAD-MH-202604-0001',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76401001',
            'primer_nombre': 'Fernando', 'segundo_nombre': 'José',
            'primer_apellido': 'Quintero', 'segundo_apellido': 'Meza',
            'fecha_nacimiento': date(1980, 2, 14), 'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana', 'telefono': '3201110001',
            'correo_electronico': 'fernando.quintero@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Casa', 'comuna': 'Comuna 3', 'barrio_vereda': 'Barrio Pandiguando',
            'direccion': 'Cra 6 # 10-24', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001030000100010001',
            'matricula_inmobiliaria': '120-80001', 'avaluo_catastral': '32000000',
            'numero_matricula_agua': 'AC-2026-020001', 'numero_contrato_energia': 'CE-2026-020001',
            'tiempo_residencia': '20 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76401001',
             'primer_nombre': 'Fernando', 'segundo_nombre': 'José',
             'primer_apellido': 'Quintero', 'segundo_apellido': 'Meza',
             'fecha_nacimiento': date(1980, 2, 14), 'parentesco': 'PADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Secundaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('1200000'), 'fuente_ingresos': 'Mecánica automotriz',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('25.00')},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76401101',
             'primer_nombre': 'Luz', 'segundo_nombre': 'Mery',
             'primer_apellido': 'Meza', 'segundo_apellido': 'Castro',
             'fecha_nacimiento': date(1983, 6, 20), 'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Técnico', 'situacion_laboral': 'EMPLEADO',
             'ingresos_mensuales': Decimal('1160000'), 'fuente_ingresos': 'Auxiliar de cocina',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('25.00')},
            {'tipo_documento': 'TARJETA_IDENTIDAD', 'numero_documento': '1062001001',
             'primer_nombre': 'Nicolás', 'segundo_nombre': '',
             'primer_apellido': 'Quintero', 'segundo_apellido': 'Meza',
             'fecha_nacimiento': date(2013, 3, 5), 'parentesco': 'HIJO', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria incompleta', 'situacion_laboral': '',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('25.00')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0002',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76402002',
            'primer_nombre': 'Rosa', 'segundo_nombre': 'Elvira',
            'primer_apellido': 'Camacho', 'segundo_apellido': 'Daza',
            'fecha_nacimiento': date(1970, 11, 8), 'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana', 'telefono': '3151110002',
            'correo_electronico': 'rosa.camacho@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Casa', 'comuna': 'Comuna 7', 'barrio_vereda': 'Barrio Alfonso López',
            'direccion': 'Calle 20 # 5-11', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001070000200020002',
            'matricula_inmobiliaria': '120-80002', 'avaluo_catastral': '26000000',
            'numero_matricula_agua': 'AC-2026-020002', 'numero_contrato_energia': 'CE-2026-020002',
            'tiempo_residencia': '28 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76402002',
             'primer_nombre': 'Rosa', 'segundo_nombre': 'Elvira',
             'primer_apellido': 'Camacho', 'segundo_apellido': 'Daza',
             'fecha_nacimiento': date(1970, 11, 8), 'parentesco': 'MADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Primaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('750000'), 'fuente_ingresos': 'Venta de tamales',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('16.20'),
             'es_victima_conflicto': True, 'es_desplazado': True,
             'municipio_origen': 'Patía', 'departamento_origen': 'Cauca'},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76402102',
             'primer_nombre': 'Alberto', 'segundo_nombre': '',
             'primer_apellido': 'Daza', 'segundo_apellido': 'Rengifo',
             'fecha_nacimiento': date(1945, 3, 12), 'parentesco': 'ABUELO', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Sin escolaridad', 'situacion_laboral': 'DESEMPLEADO',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('11.00'),
             'tiene_discapacidad': True, 'grado_discapacidad': 'Visual parcial'},
            {'tipo_documento': 'REGISTRO_CIVIL', 'numero_documento': '1062002002',
             'primer_nombre': 'Luciana', 'segundo_nombre': '',
             'primer_apellido': 'Camacho', 'segundo_apellido': 'Daza',
             'fecha_nacimiento': date(2021, 9, 15), 'parentesco': 'NIETA', 'es_cabeza_hogar': False,
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('16.20')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0003',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76403003',
            'primer_nombre': 'Héctor', 'segundo_nombre': 'Fabián',
            'primer_apellido': 'Solarte', 'segundo_apellido': 'Navia',
            'fecha_nacimiento': date(1986, 7, 1), 'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana', 'telefono': '3001110003',
            'correo_electronico': 'hector.solarte@correo.com',
            'departamento_nacimiento': 'Nariño', 'municipio_nacimiento': 'Pasto',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Casa', 'comuna': 'Comuna 5', 'barrio_vereda': 'Barrio La Esmeralda',
            'direccion': 'Cra 12 # 3-45', 'estrato': '2',
            'es_propietario': True, 'numero_predial': '19001050000300030003',
            'matricula_inmobiliaria': '120-80003', 'avaluo_catastral': '48000000',
            'numero_matricula_agua': 'AC-2026-020003', 'numero_contrato_energia': 'CE-2026-020003',
            'tiempo_residencia': '10 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76403003',
             'primer_nombre': 'Héctor', 'segundo_nombre': 'Fabián',
             'primer_apellido': 'Solarte', 'segundo_apellido': 'Navia',
             'fecha_nacimiento': date(1986, 7, 1), 'parentesco': 'PADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Técnico', 'situacion_laboral': 'EMPLEADO',
             'ingresos_mensuales': Decimal('1500000'), 'fuente_ingresos': 'Albañilería',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('29.40')},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76403103',
             'primer_nombre': 'Jenny', 'segundo_nombre': 'Patricia',
             'primer_apellido': 'Navia', 'segundo_apellido': 'López',
             'fecha_nacimiento': date(1988, 12, 22), 'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('900000'), 'fuente_ingresos': 'Manicure a domicilio',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('29.40')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0004',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76404004',
            'primer_nombre': 'Claudia', 'segundo_nombre': 'Milena',
            'primer_apellido': 'Bambagüé', 'segundo_apellido': 'Ortiz',
            'fecha_nacimiento': date(1978, 4, 25), 'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana', 'telefono': '3121110004',
            'correo_electronico': 'claudia.bambague@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Silvia',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'RURAL',
            'tipo_predio': 'Casa', 'barrio_vereda': 'Vereda Calibío',
            'direccion': 'Km 8 vía norte', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001010000400040004',
            'matricula_inmobiliaria': '120-80004', 'avaluo_catastral': '15000000',
            'numero_matricula_agua': '', 'numero_contrato_energia': 'CE-2026-020004',
            'tiempo_residencia': '12 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76404004',
             'primer_nombre': 'Claudia', 'segundo_nombre': 'Milena',
             'primer_apellido': 'Bambagüé', 'segundo_apellido': 'Ortiz',
             'fecha_nacimiento': date(1978, 4, 25), 'parentesco': 'MADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Primaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('600000'), 'fuente_ingresos': 'Artesanías',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('13.50')},
            {'tipo_documento': 'TARJETA_IDENTIDAD', 'numero_documento': '1062004004',
             'primer_nombre': 'Ángela', 'segundo_nombre': 'María',
             'primer_apellido': 'Bambagüé', 'segundo_apellido': 'Ortiz',
             'fecha_nacimiento': date(2010, 8, 30), 'parentesco': 'HIJA', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria incompleta', 'situacion_laboral': '',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('13.50')},
            {'tipo_documento': 'REGISTRO_CIVIL', 'numero_documento': '1062004005',
             'primer_nombre': 'Sebastián', 'segundo_nombre': '',
             'primer_apellido': 'Bambagüé', 'segundo_apellido': 'Ortiz',
             'fecha_nacimiento': date(2020, 1, 18), 'parentesco': 'HIJO', 'es_cabeza_hogar': False,
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('13.50')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0005',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76405005',
            'primer_nombre': 'William', 'segundo_nombre': '',
            'primer_apellido': 'Orozco', 'segundo_apellido': 'Flor',
            'fecha_nacimiento': date(1992, 1, 16), 'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana', 'telefono': '3221110005',
            'correo_electronico': 'william.orozco@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Casa', 'comuna': 'Comuna 9', 'barrio_vereda': 'Barrio Lomas de Granada',
            'direccion': 'Calle 42N # 2-78', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001090000500050005',
            'matricula_inmobiliaria': '120-80005', 'avaluo_catastral': '22000000',
            'numero_matricula_agua': 'AC-2026-020005', 'numero_contrato_energia': 'CE-2026-020005',
            'tiempo_residencia': '6 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76405005',
             'primer_nombre': 'William', 'segundo_nombre': '',
             'primer_apellido': 'Orozco', 'segundo_apellido': 'Flor',
             'fecha_nacimiento': date(1992, 1, 16), 'parentesco': 'PADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Secundaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('1100000'), 'fuente_ingresos': 'Domicilios en moto',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('24.60')},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76405105',
             'primer_nombre': 'Karen', 'segundo_nombre': 'Julieth',
             'primer_apellido': 'Flor', 'segundo_apellido': 'Peña',
             'fecha_nacimiento': date(1994, 5, 9), 'parentesco': 'COMPANERO_PERMANENTE', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Primaria completa', 'situacion_laboral': 'DESEMPLEADO',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('24.60')},
            {'tipo_documento': 'REGISTRO_CIVIL', 'numero_documento': '1062005005',
             'primer_nombre': 'Mariana', 'segundo_nombre': '',
             'primer_apellido': 'Orozco', 'segundo_apellido': 'Flor',
             'fecha_nacimiento': date(2022, 7, 3), 'parentesco': 'HIJA', 'es_cabeza_hogar': False,
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('24.60')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0006',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76406006',
            'primer_nombre': 'María', 'segundo_nombre': 'Elena',
            'primer_apellido': 'Trochez', 'segundo_apellido': 'Dagua',
            'fecha_nacimiento': date(1975, 10, 3), 'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana', 'telefono': '3161110006',
            'correo_electronico': 'maria.trochez@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Toribío',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Casa', 'comuna': 'Comuna 4', 'barrio_vereda': 'Barrio Bolívar',
            'direccion': 'Cra 9 # 6-33', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001040000600060006',
            'matricula_inmobiliaria': '120-80006', 'avaluo_catastral': '29000000',
            'numero_matricula_agua': 'AC-2026-020006', 'numero_contrato_energia': 'CE-2026-020006',
            'tiempo_residencia': '16 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76406006',
             'primer_nombre': 'María', 'segundo_nombre': 'Elena',
             'primer_apellido': 'Trochez', 'segundo_apellido': 'Dagua',
             'fecha_nacimiento': date(1975, 10, 3), 'parentesco': 'MADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Primaria incompleta', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('650000'), 'fuente_ingresos': 'Lavado de ropa',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('14.80'),
             'es_victima_conflicto': True},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76406106',
             'primer_nombre': 'Jairo', 'segundo_nombre': '',
             'primer_apellido': 'Trochez', 'segundo_apellido': 'Dagua',
             'fecha_nacimiento': date(1998, 3, 28), 'parentesco': 'HIJO', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria completa', 'situacion_laboral': 'EMPLEADO',
             'ingresos_mensuales': Decimal('1160000'), 'fuente_ingresos': 'Vigilancia',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('14.80')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0007',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76407007',
            'primer_nombre': 'Jorge', 'segundo_nombre': 'Luis',
            'primer_apellido': 'Piamba', 'segundo_apellido': 'Cerón',
            'fecha_nacimiento': date(1963, 5, 20), 'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana', 'telefono': '3001110007',
            'correo_electronico': 'jorge.piamba@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Puracé',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Casa', 'comuna': 'Comuna 8', 'barrio_vereda': 'Barrio Yanaconas',
            'direccion': 'Calle 55N # 22-08', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001080000700070007',
            'matricula_inmobiliaria': '120-80007', 'avaluo_catastral': '27000000',
            'numero_matricula_agua': 'AC-2026-020007', 'numero_contrato_energia': 'CE-2026-020007',
            'tiempo_residencia': '30 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': True, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76407007',
             'primer_nombre': 'Jorge', 'segundo_nombre': 'Luis',
             'primer_apellido': 'Piamba', 'segundo_apellido': 'Cerón',
             'fecha_nacimiento': date(1963, 5, 20), 'parentesco': 'PADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Primaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('800000'), 'fuente_ingresos': 'Zapatería',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('17.90'),
             'tiene_discapacidad': True, 'grado_discapacidad': 'Movilidad reducida'},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76407107',
             'primer_nombre': 'Nelly', 'segundo_nombre': '',
             'primer_apellido': 'Cerón', 'segundo_apellido': 'Vidal',
             'fecha_nacimiento': date(1967, 9, 14), 'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Sin escolaridad', 'situacion_laboral': 'DESEMPLEADO',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('17.90')},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76407207',
             'primer_nombre': 'Camilo', 'segundo_nombre': 'Andrés',
             'primer_apellido': 'Piamba', 'segundo_apellido': 'Cerón',
             'fecha_nacimiento': date(1995, 1, 8), 'parentesco': 'HIJO', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Universitaria incompleta', 'situacion_laboral': 'EMPLEADO',
             'ingresos_mensuales': Decimal('1300000'), 'fuente_ingresos': 'Call center',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('17.90')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0008',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76408008',
            'primer_nombre': 'Sandra', 'segundo_nombre': 'Patricia',
            'primer_apellido': 'Galíndez', 'segundo_apellido': 'Muñoz',
            'fecha_nacimiento': date(1989, 8, 12), 'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana', 'telefono': '3181110008',
            'correo_electronico': 'sandra.galindez@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Apartamento', 'comuna': 'Comuna 2', 'barrio_vereda': 'Barrio Santa Librada',
            'direccion': 'Calle 3 # 14-20 Apto 102', 'estrato': '2',
            'es_propietario': False, 'numero_predial': '19001020000800080008',
            'matricula_inmobiliaria': '', 'avaluo_catastral': '',
            'numero_matricula_agua': 'AC-2026-020008', 'numero_contrato_energia': 'CE-2026-020008',
            'tiempo_residencia': '4 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76408008',
             'primer_nombre': 'Sandra', 'segundo_nombre': 'Patricia',
             'primer_apellido': 'Galíndez', 'segundo_apellido': 'Muñoz',
             'fecha_nacimiento': date(1989, 8, 12), 'parentesco': 'MADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Secundaria completa', 'situacion_laboral': 'EMPLEADO',
             'ingresos_mensuales': Decimal('1200000'), 'fuente_ingresos': 'Cajera supermercado',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('26.10')},
            {'tipo_documento': 'TARJETA_IDENTIDAD', 'numero_documento': '1062008008',
             'primer_nombre': 'Valentina', 'segundo_nombre': '',
             'primer_apellido': 'Galíndez', 'segundo_apellido': 'Muñoz',
             'fecha_nacimiento': date(2011, 4, 7), 'parentesco': 'HIJA', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria incompleta', 'situacion_laboral': '',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('26.10')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0009',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76409009',
            'primer_nombre': 'Edison', 'segundo_nombre': 'Javier',
            'primer_apellido': 'Papamija', 'segundo_apellido': 'Chito',
            'fecha_nacimiento': date(1983, 12, 30), 'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana', 'telefono': '3001110009',
            'correo_electronico': 'edison.papamija@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Totoró',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'URBANA',
            'tipo_predio': 'Casa', 'comuna': 'Comuna 6', 'barrio_vereda': 'Barrio El Recuerdo',
            'direccion': 'Cra 11 # 68N-30', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001060000900090009',
            'matricula_inmobiliaria': '120-80009', 'avaluo_catastral': '33000000',
            'numero_matricula_agua': 'AC-2026-020009', 'numero_contrato_energia': 'CE-2026-020009',
            'tiempo_residencia': '14 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76409009',
             'primer_nombre': 'Edison', 'segundo_nombre': 'Javier',
             'primer_apellido': 'Papamija', 'segundo_apellido': 'Chito',
             'fecha_nacimiento': date(1983, 12, 30), 'parentesco': 'PADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Técnico', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('1400000'), 'fuente_ingresos': 'Electricista',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.00')},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76409109',
             'primer_nombre': 'Adriana', 'segundo_nombre': '',
             'primer_apellido': 'Chito', 'segundo_apellido': 'Velasco',
             'fecha_nacimiento': date(1985, 6, 18), 'parentesco': 'CONYUGE', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('800000'), 'fuente_ingresos': 'Venta de empanadas',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.00')},
            {'tipo_documento': 'TARJETA_IDENTIDAD', 'numero_documento': '1062009009',
             'primer_nombre': 'Daniel', 'segundo_nombre': 'Felipe',
             'primer_apellido': 'Papamija', 'segundo_apellido': 'Chito',
             'fecha_nacimiento': date(2009, 11, 22), 'parentesco': 'HIJO', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria incompleta', 'situacion_laboral': '',
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.00')},
            {'tipo_documento': 'REGISTRO_CIVIL', 'numero_documento': '1062009010',
             'primer_nombre': 'Sara', 'segundo_nombre': 'Valentina',
             'primer_apellido': 'Papamija', 'segundo_apellido': 'Chito',
             'fecha_nacimiento': date(2023, 2, 14), 'parentesco': 'HIJA', 'es_cabeza_hogar': False,
             'pertenece_sisben': True, 'grupo_sisben': 'B', 'puntaje_sisben': Decimal('27.00')},
        ],
    },
    {
        'radicado': 'RAD-MH-202604-0010',
        'titular': {
            'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76410010',
            'primer_nombre': 'Olga', 'segundo_nombre': 'Lucía',
            'primer_apellido': 'Perafán', 'segundo_apellido': 'Imbachí',
            'fecha_nacimiento': date(1966, 6, 9), 'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana', 'telefono': '3171110010',
            'correo_electronico': 'olga.perafan@correo.com',
            'departamento_nacimiento': 'Cauca', 'municipio_nacimiento': 'Popayán',
        },
        'predio': {
            'departamento': 'Cauca', 'municipio': 'Popayán', 'zona': 'RURAL',
            'tipo_predio': 'Casa', 'barrio_vereda': 'Vereda La Rejoya',
            'direccion': 'Km 4 vía al oriente', 'estrato': '1',
            'es_propietario': True, 'numero_predial': '19001010001000100010',
            'matricula_inmobiliaria': '120-80010', 'avaluo_catastral': '18000000',
            'numero_matricula_agua': '', 'numero_contrato_energia': 'CE-2026-020010',
            'tiempo_residencia': '40 años', 'tiene_dependientes': True,
            'personas_con_discapacidad_hogar': False, 'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76410010',
             'primer_nombre': 'Olga', 'segundo_nombre': 'Lucía',
             'primer_apellido': 'Perafán', 'segundo_apellido': 'Imbachí',
             'fecha_nacimiento': date(1966, 6, 9), 'parentesco': 'MADRE', 'es_cabeza_hogar': True,
             'nivel_educativo': 'Sin escolaridad', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('450000'), 'fuente_ingresos': 'Cultivo de café',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('11.50'),
             'es_victima_conflicto': True, 'es_desplazado': True,
             'municipio_origen': 'Caldono', 'departamento_origen': 'Cauca'},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76410110',
             'primer_nombre': 'Fabio', 'segundo_nombre': '',
             'primer_apellido': 'Perafán', 'segundo_apellido': 'Imbachí',
             'fecha_nacimiento': date(1993, 10, 25), 'parentesco': 'HIJO', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Primaria completa', 'situacion_laboral': 'INDEPENDIENTE',
             'ingresos_mensuales': Decimal('700000'), 'fuente_ingresos': 'Jornalero',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('11.50')},
            {'tipo_documento': 'CEDULA_CIUDADANIA', 'numero_documento': '76410210',
             'primer_nombre': 'Yenny', 'segundo_nombre': 'Alexandra',
             'primer_apellido': 'Perafán', 'segundo_apellido': 'Imbachí',
             'fecha_nacimiento': date(1997, 2, 13), 'parentesco': 'HIJA', 'es_cabeza_hogar': False,
             'nivel_educativo': 'Secundaria completa', 'situacion_laboral': 'DESEMPLEADO',
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('11.50')},
            {'tipo_documento': 'REGISTRO_CIVIL', 'numero_documento': '1062010010',
             'primer_nombre': 'Emanuel', 'segundo_nombre': '',
             'primer_apellido': 'Perafán', 'segundo_apellido': 'Imbachí',
             'fecha_nacimiento': date(2024, 5, 1), 'parentesco': 'NIETO', 'es_cabeza_hogar': False,
             'pertenece_sisben': True, 'grupo_sisben': 'A', 'puntaje_sisben': Decimal('11.50')},
        ],
    },
]

# ═════════════════════════════════════════════════════════════════════════════ #
# 4. Crear registros                                                           #
# ═════════════════════════════════════════════════════════════════════════════ #

creadas = 0
for i, datos in enumerate(POSTULACIONES, start=1):
    radicado = datos['radicado']
    tit = datos['titular']

    if GestionHogarEtapa1.objects.filter(numero_radicado=radicado).exists():
        info(f'[{i:02d}] Ya existe radicado {radicado} — omitido')
        continue

    print(f'\n── [{i:02d}] Familia {tit["primer_apellido"]} {tit["segundo_apellido"]} ──')

    ciudadano, c_nuevo = Ciudadano.objects.get_or_create(
        tipo_documento=tit['tipo_documento'],
        numero_documento=tit['numero_documento'],
        defaults={k: v for k, v in tit.items() if k not in ('tipo_documento', 'numero_documento')},
    )
    ok(f'Ciudadano: {ciudadano} {"(nuevo)" if c_nuevo else "(existente)"}')

    postulacion = Postulacion.objects.create(
        programa=programa, etapa_actual=etapa1, estado='REGISTRADA',
    )
    ok(f'Postulación id={postulacion.id} — estado=REGISTRADA')

    gestion = GestionHogarEtapa1.objects.create(
        postulacion=postulacion, etapa=etapa1, ciudadano=ciudadano,
        numero_radicado=radicado, **datos['predio'],
    )
    ok(f'GestionHogar radicado={radicado}')

    for m in datos['miembros']:
        MiembroHogar.objects.create(postulacion=gestion, **m)
    ok(f'{len(datos["miembros"])} miembro(s) del hogar')
    creadas += 1

print(f'\n{"═" * 60}')
print(f'✅ Programa: {programa.nombre} (id={programa.id})')
print(f'✅ Postulaciones creadas: {creadas} de {len(POSTULACIONES)}')
print(f'   Estado: REGISTRADA | Solo Etapa 1 activa')
print(f'{"═" * 60}')
