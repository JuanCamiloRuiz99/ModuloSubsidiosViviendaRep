# 🚀 GUÍA RÁPIDA DE SETUP - Pruebas

## Base de Datos

**Nombre**: `SubsidiosViviendaAlcaldiaPopayan`  
**Motor**: PostgreSQL  
**Para**: TODO el proyecto (Programas, Etapas, Postulantes, Usuarios, etc.)

---

## ✨ Pasos para Probar

### 1️⃣ Crear Base de Datos PostgreSQL

```bash
# Opción 1: Con psql
psql -U postgres
CREATE DATABASE SubsidiosViviendaAlcaldiaPopayan;
\q

# Opción 2: Con cmd (Windows)
createdb -U postgres SubsidiosViviendaAlcaldiaPopayan
```

### 2️⃣ Configurar Backend

```bash
cd backend

# Crear archivo .env (ya existe, verifica valores)
# DB_NAME=SubsidiosViviendaAlcaldiaPopayan
# DB_USER=postgres
# DB_PASSWORD=postgres (cambiar si es diferente)

# Instalar dependencias
pip install -r requirements.txt

# Ejecutar migraciones
python manage.py migrate

# (Opcional) Crear superusuario
python manage.py createsuperuser
```

### 3️⃣ Iniciar Backend

```bash
python manage.py runserver
# Backend en: http://localhost:8000
# Admin en: http://localhost:8000/admin
```

### 4️⃣ Configurar Frontend

```bash
cd frontend

# Crear archivo .env (ya existe con configuración)
# VITE_API_URL=http://localhost:8000/api

# Instalar dependencias (si no está)
npm install
```

### 5️⃣ Iniciar Frontend

```bash
npm run dev
# Frontend en: http://localhost:5173
```

---

## 🧪 Pruebas Rápidas

### ✅ Backend OK:
- [ ] `http://localhost:8000` - página de Django
- [ ] `http://localhost:8000/api/programas/` - lista vacía `{}`
- [ ] `http://localhost:8000/admin/` - panel admin

### ✅ Frontend OK:
- [ ] `http://localhost:5173` - página principal
- [ ] Click en "Gestionar Programas" - debe cargar lista (vacía)
- [ ] Consola sin errores TypeScript/JavaScript

### 📱 Crear programa de prueba (Opción A - API):
```bash
curl -X POST http://localhost:8000/api/programas/ \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Mi Programa Test",
    "descripcion": "Esta es una descripción de prueba para el programa",
    "entidad_responsable": "Alcaldía de Popayán"
  }'
```

### 🎨 Crear programa de prueba (Opción B - Admin):
1. Ir a `http://localhost:8000/admin/`
2. Login con superusuario
3. Click en "Programas"
4. "Add Programa"
5. Llenar formulario y guardar

---

## 🛠️ Solución de Problemas

### Error: "Database doesn't exist"
```bash
createdb SubsidiosViviendaAlcaldiaPopayan
```

### Error: "ConnectionRefused" en backend
- Verificar PostgreSQL está corriendo
- Verificar credenciales en `.env`

### Error: "Cannot find module" en frontend
```bash
npm install
```

### Frontend no ve cambios en backend
- Asegurar ambos servidores corriendo
- Verificar CORS en settings.py
- Recargar página ctrl+shift+del

### `npm run dev` da error de compilación
```bash
# Revisar sintaxis de TypeScript
npm run lint

# Limpiar node_modules
rm -r node_modules
npm install
npm run dev
```

---

## 📊 Estructura de Datos

### Tabla: Programa
```sql
id (PK)
nombre (varchar)
descripcion (text)
entidad_responsable (varchar)
codigo_programa (varchar, auto-generated)
estado (BORRADOR | ACTIVO | INHABILITADO)
fecha_creacion (datetime)
fecha_actualizacion (datetime)
```

### Estados de Programa:
- 🟡 **BORRADOR**: En creación (puede cambiar a ACTIVO)
- 🟢 **ACTIVO**: Disponible para postulantes  
- 🔴 **INHABILITADO**: Archivado (no acepta cambios)

---

## 🔗 URLs Importantes

| Recurso | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| Backend | http://localhost:8000 |
| API | http://localhost:8000/api/ |
| Admin | http://localhost:8000/admin/ |
| Programas API | http://localhost:8000/api/programas/ |

---

## 💡 Próximos Pasos Después de Pruebas

1. Crear módulo de Etapas (backend + frontend)
2. Crear módulo de Postulantes (backend + frontend)
3. Implementar autenticación
4. Agregar manejo de errores/notificaciones
5. Pruebas E2E

---

**Status**: 🟢 Listo para tests iniciales  
**Last Updated**: 2026-02-19  
**Contact**: Equipo desarrollo Alcaldía
