#!/usr/bin/env python
"""
Test para verificar el endpoint de estadísticas
"""
import os
import django
import json

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.test import Client
from django.urls import reverse

client = Client()

print("=" * 60)
print("TEST ENDPOINT /api/usuarios/estadisticas/")
print("=" * 60)

# Test GET /api/usuarios/
print("\n1. GET /api/usuarios/")
response = client.get('/api/usuarios/')
print(f"Status: {response.status_code}")
print(f"Data: {json.dumps(response.json(), indent=2, ensure_ascii=False, default=str)}")

# Test GET /api/usuarios/estadisticas/
print("\n2. GET /api/usuarios/estadisticas/")
response = client.get('/api/usuarios/estadisticas/')
print(f"Status: {response.status_code}")
print(f"Data: {json.dumps(response.json(), indent=2, ensure_ascii=False, default=str)}")

print("\n" + "=" * 60)
