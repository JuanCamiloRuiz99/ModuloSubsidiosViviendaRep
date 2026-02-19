#!/usr/bin/env python
# -*- coding: utf-8 -*-
import psycopg
import sys
import os

# Set proper encoding
os.environ['PGCLIENTENCODING'] = 'UTF8'

try:
    print("Intentando conectar a PostgreSQL...")
    conn = psycopg.connect(
        dbname="postgres",
        user="postgres",
        password="admin",
        host="localhost",
        port="5432"
    )
    cursor = conn.cursor()
    cursor.execute("SELECT datname FROM pg_database WHERE datistemplate = false;")
    databases = cursor.fetchall()
    print("Bases de datos existentes:")
    for db in databases:
        print(f"  - {db[0]}")
    cursor.close()
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
