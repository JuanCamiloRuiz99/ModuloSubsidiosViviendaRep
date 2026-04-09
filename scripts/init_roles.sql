-- Crear tabla roles
CREATE TABLE IF NOT EXISTS roles (
    id_rol SERIAL PRIMARY KEY,
    nombre_rol VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(150) NULL
);

-- Crear tabla usuarios_sistema
CREATE TABLE IF NOT EXISTS usuarios_sistema (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    correo VARCHAR(200) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    id_rol INTEGER NOT NULL REFERENCES roles(id_rol) ON DELETE PROTECT,
    creado_por INTEGER NULL REFERENCES usuarios_sistema(id_usuario) ON DELETE SET NULL,
    usuario_modificacion INTEGER NULL REFERENCES usuarios_sistema(id_usuario) ON DELETE SET NULL,
    usuario_eliminacion INTEGER NULL REFERENCES usuarios_sistema(id_usuario) ON DELETE SET NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion DATETIME NULL,
    fecha_eliminacion DATETIME NULL,
    activo BOOLEAN DEFAULT TRUE,
    activo_logico BOOLEAN DEFAULT TRUE
);

-- Crear índices
CREATE INDEX idx_usuarios_correo ON usuarios_sistema(correo);
CREATE INDEX idx_usuarios_id_rol ON usuarios_sistema(id_rol);
CREATE INDEX idx_usuarios_activo ON usuarios_sistema(activo);
CREATE INDEX idx_usuarios_id_rol_activo ON usuarios_sistema(id_rol, activo);

-- Insertar roles iniciales
INSERT INTO roles (nombre_rol, descripcion) VALUES 
('ADMIN', 'Administrador del sistema'),
('FUNCIONARIO', 'Funcionario'),
('TECNICO_VISITANTE', 'Técnico Visitante')
ON CONFLICT DO NOTHING;
