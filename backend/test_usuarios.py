#!/usr/bin/env python
"""
Test script para verificar usuarios en la BD y su serialización
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.database.models import Usuario
from presentation.serializers.usuario_serializer import UsuarioSerializer

print("=" * 60)
print("PRUEBA DE USUARIOS EN BASE DE DATOS")
print("=" * 60)

# Obtener todos los usuarios
usuarios = Usuario.objects.all()
print(f"\n✓ Total usuarios en BD: {usuarios.count()}\n")

if usuarios.count() == 0:
    print("⚠ No hay usuarios en la base de datos")
else:
    for u in usuarios:
        print(f"\nUsuario ID: {u.id}")
        print(f"  - Nombre: {u.nombre}")
        print(f"  - Apellidos: {u.apellidos}")
        print(f"  - Documento: {u.numero_documento}")
        print(f"  - Email: {u.correo}")
        print(f"  - Rol: {u.rol}")
        print(f"  - Estado: {u.estado}")
        print(f"  - Fecha creación: {u.fecha_creacion}")
        
        # Serializar
        serializer = UsuarioSerializer(u)
        print(f"\n  Serializado (JSON):")
        print(f"  {json.dumps(serializer.data, indent=4, ensure_ascii=False, default=str)}")

print("\n" + "=" * 60)
