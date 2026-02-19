# 🔄 Integración Frontend-Backend | Gestión de Programas

## 📍 Estado Actual

✅ **Backend**: Arquitectura hexagonal completa con API REST  
✅ **Frontend**: Integrado con TanStack Query para fetch de datos  
✅ **Base de Datos**: PostgreSQL "SubsidiosViviendaAlcaldiaPopayan" (para todo el proyecto)  
✅ **CORS**: Configurado para desarrollo

---

## 🏗️ Arquitectura de Integración

### Backend (Django REST Framework)
```
config/settings.py          ← PostgreSQL, CORS configurado
├── API Base URL: /api/
├── Endpoint: /api/programas/
├── Métodos:
│   ├── GET    - Listar programas
│   ├── POST   - Crear programa
│   ├── GET    - Detalle programa
│   ├── PUT    - Actualizar programa
│   ├── DELETE - Eliminar programa
│   ├── POST   - /cambiar_estado/
│   └── GET    - /estadisticas/
```

### Frontend (React + TypeScript)
```
infraestructure/
├── api/
│   ├── client.ts                 ← Cliente HTTP base
│   └── programas.api.ts          ← Llamadas API específicas
├── hooks/
│   └── useProgramas.ts           ← Hooks TanStack Query

presentation/
├── modules/admin/components/
│   ├── ProgramDetails.tsx        ← USA: useProgramas(), useChangeProgramState()
│   └── ProgramCard.tsx
└── modules/admin/pages/
    └── ProgramDetailsPage.tsx    ← USA: usePrograma()
```

---

## 🚀 Setup Rápido

### 1. Backend - PostgreSQL Setup
```bash
# Crear base de datos
createdb GestionarProgramas

# En la carpeta backend/
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser  # Opcional
python manage.py runserver
```

**Backend disponible en**: `http://localhost:8000`  
**Admin en**: `http://localhost:8000/admin`

### 2. Frontend - Configuración
```bash
# En la carpeta frontend/
cp .env.example .env
npm install  # Si no está instalado
npm run dev
```

**Frontend disponible en**: `http://localhost:5173`

---

## 📡 Flujo de Datos

### Listar Programas (GET /api/programas/)
```
ProgramasPage
  └─ ProgramDetails (componente)
      └─ useProgramas()  [TanStack Query Hook]
          └─ getProgramas()  [API Service]
              └─ apiClient()  [HTTP Client]
                  └─ Backend API (/api/programas/)
                      └─ Returns: { results: [], count, next }
```

**Datos en tiempo real**: Recarga automática cada 5 minutos (staleTime)

### Cambiar Estado de Programa (POST /api/programas/{id}/cambiar_estado/)
```
ProgramDetails (componente)
  └─ handlePublish() / handleDisable()
      └─ changeStateMutation.mutate()  [TanStack Query Mutation]
          └─ cambiarEstadoPrograma()  [API Service]
              └─ apiClient()  [HTTP Client]
                  └─ Backend API
                      └─ Returns: { mensaje, programa: {...} }
                          └─ Invalida queries automáticamente
                              └─ Recarga lista de programas
```

---

## 🔑 Hooks Disponibles

### useQuery Hooks (GET solamente)
```typescript
// Listar programas con filtro opcional
const { data, isLoading, isError } = useProgramas(estado?, page?)

// Obtener un programa específico
const { data, isLoading, isError } = usePrograma(id)

// Obtener estadísticas
const { data } = useProgramasStatistics()
```

### useMutation Hooks (POST/PUT/DELETE)
```typescript
// Crear programa
const mutation = useCreatePrograma()
mutation.mutate({ nombre, descripcion, entidad_responsable })

// Actualizar programa (PUT)
const mutation = useUpdatePrograma(id)
mutation.mutate({ nombre, nueva_descripcion, ... })

// Actualización parcial (PATCH)
const mutation = usePartialUpdatePrograma(id)
mutation.mutate({ entidad_responsable })

// Eliminar programa
const mutation = useDeletePrograma()
mutation.mutate(id)

// Cambiar estado de programa ⭐ (Versión mejorada)
const mutation = useChangeProgramState()
mutation.mutate({ programId, nuevoEstado: 'ACTIVO' })
```

---

## 🎯 Componentes Conectados

### ✅ ProgramDetails.tsx
- **Hook**: `useProgramas()` - Carga lista de programas
- **Hook**: `useChangeProgramState()` - Publica/Inhabilita programas
- **Estados**: Cargando, Error, Sin resultados, Datos cargados
- **Filtros**: Por estado (ACTIVO, BORRADOR, INHABILITADO)
- **Acciones**: Ver detalles, publicar, inhabilitar

### ✅ ProgramDetailsPage.tsx
- **Hook**: `usePrograma(id)` - Carga programa por ID
- **Estados**: Cargando, Error, Datos cargados
- **Datos**: Nombre, descripción, estado
- **Componentes hijo**: StagesManagement

### ⚠️ ProgramCard.tsx
- Estado presentacional (recibe props)
- Renderiza información del programa
- Botones contextuales según estado

---

## 📝 Variables de Entorno

### Backend (.env)
```env
# database
DB_NAME=GestionarProgramas
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=localhost

# cors
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### Frontend (.env)
```env
# API Configuration (Vite)
VITE_API_URL=http://localhost:8000/api
```

---

## 🐛 Troubleshooting

### Error: "Failed to fetch from API"
1. ✅ Backend corriendo en `http://localhost:8000`
2. ✅ PostgreSQL conectado correctamente
3. ✅ CORS_ALLOWED_ORIGINS incluye `http://localhost:5173`

### Error: "Database doesn't exist"
```bash
createdb GestionarProgramas
python manage.py migrate
```

### Hook `useQuery` retorna undefined
```typescript
// ✅ Correcto - esperar a que cargue
if (isLoading) return <Loading />
if (isError) return <Error />
return <Content data={data} />

// ❌ Incorrecto - usar antes de cargar
{data.nombre}  // Puede ser undefined
```

### Cambio de estado no se refleja en UI
- El hook `useChangeProgramState()` invalida automáticamente queries
- Si no se ve el cambio, verifica la consola para errores del servidor
- Asegúrate de que el backend está corriendo

---

## 🔄 Próximos Pasos

1. **Crear Etapas API & Frontend Hooks**
2. **Crear Postulantes API & Frontend Hooks**
3. **Implementar formulario de creación de Programa**
4. **Mejorar manejo de errores con notificaciones**
5. **Agregar autenticación (JWT del backend)**

---

## 📞 Comandos Útiles

### Backend
```bash
# Crear superusuario
python manage.py createsuperuser

# Ejecutar migraciones específicas
python manage.py migrate programas

# Ver todas las migraciones
python manage.py showmigrations

# Crear nueva migración
python manage.py makemigrations

# Reset de base de datos (cuidado!)
python manage.py flush --no-input
```

### Frontend
```bash
# Instalar dependencias
npm install

# Desarrollo con hot reload
npm run dev

# Build para producción
npm run build

# Lint del código
npm run lint
```

---

**Status**: 🟢 Listo para desarrollo  
**Last Updated**: 2026-02-19  
**Next Module**: Etapas & Postulantes
