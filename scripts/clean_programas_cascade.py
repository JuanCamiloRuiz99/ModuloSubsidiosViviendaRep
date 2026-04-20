#!/usr/bin/env python
"""
clean_programas_cascade.py
==========================
Elimina todos los programas y sus postulaciones en cascada, excepto:
1. Subsidio de Mejoramiento de Vivienda
2. Vivienda Digna para Todos

Ejecución (desde la carpeta backend/):
    python ../scripts/clean_programas_cascade.py
"""

import os
import sys
import django
from django.db import transaction

# ── Django setup ─────────────────────────────────────────────────────────── #

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

django.setup()

from infrastructure.database.models import Programa, Postulacion, Etapa

# ─────────────────────────────────────────────────────────────────────────── #

PROGRAMAS_A_MANTENER = {
    'Subsidio de Mejoramiento de Vivienda',
    'Vivienda Digna para Todos',
}

def main():
    print("🔍 Buscando programas...")
    todos_programas = Programa.objects.all()
    print(f"   Total de programas: {todos_programas.count()}")

    programas_mantener = Programa.objects.filter(nombre__in=PROGRAMAS_A_MANTENER)
    print(f"\n✅ Programas a mantener: {programas_mantener.count()}")
    for prog in programas_mantener:
        postulaciones_count = prog.postulaciones.count()
        etapas_count = prog.etapas.count()
        print(f"   • {prog.nombre} (ID: {prog.id}, Código: {prog.codigo_programa})")
        print(f"     - Postulaciones: {postulaciones_count}")
        print(f"     - Etapas: {etapas_count}")

    programas_eliminar = todos_programas.exclude(nombre__in=PROGRAMAS_A_MANTENER)
    print(f"\n❌ Programas a eliminar: {programas_eliminar.count()}")

    total_postulaciones_eliminar = 0
    total_etapas_eliminar = 0

    for prog in programas_eliminar:
        postulaciones_count = prog.postulaciones.count()
        etapas_count = prog.etapas.count()
        total_postulaciones_eliminar += postulaciones_count
        total_etapas_eliminar += etapas_count
        print(f"   • {prog.nombre} (ID: {prog.id})")
        print(f"     - Postulaciones: {postulaciones_count}")
        print(f"     - Etapas: {etapas_count}")

    if programas_eliminar.count() == 0:
        print("\n✅ No hay programas para eliminar. Base de datos ya está limpia.")
        return

    print(f"\n📊 Total a eliminar:")
    print(f"   • Programas: {programas_eliminar.count()}")
    print(f"   • Postulaciones: {total_postulaciones_eliminar}")
    print(f"   • Etapas: {total_etapas_eliminar}")

    # Confirmar antes de eliminar (automático para este script)
    print("\n⚠️  Eliminando automáticamente los programas listados...")

    try:
        with transaction.atomic():
            # Usar delete() de Django que maneja cascada automáticamente
            result = programas_eliminar.delete()
            print(f"\n✅ ¡Limpieza completada exitosamente!")
            print(f"   Resultado: {result}")

            # Mostrar resumen final
            print("\n📊 Resumen final:")
            programas_restantes = Programa.objects.all()
            print(f"   Programas en BD: {programas_restantes.count()}")

            for prog in programas_restantes:
                postulaciones_count = prog.postulaciones.count()
                etapas_count = prog.etapas.count()
                print(f"\n   {prog.nombre} (ID: {prog.id})")
                print(f"   • Postulaciones: {postulaciones_count}")
                print(f"   • Etapas: {etapas_count}")

    except Exception as e:
        print(f"\n❌ Error durante la eliminación: {e}")
        import traceback
        traceback.print_exc()

if __name__ == '__main__':
    main()