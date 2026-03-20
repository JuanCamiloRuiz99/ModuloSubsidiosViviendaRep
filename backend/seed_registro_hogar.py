#!/usr/bin/env python
"""
seed_registro_hogar.py
======================
Inserta datos de prueba para el módulo Registro del Hogar.

Crea:
  • 1 Programa  (ACTIVO)
  • 1 Etapa     (REGISTRO_HOGAR, ligada al programa)
  • 1 ConfigRegistroHogar  (publicado=True, todos los campos configurados)

Ejecución (desde la carpeta backend/):
    python seed_registro_hogar.py

Si el programa ya existe (mismo código) el script lo reutiliza en lugar de
duplicarlo.
"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.database.models import (
    Programa,
    Etapa,
    ConfigRegistroHogar,
)

# ── 1. Programa ───────────────────────────────────────────────────────────── #

programa, creado_prog = Programa.objects.get_or_create(
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

if creado_prog:
    print(f'✅ Programa creado  → id={programa.id}  código={programa.codigo_programa}')
else:
    print(f'ℹ️  Programa ya existe → id={programa.id}  código={programa.codigo_programa}')

# ── 2. Etapa ──────────────────────────────────────────────────────────────── #

etapa, creado_etapa = Etapa.objects.get_or_create(
    programa=programa,
    numero_etapa=1,
    defaults={
        'modulo_principal': 'REGISTRO_HOGAR',
        'activo_logico': True,
    },
)

if creado_etapa:
    print(f'✅ Etapa creada     → id={etapa.id}  módulo={etapa.modulo_principal}')
else:
    print(f'ℹ️  Etapa ya existe  → id={etapa.id}  módulo={etapa.modulo_principal}')

# ── 3. ConfigRegistroHogar ────────────────────────────────────────────────── #

# Todos los campos configurables definidos en secciones-data.tsx,
# usando los mismos valores de requeridoPorDefecto del frontend.
campos_config = {
    # ── Sección 1: Información del Hogar ──────────────────────────────── #
    'tipo_predio':                   {'requerido': True,  'habilitado': True},
    'comuna':                        {'requerido': False, 'habilitado': True},
    'barrio_vereda':                 {'requerido': True,  'habilitado': True},
    'observaciones_direccion':       {'requerido': False, 'habilitado': True},
    'estrato':                       {'requerido': True,  'habilitado': True},
    'es_propietario':                {'requerido': True,  'habilitado': True},
    'numero_predial':                {'requerido': False, 'habilitado': True},
    'matricula_inmobiliaria':        {'requerido': False, 'habilitado': True},
    'avaluo_catastral':              {'requerido': False, 'habilitado': True},
    'numero_matricula_agua':         {'requerido': False, 'habilitado': True},
    'numero_contrato_energia':       {'requerido': False, 'habilitado': True},
    'tiempo_residencia':             {'requerido': True,  'habilitado': True},
    'tiene_dependientes':            {'requerido': True,  'habilitado': True},
    'personas_con_discapacidad_hogar': {'requerido': False, 'habilitado': True},
    # ── Sección 2: Composición del Hogar ──────────────────────────────── #
    'miembro_segundo_nombre':                   {'requerido': False, 'habilitado': True},
    'miembro_segundo_apellido':                 {'requerido': False, 'habilitado': True},
    'miembro_parentesco_otro':                  {'requerido': False, 'habilitado': True},
    'miembro_es_cabeza_hogar':                  {'requerido': True,  'habilitado': True},
    'miembro_nivel_educativo':                  {'requerido': True,  'habilitado': True},
    'miembro_situacion_laboral':                {'requerido': True,  'habilitado': True},
    'miembro_ingresos_mensuales':               {'requerido': True,  'habilitado': True},
    'miembro_fuente_ingresos':                  {'requerido': False, 'habilitado': True},
    'miembro_pertenece_sisben':                 {'requerido': True,  'habilitado': True},
    'miembro_grupo_sisben':                     {'requerido': False, 'habilitado': True},
    'miembro_puntaje_sisben':                   {'requerido': False, 'habilitado': True},
    'miembro_tiene_discapacidad':               {'requerido': False, 'habilitado': True},
    'miembro_grado_discapacidad':               {'requerido': False, 'habilitado': True},
    'miembro_certificado_discapacidad':         {'requerido': False, 'habilitado': True},
    'miembro_numero_certificado':               {'requerido': False, 'habilitado': True},
    'miembro_es_victima_conflicto':             {'requerido': False, 'habilitado': True},
    'miembro_numero_ruv':                       {'requerido': False, 'habilitado': True},
    'miembro_hecho_victimizante':               {'requerido': False, 'habilitado': True},
    'miembro_fecha_hecho_victimizante':         {'requerido': False, 'habilitado': True},
    'miembro_es_desplazado':                    {'requerido': False, 'habilitado': True},
    'miembro_fecha_desplazamiento':             {'requerido': False, 'habilitado': True},
    'miembro_municipio_origen':                 {'requerido': False, 'habilitado': True},
    'miembro_departamento_origen':              {'requerido': False, 'habilitado': True},
    'miembro_motivo_desplazamiento':            {'requerido': False, 'habilitado': True},
    'miembro_es_firmante_paz':                  {'requerido': False, 'habilitado': True},
    'miembro_codigo_reincorporacion':           {'requerido': False, 'habilitado': True},
    'miembro_etcr':                             {'requerido': False, 'habilitado': True},
    'miembro_estado_proceso_reincorporacion':   {'requerido': False, 'habilitado': True},
    # ── Sección 3: Documentos ─────────────────────────────────────────── #
    'doc_hogar_recibo_predial':                 {'requerido': False, 'habilitado': True},
    'doc_hogar_certificado_tradicion_libertad': {'requerido': False, 'habilitado': True},
    'doc_hogar_escritura_publica_predio':       {'requerido': False, 'habilitado': True},
    'doc_hogar_recibo_servicios_publicos':      {'requerido': False, 'habilitado': True},
    'doc_hogar_declaracion_juramentada':        {'requerido': False, 'habilitado': True},
    'doc_hogar_certificado_residencia':         {'requerido': False, 'habilitado': True},
    'doc_hogar_certificado_sisben':             {'requerido': False, 'habilitado': True},
    'doc_hogar_certificado_discapacidad':       {'requerido': False, 'habilitado': True},
    'doc_hogar_registro_victima':               {'requerido': False, 'habilitado': True},
    'doc_hogar_otro':                           {'requerido': False, 'habilitado': True},
    'doc_miembro_cedula':                       {'requerido': False, 'habilitado': True},
    'doc_miembro_registro_civil':               {'requerido': False, 'habilitado': True},
    'doc_miembro_tarjeta_identidad':            {'requerido': False, 'habilitado': True},
    'doc_miembro_certificado_discapacidad':     {'requerido': False, 'habilitado': True},
    'doc_miembro_certificado_victima':          {'requerido': False, 'habilitado': True},
    'doc_miembro_otro':                         {'requerido': False, 'habilitado': True},
}

config, creado_cfg = ConfigRegistroHogar.objects.get_or_create(
    etapa=etapa,
    defaults={
        'campos': campos_config,
        'publicado': True,
    },
)

if not creado_cfg:
    # Actualizar la config existente con los campos y publicarla
    config.campos = campos_config
    config.publicado = True
    config.save(update_fields=['campos', 'publicado', 'fecha_modificacion'])
    print(f'ℹ️  ConfigRegistroHogar actualizada → id={config.pk}  publicado={config.publicado}')
else:
    print(f'✅ ConfigRegistroHogar creada → id={config.pk}  publicado={config.publicado}')

# ── Resumen ───────────────────────────────────────────────────────────────── #

print()
print('=' * 60)
print('DATOS DE PRUEBA LISTOS')
print('=' * 60)
print(f'  Programa id : {programa.id}')
print(f'  Etapa id    : {etapa.id}')
print(f'  Config id   : {config.pk}')
print()
print('URLs para probar en el navegador:')
print(f'  Formulario ciudadano : http://localhost:5173/registro-hogar/{etapa.id}')
print(f'  Config gestor        : http://localhost:5173/programas/{programa.id}/etapas/{etapa.id}/registro-hogar')
print('=' * 60)
