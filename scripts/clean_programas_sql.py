#!/usr/bin/env python
"""
clean_programas_sql.py
======================
Elimina todos los programas y sus postulaciones usando SQL directo, excepto:
1. Subsidio de Mejoramiento de Vivienda
2. Vivienda Digna para Todos

Ejecución (desde la carpeta backend/):
    python ../scripts/clean_programas_sql.py
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

    # Usar SQL directo para eliminación en cascada
    with connection.cursor() as cursor:
        try:
            print("\n🗑️  Eliminando datos relacionados...")

            print("\n🗑️  Eliminando datos relacionados en orden correcto...")

            # 1. Eliminar documentos de miembros del hogar (primero los más dependientes)
            cursor.execute("""
                DELETE FROM documentos_miembro_hogar
                WHERE miembro_id IN (
                    SELECT id FROM miembros_hogar
                    WHERE postulacion_id IN (
                        SELECT id FROM gestion_hogar_etapa1
                        WHERE postulacion_id IN (
                            SELECT id FROM postulaciones
                            WHERE programa_id IN %s
                        )
                    )
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Documentos miembros eliminados: {cursor.rowcount}")

            # 2. Eliminar miembros del hogar
            cursor.execute("""
                DELETE FROM miembros_hogar
                WHERE postulacion_id IN (
                    SELECT id FROM gestion_hogar_etapa1
                    WHERE postulacion_id IN (
                        SELECT id FROM postulaciones
                        WHERE programa_id IN %s
                    )
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Miembros del hogar eliminados: {cursor.rowcount}")

            # 3. Eliminar documentos de postulaciones
            cursor.execute("""
                DELETE FROM documentos_gestion_hogar_etapa1
                WHERE postulacion_id IN (
                    SELECT id FROM postulaciones
                    WHERE programa_id IN %s
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Documentos postulaciones eliminados: {cursor.rowcount}")

            # 4. Eliminar documentos de visitas etapa 2
            cursor.execute("""
                DELETE FROM documentos_visita_etapa2
                WHERE visita_id IN (
                    SELECT id FROM visitas
                    WHERE postulacion_id IN (
                        SELECT id FROM postulaciones
                        WHERE programa_id IN %s
                    )
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Documentos visitas E2 eliminados: {cursor.rowcount}")

            # 5. Eliminar datos hogar etapa 2
            cursor.execute("""
                DELETE FROM datos_hogar_etapa2
                WHERE visita_id IN (
                    SELECT id FROM visitas
                    WHERE postulacion_id IN (
                        SELECT id FROM postulaciones
                        WHERE programa_id IN %s
                    )
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Datos hogar E2 eliminados: {cursor.rowcount}")

            # 6. Eliminar visitas
            cursor.execute("""
                DELETE FROM visitas
                WHERE postulacion_id IN (
                    SELECT id FROM postulaciones
                    WHERE programa_id IN %s
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Visitas eliminadas: {cursor.rowcount}")

            # 7. Eliminar documentos proceso interno
            cursor.execute("""
                DELETE FROM documentos_proceso_interno
                WHERE postulacion_id IN (
                    SELECT id FROM postulaciones
                    WHERE programa_id IN %s
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Documentos proceso interno eliminados: {cursor.rowcount}")

            # 8. Eliminar registros de GestionHogarEtapa1 (postulaciones)
            cursor.execute("""
                DELETE FROM gestion_hogar_etapa1
                WHERE postulacion_id IN (
                    SELECT id FROM postulaciones
                    WHERE programa_id IN %s
                )
            """, [tuple(ids_eliminar)])
            print(f"   • Registros hogar_etapa1 eliminados: {cursor.rowcount}")

            # 9. Eliminar postulaciones
            cursor.execute("""
                DELETE FROM postulaciones
                WHERE programa_id IN %s
            """, [tuple(ids_eliminar)])
            print(f"   • Postulaciones eliminadas: {cursor.rowcount}")

            # 10. Eliminar etapas de programas
            cursor.execute("""
                DELETE FROM etapas_programas
                WHERE programa_id IN %s
            """, [tuple(ids_eliminar)])
            print(f"   • Etapas eliminadas: {cursor.rowcount}")

            # 11. Finalmente, eliminar los programas
            cursor.execute("""
                DELETE FROM gestion_programa
                WHERE id IN %s
            """, [tuple(ids_eliminar)])
            print(f"   • Programas eliminados: {cursor.rowcount}")

            print("\n✅ ¡Limpieza completada exitosamente!")

            # Verificar resultado
            cursor.execute("SELECT COUNT(*) FROM gestion_programa")
            programas_restantes = cursor.fetchone()[0]
            print(f"\n📊 Programas restantes en BD: {programas_restantes}")

            cursor.execute("SELECT nombre FROM gestion_programa ORDER BY nombre")
            programas = cursor.fetchall()
            for prog in programas:
                print(f"   • {prog[0]}")

        except Exception as e:
            print(f"\n❌ Error durante la eliminación: {e}")
            import traceback
            traceback.print_exc()
            connection.rollback()
        else:
            connection.commit()

if __name__ == '__main__':
    main()