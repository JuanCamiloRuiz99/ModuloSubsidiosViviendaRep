"""
Seed script: Crea un segundo programa de prueba con postulaciones APROBADAS
para probar el filtro por programa en el panel de gestión de visitas.
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.database.models import (
    Programa, Etapa, Ciudadano, Postulacion,
    GestionHogarEtapa1, MiembroHogar,
)

# ── Programa de prueba ──────────────────────────────────────────────────── #

programa, creado = Programa.objects.get_or_create(
    codigo_programa='2026VIVDIG',
    defaults={
        'nombre': 'Vivienda Digna para Todos',
        'descripcion': 'Programa de subsidio de vivienda nueva para familias en condición de vulnerabilidad socioeconómica.',
        'entidad_responsable': 'Secretaría de Hábitat Municipal',
        'estado': 'ACTIVO',
    },
)
if creado:
    print(f'✅ Programa creado: {programa.nombre} (id={programa.id})')
else:
    print(f'ℹ️  Programa ya existe: {programa.nombre} (id={programa.id})')

# ── Etapa 1 ──────────────────────────────────────────────────────────────── #

etapa, _ = Etapa.objects.get_or_create(
    programa=programa,
    numero_etapa=1,
    defaults={
        'modulo_principal': 'REGISTRO_HOGAR',
        'activo_logico': True,
    },
)

# ── Datos de postulaciones ──────────────────────────────────────────────── #

POSTULACIONES = [
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '80501234',
            'primer_nombre': 'Carlos',
            'segundo_nombre': 'Andrés',
            'primer_apellido': 'Rojas',
            'segundo_apellido': 'Patiño',
            'fecha_nacimiento': '1985-03-12',
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3104567890',
            'correo_electronico': 'carlos.rojas@correo.com',
        },
        'gestion': {
            'departamento': 'Cundinamarca',
            'municipio': 'Soacha',
            'zona': 'URBANA',
            'tipo_predio': 'LOTE',
            'direccion': 'Calle 15 # 8-23, Barrio San Mateo',
            'estrato': '1',
        },
        'radicado': 'RAD-VD-202603-0001',
    },
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '80605678',
            'primer_nombre': 'María',
            'segundo_nombre': 'Fernanda',
            'primer_apellido': 'López',
            'segundo_apellido': 'Gómez',
            'fecha_nacimiento': '1990-07-22',
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3157891234',
            'correo_electronico': 'maria.lopez@correo.com',
        },
        'gestion': {
            'departamento': 'Cundinamarca',
            'municipio': 'Soacha',
            'zona': 'URBANA',
            'tipo_predio': 'CASA',
            'direccion': 'Carrera 7 # 20-45, León XIII',
            'estrato': '2',
        },
        'radicado': 'RAD-VD-202603-0002',
    },
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10709012',
            'primer_nombre': 'Jorge',
            'segundo_nombre': 'Enrique',
            'primer_apellido': 'Martínez',
            'segundo_apellido': 'Silva',
            'fecha_nacimiento': '1978-11-05',
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3201234567',
            'correo_electronico': 'jorge.martinez@correo.com',
        },
        'gestion': {
            'departamento': 'Cundinamarca',
            'municipio': 'Zipaquirá',
            'zona': 'URBANA',
            'tipo_predio': 'APARTAMENTO',
            'direccion': 'Calle 4 # 12-30, Centro',
            'estrato': '2',
        },
        'radicado': 'RAD-VD-202603-0003',
    },
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '52813456',
            'primer_nombre': 'Ana',
            'segundo_nombre': 'Lucía',
            'primer_apellido': 'Herrera',
            'segundo_apellido': 'Vargas',
            'fecha_nacimiento': '1992-01-30',
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3176543210',
            'correo_electronico': 'ana.herrera@correo.com',
        },
        'gestion': {
            'departamento': 'Cundinamarca',
            'municipio': 'Facatativá',
            'zona': 'URBANA',
            'tipo_predio': 'CASA',
            'direccion': 'Carrera 3 # 5-18, Barrio El Carmen',
            'estrato': '1',
        },
        'radicado': 'RAD-VD-202603-0004',
    },
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '80917890',
            'primer_nombre': 'Luis',
            'segundo_nombre': 'Alberto',
            'primer_apellido': 'Castro',
            'segundo_apellido': 'Mendoza',
            'fecha_nacimiento': '1983-09-18',
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3119876543',
            'correo_electronico': 'luis.castro@correo.com',
        },
        'gestion': {
            'departamento': 'Cundinamarca',
            'municipio': 'Chía',
            'zona': 'URBANA',
            'tipo_predio': 'CASA',
            'direccion': 'Calle 10 # 3-55, Barrio Santa Lucía',
            'estrato': '3',
        },
        'radicado': 'RAD-VD-202603-0005',
    },
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '39021234',
            'primer_nombre': 'Sandra',
            'segundo_nombre': 'Patricia',
            'primer_apellido': 'Moreno',
            'segundo_apellido': 'Ruiz',
            'fecha_nacimiento': '1988-05-14',
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3145678901',
            'correo_electronico': 'sandra.moreno@correo.com',
        },
        'gestion': {
            'departamento': 'Boyacá',
            'municipio': 'Tunja',
            'zona': 'URBANA',
            'tipo_predio': 'LOTE',
            'direccion': 'Carrera 11 # 18-42, Barrio Libertador',
            'estrato': '2',
        },
        'radicado': 'RAD-VD-202603-0006',
    },
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '10125678',
            'primer_nombre': 'Pedro',
            'segundo_nombre': '',
            'primer_apellido': 'Suárez',
            'segundo_apellido': 'Ortiz',
            'fecha_nacimiento': '1975-12-03',
            'sexo': 'MASCULINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3208765432',
            'correo_electronico': 'pedro.suarez@correo.com',
        },
        'gestion': {
            'departamento': 'Boyacá',
            'municipio': 'Duitama',
            'zona': 'URBANA',
            'tipo_predio': 'CASA',
            'direccion': 'Calle 16 # 22-10, Centro',
            'estrato': '2',
        },
        'radicado': 'RAD-VD-202603-0007',
    },
    {
        'ciudadano': {
            'tipo_documento': 'CEDULA_CIUDADANIA',
            'numero_documento': '52229012',
            'primer_nombre': 'Diana',
            'segundo_nombre': 'Marcela',
            'primer_apellido': 'Torres',
            'segundo_apellido': 'Peña',
            'fecha_nacimiento': '1995-08-27',
            'sexo': 'FEMENINO',
            'nacionalidad': 'Colombiana',
            'telefono': '3163456789',
            'correo_electronico': 'diana.torres@correo.com',
        },
        'gestion': {
            'departamento': 'Cundinamarca',
            'municipio': 'Mosquera',
            'zona': 'URBANA',
            'tipo_predio': 'APARTAMENTO',
            'direccion': 'Carrera 2 # 8-15, Conjunto El Portal',
            'estrato': '2',
        },
        'radicado': 'RAD-VD-202603-0008',
    },
]

# ── Crear registros ─────────────────────────────────────────────────────── #

creadas = 0
existentes = 0

for item in POSTULACIONES:
    # Verificar si ya existe el radicado
    if GestionHogarEtapa1.objects.filter(numero_radicado=item['radicado']).exists():
        existentes += 1
        print(f"  ⏭️  Radicado {item['radicado']} ya existe, se omite.")
        continue

    # Ciudadano
    c_data = item['ciudadano']
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
            'telefono': c_data.get('telefono'),
            'correo_electronico': c_data.get('correo_electronico'),
        },
    )

    # Postulación con estado APROBADA
    postulacion = Postulacion.objects.create(
        programa=programa,
        etapa_actual=etapa,
        estado='APROBADA',
    )

    # Gestión Hogar Etapa 1
    g = item['gestion']
    gestion = GestionHogarEtapa1.objects.create(
        numero_radicado=item['radicado'],
        postulacion=postulacion,
        etapa=etapa,
        ciudadano=ciudadano,
        departamento=g['departamento'],
        municipio=g['municipio'],
        zona=g['zona'],
        tipo_predio=g.get('tipo_predio', ''),
        direccion=g['direccion'],
        estrato=g.get('estrato', ''),
        acepta_terminos_condiciones=True,
    )

    # Miembro titular del hogar
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
    print(f"  ✅ {item['radicado']} — {c_data['primer_nombre']} {c_data['primer_apellido']} ({g['municipio']})")

print(f'\n📊 Resultado: {creadas} postulaciones creadas, {existentes} ya existían.')
print(f'   Programa: {programa.nombre} (id={programa.id}, código={programa.codigo_programa})')
