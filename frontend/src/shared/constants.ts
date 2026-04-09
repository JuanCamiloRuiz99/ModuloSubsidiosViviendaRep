/**
 * Constantes globales del sistema
 * 
 * Valores constantes reutilizables en toda la aplicación
 */

// Estados de Programas
export const ESTADO_PROGRAMA = {
  BORRADOR: 'BORRADOR',
  ACTIVO: 'ACTIVO',
  INHABILITADO: 'INHABILITADO',
  CULMINADO: 'CULMINADO',
} as const;

export type EstadoPrograma = typeof ESTADO_PROGRAMA[keyof typeof ESTADO_PROGRAMA];

export const ESTADO_PROGRAMA_LABELS: Record<EstadoPrograma, string> = {
  BORRADOR: 'Borrador',
  ACTIVO: 'Activo',
  INHABILITADO: 'Inhabilitado',
  CULMINADO: 'Culminado',
};

export const ESTADO_PROGRAMA_COLORS: Record<EstadoPrograma, string> = {
  BORRADOR: '#FFC107',
  ACTIVO: '#28A745',
  INHABILITADO: '#DC3545',
  CULMINADO: '#6366F1',
};

// Estados de Postulaciones (sincronizado con backend Postulacion.ESTADOS)
export const ESTADO_POSTULACION = {
  REGISTRADA:          'REGISTRADA',
  EN_REVISION:         'EN_REVISION',
  SUBSANACION:         'SUBSANACION',
  VISITA_PENDIENTE:    'VISITA_PENDIENTE',
  VISITA_PROGRAMADA:   'VISITA_PROGRAMADA',
  VISITA_REALIZADA:        'VISITA_REALIZADA',
  DOCUMENTOS_INCOMPLETOS:  'DOCUMENTOS_INCOMPLETOS',
  DOCUMENTOS_CARGADOS:     'DOCUMENTOS_CARGADOS',
  BENEFICIADO:         'BENEFICIADO',
  NO_BENEFICIARIO:     'NO_BENEFICIARIO',
  APROBADA:            'APROBADA',
  RECHAZADA:           'RECHAZADA',
} as const;

export type EstadoPostulacion = typeof ESTADO_POSTULACION[keyof typeof ESTADO_POSTULACION];

export const ESTADO_POSTULACION_LABELS: Record<EstadoPostulacion, string> = {
  REGISTRADA:          'Registrada',
  EN_REVISION:         'En revisión',
  SUBSANACION:         'Subsanación',
  VISITA_PENDIENTE:    'Visita pendiente',
  VISITA_PROGRAMADA:   'Visita programada',
  VISITA_REALIZADA:        'Visita realizada',
  DOCUMENTOS_INCOMPLETOS:  'Documentos incompletos',
  DOCUMENTOS_CARGADOS:     'Documentos cargados',
  BENEFICIADO:         'Beneficiado',
  NO_BENEFICIARIO:     'No beneficiario',
  APROBADA:            'Aprobada',
  RECHAZADA:           'Rechazada',
};

// Estados de Visitas
export const ESTADO_VISITA = {
  PROGRAMADA: 'PROGRAMADA',
  REALIZANDO: 'REALIZANDO',
  COMPLETADA: 'COMPLETADA',
  CANCELADA: 'CANCELADA',
} as const;

export type EstadoVisita = typeof ESTADO_VISITA[keyof typeof ESTADO_VISITA];

export const ESTADO_VISITA_LABELS: Record<EstadoVisita, string> = {
  PROGRAMADA: 'Visita Pendiente',
  REALIZANDO: 'Realizando',
  COMPLETADA: 'Visita Realizada',
  CANCELADA: 'Cancelada',
};

// Roles de Usuario
export const ROL_USUARIO = {
  ADMIN: 'ADMIN',
  SUPERVISOR: 'SUPERVISOR',
  DIGITADOR: 'DIGITADOR',
  REVISOR: 'REVISOR',
  AUDITOR: 'AUDITOR',
} as const;

export type RolUsuario = typeof ROL_USUARIO[keyof typeof ROL_USUARIO];

export const ROL_USUARIO_LABELS: Record<RolUsuario, string> = {
  ADMIN: 'Administrador',
  SUPERVISOR: 'Supervisor',
  DIGITADOR: 'Digitador',
  REVISOR: 'Revisor',
  AUDITOR: 'Auditor',
};

// Estados de Usuario
export const ESTADO_USUARIO = {
  ACTIVO: 'ACTIVO',
  INACTIVO: 'INACTIVO',
  PENDIENTE: 'PENDIENTE',
  SUSPENDIDO: 'SUSPENDIDO',
} as const;

export type EstadoUsuario = typeof ESTADO_USUARIO[keyof typeof ESTADO_USUARIO];

export const ESTADO_USUARIO_LABELS: Record<EstadoUsuario, string> = {
  ACTIVO: 'Activo',
  INACTIVO: 'Inactivo',
  PENDIENTE: 'Pendiente Activación',
  SUSPENDIDO: 'Suspendido',
};

// Limites de validación
export const LIMITES = {
  NOMBRE_MIN: 3,
  NOMBRE_MAX: 255,
  DESCRIPCION_MIN: 10,
  DESCRIPCION_MAX: 1000,
  EMAIL_MAX: 254,
  TELEFONO_MAX: 20,
  CEDULA_MAX: 10,
} as const;

// Paginación
export const PAGINACION_DEFAULT = {
  PAGE: 1,
  PAGE_SIZE: 10,
  PAGE_SIZES: [5, 10, 25, 50],
} as const;

// Timeouts
export const TIMEOUTS = {
  API_REQUEST: 30000, // 30 segundos
  NOTIFICATION: 5000, // 5 segundos
  DEBOUNCE: 500, // 500ms
  THROTTLE: 1000, // 1 segundo
} as const;

// Mensajes genéricos
export const MENSAJES = {
  CARGANDO: 'Cargando...',
  ERROR_GENERICO: 'Ha ocurrido un error. Por favor intenta de nuevo.',
  OPERACION_EXITOSA: 'Operación realizada exitosamente',
  CONFIRMACION_ELIMINAR: '¿Estás seguro que deseas eliminar este elemento?',
  NO_DATOS: 'No hay datos disponibles',
  ACCESO_DENEGADO: 'No tienes permisos para realizar esta acción',
  SESION_EXPIRADA: 'Tu sesión ha expirado. Por favor inicia sesión nuevamente',
} as const;
