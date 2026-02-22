#!/usr/bin/env python
"""
Script de diagnóstico para verificar la API
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("=" * 80)
print("DIAGNÓSTICO DE LA API DE USUARIOS")
print("=" * 80)

# Importar después de setup
from django.test import Client
from infrastructure.database.models import Usuario as UsuarioModel
from infrastructure.database.repositories import UsuarioRepository
from application.usuarios import ObtenerUsuariosUseCase

client = Client()

# 1. Verificar usuarios en BD
print("\n1. USUARIOS EN LA BASE DE DATOS")
print("-" * 80)
usuarios_bd = UsuarioModel.objects.all()
print(f"Total: {usuarios_bd.count()}")
for user in usuarios_bd:
    print(f"  ID: {user.id}, Nombre: {user.nombre}, Estado: {user.estado}")

# 2. Repositorio
print("\n2. REPOSITORIO - obtener_todos()")
print("-" * 80)
repo = UsuarioRepository()
usuarios_repo = repo.obtener_todos()
print(f"Total: {len(usuarios_repo)}")
for user in usuarios_repo:
    print(f"  ID: {user.id}, Nombre: {user.nombre}, Estado: {user.estado}")

# 3. Use Case
print("\n3. USE CASE - ObtenerUsuariosUseCase")
print("-" * 80)
use_case = ObtenerUsuariosUseCase(repo)
resultado_use_case = use_case.execute()
print(f"Total: {len(resultado_use_case)}")
print(json.dumps(resultado_use_case[:2], indent=2, ensure_ascii=False, default=str))

# 4. API Endpoint
print("\n4. API ENDPOINT - GET /api/usuarios/")
print("-" * 80)
response = client.get('/api/usuarios/')
print(f"Status: {response.status_code}")
print(f"Content-Type: {response.get('Content-Type')}")
try:
    data = response.json()
    print(f"Total: {len(data) if isinstance(data, list) else 'N/A'}")
    if isinstance(data, list) and len(data) > 0:
        print(json.dumps(data[:2], indent=2, ensure_ascii=False, default=str))
    else:
        print(json.dumps(data, indent=2, ensure_ascii=False, default=str))
except Exception as e:
    print(f"Error: {e}")
    print(f"Content: {response.content[:500]}")

print("\n" + "=" * 80)
