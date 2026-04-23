#!/usr/bin/env python
"""
diagnose_config_registro_hogar.py

Diagnóstico completo del error:
  ❌ no existe la columna config_registro_hogar.inhabilitado

Causas comunes:
  1. Migración 0041 no se ha ejecutado en esta base de datos
  2. Base de datos en estado inconsistente con los modelos
  3. Diferencia entre desarrollo y otra instalación
"""

import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from django.db.migrations.loader import MigrationLoader
from django.core.management import call_command

print("\n" + "="*80)
print("🔍 DIAGNÓSTICO: Error en ConfigRegistroHogar.inhabilitado")
print("="*80 + "\n")

# ─────────────────────────────────────────────────────────────────────────────
# 1. Verificar estado de la migración 0041
# ─────────────────────────────────────────────────────────────────────────────

print("1️⃣  ESTADO DE MIGRACIÓN 0041")
print("-" * 80)

loader = MigrationLoader(None, ignore_no_migrations=True)
graph = loader.graph

# Verificar si 0041 está en el graph
try:
    migration_0041 = loader.graph.nodes[('database', '0041_add_inhabilitado_config_modulos')]
    applied = ('database', '0041_add_inhabilitado_config_modulos') in loader.applied_migrations
    status = "✅ APLICADA" if applied else "❌ PENDIENTE"
    print(f"Migración 0041: {status}")
    
    if not applied:
        print("\n⚠️  LA MIGRACIÓN 0041 NO HA SIDO APLICADA")
        print("   Esto explica por qué la columna 'inhabilitado' no existe en la tabla.")
except KeyError:
    print("⚠️  Migración 0041 no encontrada en el loader")

# ─────────────────────────────────────────────────────────────────────────────
# 2. Verificar columnas actuales en la tabla
# ─────────────────────────────────────────────────────────────────────────────

print("\n2️⃣  COLUMNAS EN TABLA config_registro_hogar")
print("-" * 80)

cursor = connection.cursor()
cursor.execute("""
    SELECT column_name, data_type, is_nullable 
    FROM information_schema.columns 
    WHERE table_name='config_registro_hogar'
    ORDER BY ordinal_position
""")

columns = cursor.fetchall()
print("\nColumnas en DB:")
for col_name, data_type, is_nullable in columns:
    nullable = "nullable" if is_nullable == 'YES' else "NOT NULL"
    print(f"  • {col_name:25} {data_type:15} {nullable}")

has_inhabilitado = any(col[0] == 'inhabilitado' for col in columns)
print(f"\n¿Tiene 'inhabilitado'? {'✅ SÍ' if has_inhabilitado else '❌ NO'}")

# ─────────────────────────────────────────────────────────────────────────────
# 3. Verificar modelo Django
# ─────────────────────────────────────────────────────────────────────────────

print("\n3️⃣  CAMPOS EN MODELO Django (ConfigRegistroHogar)")
print("-" * 80)

from infrastructure.database.models import ConfigRegistroHogar

print("\nCampos definidos en el modelo:")
for field in ConfigRegistroHogar._meta.get_fields():
    if not field.many_to_one and not field.many_to_many:
        print(f"  • {field.name:25} {field.get_internal_type()}")

# ─────────────────────────────────────────────────────────────────────────────
# 4. SOLUCIÓN
# ─────────────────────────────────────────────────────────────────────────────

print("\n" + "="*80)
print("🔧 SOLUCIÓN")
print("="*80)

if not has_inhabilitado:
    print("\n⚠️  ACCIÓN REQUERIDA: Aplicar migración 0041\n")
    print("Ejecuta desde la carpeta backend/:")
    print("\n  python manage.py migrate database\n")
    
    print("Esto aplicará todas las migraciones pendientes, incluyendo:")
    print("  • 0041 - Agrega campo 'inhabilitado' a ConfigRegistroHogar")
    print("  • 0042 - (si hay pendientes)")
    
    # Opcional: ejecutar automáticamente
    print("\n¿Deseas aplicar ahora? (Recomendado)")
    response = input("Escribe 'si' para aplicar migraciones: ").strip().lower()
    
    if response == 'si':
        print("\n⏳ Aplicando migraciones...")
        call_command('migrate', 'database')
        print("✅ Migraciones aplicadas correctamente")
        
        # Verificar nuevamente
        cursor.execute("""
            SELECT COUNT(*) FROM information_schema.columns 
            WHERE table_name='config_registro_hogar' AND column_name='inhabilitado'
        """)
        exists_now = cursor.fetchone()[0] > 0
        
        if exists_now:
            print("\n✅ ÉXITO: Columna 'inhabilitado' ahora existe en la tabla")
            print("\nEndpoints que ahora funcionarán:")
            print("  GET  /api/etapas/?programa=3     ✅")
            print("  POST /api/etapas/                 (si datos son válidos) ✅")
        else:
            print("\n❌ Error: Columna aún no existe. Contacta a soporte.")
    else:
        print("\n⏭️  Ejecución manual requerida.")
else:
    print("\n✅ LA COLUMNA 'inhabilitado' YA EXISTE")
    print("\nEl error puede ser por otra causa. Verifica:")
    print("  • ¿Funciona el servidor Python? (backend en ejecución)")
    print("  • ¿Tiene la base de datos datos consistentes?")
    print("  • ¿El error viene de otro lugar del código?")

print("\n" + "="*80 + "\n")
