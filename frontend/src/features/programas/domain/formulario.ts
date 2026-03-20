/**
 * Tipos y catálogo de campos del Constructor de Formulario.
 *
 * Los campos del catálogo corresponden a las columnas de la tabla
 * `ciudadanos` en la base de datos del municipio.
 */

export type FieldType = 'text' | 'select' | 'date' | 'email';

export interface CampoCatalogo {
  id: string;
  label: string;
  type: FieldType;
  seccion: Seccion;
  obligatorioDefault: boolean;
}

export interface CampoConfig {
  obligatorio: boolean;
  texto_ayuda: string;
}

export type CampoPreview = CampoCatalogo & CampoConfig;

export const SECCIONES = [
  'DATOS PERSONALES',
  'DATOS DEMOGRÁFICOS',
  'CONTACTO Y UBICACIÓN',
] as const;

export type Seccion = (typeof SECCIONES)[number];

export const CAMPOS_CATALOGO: CampoCatalogo[] = [
  // DATOS PERSONALES
  { id: 'tipo_documento',    label: 'Tipo de documento',         type: 'select', seccion: 'DATOS PERSONALES',      obligatorioDefault: true  },
  { id: 'numero_documento',  label: 'Número de documento',       type: 'text',   seccion: 'DATOS PERSONALES',      obligatorioDefault: true  },
  { id: 'primer_nombre',     label: 'Primer nombre',             type: 'text',   seccion: 'DATOS PERSONALES',      obligatorioDefault: true  },
  { id: 'segundo_nombre',    label: 'Segundo nombre',            type: 'text',   seccion: 'DATOS PERSONALES',      obligatorioDefault: false },
  { id: 'primer_apellido',   label: 'Primer apellido',           type: 'text',   seccion: 'DATOS PERSONALES',      obligatorioDefault: true  },
  { id: 'segundo_apellido',  label: 'Segundo apellido',          type: 'text',   seccion: 'DATOS PERSONALES',      obligatorioDefault: false },
  // DATOS DEMOGRÁFICOS
  { id: 'fecha_nacimiento',         label: 'Fecha de nacimiento',        type: 'date',   seccion: 'DATOS DEMOGRÁFICOS', obligatorioDefault: true  },
  { id: 'sexo',                     label: 'Sexo',                       type: 'select', seccion: 'DATOS DEMOGRÁFICOS', obligatorioDefault: true  },
  { id: 'genero',                   label: 'Género',                     type: 'text',   seccion: 'DATOS DEMOGRÁFICOS', obligatorioDefault: false },
  { id: 'nacionalidad',             label: 'Nacionalidad',               type: 'text',   seccion: 'DATOS DEMOGRÁFICOS', obligatorioDefault: true  },
  // CONTACTO Y UBICACIÓN
  { id: 'telefono',                 label: 'Teléfono',                   type: 'text',   seccion: 'CONTACTO Y UBICACIÓN', obligatorioDefault: false },
  { id: 'correo_electronico',       label: 'Correo electrónico',         type: 'email',  seccion: 'CONTACTO Y UBICACIÓN', obligatorioDefault: false },
  { id: 'departamento_nacimiento',  label: 'Departamento de nacimiento', type: 'text',   seccion: 'CONTACTO Y UBICACIÓN', obligatorioDefault: false },
  { id: 'municipio_nacimiento',     label: 'Municipio de nacimiento',    type: 'text',   seccion: 'CONTACTO Y UBICACIÓN', obligatorioDefault: false },
];

export const SELECT_OPTIONS: Record<string, Array<{ value: string; label: string }>> = {
  tipo_documento: [
    { value: 'CEDULA_CIUDADANIA',           label: 'Cédula de ciudadanía' },
    { value: 'CEDULA_EXTRANJERIA',          label: 'Cédula de extranjería' },
    { value: 'TARJETA_IDENTIDAD',           label: 'Tarjeta de identidad' },
    { value: 'PASAPORTE',                   label: 'Pasaporte' },
    { value: 'REGISTRO_CIVIL',              label: 'Registro civil' },
    { value: 'PERMISO_PROTECCION_TEMPORAL', label: 'Permiso protección temporal' },
  ],
  sexo: [
    { value: 'MASCULINO',   label: 'Masculino' },
    { value: 'FEMENINO',    label: 'Femenino' },
    { value: 'INTERSEXUAL', label: 'Intersexual' },
  ],
};

/** Genera las configs iniciales a partir del catálogo. */
export function buildDefaultConfigs(): Record<string, CampoConfig> {
  return Object.fromEntries(
    CAMPOS_CATALOGO.map(f => [f.id, { obligatorio: f.obligatorioDefault, texto_ayuda: '' }]),
  );
}
