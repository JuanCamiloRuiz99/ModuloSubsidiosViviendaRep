"""Check the new etapas_proceso table"""
import os
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
import django
django.setup()
from django.db import connection

cursor = connection.cursor()

print('=== Columnas etapas_proceso ===')
cursor.execute(
    "SELECT column_name, is_nullable, data_type "
    "FROM information_schema.columns "
    "WHERE table_name = 'etapas_proceso' "
    "ORDER BY ordinal_position"
)
rows = cursor.fetchall()
if rows:
    for r in rows:
        print(f"  {r[0]:30s} | {r[1]:3s} | {r[2]}")
else:
    print("  (tabla no encontrada)")
