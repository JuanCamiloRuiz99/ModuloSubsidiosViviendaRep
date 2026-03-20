#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Script para probar los endpoints de API usuarios"""

import json
import urllib.request
import urllib.error
import sys
import io

# Forzar UTF-8 en Windows
if sys.platform == 'win32':
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

BASE_URL = "http://localhost:8000/api"

def test_list_usuarios():
    """Test: GET /api/usuarios/"""
    print("\n" + "="*60)
    print("✅ TEST 1: GET /api/usuarios/ - Listar usuarios")
    print("="*60)
    try:
        req = urllib.request.Request(f'{BASE_URL}/usuarios/')
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        print(f"Status: {resp.status} ✓")
        print(f"Respuesta:\n{json.dumps(data, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_create_usuario():
    """Test: POST /api/usuarios/"""
    print("\n" + "="*60)
    print("✅ TEST 2: POST /api/usuarios/ - Crear usuario")
    print("="*60)
    try:
        import time
        timestamp = int(time.time())
        payload = {
            'nombre_completo': 'Rosa Fernandez',
            'correo': f'rosa{timestamp}@test.com',
            'password_hash': 'pbkdf2_sha256$12345678901234567890',
            'id_rol': 2
        }
        body = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f'{BASE_URL}/usuarios/',
            data=body,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        print(f"Status: {resp.status} ✓")
        print(f"Usuario creado:\n{json.dumps(data, indent=2)}")
        
        # Guarda el ID para tests posteriores
        usuario_id = data.get('data', {}).get('id_usuario')
        print(f"\n➡️ ID de usuario para próximos tests: {usuario_id}")
        return usuario_id
    except urllib.error.HTTPError as e:
        print(f"❌ Error {e.code}:")
        print(e.read().decode())
        return None

def test_get_usuario(usuario_id):
    """Test: GET /api/usuarios/{id}/"""
    print("\n" + "="*60)
    print(f"✅ TEST 3: GET /api/usuarios/{usuario_id}/ - Obtener usuario")
    print("="*60)
    if not usuario_id:
        print("⚠️ Saltando test (sin ID de usuario)")
        return False
    try:
        req = urllib.request.Request(f'{BASE_URL}/usuarios/{usuario_id}/')
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        print(f"Status: {resp.status} ✓")
        print(f"Usuario:\n{json.dumps(data, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def test_cambiar_rol(usuario_id):
    """Test: POST /api/usuarios/{id}/cambiar_rol/"""
    print("\n" + "="*60)
    print(f"✅ TEST 4: POST /api/usuarios/{usuario_id}/cambiar_rol/")
    print("="*60)
    if not usuario_id:
        print("⚠️ Saltando test (sin ID de usuario)")
        return False
    try:
        payload = {'rol': 3}  # Cambiar a TECNICO_VISITANTE
        body = json.dumps(payload).encode('utf-8')
        req = urllib.request.Request(
            f'{BASE_URL}/usuarios/{usuario_id}/cambiar_rol/',
            data=body,
            headers={'Content-Type': 'application/json'},
            method='POST'
        )
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        print(f"Status: {resp.status} ✓")
        print(f"Rol actualizado:\n{json.dumps(data, indent=2)}")
        return True
    except urllib.error.HTTPError as e:
        print(f"❌ Error {e.code}:")
        print(e.read().decode())
        return False

def test_filter_by_rol():
    """Test: GET /api/usuarios/?id_rol=2"""
    print("\n" + "="*60)
    print("✅ TEST 5: GET /api/usuarios/?id_rol=2 - Filtrar por rol")
    print("="*60)
    try:
        req = urllib.request.Request(f'{BASE_URL}/usuarios/?id_rol=2')
        resp = urllib.request.urlopen(req)
        data = json.loads(resp.read().decode())
        print(f"Status: {resp.status} ✓")
        print(f"Usuarios con rol=2:\n{json.dumps(data, indent=2)}")
        return True
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

def main():
    print("\n" + "🧪 "*30)
    print("SUITE DE TESTS - API USUARIOS REFACTORIZADA")
    print("🧪 "*30)
    
    results = []
    
    # Tests básicos
    results.append(("Listar usuarios", test_list_usuarios()))
    
    # Crear usuario y usar su ID
    usuario_id = test_create_usuario()
    
    # Tests sobre el usuario creado
    if usuario_id:
        results.append((f"Obtener usuario {usuario_id}", test_get_usuario(usuario_id)))
        results.append((f"Cambiar rol usuario {usuario_id}", test_cambiar_rol(usuario_id)))
        results.append(("Filtrar por rol", test_filter_by_rol()))
    
    # Resumen
    print("\n" + "="*60)
    print("📊 RESUMEN DE TESTS")
    print("="*60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    print(f"\nTests pasados: {passed}/{total}")
    
    for test_name, result in results:
        status = "✅" if result else "❌"
        print(f"{status} {test_name}")
    
    if passed == total:
        print("\n🎉 ¡TODOS LOS TESTS PASARON!")
    else:
        print(f"\n⚠️ {total - passed} test(s) fallaron")

if __name__ == '__main__':
    main()
