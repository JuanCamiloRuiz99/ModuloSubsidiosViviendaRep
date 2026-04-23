# Historias de Usuario - Módulos Faltantes

## 📋 Índice
- [Módulo Usuario](#módulo-usuario) (8 HUs)
- [Módulo Etapa](#módulo-etapa) (6 HUs)
- [Módulo Miembro del Hogar](#módulo-miembro-del-hogar) (5 HUs)
- [Módulo Visita Técnica](#módulo-visita-técnica) (10 HUs)
- [Módulo Visita Etapa 2](#módulo-visita-etapa-2) (5 HUs)
- [Módulo Documento Proceso Interno](#módulo-documento-proceso-interno) (5 HUs)
- [Módulo Dashboard](#módulo-dashboard) (6 HUs)

**Total de HUs faltantes: 45**

---

## Módulo Usuario

### HU-U-001: Autenticación de Usuario - Login
**Rol:** Ciudadano, Funcionario, Visitador Técnico, Admin  
**Como:** usuario del sistema  
**Quiero:** ingresar al sistema con mis credenciales (correo y contraseña)  
**Para:** acceder a mis funcionalidades específicas según mi rol

**Criterios de Aceptación:**
- El usuario puede ingresar correo y contraseña en un formulario de login
- El sistema valida las credenciales contra la base de datos
- Si las credenciales son válidas, se genera un token de autenticación
- Si las credenciales son inválidas, se muestra error "Correo o contraseña incorrectos"
- La sesión se mantiene activa durante 24 horas
- El usuario es redirigido al dashboard según su rol

**Notas técnicas:**
- Endpoint: `POST /api/usuarios/login/`
- Implementar throttling para prevenir ataques de fuerza bruta
- Token de autenticación con validez de 24 horas
- Registrar intentos fallidos de login

---

### HU-U-002: Cierre de Sesión - Logout
**Rol:** Ciudadano, Funcionario, Visitador Técnico, Admin  
**Como:** usuario autenticado  
**Quiero:** cerrar mi sesión en el sistema  
**Para:** proteger mi cuenta de accesos no autorizados

**Criterios de Aceptación:**
- El usuario puede hacer clic en botón "Cerrar sesión"
- El token de autenticación se invalida inmediatamente
- El usuario es redirigido a la página de login
- Los datos de sesión se limpian del cliente
- El navegador no cachea información sensible

**Notas técnicas:**
- Endpoint: `POST /api/usuarios/logout/`
- Limpiar token del localStorage/sessionStorage
- Invalidar sesión en backend

---

### HU-U-003: Cambio de Contraseña (Usuario Autenticado)
**Rol:** Ciudadano, Funcionario, Visitador Técnico, Admin  
**Como:** usuario autenticado  
**Quiero:** cambiar mi contraseña actual  
**Para:** mantener mi cuenta segura

**Criterios de Aceptación:**
- El usuario accede a "Cambiar contraseña" desde su perfil
- Debe ingresar contraseña actual para validación
- Debe ingresar nueva contraseña (mín 8 caracteres, con mayúscula y número)
- Debe confirmar la nueva contraseña
- Si coinciden, se actualiza y se muestra mensaje de éxito
- Si la contraseña actual es incorrecta, se rechaza el cambio
- El usuario se desconecta automáticamente después de cambiar contraseña

**Notas técnicas:**
- Endpoint: `POST /api/usuarios/{id}/cambiar_contraseña/`
- Validar contraseña actual con `check_password()`
- Hash la nueva contraseña con `make_password()`
- Requisitos: min 8 chars, al menos 1 mayúscula, 1 número

---

### HU-U-004: Recuperación de Contraseña (Usuario Olvidó)
**Rol:** Ciudadano, Funcionario, Visitador Técnico  
**Como:** usuario que olvidó su contraseña  
**Quiero:** recuperar acceso a mi cuenta mediante el correo registrado  
**Para:** poder volver a ingresar al sistema

**Criterios de Aceptación:**
- El usuario accede a "¿Olvidó su contraseña?" en login
- Ingresa su correo registrado
- Si el correo existe, se envía enlace de recuperación con token
- El enlace contiene un token con validez de 24 horas
- El usuario recibe instrucciones en el correo (o en el UI en desarrollo)
- Puede hacer clic en el enlace para ir a formulario de nueva contraseña
- Ingresa nueva contraseña y confirma
- Si es válida, se actualiza la contraseña y puede hacer login
- Si el correo no existe, se muestra mensaje genérico por seguridad

**Notas técnicas:**
- Endpoint: `POST /api/usuarios/solicitar_recuperacion/`
- Generar token firmado con `django.core.signing`
- Validez del token: 24 horas
- Email backend: FileBackend en desarrollo, SMTP en producción

---

### HU-U-005: Cambio de Rol (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** cambiar el rol de un usuario  
**Para:** asignarle nuevas responsabilidades

**Criterios de Aceptación:**
- El admin accede a listado de usuarios
- Selecciona un usuario y hace clic en "Cambiar rol"
- Puede seleccionar entre: FUNCIONARIO, VISITADOR_TECNICO
- (No permite cambiar a ADMIN desde aquí)
- Guarda el cambio y se registra la auditoría
- El usuario es notificado del cambio de rol
- Los permisos se actualizan inmediatamente

**Notas técnicas:**
- Endpoint: `POST /api/usuarios/{id}/cambiar_rol/`
- Roles disponibles: FUNCIONARIO, VISITADOR_TECNICO
- Validar que el usuario actual sea ADMIN
- Registrar cambio en tabla de auditoría

---

### HU-U-006: Activar/Desactivar Usuario (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** activar o desactivar usuarios  
**Para:** controlar quién puede acceder al sistema

**Criterios de Aceptación:**
- El admin ve estado (Activo/Inactivo) en listado de usuarios
- Puede hacer clic en "Desactivar" para un usuario activo
- Puede hacer clic en "Activar" para un usuario inactivo
- Se pide confirmación antes de desactivar
- Un usuario inactivo no puede iniciar sesión
- Se registra quién hizo el cambio y cuándo
- El usuario es notificado del cambio de estado

**Notas técnicas:**
- Endpoint: `POST /api/usuarios/{id}/activar/` y `POST /api/usuarios/{id}/desactivar/`
- Campo booleano `activo` en modelo Usuario
- No permitir login si `activo=False`

---

### HU-U-007: Listar Usuarios (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** ver el listado de todos los usuarios con sus roles  
**Para:** gestionar el acceso y permisos

**Criterios de Aceptación:**
- Se muestra tabla de usuarios con: ID, Nombre, Correo, Rol, Estado, Acciones
- Puedo filtrar por rol (ADMIN, FUNCIONARIO, VISITADOR_TECNICO)
- Puedo filtrar por estado (Activo/Inactivo)
- Puedo buscar por número de documento o nombre
- La tabla tiene paginación (10, 20, 50 usuarios por página)
- Puedo ver estadísticas: Total, Activos, Inactivos, por Rol
- Las columnas son ordenables

**Notas técnicas:**
- Endpoint: `GET /api/usuarios/?page=1&page_size=10&id_rol={id}&activo={true/false}&search={q}`
- Incluir estadísticas cuando se pide `include_stats=true`
- Paginación de 10 usuarios por defecto

---

### HU-U-008: Ver Perfil de Usuario
**Rol:** Ciudadano, Funcionario, Visitador Técnico, Admin  
**Como:** usuario autenticado  
**Quiero:** ver y editar mi información de perfil  
**Para:** mantener mis datos actualizados

**Criterios de Aceptación:**
- El usuario accede a su perfil desde el menú principal
- Se muestra: Nombre completo, Correo, Número de documento, Rol, Fecha de creación
- Puede editar: Nombre completo (opcional)
- No puede cambiar: Correo, Rol, Número de documento (requieren admin)
- Se muestra botón "Cambiar contraseña"
- Se muestra último acceso al sistema
- Al guardar cambios, se muestra mensaje de éxito

**Notas técnicas:**
- Endpoint: `GET /api/usuarios/{id}/` y `PATCH /api/usuarios/{id}/`
- Solo permitir editar campos específicos en el PATCH
- Registrar cambios en auditoría

---

## Módulo Etapa

### HU-E-001: Crear Nueva Etapa (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** crear una nueva etapa en el proceso de postulación  
**Para:** definir las fases del programa de subsidios

**Criterios de Aceptación:**
- El admin accede a "Configurar Etapas" dentro de un programa
- Puede crear nueva etapa con:
  - Número de etapa (1, 2, 3, etc.)
  - Nombre (ej: "Registro inicial", "Revisión de documentos")
  - Descripción
  - Duración en días (estimada)
  - Tipo de etapa (REGISTRO, REVISION, VISITA, DOCUMENTOS, FINAL)
- Validar que el número de etapa sea único en el programa
- Se guarda la etapa con estado "Activa"
- Se muestra confirmación y se puede agregar otra o ir al listado

**Notas técnicas:**
- Endpoint: `POST /api/etapas/`
- Relacionar a programa_id
- Campo `numero_etapa` debe ser único por programa
- Estado por defecto: activo_logico=True

---

### HU-E-002: Configurar Formulario de Etapa (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** definir qué campos debe completar el ciudadano en cada etapa  
**Para:** recabar la información necesaria para evaluar la solicitud

**Criterios de Aceptación:**
- El admin selecciona una etapa y hace clic en "Configurar Formulario"
- Se muestra formulario donde puede:
  - Seleccionar campos disponibles de la base (ej: dirección, teléfono, dependientes)
  - Para cada campo, marcar como "Requerido" o "Opcional"
  - Marcar como "Habilitado" o "Deshabilitado"
  - Ver vista previa del formulario
- Se puede reordenar campos mediante drag-drop
- Al guardar, se asocia el formulario a la etapa
- Se muestra confirmación

**Notas técnicas:**
- Endpoint: `POST /api/etapas/{id}/formulario/` y `GET /api/etapas/{id}/formulario/`
- Validar estructura: `{"campos": {"campo_id": {"requerido": bool, "habilitado": bool}}}`
- Relacionar con modelo FormularioEtapa

---

### HU-E-003: Ver Detalles de Etapa (Admin/Funcionario)
**Rol:** Admin, Funcionario  
**Como:** admin o funcionario  
**Quiero:** ver los detalles de una etapa específica  
**Para:** entender qué se debe validar en esa fase

**Criterios de Aceptación:**
- Se muestra: Nombre, Descripción, Duración, Tipo, Formulario asociado
- Puedo ver qué campos son obligatorios
- Puedo ver descripción de qué valida cada etapa
- Puedo ver configuraciones especiales (ej: "Requiere visita técnica")
- Botón para editar (solo admin)

**Notas técnicas:**
- Endpoint: `GET /api/etapas/{id}/`
- Incluir relaciones: formulario, configuraciones

---

### HU-E-004: Actualizar Configuración de Etapa (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** actualizar los detalles de una etapa existente  
**Para:** ajustar el proceso según cambios en la política

**Criterios de Aceptación:**
- El admin puede cambiar: Nombre, Descripción, Duración, Tipo
- No puede cambiar: Número de etapa
- Puede habilitar/deshabilitar la etapa
- Se registra quién hizo el cambio y cuándo
- Los cambios aplican a nuevas postulaciones que lleguen a esa etapa
- Las postulaciones en progreso no se ven afectadas

**Notas técnicas:**
- Endpoint: `PUT /api/etapas/{id}/` y `PATCH /api/etapas/{id}/`
- Campo `fecha_modificacion` se actualiza con `timezone.now()`
- No permitir cambiar `numero_etapa`

---

### HU-E-005: Listar Etapas de un Programa (Admin/Ciudadano)
**Rol:** Admin, Ciudadano, Funcionario  
**Como:** usuario del sistema  
**Quiero:** ver todas las etapas de un programa en orden  
**Para:** entender el flujo del proceso de postulación

**Criterios de Aceptación:**
- Se muestra lista de etapas ordenadas por número_etapa
- Para cada etapa: Número, Nombre, Descripción, Duración
- Solo muestra etapas activas (no eliminadas)
- Puede filtrar por programa
- Vista es diferente según el rol:
  - **Ciudadano**: ve etapas sin detalles de validación
  - **Admin/Funcionario**: ve detalles completos including formularios

**Notas técnicas:**
- Endpoint: `GET /api/etapas/?programa={id}`
- Query: Etapa.objects.filter(activo_logico=True).order_by('numero_etapa')
- Serializer diferente según request.user.role

---

### HU-E-006: Marcar Etapa como Finalizada (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** marcar una etapa como finalizada  
**Para:** indicar que ya no se recibirán postulaciones en esa fase

**Criterios de Aceptación:**
- El admin accede a detalles de etapa
- Puede hacer clic en "Marcar como Finalizada"
- Se pide confirmación
- Una etapa finalizada no puede recibir nuevas postulaciones
- Se registra la fecha y hora de finalización
- Las postulaciones en progreso continúan

**Notas técnicas:**
- Endpoint: `POST /api/etapas/{id}/finalizar/`
- Campo `finalizada` se establece en True
- Campo `fecha_modificacion` se actualiza

---

## Módulo Miembro del Hogar

### HU-MH-001: Registrar Miembro del Hogar (Ciudadano)
**Rol:** Ciudadano  
**Como:** ciudadano postulante  
**Quiero:** registrar los miembros de mi grupo familiar  
**Para:** que se valide la información socioeconómica del hogar

**Criterios de Aceptación:**
- Durante la postulación, puedo agregar miembros del hogar
- Para cada miembro ingreso:
  - Nombre completo
  - Número de documento (cédula)
  - Parentesco (Cónyuge, Hijo, Madre, Padre, Hermano, Otro)
  - Edad
  - Género (M/F)
  - Estado civil (Soltero, Casado, Unión libre, Viudo, Separado)
  - Ocupación
  - Ingresos mensuales (estimados)
- Valido que no haya dos miembros con mismo documento
- Puedo agregar hasta 10 miembros
- Puedo editar o eliminar miembros antes de enviar postulación

**Notas técnicas:**
- Endpoint: `POST /api/miembros-hogar/` y `PATCH /api/miembros-hogar/{id}/`
- Validar unicidad de documento dentro del mismo hogar
- Máximo 10 miembros por hogar

---

### HU-MH-002: Cargar Documentos de Miembro (Ciudadano)
**Rol:** Ciudadano  
**Como:** ciudadano postulante  
**Quiero:** cargar documentos de comprobación de mis miembros del hogar  
**Para:** acreditar la información reportada

**Criterios de Aceptación:**
- Para cada miembro, puedo cargar documentos:
  - Cédula/Documento de identidad
  - Comprobante de ingresos (recibo de nómina, declaración, otros)
  - Certificado de dependencia (si aplica)
  - Carnet de afiliación EPS/Salud
- Cada documento es un archivo (PDF, JPG, PNG)
- Validar tamaño máximo: 5MB por archivo
- El ciudadano puede ver listado de documentos cargados
- Puede reemplazar un documento cargándolo nuevamente
- Se valida que todo miembro tenga al menos documento de identidad

**Notas técnicas:**
- Endpoint: `POST /api/miembros-hogar/{id}/documentos/`
- Modelo: DocumentoMiembroHogar
- Tipos: CEDULA, INGRESOS, DEPENDENCIA, AFILIACION_EPS, OTRO
- Validar: máx 5MB, extensiones permitidas

---

### HU-MH-003: Identificar Miembros Vulnerables (Sistema)
**Rol:** Sistema  
**Como:** sistema automático  
**Quiero:** identificar miembros en situación de vulnerabilidad  
**Para:** priorizar apoyo donde más se necesita

**Criterios de Aceptación:**
- El sistema automáticamente marca miembros como vulnerables si:
  - Tienen menos de 7 años (menores de edad dependientes)
  - Tienen más de 60 años (adultos mayores)
  - Reportan discapacidad
  - Reportan estar desempleados o con ingresos < 1 SMLV
- Se muestra indicador visual en el hogar (ej: % de vulnerabilidad)
- Se registra el criterio de vulnerabilidad cumplido
- Esta información se usa para priorización en visitas técnicas

**Notas técnicas:**
- Campo: `vulnerable` boolean en MiembroHogar
- Campo: `criterio_vulnerabilidad` (array de strings)
- Lógica de cálculo automática al crear/actualizar miembro

---

### HU-MH-004: Actualizar Información de Miembro (Ciudadano/Funcionario)
**Rol:** Ciudadano, Funcionario  
**Como:** ciudadano o funcionario  
**Quiero:** actualizar la información de un miembro del hogar  
**Para:** corregir errores o reflejar cambios

**Criterios de Aceptación:**
- El ciudadano puede actualizar información antes de enviar postulación
- El funcionario puede actualizar en etapa de revisión si hay discrepancias
- Se validan los mismos campos que en creación
- Se registra quién hizo el cambio y cuándo
- Si la postulación ya está en revisión, requiere aprobación de cambios

**Notas técnicas:**
- Endpoint: `PATCH /api/miembros-hogar/{id}/`
- Campo `usuario_modificacion` y `fecha_modificacion` se actualizan
- Si postulación.estado != REGISTRADA, requiere funcionario approval

---

### HU-MH-005: Ver Resumen del Hogar (Funcionario/Visitador)
**Rol:** Funcionario, Visitador Técnico  
**Como:** funcionario o visitador técnico  
**Quiero:** ver un resumen de toda la información del hogar  
**Para:** evaluar rápidamente el grupo familiar

**Criterios de Aceptación:**
- Se muestra tabla con todos los miembros del hogar
- Para cada miembro: Nombre, Documento, Parentesco, Edad, Ocupación, Estado civil
- Se muestra total de miembros y miembros vulnerables
- Se muestra gráfico de distribución de dependencia
- Se muestra porcentaje de documentos completos
- Se pueden expandir filas para ver documentos de cada miembro

**Notas técnicas:**
- Endpoint: `GET /api/miembros-hogar/?postulacion={id}`
- Serializer: MiembroHogarDetailSerializer
- Incluir agregaciones: total, vulnerables, documentos completos

---

## Módulo Visita Técnica

### HU-VT-001: Crear Visita Técnica (Admin/Funcionario)
**Rol:** Admin, Funcionario  
**Como:** administrador o funcionario  
**Quiero:** crear una visita técnica para una postulación  
**Para:** evaluar las condiciones del hogar en terreno

**Criterios de Aceptación:**
- El admin/funcionario selecciona una postulación en estado "VISITA_PENDIENTE"
- Completa formulario con:
  - Postulación (obligatorio)
  - Tipo de visita (INICIAL, SEGUIMIENTO, VERIFICACION)
  - Dirección de visita
  - Inspector/Visitador técnico asignado
  - Fecha programada (opcional inicialmente)
- Se valida que no exista otra visita activa (no cancelada) para esa postulación
- Se guarda con estado "PROGRAMADA"
- Se notifica al inspector

**Notas técnicas:**
- Endpoint: `POST /api/visitas/crear/`
- Estados: PROGRAMADA, REALIZADA, CANCELADA
- Tipos: INICIAL, SEGUIMIENTO, VERIFICACION
- Validar: una sola visita activa por postulación

---

### HU-VT-002: Asignar Visitador Técnico a Visita (Admin/Funcionario)
**Rol:** Admin, Funcionario  
**Como:** administrador o funcionario  
**Quiero:** asignar un visitador técnico a una visita  
**Para:** distribuir el trabajo entre el equipo de inspección

**Criterios de Aceptación:**
- Al crear visita, se muestra lista de visitadores disponibles
- Puedo filtrar por disponibilidad y zona de cobertura
- Al seleccionar visitador, se guarda la asignación
- Visitador recibe notificación de nueva asignación
- Se muestra en su listado de "Mis visitas"
- Admin puede reasignar visitador a otra persona si es necesario

**Notas técnicas:**
- Endpoint: `PATCH /api/visitas/{id}/asignar/`
- Campo `encuestador_id` en Visita
- Validar que usuario sea rol VISITADOR_TECNICO
- Registrar auditoría de cambios

---

### HU-VT-003: Programar Fecha de Visita (Admin/Funcionario/Visitador)
**Rol:** Admin, Funcionario, Visitador Técnico  
**Como:** administrador, funcionario o visitador técnico  
**Quiero:** programar la fecha y hora de una visita técnica  
**Para:** coordinar con el ciudadano la visita

**Criterios de Aceptación:**
- Se muestra calendario disponible del visitador asignado
- Puedo seleccionar fecha y hora (rangos: 08:00-17:00)
- Se valida que la fecha sea en los próximos 30 días
- Se valida que no haya conflicto de horarios
- Se guarda la programación con estado "PROGRAMADA"
- Sistema envía notificación al ciudadano con fecha y hora
- Ciudadano puede confirmar o solicitar cambio de fecha

**Notas técnicas:**
- Endpoint: `POST /api/visitas/programar/`
- Campos: `fecha_programada`, `hora_inicio`, `hora_fin`
- Validar: rango 30 días a futuro, no conflictos
- Generar evento de notificación al ciudadano

---

### HU-VT-004: Realizar Visita Técnica (Visitador)
**Rol:** Visitador Técnico  
**Como:** visitador técnico  
**Quiero:** registrar que realicé una visita al hogar  
**Para:** documentar que se completó la evaluación en terreno

**Criterios de Aceptación:**
- Visitador accede a su visita desde móvil/web
- Registra:
  - Fecha y hora de inicio
  - Persona entrevistada (nombre, relación con postulante)
  - Observaciones generales
  - Fotos del hogar (mínimo 3)
  - Calificación de condiciones (1-10 escala)
- Se valida que tenga mínimo 3 fotos
- Se guarda con estado "REALIZADA"
- Se registra automáticamente la hora de fin

**Notas técnicas:**
- Endpoint: `POST /api/visitas/realizar/`
- Campos: `fecha_realizacion`, `hora_inicio`, `hora_fin`, `persona_entrevistada`
- Validar: mínimo 3 fotos (DocumentoVisita)
- Cambiar estado a REALIZADA

---

### HU-VT-005: Registrar Hallazgos de Visita (Visitador)
**Rol:** Visitador Técnico  
**Como:** visitador técnico  
**Quiero:** documentar los hallazgos encontrados durante la visita  
**Para:** sustentar la recomendación de beneficiario o no

**Criterios de Aceptación:**
- En el formulario de visita, puedo agregar hallazgos en categorías:
  - Vivienda (condiciones, material, servicios)
  - Familia (dinámicas, vulnerabilidades)
  - Económico (ingresos, gastos)
  - Social (redes de apoyo, situación legal)
- Cada hallazgo incluye: Categoría, Descripción, Evidencia (foto/documento)
- Se puede marcar como "Favorable" o "Desfavorable" para beneficio
- Total hallazgos desfavorables influyen en recomendación final

**Notas técnicas:**
- Modelo: HallazgoVisita con campos categoria, descripcion, favorable, evidencia
- Relacionar a Visita
- Campo `observaciones_generales` en Visita para resumen

---

### HU-VT-006: Generar Recomendación de Visita (Sistema)
**Rol:** Sistema  
**Como:** sistema automático  
**Quiero:** generar una recomendación basada en los hallazgos  
**Para:** asistir la toma de decisión del funcionario

**Criterios de Aceptación:**
- Después de completer visita, sistema calcula:
  - Cantidad de hallazgos favorables vs desfavorables
  - Puntuación de condiciones (escala 1-10)
  - Indicadores de vulnerabilidad
- Genera recomendación automática:
  - Verde (Recomendable - >7 puntos)
  - Amarilla (Revisar - 4-7 puntos)
  - Roja (No recomendable - <4 puntos)
- Recomendación es sugerencia, no vinculante
- Funcionario puede hacer su propia decisión

**Notas técnicas:**
- Campo: `recomendacion` enum (VERDE, AMARILLA, ROJA) en Visita
- Lógica: suma de hallazgos, calificación, criterios de vulnerabilidad
- Campo: `recomendacion_automatica` boolean

---

### HU-VT-007: Cancelar Visita (Admin/Funcionario/Visitador)
**Rol:** Admin, Funcionario, Visitador Técnico  
**Como:** admin, funcionario o visitador técnico  
**Quiero:** cancelar una visita programada  
**Para:** ajustarme a cambios en la agenda

**Criterios de Aceptación:**
- Se muestra botón "Cancelar" en visita con estado PROGRAMADA
- Se pide confirmación y motivo de cancelación
- Motivos válidos: Ciudadano no disponible, Cambio de dirección, Otro
- Se registra quién canceló y cuándo
- Ciudadano recibe notificación
- Postulación regresa a estado anterior

**Notas técnicas:**
- Endpoint: `POST /api/visitas/{id}/cancelar/`
- Campos: `estado_visita=CANCELADA`, `motivo_cancelacion`, `fecha_cancelacion`
- Actualizar Postulacion.estado

---

### HU-VT-008: Listar Mis Visitas (Visitador)
**Rol:** Visitador Técnico  
**Como:** visitador técnico  
**Quiero:** ver mi listado de visitas asignadas  
**Para:** organizar mi trabajo

**Criterios de Aceptación:**
- Se muestra tabla con visitas asignadas a mí
- Columnas: Postulante, Dirección, Fecha programada, Estado, Acciones
- Puedo filtrar por estado (Programada, Realizada, Cancelada)
- Puedo filtrar por rango de fechas
- Se muestra resumen: Total, Realizadas, Pendientes
- Se ordena por fecha más próxima primero

**Notas técnicas:**
- Endpoint: `GET /api/visitas/listar/?encuestador={user_id}&estado={estado}`
- QuerySet: Visita.objects.filter(encuestador_id=request.user.id_usuario)

---

### HU-VT-009: Listar Visitas por Postulación (Funcionario)
**Rol:** Funcionario  
**Como:** funcionario encargado de postulaciones  
**Quiero:** ver todas las visitas asociadas a una postulación  
**Para:** evaluar el progreso de la evaluación

**Criterios de Aceptación:**
- Dentro de detalle de postulación, veo sección "Visitas técnicas"
- Se muestra: Tipo, Estado, Visitador, Fecha programada, Fecha realización
- Para cada visita puedo: Ver detalles, Ver fotos, Ver hallazgos
- Se muestra recomendación de la visita
- Si hay múltiples visitas, se ordena por más reciente primero

**Notas técnicas:**
- Endpoint: `GET /api/visitas/listar/?postulacion={id}`
- Incluir serializer con detalles completos

---

### HU-VT-010: Descargar Reporte de Visita (Funcionario)
**Rol:** Funcionario, Admin  
**Como:** funcionario o admin  
**Quiero:** descargar un reporte PDF de una visita realizada  
**Para:** anexar a la documentación del caso

**Criterios de Aceptación:**
- En detalle de visita, se muestra botón "Descargar reporte"
- Se genera PDF con:
  - Datos de la postulación (postulante, dirección, fecha)
  - Datos de la visita (visitador, fecha, hora)
  - Fotos del hogar
  - Hallazgos registrados
  - Recomendación
  - Firma/fecha del visitador
- Se descarga con nombre: Visita_{postulacionId}_{fecha}.pdf

**Notas técnicas:**
- Endpoint: `GET /api/visitas/{id}/reporte/`
- Usar librería: reportlab o similar
- Generar PDF con datos de la visita

---

## Módulo Visita Etapa 2

### HU-VE2-001: Crear Visita Etapa 2 (Funcionario)
**Rol:** Funcionario  
**Como:** funcionario  
**Quiero:** crear una visita de seguimiento/verificación (Etapa 2)  
**Para:** confirmar cambios o recolectar información adicional

**Criterios de Aceptación:**
- Solo aplica a postulaciones que ya completaron Etapa 1 (Visita inicial)
- Funcionario selecciona postulación y crea nueva visita
- Ingresa: Visitador, Fecha programada, Tipo (SEGUIMIENTO, VERIFICACION)
- La visita inicia con estado "PROGRAMADA"
- Se notifica al visitador asignado

**Notas técnicas:**
- Endpoint: `POST /api/visitas-etapa2/`
- Validar: Postulacion.estado en estados permitidos
- Tipo: SEGUIMIENTO, VERIFICACION

---

### HU-VE2-002: Registrar Datos del Hogar Etapa 2 (Visitador)
**Rol:** Visitador Técnico  
**Como:** visitador técnico  
**Quiero:** registrar datos verificados del hogar en Etapa 2  
**Para:** documentar cambios o confirmar información

**Criterios de Aceptación:**
- Al realizar visita etapa 2, visitador completa formulario con:
  - Cambios en condiciones del hogar
  - Actualización de miembros (cambios de residencia, nuevos nacimientos)
  - Ingresos verificados
  - Acceso a servicios (agua, luz, gas, internet)
  - Cambios en vulnerabilidades
- Campos marcados como "Verificado" o "Cambio detectado"
- Se compara automáticamente con Etapa 1

**Notas técnicas:**
- Endpoint: `POST /api/visitas-etapa2/{id}/datos-hogar/`
- Modelo: DatosHogarEtapa2
- Comparar con GestionHogarEtapa1 para detectar cambios

---

### HU-VE2-003: Cargar Documentos Etapa 2 (Visitador)
**Rol:** Visitador Técnico  
**Como:** visitador técnico  
**Quiero:** cargar documentos adicionales encontrados en la visita  
**Para:** respaldar los datos verificados

**Criterios de Aceptación:**
- Puedo subir nuevos documentos como evidencia
- Tipos: Fotos adicionales, Acta de visita, Documentos actualizados
- Máximo 5MB por archivo
- Puedo marcar documentos como "Crítico" si requieren análisis urgente

**Notas técnicas:**
- Endpoint: `POST /api/visitas-etapa2/{id}/documentos/`
- Modelo: DocumentoVisitaEtapa2
- Campo: `critico` boolean

---

### HU-VE2-004: Completar Formulario de Verificación (Visitador)
**Rol:** Visitador Técnico  
**Como:** visitador técnico  
**Quiero:** completar el formulario final de verificación  
**Para:** indicar que la visita está completa

**Criterios de Aceptación:**
- Se muestra formulario con preguntas sobre:
  - ¿Se verificó información del hogar?
  - ¿Hay discrepancias importantes?
  - ¿Cambió la recomendación inicial?
  - Observaciones finales
- Al marcar como "Completada", visita pasa a estado "REALIZADA"
- Se genera reporte automático

**Notas técnicas:**
- Endpoint: `PATCH /api/visitas-etapa2/{id}/`
- Campo: `estado_visita=REALIZADA`

---

### HU-VE2-005: Ver Resumen Etapa 2 vs Etapa 1 (Funcionario)
**Rol:** Funcionario  
**Como:** funcionario  
**Quiero:** comparar los datos de Etapa 1 vs Etapa 2  
**Para:** identificar cambios y discrepancias importantes

**Criterios de Aceptación:**
- Se muestra comparativa lado a lado:
  - Condiciones del hogar (Etapa 1 vs Etapa 2)
  - Miembros del hogar (cambios)
  - Ingresos (cambios)
  - Estado de servicios
- Se resaltan en color rojo los cambios significativos
- Se muestra porcentaje de concordancia entre etapas
- Se sugiere decisión: Confirmar beneficio, Revisión adicional, Descartar

**Notas técnicas:**
- Endpoint: `GET /api/visitas-etapa2/{id}/comparativa/`
- Comparar DatosHogarEtapa2 con GestionHogarEtapa1

---

## Módulo Documento Proceso Interno

### HU-DP-001: Subir Documentos Proceso Interno (Ciudadano/Funcionario)
**Rol:** Ciudadano, Funcionario  
**Como:** ciudadano o funcionario  
**Quiero:** cargar documentos requeridos para completar el proceso  
**Para:** sustentar la postulación con evidencia

**Criterios de Aceptación:**
- Durante la etapa de documentos, puedo subir:
  - Comprobante de domicilio (últimas 3 facturas o certificado)
  - Declaración de impuestos (si aplica)
  - Cédula de ciudadanía del cabeza de familia
  - Cédula de cónyuge (si aplica)
  - Acta de matrimonio/unión (si aplica)
  - Acta de nacimiento de menores
  - Documento de discapacidad (si aplica)
- Máximo 5MB por archivo
- Se valida que todos los tipos requeridos estén cargados
- Se muestra estado de completitud de documentos

**Notas técnicas:**
- Endpoint: `POST /api/documentos-proceso-interno/subir/`
- Tipos requeridos: COMPROBANTE_DOMICILIO, DECLARARACION_IMPUESTOS, CEDULA_PRINCIPAL, etc.
- Validar: 5MB máx, extensiones permitidas (PDF, JPG, PNG)

---

### HU-DP-002: Listar Documentos por Postulación (Funcionario/Ciudadano)
**Rol:** Funcionario, Ciudadano  
**Como:** funcionario o ciudadano  
**Quiero:** ver todos los documentos cargados en una postulación  
**Para:** verificar que están completos

**Criterios de Aceptación:**
- Se muestra tabla con todos los documentos
- Columnas: Tipo, Nombre archivo, Fecha carga, Estado, Acciones
- Puedo filtrar por tipo de documento
- Puedo ver estado: "Completo", "Faltante", "En revisión"
- Puedo descargar documento
- Se muestra porcentaje de completitud general

**Notas técnicas:**
- Endpoint: `GET /api/documentos-proceso-interno/?postulacion={id}`
- QuerySet filtrado por postulacion_id

---

### HU-DP-003: Validar Documentos Requeridos (Sistema)
**Rol:** Sistema  
**Como:** sistema automático  
**Quiero:** validar que todos los documentos requeridos estén cargados  
**Para:** permitir avance en el proceso

**Criterios de Aceptación:**
- El sistema verifica que todos los tipos requeridos tengan al menos un documento
- Si faltan documentos, postulación queda en "DOCUMENTOS_INCOMPLETOS"
- Se notifica al ciudadano qué documentos faltan
- Una vez completos, postulación puede avanzar a "DOCUMENTOS_CARGADOS"

**Notas técnicas:**
- Validación automática al subir documento
- TIPOS_REQUERIDOS = conjunto de tipos obligatorios
- Comparar tipos cargados vs requeridos

---

### HU-DP-004: Eliminar Documento (Ciudadano/Funcionario)
**Rol:** Ciudadano, Funcionario  
**Como:** ciudadano o funcionario  
**Quiero:** eliminar un documento erróneo  
**Para:** subir la versión correcta

**Criterios de Aceptación:**
- Se muestra botón eliminar en cada documento
- Se pide confirmación
- Si es último documento de ese tipo, postulación regresa a "DOCUMENTOS_INCOMPLETOS"
- Se registra auditoría de eliminación

**Notas técnicas:**
- Endpoint: `POST /api/documentos-proceso-interno/{pk}/eliminar/`
- Soft-delete: `activo_logico=False`
- Recalcular estado de postulación

---

### HU-DP-005: Descargar Reporte de Documentos (Funcionario)
**Rol:** Funcionario, Admin  
**Como:** funcionario o admin  
**Quiero:** descargar un listado de todos los documentos de una postulación  
**Para:** crear un archivo físico del caso

**Criterios de Aceptación:**
- Se genera PDF o ZIP con:
  - Listado de documentos cargados
  - Todos los archivos ZIP (si son muchos)
  - Fecha de carga de cada uno
  - Radicados ORFEO asociados
- Se descarga con nombre: Documentos_Postulacion_{id}_{fecha}.zip

**Notas técnicas:**
- Endpoint: `GET /api/documentos-proceso-interno/reporte/?postulacion={id}`
- Usar librería `zipfile` para empacar documentos

---

## Módulo Dashboard

### HU-D-001: Ver Estadísticas Generales del Sistema (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** ver un resumen estadístico general del sistema  
**Para:** monitorear el desempeño global

**Criterios de Aceptación:**
- Se muestra dashboard con tarjetas de:
  - Total de postulaciones (con cambio % vs mes anterior)
  - Total de visitas realizadas (con cambio %)
  - Total de usuarios activos (con cambio %)
  - Total de documentos cargados (con cambio %)
- Se muestra período de tiempo seleccionable (Este mes, Últimos 3 meses, Este año)
- Gráficos de tendencia de postulaciones por mes
- Números se actualizan automáticamente cada hora

**Notas técnicas:**
- Endpoint: `GET /api/dashboard/estadisticas/?periodo={mes|trimestre|año}`
- Queries optimizadas con Count y aggregates
- Cache de 1 hora

---

### HU-D-002: Ver Distribución de Postulaciones por Estado (Admin/Funcionario)
**Rol:** Admin, Funcionario  
**Como:** admin o funcionario  
**Quiero:** ver cuántas postulaciones hay en cada estado  
**Para:** identificar cuellos de botella

**Criterios de Aceptación:**
- Gráfico tipo "dona" o "barras" mostrando:
  - REGISTRADA, EN_REVISION, SUBSANACION, VISITA_PENDIENTE, VISITA_ASIGNADA, VISITA_PROGRAMADA, VISITA_REALIZADA, DOCUMENTOS_INCOMPLETOS, DOCUMENTOS_CARGADOS, BENEFICIADO, NO_BENEFICIARIO, APROBADA, RECHAZADA
- Se muestra número y porcentaje para cada estado
- Puedo hacer clic en un estado para filtrar postulaciones
- Se actualiza en tiempo real

**Notas técnicas:**
- Endpoint: `GET /api/dashboard/estadisticas/?tipo=postulaciones_por_estado`
- Query: Postulacion.objects.values('estado').annotate(Count('id'))

---

### HU-D-003: Ver Distribución de Visitas por Tipo (Admin/Funcionario)
**Rol:** Admin, Funcionario  
**Como:** admin o funcionario  
**Quiero:** ver cuántas visitas hay por tipo y estado  
**Para:** evaluar la carga de trabajo de visitadores

**Criterios de Aceptación:**
- Se muestra tabla con:
  - Tipo de visita (INICIAL, SEGUIMIENTO, VERIFICACION)
  - Cantidad total
  - Realizadas
  - Programadas
  - Canceladas
- Se muestra gráfico de carga de visitadores (visitas por persona)
- Puedo filtrar por rango de fechas

**Notas técnicas:**
- Endpoint: `GET /api/dashboard/estadisticas/?tipo=visitas_por_tipo`
- Agregaciones: tipo_visita, estado_visita

---

### HU-D-004: Ver Usuarios por Rol (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** ver la distribución de usuarios por rol  
**Para:** gestionar la asignación de responsabilidades

**Criterios de Aceptación:**
- Se muestra gráfico (dona o barras) con:
  - Cantidad de ADMIN
  - Cantidad de FUNCIONARIOS
  - Cantidad de VISITADORES_TECNICOS
  - Cantidad de CIUDADANOS (si aplica)
- Se muestra estado (Activo/Inactivo) para cada rol
- Puedo ver listado detallado al hacer clic en un rol

**Notas técnicas:**
- Endpoint: `GET /api/dashboard/estadisticas/?tipo=usuarios_por_rol`
- Query: UsuarioSistema.objects.values('id_rol').annotate(Count('id_usuario'), Count(Case(When(activo=True, then=1))))

---

### HU-D-005: Ver Hogarees por Estrato y Vulnerabilidad (Admin/Funcionario)
**Rol:** Admin, Funcionario  
**Como:** admin o funcionario  
**Quiero:** ver la distribución socioeconómica de los hogarees  
**Para:** evaluar equidad en la distribución de beneficios

**Criterios de Aceptación:**
- Gráfico mostrando:
  - Cantidad de hogares por estrato (1, 2, 3, 4, 5, 6)
  - Cantidad de hogarees con vulnerabilidades
  - Porcentaje de dependencia por hogar (promedio)
- Mapa temático mostrando hogarees por zona geográfica
- Tabla con detalles por estrato

**Notas técnicas:**
- Endpoint: `GET /api/dashboard/estadisticas/?tipo=hogares_por_estrato`
- Query: GestionHogarEtapa1.objects.values('estrato').annotate(Count('id'))
- Incluir vulnerable flag count

---

### HU-D-006: Exportar Reporte General (Admin)
**Rol:** Admin  
**Como:** administrador del sistema  
**Quiero:** exportar un reporte completo en Excel/PDF  
**Para:** compartir con directivos

**Criterios de Aceptación:**
- Se muestra botón "Descargar reporte"
- Puedo seleccionar formato (Excel o PDF)
- Puedo seleccionar período (Este mes, Último trimestre, Este año, Custom)
- Incluye:
  - Resumen ejecutivo (números principales)
  - Tablas de postulaciones por estado
  - Tablas de visitas por tipo
  - Información de usuarios
  - Gráficos embebidos
- Se descarga con nombre: Dashboard_Reporte_{fecha}.xlsx/pdf

**Notas técnicas:**
- Endpoint: `GET /api/dashboard/exportar/?formato={excel|pdf}&periodo={custom}&fecha_inicio={}&fecha_fin={}`
- Librerías: openpyxl para Excel, reportlab para PDF

---

## 📊 Resumen

| Módulo | Historias | Roles Principales |
|--------|-----------|-------------------|
| Usuario | 8 | Admin, Todos |
| Etapa | 6 | Admin, Funcionario, Ciudadano |
| Miembro del Hogar | 5 | Ciudadano, Funcionario, Visitador |
| Visita Técnica | 10 | Visitador, Funcionario, Admin |
| Visita Etapa 2 | 5 | Visitador, Funcionario |
| Documento Proceso Interno | 5 | Ciudadano, Funcionario |
| Dashboard | 6 | Admin, Funcionario |
| **TOTAL** | **45** | - |

## 📋 Total de Historias de Usuario en el Sistema

- Programa: 12 HU
- Postulación: 18 HU
- Usuario: 8 HU
- Etapa: 6 HU
- Miembro del Hogar: 5 HU
- Visita Técnica: 10 HU
- Visita Etapa 2: 5 HU
- Documento Proceso Interno: 5 HU
- Dashboard: 6 HU

**Total: 75 Historias de Usuario** ✅

Esto cubre todos los módulos principales del sistema con un nivel de detalle suficiente para la implementación.
