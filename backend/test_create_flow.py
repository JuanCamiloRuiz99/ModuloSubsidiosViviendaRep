#!/usr/bin/env python
"""
Test de creación de usuario - simular frontend
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from infrastructure.database.repositories import UsuarioRepository
from application.usuarios import CrearUsuarioUseCase
from shared.exceptions import ValidationError

print("\n" + "="*80)
print("TEST DE CREACIÓN DE USUARIO")
print("="*80)

test_cases = [
    {
        "name": "Usuario válido - nuevo",
        "data": {
            "nombre": "Carlos",
            "apellidos": "López Rodríguez",
            "numero_documento": "88888888",
            "correo": "carlos@test.com",
            "rol": "FUNCIONARIO",
            "estado": "ACTIVO"
        }
    },
    {
        "name": "Usuario con documento duplicado",
        "data": {
            "nombre": "Otro",
            "apellidos": "Usuario",
            "numero_documento": "12312321123213",  # Ya existe
            "correo": "otro@test.com",
            "rol": "TECNICO",
            "estado": "ACTIVO"
        }
    },
    {
        "name": "Usuario sin nombre",
        "data": {
            "nombre": "",
            "apellidos": "Test",
            "numero_documento": "77777777",
            "correo": "test@test.com",
            "rol": "ADMINISTRADOR",
            "estado": "ACTIVO"
        }
    },
    {
        "name": "Usuario con correo inválido",
        "data": {
            "nombre": "Test",
            "apellidos": "User",
            "numero_documento": "66666666",
            "correo": "correo_invalido",
            "rol": "TECNICO",
            "estado": "ACTIVO"
        }
    },
]

repo = UsuarioRepository()
use_case = CrearUsuarioUseCase(repo)

for test in test_cases:
    print(f"\n{'─'*80}")
    print(f"Test: {test['name']}")
    print(f"{'─'*80}")
    print(f"Datos: {json.dumps(test['data'], indent=2)}")
    
    try:
        result = use_case.execute(test['data'])
        print(f"✅ ÉXITO - Usuario creado:")
        print(f"   ID: {result['id']}")
        print(f"   Nombre completo: {result['nombre_completo']}")
    except ValidationError as e:
        print(f"⚠️  VALIDACIÓN - {str(e)}")
    except Exception as e:
        print(f"❌ ERROR - {type(e).__name__}: {str(e)}")

print("\n" + "="*80)
