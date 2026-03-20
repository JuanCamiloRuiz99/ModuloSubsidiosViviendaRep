#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

cursor = connection.cursor()
cursor.execute("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'usuarios_sistema' ORDER BY ordinal_position")
cols = cursor.fetchall()

print('\n=== Estructura de tabla usuarios_sistema ===')
for col in cols:
    print(f'{col[0]:30} | nullable={col[1]:5} | type={col[2]}')

print('\n=== Verificando si numero_documento existe ===')
numero_doc_exists = any(col[0] == 'numero_documento' for col in cols)
print(f'numero_documento existe: {numero_doc_exists}')
