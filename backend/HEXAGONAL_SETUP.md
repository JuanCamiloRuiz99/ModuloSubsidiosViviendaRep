# Guía de Setup del Backend con Arquitectura Hexagonal

## 🏗️ Estructura del Backend

El backend está organizado siguiendo la arquitectura hexagonal con las siguientes capas:

```
backend/
├── config/                      # Configuración de Django
│   ├── settings.py             # Configuración principal
│   ├── urls.py                 # Rutas principales
│   ├── asgi.py                 # ASGI configuration
│   └── wsgi.py                 # WSGI configuration
│
├── domain/                      # Capa de Dominio (lógica de negocio pura)
│   ├── programas/
│   │   └── programa.py         # Entidad Programa
│   ├── etapas/
│   └── postulantes/
│
├── application/                 # Capa de Aplicación (casos de uso)
│   ├── programas/
│   ├── etapas/
│   └── postulantes/
│
├── infrastructure/              # Capa de Infraestructura (implementación técnica)
│   ├── database/
│   │   ├── models.py           # Modelos ORM de Django
│   │   ├── admin.py            # Configuración de admin
│   │   ├── repositories/       # Patrón Repository
│   │   └── migrations/         # Migraciones de BD
│   └── external_services/      # Servicios externos
│
├── presentation/                # Capa de Presentación (API REST)
│   ├── serializers/            # Serializadores DRF
│   └── views/                  # ViewSets de DRF
│
└── shared/                      # Código compartido
    ├── exceptions.py           # Excepciones personalizadas
    └── validators.py           # Validadores
```

## 📋 Requisitos Previos

- Python 3.10+
- PostgreSQL 12+
- pip

## 🚀 Instalación y Setup

### 1. Crear archivo .env

Copiar el archivo `.env.example` a `.env` y configurar las variables de entorno:

```bash
cp .env.example .env
```

Editar `.env` con la configuración de PostgreSQL local:
```env
DB_NAME=SubsidiosViviendaAlcaldiaPopayan
DB_USER=postgres
DB_PASSWORD=tu_contraseña
DB_HOST=localhost
DB_PORT=5432
```

### 2. Instalar dependencias

```bash
pip install -r requirements.txt
```

### 3. Crear la base de datos PostgreSQL

```bash
# Con psql o tu cliente PostgreSQL preferido
CREATE DATABASE SubsidiosViviendaAlcaldiaPopayan;
```

### 4. Ejecutar migraciones

```bash
python manage.py migrate
```

### 5. Crear superusuario (opcional)

```bash
python manage.py createsuperuser
```

### 6. Iniciar servidor de desarrollo

```bash
python manage.py runserver
```

El servidor estará disponible en: `http://localhost:8000`

## 📚 Endpoints Principales

### Programas

- `GET /api/programas/` - Listar todos los programas
- `POST /api/programas/` - Crear nuevo programa
- `GET /api/programas/{id}/` - Obtener detalle de programa
- `PUT /api/programas/{id}/` - Actualizar programa
- `DELETE /api/programas/{id}/` - Eliminar programa
- `POST /api/programas/{id}/cambiar_estado/` - Cambiar estado del programa
- `GET /api/programas/estadisticas/` - Obtener estadísticas

### Admin

- `http://localhost:8000/admin/` - Panel de administración de Django

## 🏛️ Principios de Arquitectura Hexagonal

### Capa de Dominio
- Contiene la lógica de negocio pura
- No tiene dependencias de frameworks
- Definen las reglas de negocio

### Capa de Aplicación
- Implementa los casos de uso
- Orquesta las operaciones de dominio
- No tiene dependencias de frameworks web

### Capa de Infraestructura
- Implementación técnica (BD, servicios externos)
- Implementa el patrón Repository
- Adaptadores para bases de datos

### Capa de Presentación
- Controladores REST (ViewSets de DRF)
- Serializadores para transformar datos
- Manejadores de requests/responses HTTP

## 🔌 Integración con Frontend

El frontend se conecta a través de la API REST en `http://localhost:8000/api/`

Asegúrate de que `CORS_ALLOWED_ORIGINS` en `settings.py` incluya el puerto del frontend (por defecto 5173 para Vite).

## 📝 Variables de Entorno Importantes

- `DEBUG` - Modo debug (False en producción)
- `SECRET_KEY` - Clave secreta de Django
- `DB_*` - Credenciales de PostgreSQL
- `CORS_ALLOWED_ORIGINS` - Orígenes permitidos para CORS

## 🐛 Troubleshooting

### Conexión a PostgreSQL fallida
- Asegurar que PostgreSQL está corriendo
- Verificar credenciales en `.env`
- Verificar que la base de datos existe

### Migración fallida
- Ejecutar: `python manage.py makemigrations`
- Luego: `python manage.py migrate`

### Módulos no encontrados
- Ejecutar: `pip install -r requirements.txt`
- Verificar que estás en el directorio correcto (backend/)
