#!/usr/bin/env python
"""Script para verificar y listar todas las bases de datos en PostgreSQL"""

import psycopg2

conn = psycopg2.connect(
    user="postgres",
    password="admin",
    host="localhost",
    port="5432",
    database="postgres"
)

cursor = conn.cursor()

try:
    # Listar todas las BDs
    cursor.execute("""
        SELECT datname, pg_database.datdba, pg_user.usename
        FROM pg_database
        JOIN pg_user ON pg_database.datdba = pg_user.usesysid
        WHERE datistemplate = FALSE
        ORDER BY datname;
    """)
    
    print("\n" + "="*70)
    print("📋 TODAS LAS BASES DE DATOS DISPONIBLES EN POSTGRESQL")
    print("="*70)
    
    databases = cursor.fetchall()
    
    for db_name, dba_id, owner in databases:
        print(f"\n🗄️  {db_name}")
        print(f"   Owner: {owner}")
        print(f"   OID: {dba_id}")
    
    print("\n" + "="*70)
    print(f"Total de bases de datos: {len(databases)}")
    print("="*70 + "\n")
    
    # Verificar si Modulo_subsidio existe específicamente
    cursor.execute("""
        SELECT datname FROM pg_database 
        WHERE datname = 'Modulo_subsidio';
    """)
    
    result = cursor.fetchone()
    if result:
        print(f"✅ BD 'Modulo_subsidio' EXISTE en PostgreSQL")
        print(f"   Host: localhost")
        print(f"   Port: 5432")
        print(f"   Usuario: postgres")
    else:
        print(f"❌ BD 'Modulo_subsidio' NO ENCONTRADA")
    
except psycopg2.Error as e:
    print(f"❌ Error: {e}")

finally:
    cursor.close()
    conn.close()
