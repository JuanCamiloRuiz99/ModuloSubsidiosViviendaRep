# Backend - Estructura del Módulo Programas

## 📋 Resumen

He estructurado completamente el backend para el módulo "Gestionar Programas" con:

### ✅ 1. Modelo Programa (models.py)
```python
class Programa:
    - id: Integer (PK)
    - nombre: String(255)
    - descripcion: Text
    - entidad_responsable: String(255)
    - codigo_programa: String(20) [ÚNICO, Auto-generado]
    - estado: Choice(BORRADOR, ACTIVO, INHABILITADO)
    - fecha_creacion: DateTime (Auto)
    - fecha_actualizacion: DateTime (Auto)
```

**Características:**
- Código auto-generado: `2026BS1A2B`
- Estados predefinidos
- Timestamps automáticos
- Búsqueda y filtrado habilitados
- Meta order: por fecha_creacion DESC

---

### ✅ 2. Serializer (serializers.py)
**ProgramaSerializer** con validaciones:
- ✓ Nombre: min 3 caracteres
- ✓ Descripción: min 10 caracteres
- ✓ Entidad responsable: requerida
- ✓ Campos read-only: codigo_programa, fecha_creacion, fecha_actualizacion

---

### ✅ 3. ViewSet (views.py)
**ProgramaViewSet** - ModelViewSet con acciones personalizadas:

#### CRUD Estándar:
- `GET /api/programas/` - Listar programas
- `POST /api/programas/` - Crear programa
- `GET /api/programas/{id}/` - Obtener programa
- `PATCH /api/programas/{id}/` - Actualizar programa
- `DELETE /api/programas/{id}/` - Eliminar programa

#### Acciones Personalizadas:
1. **cambiar_estado** `POST /api/programas/{id}/cambiar_estado/`
   - Cambiar estado (BORRADOR → ACTIVO → INHABILITADO)
   - Validaciones incluidas

2. **estadisticas** `GET /api/programas/estadisticas/`
   - Total de programas
   - Conteo por estado

#### Filtros:
- Por estado: `?estado=ACTIVO`

---

### ✅ 4. Admin Django (admin.py)
**ProgramaAdmin** con:
- List display: nombre, codigo, estado, entidad, fecha
- Filtros: estado, fecha_creacion, entidad
- Búsqueda: nombre, codigo, descripción
- Campos readonly: codigo_programa, fechas
- Fieldsets organizados
- Protección: Nombre no editable después de crear

---

### ✅ 5. Rutas (urls.py)
```python
router = DefaultRouter()
router.register(r'programas', ProgramaViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]
```

Todos los endpoints automáticos + custom actions

---

### ✅ 6. Migraciones
- `0001_initial.py` - Migración original
- `0002_update_programa.py` - Agregó campos faltantes

---

## 🚀 Próximos Pasos

### Para ejecutar:
```bash
# 1. Ir a backend
cd backend

# 2. Aplicar migraciones
python manage.py migrate

# 3. Crear admin (opcional)
python manage.py createsuperuser

# 4. Ejecutar servidor
python manage.py runserver
```

### URLs disponibles:
```
http://localhost:8000/admin/            # Django Admin
http://localhost:8000/api/programas/    # API REST
```

---

## 📝 Documentación

Ver `API_ENDPOINTS.md` para detalles completos de todos los endpoints con ejemplos.

---

## 🔗 Integración Frontend

El frontend ahora puede conectarse directamente a los endpoints:

```typescript
// Listar programas
GET /api/programas/

// Crear programa
POST /api/programas/
{ nombre, descripcion, entidad_responsable }

// Cambiar estado
POST /api/programas/{id}/cambiar_estado/
{ nuevo_estado: "ACTIVO" }

// Estadísticas
GET /api/programas/estadisticas/
```

¡Listo para integración! 🎉
