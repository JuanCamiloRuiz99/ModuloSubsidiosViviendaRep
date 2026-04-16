#!/usr/bin/env python
"""
seed_todos_estados.py
=====================
Crea 13 postulaciones (una por cada estado posible) en el programa
"Subsidio Vivienda Nueva 2026".

Cada postulación incluye: Ciudadano + Postulacion + GestionHogarEtapa1 + 1 MiembroHogar.

Ejecución (desde la carpeta backend/):
    python ../scripts/seed_todos_estados.py
"""

import os
import sys
import django
from datetime import date
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
backend_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'backend')
sys.path.insert(0, backend_dir)
django.setup()

from infrastructure.database.models import (
    Programa, Etapa, Ciudadano, Postulacion, GestionHogarEtapa1, MiembroHogar,
)

# ── Estados ───────────────────────────────────────────────────────────────── #

ESTADOS = [
    'REGISTRADA',
    'EN_REVISION',
    'SUBSANACION',
    'VISITA_PENDIENTE',
    'VISITA_ASIGNADA',
    'VISITA_PROGRAMADA',
    'VISITA_REALIZADA',
    'DOCUMENTOS_INCOMPLETOS',
    'DOCUMENTOS_CARGADOS',
    'BENEFICIADO',
    'NO_BENEFICIARIO',
    'APROBADA',
    'RECHAZADA',
]

# ── Datos ficticios para cada postulación ─────────────────────────────────── #

FAMILIAS = [
    {'nombre': 'Carlos',    'apellido': 'Méndez',     'doc': '76301001', 'barrio': 'La Esmeralda',     'dir': 'Cra 5 # 10-20',   'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'María',     'apellido': 'Gutiérrez',  'doc': '76301002', 'barrio': 'El Recuerdo',      'dir': 'Cll 15 # 3-45',   'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'José',      'apellido': 'Valencia',    'doc': '76301003', 'barrio': 'Los Hoyos',        'dir': 'Cra 12 # 8-10',   'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Andrea',    'apellido': 'Caicedo',     'doc': '76301004', 'barrio': 'Bello Horizonte',  'dir': 'Cll 22 # 6-33',   'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Pedro',     'apellido': 'Muñoz',       'doc': '76301005', 'barrio': 'Pandiguando',      'dir': 'Mz 3 Cs 14',      'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Luz',       'apellido': 'Orozco',      'doc': '76301006', 'barrio': 'Alfonso López',    'dir': 'Cra 9 # 5-12',    'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Diego',     'apellido': 'Hurtado',     'doc': '76301007', 'barrio': 'El Uvo',           'dir': 'Vereda El Uvo Km2','zona': 'RURAL',  'estrato': '1'},
    {'nombre': 'Sandra',    'apellido': 'Mosquera',    'doc': '76301008', 'barrio': 'La María',         'dir': 'Cll 40 # 2-18',   'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Hernán',    'apellido': 'Chará',       'doc': '76301009', 'barrio': 'Tomás Cipriano',   'dir': 'Cra 15 # 20-05',  'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Paola',     'apellido': 'Velasco',     'doc': '76301010', 'barrio': 'Lomas de Granada', 'dir': 'Mz 7 Cs 3',       'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Fabián',    'apellido': 'Erazo',       'doc': '76301011', 'barrio': 'Pubenza',          'dir': 'Cll 5 # 14-22',   'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Claudia',   'apellido': 'Zambrano',    'doc': '76301012', 'barrio': 'Bolívar',          'dir': 'Cra 7 # 3-10',    'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Óscar',     'apellido': 'Dorado',      'doc': '76301013', 'barrio': 'Caldas',           'dir': 'Cll 18 # 9-30',   'zona': 'URBANA', 'estrato': '1'},
    # ── 10 adicionales (ronda 2) ────────────────────────────────────────────── #
    {'nombre': 'Yesenia',   'apellido': 'Collazos',    'doc': '76301014', 'barrio': 'Santa Rosa',       'dir': 'Cra 3 # 12-40',   'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Rodrigo',   'apellido': 'Flórez',      'doc': '76301015', 'barrio': 'La Sombrilla',     'dir': 'Cll 8 # 5-60',    'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Natalia',   'apellido': 'Escobar',     'doc': '76301016', 'barrio': 'El Empedrado',     'dir': 'Mz 11 Cs 7',      'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Camilo',    'apellido': 'Lasso',       'doc': '76301017', 'barrio': 'San Ignacio',      'dir': 'Cra 10 # 4-25',   'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Lorena',    'apellido': 'Peña',        'doc': '76301018', 'barrio': 'Las Américas',     'dir': 'Cll 30 # 7-18',   'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Guillermo', 'apellido': 'Cifuentes',   'doc': '76301019', 'barrio': 'Yanaconas',        'dir': 'Vereda Yana Km1',  'zona': 'RURAL',  'estrato': '1'},
    {'nombre': 'Victoria',  'apellido': 'Ordóñez',     'doc': '76301020', 'barrio': 'La Ladera',        'dir': 'Cra 2 # 15-09',   'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Jairo',     'apellido': 'Bermúdez',    'doc': '76301021', 'barrio': 'Los Campos',       'dir': 'Cll 50 # 3-22',   'zona': 'URBANA', 'estrato': '1'},
    {'nombre': 'Adriana',   'apellido': 'Solarte',     'doc': '76301022', 'barrio': 'El Placer',        'dir': 'Mz 5 Cs 9',       'zona': 'URBANA', 'estrato': '2'},
    {'nombre': 'Fernando',  'apellido': 'Rengifo',     'doc': '76301023', 'barrio': 'San Fernando',     'dir': 'Cra 8 # 11-35',   'zona': 'URBANA', 'estrato': '1'},
]

# Estados para la segunda ronda (10 estados variados)
ESTADOS_RONDA2 = [
    'EN_REVISION',
    'SUBSANACION',
    'VISITA_PENDIENTE',
    'VISITA_ASIGNADA',
    'VISITA_PROGRAMADA',
    'VISITA_REALIZADA',
    'DOCUMENTOS_INCOMPLETOS',
    'BENEFICIADO',
    'APROBADA',
    'RECHAZADA',
]

# ═════════════════════════════════════════════════════════════════════════════ #

def main():
    print('\n🌱 Seed: una postulación por estado\n')

    # Programa
    programa = Programa.objects.filter(codigo_programa='2026BS2F8D').first()
    if not programa:
        print('❌ No se encontró el programa 2026BS2F8D (Reconstrucción de vivienda 2026).')
        return

    etapa1 = Etapa.objects.filter(programa=programa, numero_etapa=1).first()
    if not etapa1:
        print('❌ No se encontró la etapa 1 del programa.')
        return

    print(f'  Programa: {programa.nombre} (id={programa.id})')
    print(f'  Etapa 1:  {etapa1.modulo_principal} (id={etapa1.id})\n')

    creadas = 0

    for i, estado in enumerate(ESTADOS):
        f = FAMILIAS[i]
        radicado = f'RAD-EST-{estado[:8]}-{i+1:04d}'

        # Verificar si ya existe
        if GestionHogarEtapa1.objects.filter(numero_radicado=radicado).exists():
            print(f'  ℹ️  {estado:<25s} — ya existe ({radicado})')
            continue

        # Ciudadano
        ciudadano, _ = Ciudadano.objects.get_or_create(
            numero_documento=f['doc'],
            defaults={
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'primer_nombre': f['nombre'],
                'segundo_nombre': '',
                'primer_apellido': f['apellido'],
                'segundo_apellido': '',
                'fecha_nacimiento': date(1980 + i, 1 + (i % 12), 1 + (i % 28)),
                'sexo': 'MASCULINO' if i % 2 == 0 else 'FEMENINO',
                'nacionalidad': 'Colombiana',
                'telefono': f'320100{i+1:04d}',
                'correo_electronico': f'{f["nombre"].lower()}.{f["apellido"].lower()}@correo.com',
                'departamento_nacimiento': 'Cauca',
                'municipio_nacimiento': 'Popayán',
            },
        )

        # Postulación
        postulacion = Postulacion.objects.create(
            programa=programa,
            etapa_actual=etapa1,
            estado=estado,
            activo_logico=True,
        )

        # Gestión hogar
        gestion = GestionHogarEtapa1.objects.create(
            postulacion=postulacion,
            etapa=etapa1,
            ciudadano=ciudadano,
            numero_radicado=radicado,
            departamento='Cauca',
            municipio='Popayán',
            zona=f['zona'],
            tipo_predio='Casa',
            barrio_vereda=f['barrio'],
            direccion=f['dir'],
            estrato=f['estrato'],
            es_propietario=True,
            numero_predial=f'190010000{i+1:05d}0001',
            matricula_inmobiliaria=f'120-EST{i+1:04d}',
            avaluo_catastral=str(30_000_000 + i * 2_000_000),
            tiempo_residencia=f'{5 + i} años',
            tiene_dependientes=i % 2 == 0,
            personas_con_discapacidad_hogar=False,
            acepta_terminos_condiciones=True,
        )

        # Miembro cabeza de hogar
        MiembroHogar.objects.create(
            postulacion=gestion,
            tipo_documento='CEDULA_CIUDADANIA',
            numero_documento=f['doc'],
            primer_nombre=f['nombre'],
            segundo_nombre='',
            primer_apellido=f['apellido'],
            segundo_apellido='',
            fecha_nacimiento=date(1980 + i, 1 + (i % 12), 1 + (i % 28)),
            parentesco='PADRE' if i % 2 == 0 else 'MADRE',
            es_cabeza_hogar=True,
            nivel_educativo='Secundaria completa',
            situacion_laboral='INDEPENDIENTE',
            ingresos_mensuales=Decimal('1200000'),
            fuente_ingresos='Trabajo independiente',
            pertenece_sisben=True,
            grupo_sisben='B',
            puntaje_sisben=Decimal('28.00'),
        )

        creadas += 1
        print(f'  ✅ {estado:<25s} — {f["nombre"]} {f["apellido"]} ({radicado})')

    print(f'\n🎉 Creadas: {creadas} postulaciones ({len(ESTADOS)} estados)\n')

    # ── Ronda 2: 10 postulaciones adicionales con estados variados ────────── #
    print('🌱 Ronda 2: 10 postulaciones adicionales\n')
    creadas2 = 0

    for j, estado in enumerate(ESTADOS_RONDA2):
        i = 13 + j  # índice global
        f = FAMILIAS[i]
        radicado = f'RAD-EST2-{estado[:8]}-{j+1:04d}'

        if GestionHogarEtapa1.objects.filter(numero_radicado=radicado).exists():
            print(f'  ℹ️  {estado:<25s} — ya existe ({radicado})')
            continue

        ciudadano, _ = Ciudadano.objects.get_or_create(
            numero_documento=f['doc'],
            defaults={
                'tipo_documento': 'CEDULA_CIUDADANIA',
                'primer_nombre': f['nombre'],
                'segundo_nombre': '',
                'primer_apellido': f['apellido'],
                'segundo_apellido': '',
                'fecha_nacimiento': date(1975 + j, 1 + (j % 12), 1 + (j % 28)),
                'sexo': 'MASCULINO' if j % 2 == 0 else 'FEMENINO',
                'nacionalidad': 'Colombiana',
                'telefono': f'321200{j+1:04d}',
                'correo_electronico': f'{f["nombre"].lower()}.{f["apellido"].lower()}@correo.com',
                'departamento_nacimiento': 'Cauca',
                'municipio_nacimiento': 'Popayán',
            },
        )

        postulacion = Postulacion.objects.create(
            programa=programa,
            etapa_actual=etapa1,
            estado=estado,
            activo_logico=True,
        )

        gestion = GestionHogarEtapa1.objects.create(
            postulacion=postulacion,
            etapa=etapa1,
            ciudadano=ciudadano,
            numero_radicado=radicado,
            departamento='Cauca',
            municipio='Popayán',
            zona=f['zona'],
            tipo_predio='Casa',
            barrio_vereda=f['barrio'],
            direccion=f['dir'],
            estrato=f['estrato'],
            es_propietario=True,
            numero_predial=f'190010000{i+1:05d}0001',
            matricula_inmobiliaria=f'120-R2-{j+1:04d}',
            avaluo_catastral=str(25_000_000 + j * 1_500_000),
            tiempo_residencia=f'{3 + j} años',
            tiene_dependientes=j % 2 == 0,
            personas_con_discapacidad_hogar=False,
            acepta_terminos_condiciones=True,
        )

        MiembroHogar.objects.create(
            postulacion=gestion,
            tipo_documento='CEDULA_CIUDADANIA',
            numero_documento=f['doc'],
            primer_nombre=f['nombre'],
            segundo_nombre='',
            primer_apellido=f['apellido'],
            segundo_apellido='',
            fecha_nacimiento=date(1975 + j, 1 + (j % 12), 1 + (j % 28)),
            parentesco='PADRE' if j % 2 == 0 else 'MADRE',
            es_cabeza_hogar=True,
            nivel_educativo='Secundaria completa',
            situacion_laboral='INDEPENDIENTE',
            ingresos_mensuales=Decimal('1100000'),
            fuente_ingresos='Trabajo independiente',
            pertenece_sisben=True,
            grupo_sisben='B',
            puntaje_sisben=Decimal('30.00'),
        )

        creadas2 += 1
        print(f'  ✅ {estado:<25s} — {f["nombre"]} {f["apellido"]} ({radicado})')

    print(f'\n🎉 Ronda 2: {creadas2} postulaciones adicionales')
    print(f'📊 Total: {creadas + creadas2} postulaciones creadas\n')


if __name__ == '__main__':
    main()
