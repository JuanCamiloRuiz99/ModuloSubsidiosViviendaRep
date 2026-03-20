"""Inspección completa de la DB incluyendo todas las entradas de django_migrations"""
import psycopg2

conn = psycopg2.connect(
    dbname='SubsidiosViviendaAlcaldiaPopayan',
    user='postgres',
    password='admin',
    host='localhost',
    port=5432
)
cur = conn.cursor()

print("=== TODAS las entradas en django_migrations ===")
cur.execute("SELECT app, name FROM django_migrations ORDER BY app, id")
for r in cur.fetchall():
    print(f"  {r[0]:20s} | {r[1]}")

print("\n=== Columnas de programas_campo_etapa ===")
cur.execute("SELECT column_name, is_nullable, data_type FROM information_schema.columns WHERE table_name='programas_campo_etapa' ORDER BY ordinal_position")
rows = cur.fetchall()
if rows:
    for r in rows:
        print(f"  {r[0]:30s} | {r[1]:3s} | {r[2]}")
else:
    print("  (tabla no existe)")

print("\n=== Constraints en programas_etapa ===")
cur.execute("""
SELECT conname, contype FROM pg_constraint c
JOIN pg_class t ON c.conrelid = t.oid
WHERE t.relname = 'programas_etapa'
""")
for r in cur.fetchall():
    print(f"  {r[0]:60s} | tipo={r[1]}")

conn.close()
