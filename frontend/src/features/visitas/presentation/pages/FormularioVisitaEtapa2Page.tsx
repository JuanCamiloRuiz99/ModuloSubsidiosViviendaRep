/**
 * FormularioVisitaEtapa2Page – Formulario de visita técnica para el técnico visitante.
 *
 * Accesible desde MisVisitasPage → /mis-visitas/:visitaId/formulario.
 * 1. Carga la visita DDD (para obtener postulacionId, programaId).
 * 2. Busca la etapa VISITA_TECNICA del programa.
 * 3. Busca si ya existe una Visita Etapa 2 para esa postulación.
 * 4. Si no existe, permite crearla; si existe, permite editarla.
 * 5. Incluye sección de Datos de Hogar cuando la visita es efectiva.
 */

import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useVisita } from '../hooks/use-visita';
import { etapaRepository, type EtapaData } from '../../../programas/infrastructure/persistence/axios-etapa-repository';
import {
  visitaEtapa2Repository,
  type DatosHogarEtapa2,
} from '../../../programas/infrastructure/persistence/axios-visita-etapa2-repository';
import { storageService } from '../../../../core/services';

// ── Opciones de selects ─────────────────────────────────────────────────── //

const MOTIVO_NO_EFECTIVA = [
  { value: 'AUSENTE', label: 'Ausente' },
  { value: 'RECHAZO', label: 'Rechazo' },
  { value: 'DIRECCION_NO_ENCONTRADA', label: 'Dirección no encontrada' },
  { value: 'OTRO', label: 'Otro' },
];

const CALIDAD_TENENCIA = [
  { value: 'PROPIETARIO', label: 'Propietario' },
  { value: 'POSEEDOR', label: 'Poseedor' },
  { value: 'ARRENDATARIO', label: 'Arrendatario' },
  { value: 'USUFRUCTUARIO', label: 'Usufructuario' },
];

const USO_INMUEBLE = [
  { value: 'RESIDENCIAL', label: 'Residencial' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'MIXTO', label: 'Mixto' },
  { value: 'INSTITUCIONAL', label: 'Institucional' },
];

const RANGO_INGRESOS = [
  { value: 'MENOS_1_SMMLV', label: 'Menos de 1 SMMLV' },
  { value: '1_A_2_SMMLV', label: '1 a 2 SMMLV' },
  { value: '2_A_4_SMMLV', label: '2 a 4 SMMLV' },
  { value: 'MAS_4_SMMLV', label: 'Más de 4 SMMLV' },
];

const MATERIAL_PISOS = [
  { value: 'TIERRA', label: 'Tierra' },
  { value: 'CEMENTO', label: 'Cemento' },
  { value: 'BALDOSA', label: 'Baldosa' },
  { value: 'MADERA', label: 'Madera' },
  { value: 'OTRO', label: 'Otro' },
];

const MATERIAL_PAREDES = [
  { value: 'BAHAREQUE', label: 'Bahareque' },
  { value: 'MADERA', label: 'Madera' },
  { value: 'BLOQUE_LADRILLO', label: 'Bloque/Ladrillo' },
  { value: 'PREFABRICADO', label: 'Prefabricado' },
  { value: 'OTRO', label: 'Otro' },
];

const PERCEPCION_SEGURIDAD = [
  { value: 'ALTA', label: 'Alta' },
  { value: 'MEDIA', label: 'Media' },
  { value: 'BAJA', label: 'Baja' },
];

const TIPO_DOCUMENTO_VISITA = [
  { value: 'RECIBO_PREDIAL', label: 'Recibo predial' },
  { value: 'CERTIFICADO_TRADICION_LIBERTAD', label: 'Certificado de tradición y libertad' },
  { value: 'ESCRITURA_PUBLICA', label: 'Escritura pública' },
  { value: 'CONTRATO_ARRENDAMIENTO', label: 'Contrato de arrendamiento' },
  { value: 'RECIBO_AGUA', label: 'Recibo de agua' },
  { value: 'RECIBO_ENERGIA', label: 'Recibo de energía' },
  { value: 'RECIBO_GAS', label: 'Recibo de gas' },
  { value: 'FOTO_VISITA', label: 'Foto de la visita' },
  { value: 'INFORME_TECNICO', label: 'Informe técnico' },
  { value: 'ACTA_VISITA', label: 'Acta de visita' },
  { value: 'OTRO', label: 'Otro' },
];

// ── Helpers de UI ─────────────────────────────────────────────────────────── //

const SelectField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
}> = ({ label, value, onChange, options, disabled }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      disabled={disabled}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm disabled:bg-gray-100"
    >
      <option value="">Seleccionar...</option>
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

const BoolField: React.FC<{
  label: string;
  value: boolean | null;
  onChange: (v: boolean | null) => void;
  disabled?: boolean;
}> = ({ label, value, onChange, disabled }) => (
  <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-lg">
    <span className="text-sm text-gray-700">{label}</span>
    <div className="flex gap-2">
      {[
        { val: true, lbl: 'Sí', color: 'bg-green-500' },
        { val: false, lbl: 'No', color: 'bg-red-500' },
      ].map(opt => (
        <button
          key={String(opt.val)}
          type="button"
          disabled={disabled}
          onClick={() => onChange(value === opt.val ? null : opt.val)}
          className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
            value === opt.val
              ? `${opt.color} text-white`
              : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {opt.lbl}
        </button>
      ))}
    </div>
  </div>
);

const SectionTitle: React.FC<{ icon: string; title: string }> = ({ icon, title }) => (
  <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2 mb-4 mt-6 first:mt-0">
    <span>{icon}</span> {title}
  </h3>
);

// ── Formulario visita ─────────────────────────────────────────────────────── //

interface VisitaForm {
  fecha_visita: string;
  visita_efectiva: boolean;
  motivo_no_efectiva: string;
  motivo_no_efectiva_otro: string;
  nombre_encuestado: string;
  numero_documento_encuestado: string;
  telefono_contacto: string;
  acta_firmada: string;
  observaciones_generales: string;
}

const initialVisitaForm: VisitaForm = {
  fecha_visita: new Date().toISOString().slice(0, 16),
  visita_efectiva: true,
  motivo_no_efectiva: '',
  motivo_no_efectiva_otro: '',
  nombre_encuestado: '',
  numero_documento_encuestado: '',
  telefono_contacto: '',
  acta_firmada: '',
  observaciones_generales: '',
};

const initialDatosHogar: Partial<DatosHogarEtapa2> = {
  calidad_tenencia: '',
  tiene_escrituras: null,
  tiene_certificado_libertad: null,
  tiene_contrato_arrendamiento: null,
  uso_inmueble: '',
  rango_ingresos_hogar: '',
  hay_adultos_mayores: null,
  hay_personas_discapacidad: null,
  hay_madre_cabeza_hogar: null,
  hay_victimas_conflicto: null,
  material_pisos: '',
  material_paredes: '',
  numero_habitaciones: null,
  tiene_agua: null,
  tiene_energia: null,
  tiene_gas: null,
  tiene_alcantarillado: null,
  percepcion_seguridad: '',
  riesgo_inundacion: null,
  riesgo_deslizamiento: null,
  riesgo_estructural: null,
};

// ── Página ────────────────────────────────────────────────────────────────── //

export default function FormularioVisitaEtapa2Page() {
  const { visitaId } = useParams<{ visitaId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Obtener la visita DDD
  const { visita: visitaDDD, isLoading: loadingVisita, error: errorVisita } = useVisita(visitaId!);

  // 2. Obtener etapas del programa para encontrar la VISITA_TECNICA
  const programaId = visitaDDD?.programaId;
  const { data: etapas } = useQuery({
    queryKey: ['etapas', programaId],
    queryFn: () => etapaRepository.listarPorPrograma(programaId!),
    enabled: !!programaId,
  });

  const etapaVT: EtapaData | undefined = etapas?.find(
    e => e.modulo_principal === 'VISITA_TECNICA' && e.visita_tecnica_publicado === true,
  );

  // 3. La visita asignada (visitaId de la URL) ES la visita E2 — usarla directamente
  const postulacionId = visitaDDD?.postulacionId;
  // visitaId del param ES el ID de la Visita asignada por el funcionario
  const visitaE2Id: number | null = visitaId ? Number(visitaId) : null;

  const { data: visitaE2Detail, isLoading: loadingE2 } = useQuery({
    queryKey: ['visita-etapa2', visitaE2Id],
    queryFn: () => visitaEtapa2Repository.obtener(visitaE2Id!),
    enabled: visitaE2Id !== null,
  });

  // ── Estado del formulario ──

  const [visitaForm, setVisitaForm] = useState<VisitaForm>(initialVisitaForm);
  const [datosHogar, setDatosHogar] = useState<Partial<DatosHogarEtapa2>>(initialDatosHogar);
  const [initialized, setInitialized] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // Foto del predio (archivo PNG)
  const [fotoFile, setFotoFile] = useState<File | null>(null);

  // Documentos
  const [docTipo, setDocTipo] = useState('');
  const [docArchivo, setDocArchivo] = useState<File | null>(null);
  const [docObs, setDocObs] = useState('');

  // Query documentos (solo cuando existe la visita E2)
  const { data: documentos = [], refetch: refetchDocs } = useQuery({
    queryKey: ['visita-e2-docs', visitaE2Id],
    queryFn: () => visitaEtapa2Repository.listarDocumentos(visitaE2Id!),
    enabled: visitaE2Id !== null,
  });

  const subirDocMutation = useMutation({
    mutationFn: () =>
      visitaEtapa2Repository.subirDocumento(visitaE2Id!, docTipo, docArchivo!, docObs || undefined),
    onSuccess: () => {
      setDocTipo('');
      setDocArchivo(null);
      setDocObs('');
      void refetchDocs();
      void queryClient.invalidateQueries({ queryKey: ['visitas', 'mis-visitas'] });
      void queryClient.invalidateQueries({ queryKey: ['visita', visitaId] });
      setToast({ msg: 'Documento subido exitosamente', type: 'success' });
    },
    onError: () => setToast({ msg: 'Error al subir el documento', type: 'error' }),
  });

  const eliminarDocMutation = useMutation({
    mutationFn: (docId: number) => visitaEtapa2Repository.eliminarDocumento(visitaE2Id!, docId),
    onSuccess: () => {
      void refetchDocs();
      void queryClient.invalidateQueries({ queryKey: ['visitas', 'mis-visitas'] });
      void queryClient.invalidateQueries({ queryKey: ['visita', visitaId] });
      setToast({ msg: 'Documento eliminado', type: 'success' });
    },
    onError: () => setToast({ msg: 'Error al eliminar el documento', type: 'error' }),
  });

  // Inicializar formulario con datos existentes
  useEffect(() => {
    if (initialized) return;
    if (visitaE2Detail) {
      setVisitaForm({
        fecha_visita: visitaE2Detail.fecha_visita?.slice(0, 16) ?? initialVisitaForm.fecha_visita,
        visita_efectiva: visitaE2Detail.visita_efectiva,
        motivo_no_efectiva: visitaE2Detail.motivo_no_efectiva ?? '',
        motivo_no_efectiva_otro: visitaE2Detail.motivo_no_efectiva_otro ?? '',
        nombre_encuestado: visitaE2Detail.nombre_encuestado ?? '',
        numero_documento_encuestado: visitaE2Detail.numero_documento_encuestado ?? '',
        telefono_contacto: visitaE2Detail.telefono_contacto ?? '',
        acta_firmada: visitaE2Detail.acta_firmada ?? '',
        observaciones_generales: visitaE2Detail.observaciones_generales ?? '',
      });
      if (visitaE2Detail.datos_hogar) {
        setDatosHogar(prev => ({ ...prev, ...visitaE2Detail.datos_hogar }));
      }
      setInitialized(true);
    } else if (!loadingE2) {
      // Query resolvió sin datos (nunca debería ocurrir para una visita asignada)
      setInitialized(true);
    }
  }, [visitaE2Detail, loadingE2, initialized]);

  const setVF = <K extends keyof VisitaForm>(k: K, v: VisitaForm[K]) =>
    setVisitaForm(prev => ({ ...prev, [k]: v }));

  const setDH = <K extends keyof DatosHogarEtapa2>(k: K, v: DatosHogarEtapa2[K]) =>
    setDatosHogar(prev => ({ ...prev, [k]: v }));

  // ── Mutations ──

  const crearVisitaE2 = useMutation({
    mutationFn: async () => {
      const user = storageService.getUser();
      const created = await visitaEtapa2Repository.crear({
        postulacion: Number(postulacionId),
        etapa: etapaVT!.id,
        encuestador: user?.id ?? user?.usuario_id,
        fecha_visita: visitaForm.fecha_visita,
        visita_efectiva: visitaForm.visita_efectiva,
        motivo_no_efectiva: visitaForm.visita_efectiva ? undefined : visitaForm.motivo_no_efectiva,
        motivo_no_efectiva_otro: visitaForm.motivo_no_efectiva === 'OTRO' ? visitaForm.motivo_no_efectiva_otro : undefined,
        nombre_encuestado: visitaForm.nombre_encuestado || undefined,
        numero_documento_encuestado: visitaForm.numero_documento_encuestado || undefined,
        telefono_contacto: visitaForm.telefono_contacto || undefined,
        acta_firmada: visitaForm.acta_firmada || undefined,
        observaciones_generales: visitaForm.observaciones_generales || undefined,
      });

      // Si es efectiva y hay datos hogar, guardarlos
      if (visitaForm.visita_efectiva) {
        await visitaEtapa2Repository.guardarDatosHogar(created.id, datosHogar);
      }

      // Subir foto del predio si se seleccionó
      if (fotoFile) {
        await visitaEtapa2Repository.subirDocumento(created.id, 'FOTO_VISITA', fotoFile);
      }

      return created;
    },
    onSuccess: () => {
      setFotoFile(null);
      void queryClient.invalidateQueries({ queryKey: ['visitas-etapa2'] });
      void queryClient.invalidateQueries({ queryKey: ['visita', visitaId] });
      void queryClient.invalidateQueries({ queryKey: ['visitas', 'mis-visitas'] });
      void refetchDocs();
      setToast({ msg: 'Visita técnica registrada exitosamente', type: 'success' });
    },
    onError: () => {
      setToast({ msg: 'Error al registrar la visita técnica', type: 'error' });
    },
  });

  const actualizarVisitaE2 = useMutation({
    mutationFn: async () => {
      const updated = await visitaEtapa2Repository.actualizar(visitaE2Id!, {
        fecha_visita: visitaForm.fecha_visita,
        visita_efectiva: visitaForm.visita_efectiva,
        motivo_no_efectiva: visitaForm.visita_efectiva ? undefined : visitaForm.motivo_no_efectiva,
        motivo_no_efectiva_otro: visitaForm.motivo_no_efectiva === 'OTRO' ? visitaForm.motivo_no_efectiva_otro : undefined,
        nombre_encuestado: visitaForm.nombre_encuestado || undefined,
        numero_documento_encuestado: visitaForm.numero_documento_encuestado || undefined,
        telefono_contacto: visitaForm.telefono_contacto || undefined,
        acta_firmada: visitaForm.acta_firmada || undefined,
        observaciones_generales: visitaForm.observaciones_generales || undefined,
      });

      if (visitaForm.visita_efectiva) {
        await visitaEtapa2Repository.guardarDatosHogar(updated.id, datosHogar);
      }

      // Subir foto del predio si se seleccionó
      if (fotoFile) {
        await visitaEtapa2Repository.subirDocumento(visitaE2Id!, 'FOTO_VISITA', fotoFile);
      }

      return updated;
    },
    onSuccess: () => {
      setFotoFile(null);
      void queryClient.invalidateQueries({ queryKey: ['visitas-etapa2'] });
      void queryClient.invalidateQueries({ queryKey: ['visita-etapa2', visitaE2Id] });
      void queryClient.invalidateQueries({ queryKey: ['visita', visitaId] });
      void queryClient.invalidateQueries({ queryKey: ['visitas', 'mis-visitas'] });
      void refetchDocs();
      setToast({ msg: 'Visita técnica actualizada exitosamente', type: 'success' });
    },
    onError: () => {
      setToast({ msg: 'Error al actualizar la visita técnica', type: 'error' });
    },
  });

  const handleSubmit = () => {
    if (visitaE2Id) {
      actualizarVisitaE2.mutate();
    } else {
      crearVisitaE2.mutate();
    }
  };

  const isSaving = crearVisitaE2.isPending || actualizarVisitaE2.isPending;
  const isExistente = visitaE2Id !== null;

  // ── Loading / Error states ──

  const isLoading = loadingVisita || loadingE2;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando formulario...</p>
        </div>
      </div>
    );
  }

  if (errorVisita || !visitaDDD) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">⚠️</div>
          <p className="text-red-700 font-medium">No se pudo cargar la visita.</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-indigo-600 hover:underline">
            Volver a Mis Visitas
          </button>
        </div>
      </div>
    );
  }

  if (!etapaVT) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 text-center">
          <div className="text-3xl mb-2">📋</div>
          <p className="text-amber-700 font-medium">
            El formulario de Visita Técnica aún no ha sido publicado para este programa.
          </p>
          <p className="text-amber-600 text-sm mt-2">
            Contacte al gestor del programa para habilitar el formulario.
          </p>
          <button onClick={() => navigate(-1)} className="mt-4 text-sm text-indigo-600 hover:underline">
            Volver a Mis Visitas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-4 flex flex-col gap-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${toast.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 'bg-red-100 text-red-800 border border-red-200'}`}>
          {toast.msg}
        </div>
      )}

      {/* Cabecera */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/mis-visitas')}
            className="flex-shrink-0 p-2 rounded-full hover:bg-gray-100 transition-colors text-gray-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">
              Formulario de Visita Técnica
            </p>
            <h1 className="text-xl font-extrabold text-gray-900 leading-tight">
              {visitaDDD.direccion}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Postulación: {visitaDDD.postulacionId} · Visita DDD #{visitaDDD.id}
            </p>
          </div>
        </div>
        <span className={`flex-shrink-0 mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap ${isExistente ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>
          {isExistente ? 'Editando' : 'Nuevo registro'}
        </span>
      </div>

      {/* ── Sección 1: Información de la visita ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionTitle icon="📋" title="Información de la Visita" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de la visita</label>
            <input
              type="datetime-local"
              value={visitaForm.fecha_visita}
              onChange={e => setVF('fecha_visita', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
            />
          </div>
          <div className="flex items-end">
            <BoolField
              label="¿Visita efectiva?"
              value={visitaForm.visita_efectiva}
              onChange={v => setVF('visita_efectiva', v ?? true)}
            />
          </div>
        </div>

        {!visitaForm.visita_efectiva && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-2 space-y-3">
            <SelectField
              label="Motivo de visita no efectiva"
              value={visitaForm.motivo_no_efectiva}
              onChange={v => setVF('motivo_no_efectiva', v)}
              options={MOTIVO_NO_EFECTIVA}
            />
            {visitaForm.motivo_no_efectiva === 'OTRO' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Especifique el motivo</label>
                <input
                  type="text"
                  value={visitaForm.motivo_no_efectiva_otro}
                  onChange={e => setVF('motivo_no_efectiva_otro', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                  placeholder="Describa el motivo..."
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Sección 2: Datos del encuestado ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionTitle icon="👤" title="Datos del Encuestado" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nombre del encuestado</label>
            <input
              type="text"
              value={visitaForm.nombre_encuestado}
              onChange={e => setVF('nombre_encuestado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Número de documento</label>
            <input
              type="text"
              value={visitaForm.numero_documento_encuestado}
              onChange={e => setVF('numero_documento_encuestado', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              placeholder="Documento de identidad"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono de contacto</label>
            <input
              type="tel"
              value={visitaForm.telefono_contacto}
              onChange={e => setVF('telefono_contacto', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              placeholder="Teléfono"
            />
          </div>
        </div>
      </div>

      {/* ── Sección 3: Acta y observaciones ── */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <SectionTitle icon="📝" title="Acta y Observaciones" />

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Referencia del acta firmada</label>
            <input
              type="text"
              value={visitaForm.acta_firmada}
              onChange={e => setVF('acta_firmada', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              placeholder="N° de acta o referencia del documento firmado"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones generales</label>
            <textarea
              rows={4}
              value={visitaForm.observaciones_generales}
              onChange={e => setVF('observaciones_generales', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              placeholder="Observaciones sobre la visita..."
            />
          </div>
        </div>
      </div>

      {/* ── Sección 4: Datos del Hogar (solo si efectiva) ── */}
      {visitaForm.visita_efectiva && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Datos del Hogar</h2>
          <p className="text-sm text-gray-500 mb-6">
            Complete la información recopilada durante la visita técnica.
          </p>

          {/* Foto del predio */}
          <SectionTitle icon="📷" title="Foto de la Visita" />
          <div className="mb-6 space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto del predio (PNG)</label>
              <input
                type="file"
                accept="image/png"
                onChange={e => setFotoFile(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
              />
              {fotoFile && (
                <p className="text-xs text-indigo-600 mt-1">📸 Seleccionado: {fotoFile.name} — se subirá al guardar</p>
              )}
            </div>
            {/* Fotos ya subidas */}
            {documentos.filter(d => d.activo_logico && d.tipo_documento === 'FOTO_VISITA').length > 0 && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                <p className="text-xs text-gray-600 font-medium mb-2">Fotos guardadas:</p>
                <div className="flex flex-wrap gap-2">
                  {documentos.filter(d => d.activo_logico && d.tipo_documento === 'FOTO_VISITA').map(d => (
                    <div key={d.id} className="flex items-center gap-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-800 rounded text-xs border border-indigo-200">
                        📷 {d.nombre_archivo || `Foto #${d.id}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => eliminarDocMutation.mutate(d.id)}
                        className="text-red-400 hover:text-red-600 transition-colors"
                        title="Eliminar foto"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Tenencia */}
          <SectionTitle icon="🏠" title="Tenencia del Inmueble" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <SelectField
              label="Calidad de Tenencia"
              value={(datosHogar.calidad_tenencia as string) || ''}
              onChange={v => setDH('calidad_tenencia', v)}
              options={CALIDAD_TENENCIA}
            />
            <div className="flex flex-col gap-2">
              <BoolField label="¿Tiene escrituras?" value={datosHogar.tiene_escrituras ?? null} onChange={v => setDH('tiene_escrituras', v)} />
              <BoolField label="¿Certificado de libertad?" value={datosHogar.tiene_certificado_libertad ?? null} onChange={v => setDH('tiene_certificado_libertad', v)} />
              <BoolField label="¿Contrato de arrendamiento?" value={datosHogar.tiene_contrato_arrendamiento ?? null} onChange={v => setDH('tiene_contrato_arrendamiento', v)} />
            </div>
          </div>

          {/* Uso e ingresos */}
          <SectionTitle icon="💰" title="Uso del Inmueble e Ingresos" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <SelectField label="Uso del Inmueble" value={(datosHogar.uso_inmueble as string) || ''} onChange={v => setDH('uso_inmueble', v)} options={USO_INMUEBLE} />
            <SelectField label="Rango de Ingresos" value={(datosHogar.rango_ingresos_hogar as string) || ''} onChange={v => setDH('rango_ingresos_hogar', v)} options={RANGO_INGRESOS} />
          </div>

          {/* Vulnerabilidad */}
          <SectionTitle icon="🤝" title="Condiciones de Vulnerabilidad" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <BoolField label="¿Adultos mayores?" value={datosHogar.hay_adultos_mayores ?? null} onChange={v => setDH('hay_adultos_mayores', v)} />
            <BoolField label="¿Personas con discapacidad?" value={datosHogar.hay_personas_discapacidad ?? null} onChange={v => setDH('hay_personas_discapacidad', v)} />
            <BoolField label="¿Madre cabeza de hogar?" value={datosHogar.hay_madre_cabeza_hogar ?? null} onChange={v => setDH('hay_madre_cabeza_hogar', v)} />
            <BoolField label="¿Víctimas del conflicto?" value={datosHogar.hay_victimas_conflicto ?? null} onChange={v => setDH('hay_victimas_conflicto', v)} />
          </div>

          {/* Condiciones físicas */}
          <SectionTitle icon="🧱" title="Condiciones Físicas del Inmueble" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <SelectField label="Material de Pisos" value={(datosHogar.material_pisos as string) || ''} onChange={v => setDH('material_pisos', v)} options={MATERIAL_PISOS} />
            <SelectField label="Material de Paredes" value={(datosHogar.material_paredes as string) || ''} onChange={v => setDH('material_paredes', v)} options={MATERIAL_PAREDES} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Número de Habitaciones</label>
              <input
                type="number"
                min={1}
                value={datosHogar.numero_habitaciones ?? ''}
                onChange={e => setDH('numero_habitaciones', e.target.value ? Number(e.target.value) : null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                placeholder="Ej: 3"
              />
            </div>
          </div>

          {/* Servicios públicos */}
          <SectionTitle icon="💡" title="Servicios Públicos" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <BoolField label="¿Tiene agua?" value={datosHogar.tiene_agua ?? null} onChange={v => setDH('tiene_agua', v)} />
            <BoolField label="¿Tiene energía?" value={datosHogar.tiene_energia ?? null} onChange={v => setDH('tiene_energia', v)} />
            <BoolField label="¿Tiene gas?" value={datosHogar.tiene_gas ?? null} onChange={v => setDH('tiene_gas', v)} />
            <BoolField label="¿Tiene alcantarillado?" value={datosHogar.tiene_alcantarillado ?? null} onChange={v => setDH('tiene_alcantarillado', v)} />
          </div>

          {/* Entorno */}
          <SectionTitle icon="🌍" title="Condiciones del Entorno" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <SelectField label="Percepción de Seguridad" value={(datosHogar.percepcion_seguridad as string) || ''} onChange={v => setDH('percepcion_seguridad', v)} options={PERCEPCION_SEGURIDAD} />
            <div className="flex flex-col gap-2">
              <BoolField label="¿Riesgo de inundación?" value={datosHogar.riesgo_inundacion ?? null} onChange={v => setDH('riesgo_inundacion', v)} />
              <BoolField label="¿Riesgo de deslizamiento?" value={datosHogar.riesgo_deslizamiento ?? null} onChange={v => setDH('riesgo_deslizamiento', v)} />
              <BoolField label="¿Riesgo estructural?" value={datosHogar.riesgo_estructural ?? null} onChange={v => setDH('riesgo_estructural', v)} />
            </div>
          </div>
        </div>
      )}

      {/* ── Sección 5: Documentos de la Visita ── */}
      {isExistente && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <SectionTitle icon="📎" title="Documentos de la Visita" />
          <p className="text-sm text-gray-500 mb-4">
            Adjunte los documentos recopilados durante la visita técnica.
          </p>

          {/* Lista de documentos existentes */}
          {documentos.length > 0 && (
            <div className="mb-6 space-y-2">
              {documentos.filter(d => d.activo_logico).map(doc => {
                const tipoLabel = TIPO_DOCUMENTO_VISITA.find(t => t.value === doc.tipo_documento)?.label ?? doc.tipo_documento;
                return (
                  <div key={doc.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{tipoLabel}</p>
                        <p className="text-xs text-gray-500 truncate">{doc.nombre_archivo || 'Sin nombre'}</p>
                        {doc.observaciones && <p className="text-xs text-gray-400 truncate">{doc.observaciones}</p>}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => eliminarDocMutation.mutate(doc.id)}
                      disabled={eliminarDocMutation.isPending}
                      className="flex-shrink-0 p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Eliminar documento"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Formulario para subir nuevo documento */}
          <div className="border border-dashed border-gray-300 rounded-lg p-4 bg-gray-50/50">
            <p className="text-sm font-medium text-gray-700 mb-3">Agregar documento</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
              <SelectField
                label="Tipo de documento"
                value={docTipo}
                onChange={v => setDocTipo(v)}
                options={TIPO_DOCUMENTO_VISITA}
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                <input
                  type="file"
                  onChange={e => setDocArchivo(e.target.files?.[0] ?? null)}
                  className="w-full text-sm text-gray-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (opcional)</label>
              <input
                type="text"
                value={docObs}
                onChange={e => setDocObs(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                placeholder="Observaciones del documento..."
              />
            </div>
            <button
              type="button"
              disabled={!docTipo || !docArchivo || subirDocMutation.isPending}
              onClick={() => subirDocMutation.mutate()}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {subirDocMutation.isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                  </svg>
                  Subiendo...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Subir documento
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ── Barra de acciones ── */}
      <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-200">
        <button
          type="button"
          onClick={() => navigate('/mis-visitas')}
          className="px-5 py-2.5 rounded-xl border border-gray-300 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
        <button
          type="button"
          disabled={isSaving}
          onClick={handleSubmit}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold shadow-sm transition-colors"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Guardando...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              {isExistente ? 'Actualizar Visita' : 'Registrar Visita'}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
