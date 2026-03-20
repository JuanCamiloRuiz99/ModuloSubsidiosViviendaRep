/**
 * Tipos del formulario de Registro del Hogar (Etapa 1 - REGISTRO_HOGAR).
 *
 * Reflejan las tablas:
 *   - gestion_hogar_etapa1
 *   - miembros_hogar
 *   - documentos_gestion_hogar_etapa1
 *   - documentos_miembro_hogar
 */

// ── Enumeraciones ─────────────────────────────────────────────────────────── //

export type Zona = 'URBANA' | 'RURAL';

export type SituacionLaboral = 'EMPLEADO' | 'INDEPENDIENTE' | 'DESEMPLEADO' | 'OTRO';

export type Parentesco =
  | 'PADRE' | 'MADRE' | 'HIJO' | 'HIJA' | 'CONYUGE'
  | 'COMPANERO_PERMANENTE' | 'HERMANO' | 'HERMANA'
  | 'ABUELO' | 'ABUELA' | 'NIETO' | 'NIETA'
  | 'TIO' | 'TIA' | 'SOBRINO' | 'SOBRINA'
  | 'PRIMO' | 'PRIMA' | 'YERNO' | 'NUERA'
  | 'SUEGRO' | 'SUEGRA' | 'CUNADO' | 'CUNADA'
  | 'PADRASTRO' | 'MADRASTRA' | 'HIJASTRO' | 'HIJASTRA'
  | 'FAMILIAR_A_CARGO' | 'PERSONA_BAJO_CUIDADO' | 'OTRO';

export type TipoDocPersona =
  | 'CEDULA_CIUDADANIA'
  | 'CEDULA_EXTRANJERIA'
  | 'TARJETA_IDENTIDAD'
  | 'PASAPORTE'
  | 'REGISTRO_CIVIL'
  | 'PERMISO_PROTECCION_TEMPORAL';

export type TipoDocumentoHogar =
  | 'FOTO_CEDULA_FRENTE'
  | 'FOTO_CEDULA_REVERSO'
  | 'RECIBO_PREDIAL'
  | 'CERTIFICADO_TRADICION_LIBERTAD'
  | 'ESCRITURA_PUBLICA_PREDIO'
  | 'RECIBO_SERVICIOS_PUBLICOS'
  | 'DECLARACION_JURAMENTADA'
  | 'CERTIFICADO_RESIDENCIA'
  | 'CERTIFICADO_SISBEN'
  | 'CERTIFICADO_DISCAPACIDAD'
  | 'REGISTRO_VICTIMA'
  | 'OTRO';

export type TipoDocumentoMiembro =
  | 'CEDULA'
  | 'REGISTRO_CIVIL'
  | 'TARJETA_IDENTIDAD'
  | 'CERTIFICADO_DISCAPACIDAD'
  | 'CERTIFICADO_VICTIMA'
  | 'OTRO';

// ── Interfaces del formulario ─────────────────────────────────────────────── //

export interface InfoHogarForm {
  // Ubicación
  departamento: string;
  municipio: string;
  zona: Zona | '';
  tipo_predio: Zona | '';
  comuna: string;
  barrio_vereda: string;
  direccion: string;
  observaciones_direccion: string;
  // Predio
  estrato: string;
  es_propietario: boolean | null;
  numero_predial: string;
  matricula_inmobiliaria: string;
  avaluo_catastral: string;
  // Servicios públicos
  numero_matricula_agua: string;
  numero_contrato_energia: string;
  // Información adicional
  tiempo_residencia: string;
  tiene_dependientes: boolean | null;
  personas_con_discapacidad_hogar: boolean | null;
  // Términos
  acepta_terminos_condiciones: boolean;
}

export interface DocumentoMiembroEntry {
  tipo_documento: TipoDocumentoMiembro | '';
  file: File | null;
  observaciones: string;
}

export interface MiembroHogarForm {
  _localId: string;
  // Datos de la persona (ciudadano)
  tipo_documento: TipoDocPersona | '';
  numero_documento: string;
  primer_nombre: string;
  segundo_nombre: string;
  primer_apellido: string;
  segundo_apellido: string;
  fecha_nacimiento: string;
  // Vínculo con el hogar
  parentesco: Parentesco | '';
  parentesco_otro: string;
  es_cabeza_hogar: boolean;
  // Socioeconómica
  nivel_educativo: string;
  situacion_laboral: SituacionLaboral | '';
  ingresos_mensuales: string;
  fuente_ingresos: string;
  // SISBEN
  pertenece_sisben: boolean | null;
  grupo_sisben: string;
  puntaje_sisben: string;
  // Discapacidad
  tiene_discapacidad: boolean;
  grado_discapacidad: string;
  certificado_discapacidad: boolean | null;
  numero_certificado: string;
  // Víctima de conflicto
  es_victima_conflicto: boolean;
  numero_ruv: string;
  hecho_victimizante: string;
  fecha_hecho_victimizante: string;
  // Desplazamiento
  es_desplazado: boolean;
  fecha_desplazamiento: string;
  municipio_origen: string;
  departamento_origen: string;
  motivo_desplazamiento: string;
  // Firmante de paz
  es_firmante_paz: boolean;
  codigo_reincorporacion: string;
  etcr: string;
  estado_proceso_reincorporacion: string;
  // Documentos del miembro
  documentos: DocumentoMiembroEntry[];
}

export interface DocumentoHogarEntry {
  tipo_documento: TipoDocumentoHogar;
  file: File | null;
  observaciones: string;
}

export interface RegistroHogarResult {
  id_postulacion: number;
  numero_radicado: string;
  fecha_radicado: string;
}

// ── Valores iniciales ─────────────────────────────────────────────────────── //

export const INFO_HOGAR_INICIAL: InfoHogarForm = {
  departamento: 'Cauca',
  municipio: 'Popayan',
  zona: '',
  tipo_predio: '',
  comuna: '',
  barrio_vereda: '',
  direccion: '',
  observaciones_direccion: '',
  estrato: '',
  es_propietario: null,
  numero_predial: '',
  matricula_inmobiliaria: '',
  avaluo_catastral: '',
  numero_matricula_agua: '',
  numero_contrato_energia: '',
  tiempo_residencia: '',
  tiene_dependientes: null,
  personas_con_discapacidad_hogar: null,
  acepta_terminos_condiciones: false,
};

export const MIEMBRO_VACIO = (): MiembroHogarForm => ({
  _localId: crypto.randomUUID(),
  tipo_documento: '',
  numero_documento: '',
  primer_nombre: '',
  segundo_nombre: '',
  primer_apellido: '',
  segundo_apellido: '',
  fecha_nacimiento: '',
  parentesco: '',
  parentesco_otro: '',
  es_cabeza_hogar: false,
  nivel_educativo: '',
  situacion_laboral: '',
  ingresos_mensuales: '',
  fuente_ingresos: '',
  pertenece_sisben: null,
  grupo_sisben: '',
  puntaje_sisben: '',
  tiene_discapacidad: false,
  grado_discapacidad: '',
  certificado_discapacidad: null,
  numero_certificado: '',
  es_victima_conflicto: false,
  numero_ruv: '',
  hecho_victimizante: '',
  fecha_hecho_victimizante: '',
  es_desplazado: false,
  fecha_desplazamiento: '',
  municipio_origen: '',
  departamento_origen: '',
  motivo_desplazamiento: '',
  es_firmante_paz: false,
  codigo_reincorporacion: '',
  etcr: '',
  estado_proceso_reincorporacion: '',
  documentos: [],
});

// ── Catálogos de opciones ─────────────────────────────────────────────────── //

export const PARENTESCO_OPTIONS: Array<{ value: Parentesco; label: string }> = [
  { value: 'PADRE',                label: 'Padre' },
  { value: 'MADRE',                label: 'Madre' },
  { value: 'HIJO',                 label: 'Hijo' },
  { value: 'HIJA',                 label: 'Hija' },
  { value: 'CONYUGE',              label: 'Cónyuge' },
  { value: 'COMPANERO_PERMANENTE', label: 'Compañero(a) permanente' },
  { value: 'HERMANO',              label: 'Hermano' },
  { value: 'HERMANA',              label: 'Hermana' },
  { value: 'ABUELO',               label: 'Abuelo' },
  { value: 'ABUELA',               label: 'Abuela' },
  { value: 'NIETO',                label: 'Nieto' },
  { value: 'NIETA',                label: 'Nieta' },
  { value: 'TIO',                  label: 'Tío' },
  { value: 'TIA',                  label: 'Tía' },
  { value: 'SOBRINO',              label: 'Sobrino' },
  { value: 'SOBRINA',              label: 'Sobrina' },
  { value: 'PRIMO',                label: 'Primo' },
  { value: 'PRIMA',                label: 'Prima' },
  { value: 'YERNO',                label: 'Yerno' },
  { value: 'NUERA',                label: 'Nuera' },
  { value: 'SUEGRO',               label: 'Suegro' },
  { value: 'SUEGRA',               label: 'Suegra' },
  { value: 'CUNADO',               label: 'Cuñado' },
  { value: 'CUNADA',               label: 'Cuñada' },
  { value: 'PADRASTRO',            label: 'Padrastro' },
  { value: 'MADRASTRA',            label: 'Madrastra' },
  { value: 'HIJASTRO',             label: 'Hijastro' },
  { value: 'HIJASTRA',             label: 'Hijastra' },
  { value: 'FAMILIAR_A_CARGO',     label: 'Familiar a cargo' },
  { value: 'PERSONA_BAJO_CUIDADO', label: 'Persona bajo cuidado' },
  { value: 'OTRO',                 label: 'Otro (especificar)' },
];

export const TIPOS_DOC_PERSONA: Array<{ value: TipoDocPersona; label: string }> = [
  { value: 'CEDULA_CIUDADANIA',           label: 'Cédula de ciudadanía' },
  { value: 'CEDULA_EXTRANJERIA',          label: 'Cédula de extranjería' },
  { value: 'TARJETA_IDENTIDAD',           label: 'Tarjeta de identidad' },
  { value: 'PASAPORTE',                   label: 'Pasaporte' },
  { value: 'REGISTRO_CIVIL',              label: 'Registro civil' },
  { value: 'PERMISO_PROTECCION_TEMPORAL', label: 'Permiso de protección temporal (PPT)' },
];

export const SITUACION_LABORAL_OPTIONS: Array<{ value: SituacionLaboral; label: string }> = [
  { value: 'EMPLEADO',      label: 'Empleado' },
  { value: 'INDEPENDIENTE', label: 'Trabajador independiente' },
  { value: 'DESEMPLEADO',   label: 'Desempleado' },
  { value: 'OTRO',          label: 'Otro' },
];

export const TIPOS_DOCUMENTO_HOGAR: Array<{
  value: TipoDocumentoHogar;
  label: string;
  requerido?: boolean;
}> = [
  { value: 'FOTO_CEDULA_FRENTE',             label: 'Foto cédula — frente',               requerido: true  },
  { value: 'FOTO_CEDULA_REVERSO',            label: 'Foto cédula — reverso',              requerido: true  },
  { value: 'RECIBO_PREDIAL',                 label: 'Recibo predial'                                       },
  { value: 'CERTIFICADO_TRADICION_LIBERTAD', label: 'Certificado de tradición y libertad'                  },
  { value: 'ESCRITURA_PUBLICA_PREDIO',       label: 'Escritura pública del predio'                         },
  { value: 'RECIBO_SERVICIOS_PUBLICOS',      label: 'Recibo de servicios públicos'                         },
  { value: 'DECLARACION_JURAMENTADA',        label: 'Declaración juramentada'                              },
  { value: 'CERTIFICADO_RESIDENCIA',         label: 'Certificado de residencia'                            },
  { value: 'CERTIFICADO_SISBEN',             label: 'Certificado SISBEN'                                   },
  { value: 'CERTIFICADO_DISCAPACIDAD',       label: 'Certificado de discapacidad'                          },
  { value: 'REGISTRO_VICTIMA',               label: 'Registro de víctima (RUV)'                            },
];

export const TIPOS_DOCUMENTO_MIEMBRO: Array<{
  value: TipoDocumentoMiembro;
  label: string;
}> = [
  { value: 'CEDULA',                   label: 'Cédula de ciudadanía' },
  { value: 'REGISTRO_CIVIL',           label: 'Registro civil' },
  { value: 'TARJETA_IDENTIDAD',        label: 'Tarjeta de identidad' },
  { value: 'CERTIFICADO_DISCAPACIDAD', label: 'Certificado de discapacidad' },
  { value: 'CERTIFICADO_VICTIMA',      label: 'Certificado de víctima' },
];
