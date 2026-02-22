#!/usr/bin/env python
"""
Script para revisar y diagnosticar usuarios - debug
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.database.models import Usuario

print("\n" + "="*80)
print("DIAGNÓSTICO DE USUARIOS")
print("="*80)

# Listar todos los usuarios
usuarios = Usuario.objects.all()
print(f"\nTotal de usuarios: {usuarios.count()}\n")

for user in usuarios:
    print(f"ID: {user.id}")
    print(f"  Nombre: {user.nombre} {user.apellidos}")
    print(f"  Documento: {user.numero_documento}")
    print(f"  Correo: {user.correo}")
    print(f"  Rol: {user.rol}")
    print(f"  Estado: {user.estado}")
    print()

# Buscar duplicados
print("="*80)
print("VERIFICANDO DUPLICADOS")
print("="*80)

documentos = Usuario.objects.values('numero_documento').annotate(
    count=__import__('django.db.models', fromlist=['Count']).Count('id')
).filter(count__gt=1)

if documentos:
    print(f"⚠️  Documentos duplicados: {len(documentos)}")
    for doc in documentos:
        print(f"  - {doc['numero_documento']}: {doc['count']} usuarios")
else:
    print("✅ No hay documentos duplicados")

# Buscar correos duplicados
correos = Usuario.objects.values('correo').annotate(
    count=__import__('django.db.models', fromlist=['Count']).Count('id')
).filter(count__gt=1)

if correos:
    print(f"⚠️  Correos duplicados: {len(correos)}")
    for correo in correos:
        print(f"  - {correo['correo']}: {correo['count']} usuarios")
else:
    print("✅ No hay correos duplicados")

print("\n" + "="*80)
