#!/usr/bin/env python
# -*- coding: utf-8 -*-
import psycopg
import sys
import os

os.environ['PGCLIENTENCODING'] = 'UTF8'

try:
    print("Creando base de datos 'SubsidiosViviendaAlcaldiaPopayan'...")
    conn = psycopg.connect(
        dbname="postgres",
        user="postgres",
        password="admin",
        host="localhost",
        port="5432"
    )
    # Set autocommit para poder crear base de datos
    conn.autocommit = True
    cursor = conn.cursor()
    
    # Check if database exists
    cursor.execute("SELECT 1 FROM pg_database WHERE datname='SubsidiosViviendaAlcaldiaPopayan'")
    exists = cursor.fetchone()
    
    if exists:
        print("Base de datos ya existe.")
    else:
        cursor.execute("CREATE DATABASE \"SubsidiosViviendaAlcaldiaPopayan\" ENCODING 'UTF8'")
        print("Base de datos creada exitosamente!")
    
    cursor.close()
    conn.close()
    sys.exit(0)
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
