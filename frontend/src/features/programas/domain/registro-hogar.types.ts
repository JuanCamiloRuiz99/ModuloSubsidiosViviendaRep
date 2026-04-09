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

export type Sexo =
  | 'MASCULINO'
  | 'FEMENINO'
  | 'INTERSEXUAL'
  | 'NO_BINARIO'
  | 'PREFIERE_NO_DECIR';

// Documentos a nivel del hogar (predio, servicios, propiedad)
export type TipoDocumentoHogar =
  | 'RECIBO_PREDIAL'
  | 'CERTIFICADO_TRADICION_LIBERTAD'
  | 'ESCRITURA_PUBLICA_PREDIO'
  | 'RECIBO_SERVICIOS_PUBLICOS'
  | 'DECLARACION_JURAMENTADA'
  | 'CERTIFICADO_RESIDENCIA'
  | 'OTRO';

// Documentos a nivel de cada miembro (identidad, SISBEN, discapacidad, etc.)
export type TipoDocumentoMiembro =
  | 'FOTO_CEDULA_FRENTE'
  | 'FOTO_CEDULA_REVERSO'
  | 'REGISTRO_CIVIL'
  | 'TARJETA_IDENTIDAD'
  | 'CERTIFICADO_SISBEN'
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
  sexo: Sexo | '';
  telefono: string;
  correo_electronico: string;
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
  advertencias?: string[];
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
  sexo: '',
  telefono: '',
  correo_electronico: '',
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
  documentos: [
    { tipo_documento: 'FOTO_CEDULA_FRENTE', file: null, observaciones: '' },
    { tipo_documento: 'FOTO_CEDULA_REVERSO', file: null, observaciones: '' },
  ],
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

export const SEXO_OPTIONS: Array<{ value: Sexo; label: string }> = [
  { value: 'MASCULINO',        label: 'Masculino' },
  { value: 'FEMENINO',         label: 'Femenino' },
  { value: 'INTERSEXUAL',      label: 'Intersexual' },
  { value: 'NO_BINARIO',       label: 'No binario' },
  { value: 'PREFIERE_NO_DECIR', label: 'Prefiere no decir' },
];

/** Documentos del hogar: predio, servicios, propiedad. */
export const TIPOS_DOCUMENTO_HOGAR: Array<{
  value: TipoDocumentoHogar;
  label: string;
}> = [
  { value: 'RECIBO_PREDIAL',                 label: 'Recibo predial'                        },
  { value: 'CERTIFICADO_TRADICION_LIBERTAD', label: 'Certificado de tradición y libertad'   },
  { value: 'ESCRITURA_PUBLICA_PREDIO',       label: 'Escritura pública del predio'           },
  { value: 'RECIBO_SERVICIOS_PUBLICOS',      label: 'Recibo de servicios públicos (agua/luz)'},
  { value: 'DECLARACION_JURAMENTADA',        label: 'Declaración juramentada'                },
  { value: 'CERTIFICADO_RESIDENCIA',         label: 'Certificado de residencia'              },
];

/** Documentos requeridos por cada miembro (foto de identificación). */
export const DOCS_REQUERIDOS_MIEMBRO: Array<{
  value: 'FOTO_CEDULA_FRENTE' | 'FOTO_CEDULA_REVERSO';
  label: string;
}> = [
  { value: 'FOTO_CEDULA_FRENTE',  label: 'Foto cédula — frente'  },
  { value: 'FOTO_CEDULA_REVERSO', label: 'Foto cédula — reverso' },
];

/** Documentos opcionales que el usuario puede agregar a cada miembro. */
export const TIPOS_DOCUMENTO_MIEMBRO: Array<{
  value: TipoDocumentoMiembro;
  label: string;
}> = [
  { value: 'REGISTRO_CIVIL',           label: 'Registro civil (menores)' },
  { value: 'TARJETA_IDENTIDAD',        label: 'Tarjeta de identidad' },
  { value: 'CERTIFICADO_SISBEN',       label: 'Certificado SISBEN' },
  { value: 'CERTIFICADO_DISCAPACIDAD', label: 'Certificado de discapacidad' },
  { value: 'CERTIFICADO_VICTIMA',      label: 'Certificado registro de víctima (RUV)' },
  { value: 'OTRO',                     label: 'Otro documento' },
];

// ── Catálogos adicionales para campos guiados ─────────────────────────────── //

export const NIVEL_EDUCATIVO_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'NINGUNO',               label: 'Ninguno' },
  { value: 'PREESCOLAR',            label: 'Preescolar' },
  { value: 'PRIMARIA_INCOMPLETA',   label: 'Primaria incompleta' },
  { value: 'PRIMARIA_COMPLETA',     label: 'Primaria completa' },
  { value: 'SECUNDARIA_INCOMPLETA', label: 'Secundaria incompleta' },
  { value: 'SECUNDARIA_COMPLETA',   label: 'Secundaria completa (bachiller)' },
  { value: 'TECNICO',               label: 'Técnico' },
  { value: 'TECNOLOGO',             label: 'Tecnólogo' },
  { value: 'UNIVERSITARIO',         label: 'Universitario' },
  { value: 'POSGRADO',              label: 'Posgrado' },
];

export const FUENTE_INGRESOS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'EMPLEO_FORMAL',    label: 'Empleo formal' },
  { value: 'EMPLEO_INFORMAL',  label: 'Empleo informal' },
  { value: 'NEGOCIO_PROPIO',   label: 'Negocio propio' },
  { value: 'PENSION',          label: 'Pensión' },
  { value: 'SUBSIDIO_ESTATAL', label: 'Subsidio del Estado' },
  { value: 'REMESAS',          label: 'Remesas' },
  { value: 'ARRIENDO',         label: 'Arriendo de inmuebles' },
  { value: 'SIN_INGRESOS',     label: 'Sin ingresos' },
  { value: 'OTRO',             label: 'Otro' },
];

export const GRADO_DISCAPACIDAD_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'LEVE',     label: 'Leve' },
  { value: 'MODERADA', label: 'Moderada' },
  { value: 'SEVERA',   label: 'Severa' },
  { value: 'PROFUNDA', label: 'Profunda' },
];

export const HECHO_VICTIMIZANTE_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'DESPLAZAMIENTO_FORZADO',      label: 'Desplazamiento forzado' },
  { value: 'HOMICIDIO',                   label: 'Homicidio' },
  { value: 'AMENAZA',                     label: 'Amenaza' },
  { value: 'DESPOJO_TIERRAS',             label: 'Despojo de tierras' },
  { value: 'DESAPARICION_FORZADA',        label: 'Desaparición forzada' },
  { value: 'SECUESTRO',                   label: 'Secuestro' },
  { value: 'MINAS_ANTIPERSONAL',          label: 'Minas antipersonal' },
  { value: 'TORTURA',                     label: 'Tortura' },
  { value: 'RECLUTAMIENTO_FORZADO',       label: 'Reclutamiento forzado' },
  { value: 'DELITOS_CONTRA_INTEGRIDAD',   label: 'Delitos contra la integridad sexual' },
  { value: 'OTRO',                        label: 'Otro' },
];

export const TIEMPO_RESIDENCIA_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'MENOS_1_ANIO', label: 'Menos de 1 año' },
  { value: '1_A_3_ANIOS',  label: '1 a 3 años' },
  { value: '3_A_5_ANIOS',  label: '3 a 5 años' },
  { value: '5_A_10_ANIOS', label: '5 a 10 años' },
  { value: 'MAS_10_ANIOS', label: 'Más de 10 años' },
];

export const GRUPO_SISBEN_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'A1',  label: 'A1 — Pobreza extrema' },
  { value: 'A2',  label: 'A2 — Pobreza extrema' },
  { value: 'A3',  label: 'A3 — Pobreza extrema' },
  { value: 'A4',  label: 'A4 — Pobreza extrema' },
  { value: 'A5',  label: 'A5 — Pobreza extrema' },
  { value: 'B1',  label: 'B1 — Pobreza moderada' },
  { value: 'B2',  label: 'B2 — Pobreza moderada' },
  { value: 'B3',  label: 'B3 — Pobreza moderada' },
  { value: 'B4',  label: 'B4 — Pobreza moderada' },
  { value: 'B5',  label: 'B5 — Pobreza moderada' },
  { value: 'B6',  label: 'B6 — Pobreza moderada' },
  { value: 'B7',  label: 'B7 — Pobreza moderada' },
  { value: 'C1',  label: 'C1 — Vulnerable' },
  { value: 'C2',  label: 'C2 — Vulnerable' },
  { value: 'C3',  label: 'C3 — Vulnerable' },
  { value: 'C4',  label: 'C4 — Vulnerable' },
  { value: 'C5',  label: 'C5 — Vulnerable' },
  { value: 'C6',  label: 'C6 — Vulnerable' },
  { value: 'C7',  label: 'C7 — Vulnerable' },
  { value: 'C8',  label: 'C8 — Vulnerable' },
  { value: 'C9',  label: 'C9 — Vulnerable' },
  { value: 'C10', label: 'C10 — Vulnerable' },
  { value: 'C11', label: 'C11 — Vulnerable' },
  { value: 'C12', label: 'C12 — Vulnerable' },
  { value: 'C13', label: 'C13 — Vulnerable' },
  { value: 'C14', label: 'C14 — Vulnerable' },
  { value: 'C15', label: 'C15 — Vulnerable' },
  { value: 'C16', label: 'C16 — Vulnerable' },
  { value: 'C17', label: 'C17 — Vulnerable' },
  { value: 'C18', label: 'C18 — Vulnerable' },
  { value: 'D1',  label: 'D1 — No pobre, no vulnerable' },
  { value: 'D2',  label: 'D2 — No pobre, no vulnerable' },
  { value: 'D3',  label: 'D3 — No pobre, no vulnerable' },
  { value: 'D4',  label: 'D4 — No pobre, no vulnerable' },
  { value: 'D5',  label: 'D5 — No pobre, no vulnerable' },
];

export const ESTADO_REINCORPORACION_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'EN_PROCESO',   label: 'En proceso de reincorporación' },
  { value: 'REINCORPORADO', label: 'Reincorporado' },
  { value: 'DESVINCULADO',  label: 'Desvinculado del proceso' },
];

export const COMUNAS_POPAYAN: Array<{ value: string; label: string }> = [
  { value: 'COMUNA_1', label: 'Comuna 1' },
  { value: 'COMUNA_2', label: 'Comuna 2' },
  { value: 'COMUNA_3', label: 'Comuna 3' },
  { value: 'COMUNA_4', label: 'Comuna 4' },
  { value: 'COMUNA_5', label: 'Comuna 5' },
  { value: 'COMUNA_6', label: 'Comuna 6' },
  { value: 'COMUNA_7', label: 'Comuna 7' },
  { value: 'COMUNA_8', label: 'Comuna 8' },
  { value: 'COMUNA_9', label: 'Comuna 9' },
];
