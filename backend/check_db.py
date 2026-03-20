#!/usr/bin/env python
"""Verificar conexión a PostgreSQL y estado de datos"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection
from infrastructure.database.usuarios_models import UsuarioSistema
from infrastructure.database.roles_models import Rol

print("\n" + "="*60)
print("🔍 VERIFICACIÓN - POSTGRESQL CONNECTION")
print("="*60)

try:
    # Test conexión
    with connection.cursor() as cursor:
        cursor.execute('SELECT version();')
        version = cursor.fetchone()[0]
        pg_version = version.split(',')[0].strip()
        print(f"\n✅ Conectado a PostgreSQL")
        print(f"   Versión: {pg_version}")
except Exception as e:
    print(f"\n❌ Error conectando a PostgreSQL: {e}")
    exit(1)

# Verificar datos
print(f"\n📊 Datos en Base de Datos:")
usuarios_count = UsuarioSistema.objects.count()
roles_count = Rol.objects.count()

print(f"   Usuarios guardados: {usuarios_count}")
print(f"   Roles disponibles: {roles_count}")

# Listar roles
if roles_count > 0:
    print(f"\n📋 Roles en BD:")
    for rol in Rol.objects.all():
        print(f"   - {rol.id_rol}: {rol.nombre_rol}")

# Listar últimos usuarios
if usuarios_count > 0:
    print(f"\n👥 Últimos 3 usuarios:")
    for usuario in UsuarioSistema.objects.all()[:3]:
        print(f"   - {usuario.nombre_completo} ({usuario.id_rol.nombre_rol})")

print("\n" + "="*60)
print("✅ BASE DE DATOS OPERACIONAL")
print("="*60 + "\n")
