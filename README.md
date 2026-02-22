# Módulo de Subsidios de Vivienda

Sistema de gestión de programas de subsidios de vivienda para la Alcaldía de Popayán.

## 🏗️ Arquitectura

El proyecto sigue una **arquitectura hexagonal (puertos y adaptadores)** con separación clara entre:
- **Domain**: Lógica de negocio (entidades y reglas)
- **Application**: Casos de uso (orquestación)
- **Infrastructure**: Acceso a datos, APIs externas
- **Presentation**: Interfaces de usuario

## 🚀 Setup Rápido

### Backend
```bash
cd backend
pip install -r requirements.txt
python manage.py runserver
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📁 Estructura del Proyecto

```
├── backend/
│   ├── domain/           # Lógica de negocio
│   ├── application/      # Casos de uso
│   ├── infrastructure/   # BD, APIs externas
│   ├── presentation/     # Serializers y ViewSets
│   └── manage.py
├── frontend/
│   ├── src/
│   │   ├── domain/       # Tipos y entidades
│   │   ├── infraestructure/  # APIs, hooks
│   │   └── presentation/ # Componentes y páginas
│   └── package.json
└── README.md
```

## 🔑 Características Principales

- ✅ Gestión de programas de subsidios
- ✅ Gestión de usuarios (administradores, funcionarios)
- ✅ Gestión de etapas y postulaciones
- ✅ Interfaz responsiva con React + Vite
- ✅ API REST completa con Django

## 👥 Roles del Sistema

- **Administrador**: Control total del sistema
- **Funcionario**: Gestión de postulantes y programas
- **Ciudadano/Visitante**: Consulta de programas disponibles

## 📦 Dependencias Principales

### Backend
- Django REST Framework
- PostgreSQL
- Python 3.10+

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- Radix UI (componentes accesibles)
- TanStack Query (gestión de estado)

## 🧪 Testing & Desarrollo

### Utilidades de debugging
- `backend/create_db.py` - Setup inicial de base de datos
- `backend/diagnose_usuarios.py` - Herramienta de diagnóstico

## 📝 Instrucciones Adicionales

Ver `instrucciones.md` para guías específicas de desarrollo.

## 📄 Licencia

Este proyecto es propiedad de la Alcaldía de Popayán.

