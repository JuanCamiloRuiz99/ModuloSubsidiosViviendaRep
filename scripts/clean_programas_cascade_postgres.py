#!/usr/bin/env python
"""
clean_programas_cascade_postgres.py
====================================
Elimina todos los programas y sus postulaciones usando CASCADE de PostgreSQL, excepto:
1. Subsidio de Mejoramiento de Vivienda
2. Vivienda Digna para Todos

Ejecución (desde la carpeta backend/):
    python ../scripts/clean_programas_cascade_postgres.py
"""

import os
import sys
import django
from django.db import connection

# ── Django setup ─────────────────────────────────────────────────────────── #

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

django.setup()

from infrastructure.database.models import Programa

# ─────────────────────────────────────────────────────────────────────────── #

PROGRAMAS_A_MANTENER = {
    'Subsidio de Mejoramiento de Vivienda',
    'Vivienda Digna para Todos',
}

def main():
    print("🔍 Buscando programas...")

    # Obtener IDs de programas a mantener
    programas_mantener = Programa.objects.filter(nombre__in=PROGRAMAS_A_MANTENER)
    ids_mantener = list(programas_mantener.values_list('id', flat=True))

    print(f"✅ Programas a mantener: {programas_mantener.count()}")
    for prog in programas_mantener:
        print(f"   • {prog.nombre} (ID: {prog.id})")

    # Obtener todos los programas
    todos_programas = Programa.objects.all()
    programas_eliminar = todos_programas.exclude(nombre__in=PROGRAMAS_A_MANTENER)

    print(f"\n❌ Programas a eliminar: {programas_eliminar.count()}")
    for prog in programas_eliminar:
        postulaciones_count = prog.postulaciones.count()
        etapas_count = prog.etapas.count()
        print(f"   • {prog.nombre} (ID: {prog.id})")
        print(f"     - Postulaciones: {postulaciones_count}")
        print(f"     - Etapas: {etapas_count}")

    if programas_eliminar.count() == 0:
        print("\n✅ No hay programas para eliminar. Base de datos ya está limpia.")
        return

    # Obtener IDs de programas a eliminar
    ids_eliminar = list(programas_eliminar.values_list('id', flat=True))

    print(f"\n📊 IDs a mantener: {ids_mantener}")
    print(f"📊 IDs a eliminar: {ids_eliminar}")

    # Usar CASCADE de PostgreSQL para eliminación automática
    with connection.cursor() as cursor:
        try:
            print("\n🗑️  Eliminando programas con CASCADE...")

            # Eliminar programas con CASCADE (PostgreSQL maneja las dependencias automáticamente)
            cursor.execute("""
                DELETE FROM gestion_programa CASCADE
                WHERE id IN %s
            """, [tuple(ids_eliminar)])
            print(f"   • Programas eliminados (con CASCADE): {cursor.rowcount}")

            print("\n✅ ¡Limpieza completada exitosamente!")

            # Verificar resultado
            cursor.execute("SELECT COUNT(*) FROM gestion_programa")
            programas_restantes = cursor.fetchone()[0]
            print(f"\n📊 Programas restantes en BD: {programas_restantes}")

            cursor.execute("SELECT nombre FROM gestion_programa ORDER BY nombre")
            programas = cursor.fetchall()
            for prog in programas:
                print(f"   • {prog[0]}")

            # Verificar otras tablas
            cursor.execute("SELECT COUNT(*) FROM postulaciones")
            postulaciones_restantes = cursor.fetchone()[0]
            print(f"   • Postulaciones restantes: {postulaciones_restantes}")

            cursor.execute("SELECT COUNT(*) FROM etapas_programas")
            etapas_restantes = cursor.fetchone()[0]
            print(f"   • Etapas restantes: {etapas_restantes}")

        except Exception as e:
            print(f"\n❌ Error durante la eliminación: {e}")
            import traceback
            traceback.print_exc()
            connection.rollback()
        else:
            connection.commit()

if __name__ == '__main__':
    main()