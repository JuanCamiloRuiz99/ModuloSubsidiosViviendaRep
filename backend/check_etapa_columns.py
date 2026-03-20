"""Script para ver las columnas de programas_etapa"""
import psycopg2

conn = psycopg2.connect(
    dbname='SubsidiosViviendaAlcaldiaPopayan',
    user='postgres',
    password='admin',
    host='localhost',
    port=5432
)
cur = conn.cursor()

# Ver columnas de programas_etapa
cur.execute("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name = 'programas_etapa' ORDER BY ordinal_position")
rows = cur.fetchall()
if rows:
    print("=== Columnas de programas_etapa ===")
    for r in rows:
        print(f"  {r[0]:30s} | nullable={r[1]:3s} | {r[2]}")
else:
    print("Tabla programas_etapa NO existe o no tiene columnas")

# Ver si etapas_proceso existe
cur.execute("SELECT column_name FROM information_schema.columns WHERE table_name = 'etapas_proceso' ORDER BY ordinal_position")
rows2 = cur.fetchall()
if rows2:
    print("\n=== Columnas de etapas_proceso ===")
    for r in rows2:
        print(f"  {r[0]}")
else:
    print("\nTabla etapas_proceso no existe aún")

conn.close()
