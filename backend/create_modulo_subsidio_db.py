#!/usr/bin/env python
"""Script para recrear la BD Modulo_subsidio con mejor configuración"""

import psycopg2
from psycopg2 import sql

conn = psycopg2.connect(
    user="postgres",
    password="admin",
    host="localhost",
    port="5432",
    database="postgres"
)

conn.autocommit = True
cursor = conn.cursor()

try:
    # Eliminar BD anterior si existe
    print("🗑️  Eliminando BD antigua (si existe)...")
    cursor.execute("DROP DATABASE IF EXISTS Modulo_subsidio;")
    print("✅ BD antigua eliminada")
    
    # Crear la BD nueva con encoding UTF8
    print("\n🔨 Creando base de datos Modulo_subsidio...")
    cursor.execute("""
        CREATE DATABASE "Modulo_subsidio" 
        ENCODING 'UTF8'
        TEMPLATE template0;
    """)
    print("✅ Base de datos 'Modulo_subsidio' creada exitosamente")
    
    # Listar todas las BDs
    cursor.execute("""
        SELECT datname FROM pg_database 
        WHERE datistemplate = false 
        ORDER BY datname;
    """)
    
    print("\n📋 Bases de datos disponibles:")
    for row in cursor.fetchall():
        db_name = row[0]
        marker = "🆕" if db_name == "Modulo_subsidio" else "  "
        print(f"{marker} {db_name}")
    
except psycopg2.Error as e:
    print(f"❌ Error: {e}")

finally:
    cursor.close()
    conn.close()
