"""Check columns in Django's database (Modulo_subsidio)"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

cursor = connection.cursor()

print('=== DB actual de Django ===')
cursor.execute('SELECT current_database()')
print(' ', cursor.fetchone()[0])

print('\n=== Columnas programas_etapa ===')
cursor.execute(
    "SELECT column_name, is_nullable, data_type "
    "FROM information_schema.columns "
    "WHERE table_name = 'programas_etapa' "
    "ORDER BY ordinal_position"
)
rows = cursor.fetchall()
if rows:
    for r in rows:
        print(f"  {r[0]:30s} | {r[1]:3s} | {r[2]}")
else:
    print("  (tabla no encontrada)")

print('\n=== Ghost migrations ===')
cursor.execute(
    "SELECT name FROM django_migrations WHERE app='database' ORDER BY id"
)
for r in cursor.fetchall():
    print(f"  {r[0]}")
