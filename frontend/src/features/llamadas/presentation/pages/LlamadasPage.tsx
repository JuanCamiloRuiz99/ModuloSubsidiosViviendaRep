/**
 * LlamadasPage – Módulo de registro de llamadas a postulantes.
 *
 * Permite registrar, listar y eliminar llamadas telefónicas
 * a los postulantes para dar seguimiento a su proceso.
 */

import React, { useMemo, useState } from 'react';
import { useLlamadas, useCrearLlamada, useEliminarLlamada } from '../hooks/use-llamadas';
import { storageService } from '../../../../core/services';

// ── Constantes ─────────────────────────────────────────────────────────────── //

const RESULTADOS = [
  { value: 'CONTESTADA',            label: 'Contestada' },
  { value: 'NO_CONTESTA',           label: 'No contesta' },
  { value: 'BUZON',                 label: 'Buzón de voz' },
  { value: 'NUMERO_EQUIVOCADO',     label: 'Número equivocado' },
  { value: 'NUMERO_FUERA_SERVICIO', label: 'Número fuera de servicio' },
];

const RESULTADO_STYLES: Record<string, string> = {
  CONTESTADA:            'bg-green-100 text-green-700',
  NO_CONTESTA:           'bg-yellow-100 text-yellow-700',
  BUZON:                 'bg-orange-100 text-orange-700',
  NUMERO_EQUIVOCADO:     'bg-red-100 text-red-700',
  NUMERO_FUERA_SERVICIO: 'bg-gray-100 text-gray-600',
};

// ── Página ─────────────────────────────────────────────────────────────────── //

export const LlamadasPage: React.FC = () => {
  const user = storageService.getUser();
  const { llamadas, isLoading, error } = useLlamadas();
  const crearMutation = useCrearLlamada();
  const eliminarMutation = useEliminarLlamada();

  // ── Filtros ─────────────────────────────────────────────────────────────── //
  const [filtroResultado, setFiltroResultado] = useState('');
  const [busqueda, setBusqueda] = useState('');

  // ── Form nueva llamada ─────────────────────────────────────────────────── //
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    postulacion: '',
    fecha_llamada: new Date().toISOString().slice(0, 10),
    hora_llamada: new Date().toTimeString().slice(0, 5),
    resultado: '',
    observaciones: '',
  });

  const resetForm = () => {
    setForm({
      postulacion: '',
      fecha_llamada: new Date().toISOString().slice(0, 10),
      hora_llamada: new Date().toTimeString().slice(0, 5),
      resultado: '',
      observaciones: '',
    });
  };

  const handleCrear = async () => {
    if (!form.postulacion || !form.resultado) return;
    await crearMutation.mutateAsync({
      postulacion: Number(form.postulacion),
      usuario_llamada: user?.id_usuario ?? user?.id,
      fecha_llamada: form.fecha_llamada,
      hora_llamada: form.hora_llamada,
      resultado: form.resultado,
      observaciones: form.observaciones,
    });
    resetForm();
    setShowForm(false);
  };

  // ── Filtrado ────────────────────────────────────────────────────────────── //
  const filas = useMemo(() => {
    const q = busqueda.toLowerCase().trim();
    return llamadas.filter(ll => {
      if (filtroResultado && ll.resultado !== filtroResultado) return false;
      if (!q) return true;
      return (
        String(ll.postulacion).includes(q) ||
        ll.usuario_nombre?.toLowerCase().includes(q) ||
        ll.observaciones?.toLowerCase().includes(q)
      );
    });
  }, [llamadas, filtroResultado, busqueda]);

  // ── Stats ──────────────────────────────────────────────────────────────── //
  const stats = useMemo(() => ({
    total:      llamadas.length,
    contestadas: llamadas.filter(l => l.resultado === 'CONTESTADA').length,
    noContesta: llamadas.filter(l => l.resultado === 'NO_CONTESTA').length,
    buzon:      llamadas.filter(l => l.resultado === 'BUZON').length,
  }), [llamadas]);

  if (error) {
    return (
      <div className="p-6 text-center text-red-500">
        Error al cargar llamadas: {error}
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">📞 Registro de Llamadas</h1>
          <p className="text-sm text-gray-500 mt-1">
            Registro de llamadas telefónicas realizadas a los postulantes.
          </p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          {showForm ? '✕ Cerrar' : '📞 Registrar Llamada'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-green-600 uppercase tracking-wide">Contestadas</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{stats.contestadas}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-yellow-600 uppercase tracking-wide">No contesta</p>
          <p className="text-2xl font-bold text-yellow-700 mt-1">{stats.noContesta}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <p className="text-xs text-orange-600 uppercase tracking-wide">Buzón</p>
          <p className="text-2xl font-bold text-orange-700 mt-1">{stats.buzon}</p>
        </div>
      </div>

      {/* Form registrar llamada */}
      {showForm && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Nueva Llamada</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ID Postulación *</label>
              <input
                type="number"
                value={form.postulacion}
                onChange={e => setForm(f => ({ ...f, postulacion: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                placeholder="Ej: 123"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha *</label>
              <input
                type="date"
                value={form.fecha_llamada}
                onChange={e => setForm(f => ({ ...f, fecha_llamada: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hora *</label>
              <input
                type="time"
                value={form.hora_llamada}
                onChange={e => setForm(f => ({ ...f, hora_llamada: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Resultado *</label>
              <select
                value={form.resultado}
                onChange={e => setForm(f => ({ ...f, resultado: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
              >
                <option value="">Seleccione...</option>
                {RESULTADOS.map(r => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones</label>
              <input
                type="text"
                value={form.observaciones}
                onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 text-sm"
                placeholder="Observaciones de la llamada..."
              />
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => { resetForm(); setShowForm(false); }}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              onClick={handleCrear}
              disabled={!form.postulacion || !form.resultado || crearMutation.isPending}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {crearMutation.isPending ? 'Guardando...' : 'Guardar Llamada'}
            </button>
          </div>
          {crearMutation.isError && (
            <p className="text-sm text-red-500 mt-2">
              Error al registrar la llamada. Verifique que el ID de postulación sea válido.
            </p>
          )}
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <input
          type="text"
          value={busqueda}
          onChange={e => setBusqueda(e.target.value)}
          placeholder="Buscar por ID postulación, usuario u observaciones..."
          className="flex-1 min-w-[240px] px-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
        />
        <select
          value={filtroResultado}
          onChange={e => setFiltroResultado(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400"
        >
          <option value="">Todos los resultados</option>
          {RESULTADOS.map(r => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500">Cargando llamadas...</div>
        ) : filas.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            No se encontraron llamadas registradas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-left text-xs text-gray-500 uppercase tracking-wider">
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Postulación</th>
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Hora</th>
                  <th className="px-4 py-3">Resultado</th>
                  <th className="px-4 py-3">Quien llamó</th>
                  <th className="px-4 py-3">Observaciones</th>
                  <th className="px-4 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filas.map(ll => {
                  const resultadoLabel = RESULTADOS.find(r => r.value === ll.resultado)?.label ?? ll.resultado;
                  return (
                    <tr key={ll.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-gray-900">{ll.id}</td>
                      <td className="px-4 py-3 text-gray-700">#{ll.postulacion}</td>
                      <td className="px-4 py-3 text-gray-700">{ll.fecha_llamada}</td>
                      <td className="px-4 py-3 text-gray-700">{ll.hora_llamada}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${RESULTADO_STYLES[ll.resultado] ?? 'bg-gray-100 text-gray-600'}`}>
                          {resultadoLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{ll.usuario_nombre || '—'}</td>
                      <td className="px-4 py-3 text-gray-500 max-w-[200px] truncate" title={ll.observaciones}>
                        {ll.observaciones || '—'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm('¿Desea eliminar esta llamada?')) {
                              eliminarMutation.mutate(ll.id);
                            }
                          }}
                          disabled={eliminarMutation.isPending}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                          title="Eliminar llamada"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
