#!/usr/bin/env python
"""
Script para inicializar la estructura de roles en la BD
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.db import connection

# SQL para crear tablas e insertar roles
sql_script = """
-- Crear tabla roles si no existe
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NULL
);

-- Crear tabla usuarios_sistema si no existe
CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    correo VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL DEFAULT 2,
    creado_por INTEGER NULL REFERENCES usuarios_sistema(id_usuario) ON DELETE SET NULL,
    usuario_modificacion INTEGER NULL REFERENCES usuarios_sistema(id_usuario) ON DELETE SET NULL,
    usuario_eliminacion INTEGER NULL REFERENCES usuarios_sistema(id_usuario) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP NULL,
    fecha_eliminacion TIMESTAMP NULL,
    activo BOOLEAN DEFAULT TRUE,
    activo_logico BOOLEAN DEFAULT TRUE
);

-- Insertar roles iniciales
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('ADMIN', 'Administrador del sistema'),
('FUNCIONARIO', 'Funcionario'),
('TECNICO_VISITANTE', 'Técnico Visitante')
ON CONFLICT (nombre_rol) DO NOTHING;

-- Crear índices
CREATE INDEX IF NOT EXISTS idx_usuarios_correo ON usuarios_sistema(correo);
CREATE INDEX IF NOT EXISTS idx_usuarios_id_rol ON usuarios_sistema(id_rol);
CREATE INDEX IF NOT EXISTS idx_usuarios_activo ON usuarios_sistema(activo);
CREATE INDEX IF NOT EXISTS idx_usuarios_id_rol_activo ON usuarios_sistema(id_rol, activo);

-- Agregar constraint FK si no existe
ALTER TABLE usuarios_sistema
ADD CONSTRAINT fk_usuarios_id_rol FOREIGN KEY (id_rol) REFERENCES roles(id_rol) ON DELETE RESTRICT;
"""

try:
    with connection.cursor() as cursor:
        # Ejecutar script SQL
        statements = [s.strip() for s in sql_script.split(';') if s.strip()]
        for stmt in statements:
            print(f"Ejecutando: {stmt[:60]}...")
            cursor.execute(stmt)
        
        # Commit los cambios
        connection.commit()
        print("✓ Base de datos inicializada exitosamente")
        
except Exception as e:
    print(f"✗ Error: {str(e)}")
    import traceback
    traceback.print_exc()
