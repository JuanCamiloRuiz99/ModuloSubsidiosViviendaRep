#!/usr/bin/env python
"""
clean_programas.py
==================
Elimina todos los programas y sus postulaciones, excepto:
1. Subsidio de Mejoramiento de Vivienda
2. Vivienda Digna para Todos

Ejecución (desde la carpeta backend/):
    python ../scripts/clean_programas.py
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
        print(f"   • {prog.nombre} (ID: {prog.id}, Código: {prog.codigo_programa})")
    
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
    
    # Confirmar antes de eliminar
    respuesta = input("\n⚠️  ¿Deseas eliminar los programas listados y todas sus postulaciones? (s/n): ")
    if respuesta.lower() != 's':
        print("❌ Operación cancelada.")
        return
    
    with transaction.atomic():
        # Contar postulaciones y etapas a eliminar
        total_postulaciones = Postulacion.objects.filter(
            programa__in=programas_eliminar
        ).count()
        total_etapas = Etapa.objects.filter(
            programa__in=programas_eliminar
        ).count()
        
        print(f"\n🗑️  Eliminando...")
        print(f"   • Postulaciones: {total_postulaciones}")
        print(f"   • Etapas: {total_etapas}")
        print(f"   • Programas: {programas_eliminar.count()}")
        
        # Eliminar postulaciones
        Postulacion.objects.filter(programa__in=programas_eliminar).delete()
        
        # Eliminar etapas
        Etapa.objects.filter(programa__in=programas_eliminar).delete()
        
        # Eliminar programas
        programas_eliminar.delete()
        
        print("\n✅ ¡Limpieza completada exitosamente!")
        
        # Mostrar resumen final
        print("\n📊 Resumen final:")
        print(f"   Programas en BD: {Programa.objects.count()}")
        print(f"   Postulaciones totales: {Postulacion.objects.count()}")
        print(f"   Etapas totales: {Etapa.objects.count()}")
        
        for prog in Programa.objects.all():
            postulaciones_count = prog.postulaciones.count()
            etapas_count = prog.etapas.count()
            print(f"\n   {prog.nombre}")
            print(f"   • Postulaciones: {postulaciones_count}")
            print(f"   • Etapas: {etapas_count}")

if __name__ == '__main__':
    main()
