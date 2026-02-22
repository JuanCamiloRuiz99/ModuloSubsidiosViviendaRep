#!/usr/bin/env python
"""
Test completo del flujo backend-frontend
"""
import os
import django
import json
import urllib.request
import urllib.error

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

print("=" * 80)
print("TEST COMPLETO: Backend API Endpoints")
print("=" * 80)

# Test 1: Verificar usuarios directamente en Django
print("\n[1] Verificando usuarios en Django:")
from infrastructure.database.models import Usuario
usuarios_count = Usuario.objects.all().count()
print(f"✓ Total de usuarios en BD: {usuarios_count}")

# Test 2: Verificar que los usuarios tienen nombre_completo
print("\n[2] Verificando que usuarios tienen nombre_completo:")
usuarios = Usuario.objects.all()
for u in usuarios[:2]:  # Show first 2
    print(f"  - {u.numero_documento}: {u.nombre} {u.apellidos}")

# Test 3: Verificar use case directamente
print("\n[3] Probando ObtenerEstadisticasUsuariosUseCase directamente:")
from infrastructure.database.repositories import UsuarioRepository
from application.usuarios import ObtenerEstadisticasUsuariosUseCase

repo = UsuarioRepository()
use_case = ObtenerEstadisticasUsuariosUseCase(repo)
stats = use_case.execute()
print(f"✓ Estadísticas obtenidas: {json.dumps(stats, indent=2)}")

# Test 4: API HTTP - GET /api/usuarios/
print("\n[4] Probando API HTTP GET /api/usuarios/")
try:
    req = urllib.request.Request('http://localhost:8000/api/usuarios/')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        print(f"✓ Status: {response.status}")
        print(f"✓ Type: {type(data)}")
        print(f"✓ Count: {len(data) if isinstance(data, list) else 'N/A'}")
        if isinstance(data, list) and len(data) > 0:
            print(f"✓ First item keys: {list(data[0].keys())}")
            print(f"  - nombre_completo: {data[0].get('nombre_completo', 'MISSING!')}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 5: API HTTP - GET /api/usuarios/estadisticas/
print("\n[5] Probando API HTTP GET /api/usuarios/estadisticas/")
try:
    req = urllib.request.Request('http://localhost:8000/api/usuarios/estadisticas/')
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        print(f"✓ Status: {response.status}")
        print(f"✓ Data: {json.dumps(data, indent=2)}")
except Exception as e:
    print(f"❌ Error: {e}")

# Test 6: Simular llamada del frontend
print("\n[6] Simulando llamada del frontend (como si fuera desde browser):")
print("  POST request con User-Agent simulado...")
try:
    req = urllib.request.Request(
        'http://localhost:8000/api/usuarios/estadisticas/',
        headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
        }
    )
    with urllib.request.urlopen(req) as response:
        data = json.loads(response.read())
        print(f"✓ Status: {response.status}")
        print(f"✓ Data recibido: {json.dumps(data, indent=2)}")
        
        # Verificar que los datos sean los esperados
        if data.get('total') == 2:
            print("✓ Total = 2 ✓")
        if data.get('activos') == 2:
            print("✓ Activos = 2 ✓")
        if data.get('por_rol', {}).get('TECNICO') == 2:
            print("✓ Técnicos = 2 ✓")
except Exception as e:
    print(f"❌ Error: {e}")

print("\n" + "=" * 80)
print("✅ TEST COMPLETO FINALIZADO")
print("=" * 80)
