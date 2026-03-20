"""Inspeccionar estado real de la DB"""
import psycopg2

conn = psycopg2.connect(
    dbname='SubsidiosViviendaAlcaldiaPopayan',
    user='postgres',
    password='admin',
    host='localhost',
    port=5432
)
cur = conn.cursor()

print("=== django_migrations para 'database' ===")
cur.execute("SELECT app, name, applied FROM django_migrations WHERE app='database' ORDER BY applied")
for r in cur.fetchall():
    print(f"  {r[0]}.{r[1]:50s} applied={r[2]}")

print("\n=== Todas las tablas con 'etapa' en el nombre ===")
cur.execute("SELECT table_name FROM information_schema.tables WHERE table_name LIKE '%etapa%' OR table_name LIKE '%etapas%'")
for r in cur.fetchall():
    print(f"  {r[0]}")

print("\n=== Columnas de programas_etapa ===")
cur.execute("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='programas_etapa' ORDER BY ordinal_position")
for r in cur.fetchall():
    print(f"  {r[0]:30s} | {r[1]:3s} | {r[2]}")

conn.close()
