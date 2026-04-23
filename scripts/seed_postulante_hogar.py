#!/usr/bin/env python
"""
seed_postulante_hogar.py
========================
Inserta datos de prueba completos para el módulo de Postulantes.

Crea (o reutiliza si ya existen):
  • Programa   – 2026SRHOGAR  (ACTIVO)
  • Etapa      – REGISTRO_HOGAR  (número 1 del programa)
  • Ciudadano  – titular del hogar  (CC 10234567)
  • Postulacion – estado REGISTRADA
  • GestionHogarEtapa1 – datos del predio y ubicación
  • 3 MiembroHogar – madre, hijo, hija

Ejecución (desde la carpeta backend/):
    python seed_postulante_hogar.py
"""

import os
import sys
import django
from datetime import date, timedelta
from seed_setup import setup_django_path

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
setup_django_path()
django.setup()

from django.utils import timezone
from django.core.files.base import ContentFile
from infrastructure.database.models import (
    Programa,
    Etapa,
    Ciudadano,
    Postulacion,
    GestionHogarEtapa1,
    MiembroHogar,
    DocumentoGestionHogar,
)

# ── Helpers ───────────────────────────────────────────────────────────────── #

def ok(msg):  print(f'✅ {msg}')
def info(msg): print(f'ℹ️  {msg}')
def err(msg):  print(f'❌ {msg}', file=sys.stderr)


# ─────────────────────────────────────────────────────────────────────────── #
# 1. Programa                                                                 #
# ─────────────────────────────────────────────────────────────────────────── #

programa, creado = Programa.objects.get_or_create(
    codigo_programa='2026SRHOGAR',
    defaults={
        'nombre': 'Subsidio de Mejoramiento de Vivienda',
        'descripcion': (
            'Programa municipal de subsidios para mejoramiento de vivienda '
            'en zonas urbanas y rurales del municipio.'
        ),
        'entidad_responsable': 'Secretaría de Vivienda Municipal',
        'estado': 'ACTIVO',
    },
)
ok(f'Programa creado → id={programa.id}') if creado else info(f'Programa ya existe → id={programa.id}')


# ─────────────────────────────────────────────────────────────────────────── #
# 2. Etapa                                                                    #
# ─────────────────────────────────────────────────────────────────────────── #

etapa, creado = Etapa.objects.get_or_create(
    programa=programa,
    numero_etapa=1,
    defaults={
        'modulo_principal': 'REGISTRO_HOGAR',
        'activo_logico': True,
    },
)
ok(f'Etapa creada → id={etapa.id}') if creado else info(f'Etapa ya existe → id={etapa.id}')


# ─────────────────────────────────────────────────────────────────────────── #
# 3. Ciudadanos titulares (5 hogares de prueba)                               #
# ─────────────────────────────────────────────────────────────────────────── #

TITULARES = [
    {
        'tipo_documento': 'CEDULA_CIUDADANIA',
        'numero_documento': '10234567',
        'primer_nombre': 'Carlos',
        'segundo_nombre': 'Andrés',
        'primer_apellido': 'Ramírez',
        'segundo_apellido': 'Torres',
        'fecha_nacimiento': date(1985, 6, 15),
        'sexo': 'MASCULINO',
        'nacionalidad': 'Colombiana',
        'telefono': '3001234567',
        'correo_electronico': 'carlos.ramirez@email.com',
    },
    {
        'tipo_documento': 'CEDULA_CIUDADANIA',
        'numero_documento': '20456789',
        'primer_nombre': 'María',
        'segundo_nombre': 'Fernanda',
        'primer_apellido': 'López',
        'segundo_apellido': 'Silva',
        'fecha_nacimiento': date(1990, 3, 22),
        'sexo': 'FEMENINO',
        'nacionalidad': 'Colombiana',
        'telefono': '3109876543',
        'correo_electronico': 'maria.lopez@email.com',
    },
    {
        'tipo_documento': 'CEDULA_CIUDADANIA',
        'numero_documento': '30678901',
        'primer_nombre': 'Juan',
        'segundo_nombre': '',
        'primer_apellido': 'Martínez',
        'segundo_apellido': 'Herrera',
        'fecha_nacimiento': date(1978, 11, 8),
        'sexo': 'MASCULINO',
        'nacionalidad': 'Colombiana',
        'telefono': '3157654321',
        'correo_electronico': 'juan.martinez@email.com',
    },
    {
        'tipo_documento': 'CEDULA_CIUDADANIA',
        'numero_documento': '90901234',
        'primer_nombre': 'Luz',
        'segundo_nombre': 'Dary',
        'primer_apellido': 'Mosquera',
        'segundo_apellido': 'Riascos',
        'fecha_nacimiento': date(1987, 7, 9),
        'sexo': 'FEMENINO',
        'nacionalidad': 'Colombiana',
        'telefono': '3008887766',
        'correo_electronico': 'luz.mosquera@email.com',
    },
    {
        'tipo_documento': 'CEDULA_CIUDADANIA',
        'numero_documento': '40890123',
        'primer_nombre': 'Ana',
        'segundo_nombre': 'Lucía',
        'primer_apellido': 'Gómez',
        'segundo_apellido': 'Peña',
        'fecha_nacimiento': date(1995, 7, 30),
        'sexo': 'FEMENINO',
        'nacionalidad': 'Colombiana',
        'telefono': '3201234567',
        'correo_electronico': 'ana.gomez@email.com',
    },
    {
        'tipo_documento': 'CEDULA_EXTRANJERIA',
        'numero_documento': '50123456',
        'primer_nombre': 'Luis',
        'segundo_nombre': 'Eduardo',
        'primer_apellido': 'Vargas',
        'segundo_apellido': 'Castillo',
        'fecha_nacimiento': date(1982, 4, 18),
        'sexo': 'MASCULINO',
        'nacionalidad': 'Venezolana',
        'telefono': '3054321098',
        'correo_electronico': 'luis.vargas@email.com',
    },
]

# ─────────────────────────────────────────────────────────────────────────── #
# 4. Hogares completos (predio + postulación + miembros)                      #
# ─────────────────────────────────────────────────────────────────────────── #

HOGARES = [
    {
        'radicado': 'RAD-202603-000001',
        'estado': 'REGISTRADA',
        'predio': {
            'departamento': 'Cundinamarca',
            'municipio': 'Bogotá D.C.',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Kennedy',
            'barrio_vereda': 'Patio Bonito',
            'direccion': 'Calle 40 Sur # 80-25',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '11001000000640060000000',
            'tiempo_residencia': '5 años',
            'tiene_dependientes': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '52345678',
                'primer_nombre': 'Gloria',
                'segundo_nombre': 'Elena',
                'primer_apellido': 'Torres',
                'segundo_apellido': 'Mesa',
                'fecha_nacimiento': date(1988, 2, 14),
                'parentesco': 'CONYUGE',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': '1200000',
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1023456780',
                'primer_nombre': 'Santiago',
                'segundo_nombre': '',
                'primer_apellido': 'Ramírez',
                'segundo_apellido': 'Torres',
                'fecha_nacimiento': date(2010, 8, 20),
                'parentesco': 'HIJO',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria',
                'situacion_laboral': '',
                'ingresos_mensuales': None,
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1034567890',
                'primer_nombre': 'Valentina',
                'segundo_nombre': '',
                'primer_apellido': 'Ramírez',
                'segundo_apellido': 'Torres',
                'fecha_nacimiento': date(2012, 5, 3),
                'parentesco': 'HIJA',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria',
                'situacion_laboral': '',
                'ingresos_mensuales': None,
            },
        ],
    },
    {
        'radicado': 'RAD-202603-000002',
        'estado': 'EN_REVISION',
        'predio': {
            'departamento': 'Antioquia',
            'municipio': 'Medellín',
            'zona': 'URBANA',
            'tipo_predio': 'Apartamento',
            'comuna': 'Laureles',
            'barrio_vereda': 'Estadio',
            'direccion': 'Carrera 70 # 44-30 Apto 301',
            'estrato': '3',
            'es_propietario': False,
            'numero_predial': '',
            'tiempo_residencia': '3 años',
            'tiene_dependientes': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '43456789',
                'primer_nombre': 'Diego',
                'segundo_nombre': 'Alejandro',
                'primer_apellido': 'López',
                'segundo_apellido': '',
                'fecha_nacimiento': date(1986, 9, 11),
                'parentesco': 'CONYUGE',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Universidad completa',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': '3500000',
            },
            {
                'tipo_documento': 'REGISTRO_CIVIL',
                'numero_documento': '5500000001',
                'primer_nombre': 'Isabela',
                'segundo_nombre': '',
                'primer_apellido': 'López',
                'segundo_apellido': 'Silva',
                'fecha_nacimiento': date(2018, 12, 25),
                'parentesco': 'HIJA',
                'es_cabeza_hogar': False,
                'nivel_educativo': '',
                'situacion_laboral': '',
                'ingresos_mensuales': None,
            },
        ],
    },
    {
        'radicado': 'RAD-202603-000003',
        'estado': 'VISITA_PENDIENTE',
        'predio': {
            'departamento': 'Valle del Cauca',
            'municipio': 'Cali',
            'zona': 'RURAL',
            'tipo_predio': 'Finca',
            'comuna': '',
            'barrio_vereda': 'Vereda El Pital',
            'direccion': 'Kilómetro 12 vía Cali-Buenaventura',
            'estrato': '1',
            'es_propietario': True,
            'numero_predial': '76001000000100010000000',
            'tiempo_residencia': '15 años',
            'tiene_dependientes': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '65432198',
                'primer_nombre': 'Rosa',
                'segundo_nombre': 'Elena',
                'primer_apellido': 'Martínez',
                'segundo_apellido': 'Castaño',
                'fecha_nacimiento': date(1980, 6, 25),
                'parentesco': 'MADRE',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': '800000',
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '76543210',
                'primer_nombre': 'Pedro',
                'segundo_nombre': 'José',
                'primer_apellido': 'Martínez',
                'segundo_apellido': 'Herrera',
                'fecha_nacimiento': date(2002, 3, 10),
                'parentesco': 'HIJO',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria completa',
                'situacion_laboral': 'DESEMPLEADO',
                'ingresos_mensuales': None,
            },
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '87654321',
                'primer_nombre': 'Luciana',
                'segundo_nombre': '',
                'primer_apellido': 'Martínez',
                'segundo_apellido': 'Herrera',
                'fecha_nacimiento': date(2005, 7, 18),
                'parentesco': 'HIJA',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria incompleta',
                'situacion_laboral': '',
                'ingresos_mensuales': None,
            },
        ],
    },
    {
        'radicado': 'RAD-202603-000004',
        'estado': 'APROBADA',
        'predio': {
            'departamento': 'Santander',
            'municipio': 'Bucaramanga',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Norte',
            'barrio_vereda': 'Cabecera del Llano',
            'direccion': 'Calle 52 # 34-18',
            'estrato': '3',
            'es_propietario': True,
            'numero_predial': '68001000000200020000000',
            'tiempo_residencia': '10 años',
            'tiene_dependientes': False,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '37891234',
                'primer_nombre': 'Patricia',
                'segundo_nombre': 'Isabel',
                'primer_apellido': 'Gómez',
                'segundo_apellido': 'Ruiz',
                'fecha_nacimiento': date(1993, 1, 5),
                'parentesco': 'CONYUGE',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Universidad completa',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': '2800000',
            },
        ],
    },
    {
        'radicado': 'RAD-202603-000005',
        'estado': 'RECHAZADA',
        'predio': {
            'departamento': 'Nariño',
            'municipio': 'Pasto',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Centro',
            'barrio_vereda': 'San Felipe',
            'direccion': 'Carrera 25 # 18-40',
            'estrato': '2',
            'es_propietario': False,
            'numero_predial': '',
            'tiempo_residencia': '2 años',
            'tiene_dependientes': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '98712345',
                'primer_nombre': 'Andrés',
                'segundo_nombre': 'Felipe',
                'primer_apellido': 'Vargas',
                'segundo_apellido': 'Mora',
                'fecha_nacimiento': date(1984, 10, 22),
                'parentesco': 'COMPANERO_PERMANENTE',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'INDEPENDIENTE',
                'ingresos_mensuales': '1500000',
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1045678901',
                'primer_nombre': 'Camila',
                'segundo_nombre': '',
                'primer_apellido': 'Vargas',
                'segundo_apellido': 'Castillo',
                'fecha_nacimiento': date(2009, 4, 15),
                'parentesco': 'HIJA',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Primaria',
                'situacion_laboral': '',
                'ingresos_mensuales': None,
            },
        ],
    },
    {
        'radicado': 'RAD-202603-000006',
        'estado': 'EN_REVISION',
        'predio': {
            'departamento': 'Cauca',
            'municipio': 'Popayan',
            'zona': 'URBANA',
            'tipo_predio': 'Casa',
            'comuna': 'Centro',
            'barrio_vereda': 'El Empedrado',
            'direccion': 'Cra 7 # 3-21',
            'estrato': '2',
            'es_propietario': True,
            'numero_predial': '19001000000100010000000',
            'tiempo_residencia': '6 años',
            'tiene_dependientes': True,
            'acepta_terminos_condiciones': True,
        },
        'miembros': [
            {
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'numero_documento': '90901234',
                'primer_nombre': 'Luz',
                'segundo_nombre': 'Dary',
                'primer_apellido': 'Mosquera',
                'segundo_apellido': 'Riascos',
                'fecha_nacimiento': date(1987, 7, 9),
                'parentesco': 'MADRE',
                'es_cabeza_hogar': True,
                'nivel_educativo': 'Técnico',
                'situacion_laboral': 'EMPLEADO',
                'ingresos_mensuales': '1800000',
            },
            {
                'tipo_documento': 'TARJETA_IDENTIDAD',
                'numero_documento': '1122334455',
                'primer_nombre': 'Mateo',
                'segundo_nombre': '',
                'primer_apellido': 'Mosquera',
                'segundo_apellido': 'Riascos',
                'fecha_nacimiento': date(2011, 4, 18),
                'parentesco': 'HIJO',
                'es_cabeza_hogar': False,
                'nivel_educativo': 'Secundaria',
                'situacion_laboral': '',
                'ingresos_mensuales': None,
            },
        ],
        'documentos': [
            {
                'tipo_documento': 'RECIBO_SERVICIOS_PUBLICOS',
                'nombre_archivo': 'recibo_servicios.pdf',
                'contenido': b'Documento de prueba - recibo de servicios',
                'observaciones': 'Adjunto de servicios públicos reciente.'
            },
            {
                'tipo_documento': 'CERTIFICADO_RESIDENCIA',
                'nombre_archivo': 'certificado_residencia.pdf',
                'contenido': b'Documento de prueba - certificado de residencia',
                'observaciones': 'Expedido por la JAC.'
            },
        ],
    },
]

# ─────────────────────────────────────────────────────────────────────────── #
# 5. Inserción                                                                #
# ─────────────────────────────────────────────────────────────────────────── #

created_count = 0
skipped_count = 0

for idx, (titular_data, hogar) in enumerate(zip(TITULARES, HOGARES)):
    radicado = hogar['radicado']

    # Verificar si ya existe el radicado
    if GestionHogarEtapa1.objects.filter(numero_radicado=radicado).exists():
        info(f'Hogar {radicado} ya existe → omitido')
        skipped_count += 1
        continue

    # 5a. Ciudadano titular
    ciudadano, _ = Ciudadano.objects.get_or_create(
        tipo_documento=titular_data['tipo_documento'],
        numero_documento=titular_data['numero_documento'],
        defaults={
            'primer_nombre':   titular_data['primer_nombre'],
            'segundo_nombre':  titular_data.get('segundo_nombre', ''),
            'primer_apellido': titular_data['primer_apellido'],
            'segundo_apellido': titular_data.get('segundo_apellido', ''),
            'fecha_nacimiento': titular_data['fecha_nacimiento'],
            'sexo':            titular_data['sexo'],
            'nacionalidad':    titular_data['nacionalidad'],
            'telefono':        titular_data.get('telefono', ''),
            'correo_electronico': titular_data.get('correo_electronico', ''),
        },
    )

    # 5b. Postulación
    estado_val = hogar.get('estado', 'EN_REVISION') or 'EN_REVISION'
    postulacion = Postulacion.objects.create(
        programa=programa,
        etapa_actual=etapa,
        estado=estado_val,
    )

    # 5c. GestionHogarEtapa1
    p = hogar['predio']
    gestion = GestionHogarEtapa1.objects.create(
        numero_radicado=radicado,
        postulacion=postulacion,
        etapa=etapa,
        ciudadano=ciudadano,
        departamento=p['departamento'],
        municipio=p['municipio'],
        zona=p['zona'],
        tipo_predio=p.get('tipo_predio', ''),
        comuna=p.get('comuna', ''),
        barrio_vereda=p.get('barrio_vereda', ''),
        direccion=p['direccion'],
        estrato=p.get('estrato', ''),
        es_propietario=p.get('es_propietario'),
        numero_predial=p.get('numero_predial', ''),
        tiempo_residencia=p.get('tiempo_residencia', ''),
        tiene_dependientes=p.get('tiene_dependientes'),
        acepta_terminos_condiciones=p.get('acepta_terminos_condiciones', False),
    )

    # 5d. Miembros del hogar
    for m in hogar['miembros']:
        MiembroHogar.objects.create(
            postulacion=gestion,
            tipo_documento=m['tipo_documento'],
            numero_documento=m['numero_documento'],
            primer_nombre=m['primer_nombre'],
            segundo_nombre=m.get('segundo_nombre', ''),
            primer_apellido=m['primer_apellido'],
            segundo_apellido=m.get('segundo_apellido', ''),
            fecha_nacimiento=m['fecha_nacimiento'],
            parentesco=m['parentesco'],
            es_cabeza_hogar=m.get('es_cabeza_hogar', False),
            nivel_educativo=m.get('nivel_educativo', ''),
            situacion_laboral=m.get('situacion_laboral', ''),
            ingresos_mensuales=m.get('ingresos_mensuales'),
        )

    # 5e. Documentos (opcional)
    for doc in hogar.get('documentos', []):
        documento = DocumentoGestionHogar(
            postulacion=gestion,
            tipo_documento=doc['tipo_documento'],
            observaciones=doc.get('observaciones', ''),
        )
        documento.archivo.save(doc['nombre_archivo'], ContentFile(doc.get('contenido', b'')), save=False)
        documento.save()

    ok(
        f'Hogar {radicado} creado → '
        f'{titular_data["primer_nombre"]} {titular_data["primer_apellido"]} | '
        f'estado={estado_val} | '
        f'{len(hogar["miembros"])} miembro(s) | '
        f'{len(hogar.get("documentos", []))} documento(s)'
    )
    created_count += 1

print()
print(f'─' * 50)
print(f'Resumen: {created_count} hogar(es) creado(s), {skipped_count} omitido(s).')
print(f'Endpoint para verificar: GET /api/postulaciones/registro-hogar/')
