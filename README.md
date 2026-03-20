# Sistema Integral de Gestión de Subsidios de Vivienda

## Descripción General

Sistema completo desarrollado con arquitectura **Hexagonal** que permite gestionar de forma integral:
- ✅ **Programas de Subsidios** - Crear y mantener programas de vivienda
- ✅ **Postulantes/Beneficiarios** - Administrar solicitudes de subsidios
- ✅ **Visitas Técnicas** - Realizar y registrar inspecciones de vivienda
- ✅ **Usuarios del Sistema** - Gestión de administradores y funcionarios
- ✅ **Auditoría** - Registro completo de todas las operaciones

## 📦 Stack Tecnológico

### Backend
- **Python** con **Django** y **Django REST Framework**
- **Arquitectura Hexagonal** con capas: Domain → Application → Infrastructure
- **PostgreSQL/MySQL** para persistencia de datos

### Frontend
- **React 18** con **TypeScript 5.0**
- **Vite** como bundler (dev: localhost:5173)
- **Redux Toolkit** para state management
- **TanStack React Query** para async state
- **Radix UI** para componentes UI
- **React Router v7** para navegación

---

## 🚀 Inicio Rápido

### Backend

```bash
# 1. Navegar a backend
cd backend

# 2. Instalar dependencias
pip install -r requirements.txt

# 3. Crear base de datos
python create_db.py

# 4. Aplicar migraciones
python manage.py migrate

# 5. Crear superusuario
python manage.py createsuperuser

# 6. Iniciar servidor
python manage.py runserver
```

**API disponible en**: http://localhost:8000/api/

### Frontend

```bash
# 1. Navegar a frontend
cd frontend

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo
npm run dev
```

**Aplicación disponible en**: http://localhost:5173

---

## 📁 Estructura del Proyecto

```
ModuloSubsidiosViviendaRep/
├── backend/
│   ├── domain/                    # Capa de Dominio
│   │   ├── usuarios/
│   │   ├── programas/
│   │   ├── postulantes/
│   │   ├── visitas/
│   │   └── auditoria/
│   │
│   ├── application/               # Capa de Aplicación
│   │   ├── usuarios/
│   │   ├── programas/
│   │   └── ...
│   │
│   ├── infrastructure/            # Capa de Infraestructura
│   │   ├── database/
│   │   ├── repositories/
│   │   └── external_services/
│   │
│   ├── presentation/              # Capa de Presentación (API)
│   │   ├── views/
│   │   └── serializers/
│   │
│   ├── config/                    # Configuración Django
│   ├── manage.py
│   ├── requirements.txt
│   └── API_ENDPOINTS.md
│
├── frontend/
│   ├── src/
│   │   ├── domain/               # Lógica de dominio
│   │   ├── application/          # Casos de uso
│   │   ├── infrastructure/       # Conexión con APIs
│   │   ├── presentation/         # Componentes React
│   │   ├── shared/               # Utilidades compartidas
│   │   ├── app/                  # Redux store
│   │   └── assets/
│   │
│   ├── public/
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
│
└── [Documentación]
    ├── README.md (este archivo)
    ├── USUARIOS_MODULE_README.md         # 📚 Documentación módulo Usuarios
    ├── USUARIOS_API.md                    # 🔌 API REST de Usuarios
    ├── ESTRUCTURA_BACKEND.md
    ├── HEXAGONAL_SETUP.md
    └── ...
```

---

## 📖 Módulos Disponibles

### 1. **Módulo de Usuarios** ✅ COMPLETADO

**Propósito**: Gestión integral de usuarios del sistema

**Características**:
- ✓ crear, obtener, listar, actualizar usuarios
- ✓ Cambio de contraseñas
- ✓ Filtrado por rol y estado
- ✓ Paginación
- ✓ Estadísticas de usuarios
- ✓ Audit trail completo

**Documentación**:
- 📚 [Módulo Completo](./backend/USUARIOS_MODULE_README.md)
- 🔌 [API REST](./backend/USUARIOS_API.md)
- 🧪 [Tests](./backend/usuarios_tests.py)

**Endpoints**:
```
GET   /api/usuarios/                          # Listar usuarios
POST  /api/usuarios/                          # Crear usuario
GET   /api/usuarios/{id}/                     # Obtener usuario
PATCH /api/usuarios/{id}/                     # Actualizar usuario
DELETE /api/usuarios/{id}/                    # Eliminar usuario
POST  /api/usuarios/{id}/cambiar-contraseña/  # Cambiar contraseña
GET   /api/usuarios/estadisticas/             # Estadísticas
```

**Roles Disponibles**:
- `ADMIN` - Administrador del sistema
- `FUNCIONARIO` - Empleado municipal
- `VISITADOR_TECNICO` - Inspector técnico

---

### 2. **Módulo de Programas de Subsidios**

**Propósito**: Administración de programas de subsidios de vivienda

**Endpoints**: `/api/programas/`

---

### 3. **Módulo de Postulantes/Beneficiarios**

**Propósito**: Gestión de solicitudes de subsidios

**Endpoints**: `/api/postulantes/`

---

### 4. **Módulo de Visitas Técnicas**

**Propósito**: Registro de inspecciones y visitas técnicas

**Endpoints**: `/api/visitas/`

---

### 5. **Módulo de Auditoría**

**Propósito**: Registro de todas las operaciones del sistema

**Endpoints**: `/api/auditoria/`

---

## 🏗️ Arquitectura Hexagonal

Todos los módulos siguen el patrón Hexagonal con 3 capas claramente definidas:

### Capa de Dominio
- Lógica de negocio pura
- Entidades con métodos de negocio
- Value Objects para validación
- Interfaces de repositorios

### Capa de Aplicación
- Casos de uso (Use Cases)
- DTOs de entrada/salida
- Servicios de aplicación
- Orquestación de lógica

### Capa de Infraestructura
- Implementaciones de repositorios
- Modelos ORM (Django)
- Migraciones de BD
- Servicios externos

---

## 🔐 Seguridad

- ✅ Autenticación basada en tokens
- ✅ Validación en 3 niveles (REST, Aplicación, Dominio)
- ✅ Hasheo de contraseñas
- ✅ CORS configurado
- ✅ Eliminación lógica (no física)
- ✅ Audit trail completo
- ✅ FK con ON DELETE SET NULL

---

## 🗄️ Base de Datos

### Tabla: usuarios_sistema

```sql
CREATE TABLE usuarios_sistema (
    id_usuario SERIAL PRIMARY KEY,
    nombre_completo VARCHAR(200) NOT NULL,
    correo VARCHAR(200) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20),
    activo BOOLEAN DEFAULT TRUE,
    activo_logico BOOLEAN DEFAULT TRUE,
    usuario_creacion INT REFERENCES usuarios_sistema(id_usuario),
    usuario_modificacion INT REFERENCES usuarios_sistema(id_usuario),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_modificacion TIMESTAMP NULL
);
```

---

## 🛠️ Configuración

### Variables de Entorno (.env)

```
# Django
DEBUG=True
SECRET_KEY=your-secret-key-here
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_ENGINE=django.db.backends.postgresql
DB_NAME=subsidios_vivienda
DB_USER=postgres
DB_PASSWORD=your-password
DB_HOST=localhost
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

---

## 📊 Estadísticas del Proyecto

| Aspecto | Valor |
|--------|-------|
| Módulos Backend | 5 |
| Módulos Frontend | 5 |
| Archivos Backend | 50+ |
| Archivos Frontend | 80+ |
| Líneas de Código | 15,000+ |
| Casos de Uso | 35+ |
| Endpoints API | 50+ |
| Value Objects | 15+ |

---

## 🧪 Testing

### Ejecutar Tests Backend

```bash
cd backend
pytest usuarios_tests.py -v              # Tests de usuarios
pytest programas_tests.py -v             # Tests de programas
pytest -v                                # Todos los tests
pytest --cov=.                           # Con cobertura
```

### Testing API REST

```bash
# Crear usuario
curl -X POST http://localhost:8000/api/usuarios/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"nombre_completo":"Juan García","correo":"juan@example.com","password_hash":"bcrypt...","rol":"FUNCIONARIO"}'

# Listar usuarios
curl http://localhost:8000/api/usuarios/ \
  -H "Authorization: Bearer <token>"

# Obtener usuario
curl http://localhost:8000/api/usuarios/1/ \
  -H "Authorization: Bearer <token>"
```

---

## 📝 Documentación Detallada

| Documento | Descripción |
|-----------|-------------|
| [USUARIOS_MODULE_README.md](./backend/USUARIOS_MODULE_README.md) | Documentación completa del módulo de usuarios |
| [USUARIOS_API.md](./backend/USUARIOS_API.md) | Especificación de endpoints REST |
| [ESTRUCTURA_BACKEND.md](./backend/ESTRUCTURA_BACKEND.md) | Estructura general del backend |
| [HEXAGONAL_SETUP.md](./backend/HEXAGONAL_SETUP.md) | Patrón Hexagonal implementado |
| [API_ENDPOINTS.md](./backend/API_ENDPOINTS.md) | Todos los endpoints |

---

## 🚦 Estado del Proyecto

| Componente | Estado | Completitud |
|-----------|--------|------------|
| Backend Infrastructure | ✅ Completo | 100% |
| Backend Usuarios | ✅ Completo | 100% |
| Backend Programas | ✅ Completo | 100% |
| Backend Postulantes | ✅ Completo | 100% |
| Backend Visitas | ✅ Completo | 100% |
| Backend Auditoria | ✅ Completo | 100% |
| Frontend Setup | ✅ Completo | 100% |
| Frontend Usuarios | ⏳ En progreso | 30% |
| Frontend Componentes UI | ⏳ Pendiente | 0% |
| Pruebas E2E | ⏳ Pendiente | 0% |
| Deploy | ⏳ Pendiente | 0% |

---

## 🔄 Flujo de Desarrollo

1. **Backend First**: Endpoints HTTP listos ✅
2. **Frontend DTOs**: Estructuras de datos en TypeScript
3. **Custom Hooks**: Lógica de aplicación en React
4. **Componentes UI**: Interfaz usuario
5. **Integración**: Conexión Frontend ↔ Backend
6. **Testing**: Unit tests + Integration tests
7. **Deploy**: Producción

---

## ✨ Próximas Funcionalidades

- [ ] Frontend Usuarios completo (componentes React)
- [ ] Integración Frontend ↔ Backend
- [ ] Búsqueda avanzada en usuarios
- [ ] Exportación a Excel
- [ ] Dashboard de estadísticas
- [ ] Notificaciones por email
- [ ] Sistema de permisos granulares
- [ ] Versioning de API
- [ ] Documentación OpenAPI/Swagger
- [ ] Dockerización

---

## 👥 Roles de Usuario

El sistema implementa 3 roles con diferentes niveles de acceso:

```
┌─────────────────────────────────────────────────────────┐
│ ADMIN (Administrador)                                    │
├─────────────────────────────────────────────────────────┤
│ ✓ Crear/editar/eliminar usuarios                        │
│ ✓ Crear/editar/eliminar programas                       │
│ ✓ Ver reportes y estadísticas                           │
│ ✓ Configurar sistema                                    │
│ ✓ Acceso a auditoría completa                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ FUNCIONARIO (Empleado Municipal)                         │
├─────────────────────────────────────────────────────────┤
│ ✓ Crear/editar postulantes                              │
│ ✓ Realizar trámites de subsidios                       │
│ ✓ Ver historial de actividades                         │
│ ✗ No puede gestionar usuarios                          │
│ ✗ No puede configurar sistema                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ VISITADOR_TECNICO (Inspector Técnico)                    │
├─────────────────────────────────────────────────────────┤
│ ✓ Realizar visitas técnicas                             │
│ ✓ Registrar inspecciones                                │
│ ✓ Ver antecedentes de viviendas                        │
│ ✗ No puede eliminar datos                              │
│ ✗ No puede crear usuarios                              │
└─────────────────────────────────────────────────────────┘
```

---

## 📞 Soporte

Para más información o reportar problemas:
- 📧 Email: soporte@alcaldia.gov.mx
- 📱 Teléfono: +xx (xxx) xxx-xxxx
- 🐛 Issues: [GitHub Issues](https://github.com/alcaldia/subsidios-vivienda/issues)

---

## 📄 Licencia

Este proyecto está bajo licencia privada de la Alcaldía. Todos los derechos reservados.

---

**Última actualización**: Enero 2024
**Versión**: 1.0.0
**Desarrollador**: Sistema de Gestión de Subsidios

