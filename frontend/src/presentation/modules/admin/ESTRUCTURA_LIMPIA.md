# 📦 Documentación de la Estructura Limpia - Módulo Admin

## 📂 Estructura de Directorios

```
frontend/src/presentation/modules/admin/
├── components/                  # Componentes reutilizables
│   ├── index.ts                # ✅ Índice central de exportación
│   ├── ProgramDetails.tsx       # Lista de programas con filtros
│   ├── ProgramCard.tsx          # Tarjeta individual de programa
│   ├── ProgramCreationForm.tsx  # Formulario para crear programa
│   ├── StagesManagement.tsx     # Gestión de etapas
│   ├── StageCard.tsx            # Tarjeta de etapa
│   └── PostulantsTable.tsx      # Tabla de postulantes
│
├── pages/                       # Páginas del módulo
│   ├── index.ts                # ✅ Índice central de exportación
│   ├── DashboardAdminPage.tsx   # Dashboard principal
│   ├── ProgramasPage.tsx        # Página de gestión de programas
│   ├── CreateProgramPage.tsx    # Página para crear programa
│   ├── ProgramDetailsPage.tsx   # Detalles de un programa
│   └── PostulantsManagementPage.tsx # Gestión de postulantes
│
├── constants/                   # Constantes reutilizables
│   ├── index.ts                # ✅ Índice de exportación
│   └── programConstants.ts      # Constantes de programas
│
├── schemas/                     # Esquemas de validación (Zod)
│   └── programSchema.ts         # Validaciones para formularios
│
└── README.md                   # Esta documentación

frontend/src/infraestructure/
├── api/
│   ├── index.ts                # ✅ Índice central de exportación
│   ├── client.ts               # Cliente HTTP
│   └── programas.api.ts        # Servicios API para programas
│
└── hooks/
    ├── index.ts                # ✅ Índice central de exportación
    └── useProgramas.ts         # Hooks de TanStack Query
```

## 🔄 Flujo de Importaciones (Simplificado)

### ❌ ANTES (Complicado)
```tsx
import ProgramDetails from "../components/ProgramDetails";
import ProgramCard from "../components/ProgramCard";
import { useProgramas } from "../../../infraestructure/hooks/useProgramas";
import type { ProgramaResponse } from "../../../infraestructure/api/programas.api";
```

### ✅ AHORA (Limpio y Centralizado)
```tsx
import { ProgramDetails, ProgramCard } from "../components";
import { useProgramas } from "../../../infraestructure/hooks";
import type { ProgramaResponse } from "../../../infraestructure/api";
import { PROGRAMA_ESTADO_LABELS, RESPONSABLE_ENTITIES } from "../constants";
```

## 📋 Constantes Centralizadas

**Ubicación**: `constants/programConstants.ts`

### Estados disponibles
```typescript
PROGRAMA_ESTADOS = {
  BORRADOR: 'BORRADOR',
  ACTIVO: 'ACTIVO',
  INHABILITADO: 'INHABILITADO',
}
```

### Etiquetas de estado
```typescript
PROGRAMA_ESTADO_LABELS = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  INHABILITADO: 'Inhabilitado',
}
```

### Colores por estado
```typescript
PROGRAMA_ESTADO_COLORS = {
  BORRADOR: { borderColor, statusBgColor, statusColor, statusDot },
  ACTIVO: { borderColor, statusBgColor, statusColor, statusDot },
  INHABILITADO: { borderColor, statusBgColor, statusColor, statusDot },
}
```

### Entidades responsables
```typescript
RESPONSABLE_ENTITIES = [
  'Secretaría General',
  'Alcaldía de Popayán',
  'Secretaría de Desarrollo Social',
  'Secretaría de Hacienda',
  'Secretaría de Infraestructura',
]
```

## 🎯 Patrones de Uso

### Uso de Constantes en Componentes
```typescript
import { PROGRAMA_ESTADO_COLORS, PROGRAMA_ESTADO_LABELS } from "../constants";

const getStatusStyles = (status: string) => {
  return PROGRAMA_ESTADO_COLORS[status as keyof typeof PROGRAMA_ESTADO_COLORS];
};

const getStatusLabel = (status: string) => {
  return PROGRAMA_ESTADO_LABELS[status as keyof typeof PROGRAMA_ESTADO_LABELS];
};
```

### Uso de API y Hooks
```typescript
import { useProgramas, useChangeProgramState } from "../../../infraestructure/hooks";

function MyComponent() {
  const { data, isLoading } = useProgramas();
  const changeStateMutation = useChangeProgramState();
  
  // ... resto del componente
}
```

## 🔌 Conexión con Backend (API)

### Endpoints disponibles
- `GET /api/programas/` - Listar programas
- `POST /api/programas/` - Crear programa
- `GET /api/programas/{id}/` - Obtener programa
- `PUT /api/programas/{id}/` - Actualizar programa
- `DELETE /api/programas/{id}/` - Eliminar programa
- `POST /api/programas/{id}/cambiar_estado/` - Cambiar estado
- `GET /api/programas/estadisticas/` - Obtener estadísticas

### Estados HTTP
- ✅ 200 OK - Exitoso
- ✅ 201 Created - Recurso creado
- ❌ 400 Bad Request - Validación fallida
- ❌ 404 Not Found - Recurso no existe
- ❌ 500 Internal Server Error - Error del servidor

## 🧪 Componentes Refactorizados

### ProgramCreationForm.tsx
**Cambios**:
- ✅ Ahora conectado a API real (`useCreatePrograma`)
- ✅ Usa constantes centralizadas (`RESPONSABLE_ENTITIES`)
- ✅ Genera código automáticamente en el backend
- ✅ Estados de carga desde mutations

### ProgramDetails.tsx
**Cambios**:
- ✅ Usa constantes de colores (`PROGRAMA_ESTADO_COLORS`)
- ✅ Usa constantes de etiquetas (`PROGRAMA_ESTADO_LABELS`)
- ✅ Importaciones simplificadas

## ✨ Próximos Pasos

1. **Crear más módulos** siguiendo el mismo patrón
2. **Agregar validaciones** en backend si es necesario
3. **Implementar búsqueda** de programas
4. **Agregar paginación** en la lista
5. **Crear etapas** del programa
6. **Gestionar postulantes**

## 🐛 Resolución de Problemas

Si ves errores de importación después de esta refactorización:

1. **Recarga el servidor TypeScript**
   - Presiona: `Ctrl+Shift+P` > `TypeScript: Restart TS Server`

2. **Limpia la caché del navegador**
   - Abre DevTools: `F12`
   - Click derecho en refresh > `Empty cache and hard refresh`

3. **Reinicia el servidor Vite**
   - Presiona: `Ctrl+C` en terminal
   - Corre: `npm run dev`

## 📞 Referencia Rápida

| Tarea | Ubicación |
|-------|-----------|
| Agregar valor a estado | `programConstants.ts` |
| Crear página nueva | `pages/` + `pages/index.ts` |
| Crear componente nuevo | `components/` + `components/index.ts` |
| Crear hook nuevo | `hooks/` + `hooks/index.ts` |
| Crear servicio API nuevo | `api/` + `api/index.ts` |

---

**Última actualización**: 19 Febrero 2026  
**Responsable**: Equipo de Desarrollo
