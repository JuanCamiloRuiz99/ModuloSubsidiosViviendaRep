#!/usr/bin/env python
"""
clean_programas_orm.py
======================
Elimina todos los programas y sus postulaciones usando Django ORM delete() con CASCADE automático, excepto:
1. Subsidio de Mejoramiento de Vivienda
2. Vivienda Digna para Todos

Ejecución (desde la carpeta backend/):
    python ../scripts/clean_programas_orm.py
"""

import os
import sys
import django

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

    print(f"\n📊 IDs a mantener: {ids_mantener}")
    print(f"📊 IDs a eliminar: {list(programas_eliminar.values_list('id', flat=True))}")

    # Usar Django ORM delete() que maneja CASCADE automáticamente
    try:
        print("\n🗑️  Eliminando programas con Django ORM CASCADE...")

        # Eliminar programas con CASCADE automático de Django
        deleted_count, details = programas_eliminar.delete()

        print(f"   • Programas eliminados: {deleted_count}")
        print(f"   • Detalles de eliminación: {details}")

        print("\n✅ ¡Limpieza completada exitosamente!")

        # Verificar resultado
        programas_restantes = Programa.objects.all()
        print(f"\n📊 Programas restantes en BD: {programas_restantes.count()}")
        for prog in programas_restantes:
            print(f"   • {prog.nombre} (ID: {prog.id})")

    except Exception as e:
        print(f"\n❌ Error durante la eliminación: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()