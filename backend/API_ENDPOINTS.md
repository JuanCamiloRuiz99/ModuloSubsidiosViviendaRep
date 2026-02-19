# API Backend - Módulo Programas

## Setup inicial

### 1. Instalar dependencias
```bash
cd backend
pip install -r requirements.txt
```

### 2. Aplicar migraciones
```bash
python manage.py migrate
```

### 3. Crear superusuario (opcional)
```bash
python manage.py createsuperuser
```

### 4. Ejecutar servidor
```bash
python manage.py runserver
```

El servidor correrá en `http://localhost:8000`

---

## Endpoints de Programas

### Base URL
```
http://localhost:8000/api/programas/
```

### 1. Listar todos los programas
**GET** `/api/programas/`

**Parámetros opcionales:**
- `estado=ACTIVO` (Filtrar por estado: BORRADOR, ACTIVO, INHABILITADO)

**Ejemplo:**
```bash
curl http://localhost:8000/api/programas/
curl http://localhost:8000/api/programas/?estado=ACTIVO
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Mi casa Ya!!",
    "descripcion": "Subsidio para mejoramiento de vivienda",
    "entidad_responsable": "Alcaldía de Popayán",
    "codigo_programa": "2026BS1A2B",
    "estado": "ACTIVO",
    "fecha_creacion": "2026-02-19T10:30:00Z",
    "fecha_actualizacion": "2026-02-19T10:35:00Z"
  }
]
```

---

### 2. Crear un nuevo programa
**POST** `/api/programas/`

**Body (JSON):**
```json
{
  "nombre": "Vivienda Digna",
  "descripcion": "Programa de apoyo a construcción de vivienda nueva en zonas urbanas",
  "entidad_responsable": "Secretaría de Desarrollo Social",
  "estado": "BORRADOR"
}
```

**Respuesta (201 Created):**
```json
{
  "id": 2,
  "nombre": "Vivienda Digna",
  "descripcion": "Programa de apoyo a construcción de vivienda nueva en zonas urbanas",
  "entidad_responsable": "Secretaría de Desarrollo Social",
  "codigo_programa": "2026BS3C4D",
  "estado": "BORRADOR",
  "fecha_creacion": "2026-02-19T11:00:00Z",
  "fecha_actualizacion": "2026-02-19T11:00:00Z"
}
```

---

### 3. Obtener un programa específico
**GET** `/api/programas/{id}/`

**Ejemplo:**
```bash
curl http://localhost:8000/api/programas/1/
```

---

### 4. Actualizar un programa
**PATCH** `/api/programas/{id}/`

**Body (JSON):**
```json
{
  "nombre": "Mi Casa Ya!! Actualizado",
  "descripcion": "Descripción actualizada"
}
```

---

### 5. Eliminar un programa
**DELETE** `/api/programas/{id}/`

---

### 6. Cambiar estado de un programa
**POST** `/api/programas/{id}/cambiar_estado/`

**Body (JSON):**
```json
{
  "nuevo_estado": "ACTIVO"
}
```

Estados válidos: `BORRADOR`, `ACTIVO`, `INHABILITADO`

**Respuesta:**
```json
{
  "mensaje": "El programa fue actualizado a estado ACTIVO",
  "programa": { ... }
}
```

---

### 7. Obtener estadísticas
**GET** `/api/programas/estadisticas/`

**Respuesta:**
```json
{
  "total": 5,
  "por_estado": {
    "BORRADOR": 2,
    "ACTIVO": 2,
    "INHABILITADO": 1
  }
}
```

---

## Códigos de Estado HTTP

- **200**: OK - Solicitud exitosa
- **201**: Created - Recurso creado
- **400**: Bad Request - Error en los datos enviados
- **404**: Not Found - Recurso no encontrado
- **500**: Internal Server Error - Error del servidor

---

## Validaciones

### Nombre
- Mínimo 3 caracteres
- Requerido

### Descripción
- Mínimo 10 caracteres
- Requerido

### Entidad Responsable
- No puede estar vacío
- Requerido

### Código Programa
- Se genera automáticamente
- Formato: `{year}BS{random}` (ej: 2026BS1A2B)
- Único en la base de datos

---

## Acceso a Django Admin

Navega a `http://localhost:8000/admin/` y accede con las credenciales del superusuario.

Aquí puedes:
- Ver todos los programas
- Crear/editar/eliminar programas
- Filtrar por estado
- Buscar por nombre o código
