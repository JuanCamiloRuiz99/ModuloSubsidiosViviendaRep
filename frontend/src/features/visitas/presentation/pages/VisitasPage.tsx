/**
 * VisitasPage – Módulo unificado de Visitas Técnicas.
 *
 * Combina el mapa interactivo y la gestión de agrupación/asignación
 * en una sola pantalla con dos pestañas: «Mapa» y «Gestión».
 *
 * Usa Leaflet vanilla (vía refs) porque react-leaflet 4.x no es
 * compatible con React 19 StrictMode.
 *
 * Optimizaciones:
 *  - Geocodificación con caché en IndexedDB (geocodeBatch).
 *  - Iconos de marcador cacheados (getMarkerIcon).
 *  - Popups XSS-safe (buildPopupHtml).
 *  - Componentes memoizados para listas largas.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import L from 'leaflet';
import { HeaderPanel, StatCard } from '../../../../shared/presentation/components';
import { useNavigate } from 'react-router-dom';
import { usePostulantes } from '../../../postulantes/presentation/hooks/use-postulantes';
import { useProgramas } from '../../../programas/presentation/hooks/useProgramas';
import { useEtapas } from '../../../programas/presentation/hooks/useEtapas';
import { useTecnicos } from '../hooks/use-tecnicos';
import { useCrearVisita } from '../hooks/use-visita-actions';
import { CrearVisitaDTO } from '../../application/dtos/visita-in';
import { kmeans } from '../utils/kmeans';
import {
  initMap,
  fitBoundsToPoints,
  buildPopupHtml,
  getMarkerIcon,
  DEFAULT_ICON,
  SELECTED_ICON,
  CLUSTER_COLORS,
  ASSIGNED_COLOR,
} from '../utils/leaflet-helpers';
import type { MapRefs } from '../utils/leaflet-helpers';
import {
  geocodeBatch,
  nombreCompleto,
} from '../utils/geocoding';
import type { GeocodedMarker, GeocodeProgress } from '../utils/geocoding';
import { GeocodingProgress } from '../components/GeocodingProgress';
import { PostulantesListPanel } from '../components/PostulantesListPanel';
import { ClusterGroupCard } from '../components/ClusterGroupCard';
import type { ClusterGroup } from '../components/ClusterGroupCard';

// ── Tipos de pestaña ──────────────────────────────────────────────────────── //

type TabId = 'mapa' | 'gestion';

// ── Página ────────────────────────────────────────────────────────────────── //

export const VisitasPage: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('mapa');

  // ── Filtro por programa ──
  const [selectedProgramaId, setSelectedProgramaId] = useState<string>('');
  const { programas, isLoading: loadingProgramas } = useProgramas({ estado: 'activo', pageSize: 100 });

  // Verificar si el programa tiene etapa de visita técnica activada
  const { data: etapasPrograma = [], isLoading: loadingEtapas } = useEtapas(selectedProgramaId);
  const tieneVisitaTecnica = etapasPrograma.some(
    e => e.modulo_principal === 'VISITA_TECNICA' && e.visita_tecnica_publicado && !e.finalizada,
  );

  const { postulantes, isLoading, error, refetch } = usePostulantes(
    'APROBADA',
    selectedProgramaId || undefined,
  );

  // Técnicos (para pestaña gestión)
  const { tecnicos, isLoading: loadingTec } = useTecnicos();
  const crearVisitaMutation = useCrearVisita();

  // ── Estado compartido de geocodificación ──
  const [markers, setMarkers]           = useState<GeocodedMarker[]>([]);
  const [isGeocoding, setIsGeocoding]   = useState(false);
  const [geoProgress, setGeoProgress]   = useState<GeocodeProgress>({ done: 0, total: 0, cached: 0 });
  const abortRef = useRef<AbortController | null>(null);

  // ── Estado pestaña Mapa ──
  const [selectedId, setSelectedId] = useState<number | null>(null);

  // ── Estado pestaña Gestión ──
  const [numClusters, setNumClusters]               = useState(3);
  const [sliderValue, setSliderValue]               = useState(3);
  const [clusters, setClusters]                     = useState<ClusterGroup[]>([]);
  const [tecnicoAssignments, setTecnicoAssignments] = useState<Record<number, string>>({});
  const [expandedGroup, setExpandedGroup]           = useState<number | null>(null);
  const [selectedGroupForAssign, setSelectedGroupForAssign] = useState<number | null>(null);
  const [creatingVisitas, setCreatingVisitas]        = useState(false);
  const [createResult, setCreateResult]             = useState<{ ok: number; fail: number; dup: number } | null>(null);
  const [showGestionMap, setShowGestionMap]          = useState(false);

  // ── Refs del mapa (pestaña Mapa) ──
  const mapContainerRef   = useRef<HTMLDivElement>(null);
  const mapRefsRef        = useRef<MapRefs | null>(null);
  const leafletMarkersRef = useRef<Map<number, L.Marker>>(new Map());

  // ── Refs del mapa (pestaña Gestión) ──
  const gestionMapContainerRef = useRef<HTMLDivElement>(null);
  const gestionMapRefsRef      = useRef<MapRefs | null>(null);

  // ══════════════════════════════════════════════════════════════════════════ //
  // ── Reset al cambiar de programa ──
  // ══════════════════════════════════════════════════════════════════════════ //

  useEffect(() => {
    abortRef.current?.abort();
    setMarkers([]);
    setSelectedId(null);
    setClusters([]);
    setTecnicoAssignments({});
    setCreateResult(null);
    setExpandedGroup(null);
    setSelectedGroupForAssign(null);
    setShowGestionMap(false);
  }, [selectedProgramaId]);

  // ══════════════════════════════════════════════════════════════════════════ //
  // ── Geocodificación (compartida por ambas pestañas) ──
  // ══════════════════════════════════════════════════════════════════════════ //

  useEffect(() => {
    if (!postulantes.length) { setMarkers([]); return; }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsGeocoding(true);
    setGeoProgress({ done: 0, total: postulantes.length, cached: 0 });

    geocodeBatch(postulantes, setGeoProgress, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          setMarkers(result);
          setIsGeocoding(false);
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setIsGeocoding(false);
      });

    return () => controller.abort();
  }, [postulantes]);

  // ══════════════════════════════════════════════════════════════════════════ //
  // ── Mapa de pestaña «Mapa» ──
  // ══════════════════════════════════════════════════════════════════════════ //

  useEffect(() => {
    if (activeTab !== 'mapa') return;
    if (!mapContainerRef.current || mapRefsRef.current) return;
    const refs = initMap(mapContainerRef.current);
    mapRefsRef.current = refs;
    return () => {
      refs.map.remove();
      mapRefsRef.current = null;
      leafletMarkersRef.current.clear();
    };
  }, [activeTab, isLoading, error]);

  // Sincronizar marcadores en mapa
  useEffect(() => {
    if (activeTab !== 'mapa') return;
    const refs = mapRefsRef.current;
    if (!refs) return;

    refs.layerGroup.clearLayers();
    leafletMarkersRef.current.clear();

    const geocodedMarkers = markers.filter(m => m.geocoded);

    for (const m of geocodedMarkers) {
      const icon = m.id === selectedId ? SELECTED_ICON : DEFAULT_ICON;
      const marker = L.marker([m.lat, m.lng], { icon })
        .bindPopup(buildPopupHtml({
          radicado: m.radicado,
          solicitante: m.solicitante,
          direccion: m.direccion,
          municipio: m.municipio,
          departamento: m.departamento,
          zona: m.zona,
          programa: m.programa,
        }), { maxWidth: 280 })
        .on('click', () => setSelectedId(m.id));
      refs.layerGroup.addLayer(marker);
      leafletMarkersRef.current.set(m.id, marker);
    }

    fitBoundsToPoints(refs.map, geocodedMarkers, 15);
  }, [markers, selectedId, activeTab]);

  // Volar al marcador seleccionado
  useEffect(() => {
    const refs = mapRefsRef.current;
    if (!refs || selectedId == null) return;
    const m = markers.find(mk => mk.id === selectedId);
    if (m) {
      refs.map.flyTo([m.lat, m.lng], 15, { duration: 1 });
      leafletMarkersRef.current.get(m.id)?.openPopup();
    }
  }, [selectedId, markers]);

  const handleRowSelect = useCallback((id: number) => {
    setSelectedId(prev => (prev === id ? null : id));
  }, []);

  // ══════════════════════════════════════════════════════════════════════════ //
  // ── Clustering (pestaña «Gestión») ──
  // ══════════════════════════════════════════════════════════════════════════ //

  const recalculate = useCallback(() => {
    if (!markers.length) { setClusters([]); return; }

    const geocoded = markers.filter(m => m.geocoded);
    const noGeocoded = markers.filter(m => !m.geocoded);

    if (!geocoded.length) {
      // Ninguno geocodificado → un solo grupo con todos
      setClusters([{
        index: 0,
        color: CLUSTER_COLORS[0],
        markers: [...noGeocoded],
        tecnicoId: tecnicoAssignments[0] ?? null,
      }]);
      return;
    }

    const k = Math.min(numClusters, geocoded.length);
    const result = kmeans(geocoded, k);
    const groups: ClusterGroup[] = result.groups.map((items, i) => ({
      index: i,
      color: CLUSTER_COLORS[i % CLUSTER_COLORS.length],
      markers: [...(items as GeocodedMarker[])],
      tecnicoId: tecnicoAssignments[i] ?? null,
    }));

    // Distribuir no-geocodificados equitativamente (round-robin)
    noGeocoded.forEach((m, i) => {
      groups[i % groups.length].markers.push(m);
    });

    setClusters(groups);
  }, [markers, numClusters, tecnicoAssignments]);

  useEffect(() => { recalculate(); }, [recalculate]);

  // ── Mapa de gestión (toggle) ──
  useEffect(() => {
    if (!showGestionMap || activeTab !== 'gestion') return;
    if (!gestionMapContainerRef.current || gestionMapRefsRef.current) return;
    const refs = initMap(gestionMapContainerRef.current);
    gestionMapRefsRef.current = refs;
    return () => {
      refs.map.remove();
      gestionMapRefsRef.current = null;
    };
  }, [showGestionMap, activeTab]);

  // Sincronizar clusters en mapa de gestión
  useEffect(() => {
    const refs = gestionMapRefsRef.current;
    if (!refs) return;

    refs.layerGroup.clearLayers();
    const allPts: { lat: number; lng: number }[] = [];

    for (const cluster of clusters) {
      const isAssigned = !!cluster.tecnicoId;
      const markerColor = isAssigned ? ASSIGNED_COLOR : cluster.color;
      const icon = getMarkerIcon(markerColor);
      for (const m of cluster.markers.filter(mk => mk.geocoded)) {
        allPts.push({ lat: m.lat, lng: m.lng });
        const tec = cluster.tecnicoId
          ? tecnicos.find((t: any) => String(t.id) === cluster.tecnicoId)
          : null;

        L.marker([m.lat, m.lng], { icon })
          .bindPopup(buildPopupHtml({
            radicado: m.radicado,
            solicitante: m.solicitante,
            direccion: m.direccion,
            municipio: m.municipio,
            departamento: m.departamento,
            grupoLabel: isAssigned ? `Grupo ${cluster.index + 1} ✓` : `Grupo ${cluster.index + 1}`,
            grupoColor: markerColor,
            tecnicoLabel: tec ? `${(tec as any).nombre} ${(tec as any).apellido}` : undefined,
          }), { maxWidth: 280 })
          .addTo(refs.layerGroup);
      }
    }

    fitBoundsToPoints(refs.map, allPts, 14);
  }, [clusters, tecnicos, showGestionMap]);

  // ── Handlers de gestión ──
  const handleAssignTecnico = useCallback((clusterIdx: number, tecnicoId: string) => {
    setTecnicoAssignments(prev => ({ ...prev, [clusterIdx]: tecnicoId }));
    setSelectedGroupForAssign(null);
  }, []);

  const handleRecalcular = useCallback(() => {
    setNumClusters(sliderValue);
    setTecnicoAssignments({});
    setExpandedGroup(null);
    setSelectedGroupForAssign(null);
  }, [sliderValue]);

  const handleCrearVisitas = useCallback(async () => {
    const groupsToCreate = clusters.filter(c => c.tecnicoId && c.markers.length > 0);
    if (!groupsToCreate.length) return;

    setCreatingVisitas(true);
    setCreateResult(null);
    let ok = 0;
    let fail = 0;
    let dup = 0;

    for (const group of groupsToCreate) {
      for (const m of group.markers) {
        try {
          await crearVisitaMutation.mutateAsync(
            new CrearVisitaDTO(
              m.postulacionId,
              m.postulanteId,
              selectedProgramaId,
              'INICIAL',
              m.direccion,
              undefined,
              group.tecnicoId ?? undefined,
            ),
          );
          ok++;
        } catch (err: unknown) {
          // 409 = ya tiene visita asignada (duplicado)
          if (err && typeof err === 'object' && 'response' in err) {
            const axErr = err as { response?: { status?: number } };
            if (axErr.response?.status === 409) { dup++; continue; }
          }
          fail++;
        }
      }
    }

    setCreatingVisitas(false);
    setCreateResult({ ok, fail, dup });

    // Limpiar grupos y refrescar: los asignados (ok) ya no son APROBADA,
    // y los duplicados (dup) ya tenían visita → no deben seguir visibles.
    if (ok > 0 || dup > 0) {
      setTecnicoAssignments({});
      setClusters([]);
      setExpandedGroup(null);
      setSelectedGroupForAssign(null);
      refetch();
    }
  }, [clusters, crearVisitaMutation, selectedProgramaId, refetch]);

  // ── Derivados ──
  const totalAprobadas  = postulantes.length;
  const totalUbicadas   = markers.filter(m => m.geocoded).length;
  const totalNoUbicadas = markers.filter(m => !m.geocoded).length;
  const asignadas       = clusters.filter(c => c.tecnicoId).reduce((s, c) => s + c.markers.length, 0);
  const maxClusters     = Math.max(1, Math.min(totalUbicadas || 1, 15));

  // ══════════════════════════════════════════════════════════════════════════ //

  return (
    <div className="p-8">

      {/* ── Cabecera ── */}
      <HeaderPanel
        title="Visitas Técnicas"
        subtitle="Gestión integral de visitas: geolocalizción, agrupación por cercanía y asignación a técnicos"
        actionLabel="Actualizar"
        onAction={() => void refetch()}
      />

      {/* ── Selector de programa ── */}
      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <label htmlFor="programa-filter" className="block text-sm font-semibold text-gray-800 mb-1">
          Filtrar por programa
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Selecciona el programa para ver sus postulaciones aprobadas
        </p>
        <select
          id="programa-filter"
          value={selectedProgramaId}
          onChange={e => setSelectedProgramaId(e.target.value)}
          disabled={loadingProgramas}
          className="w-full sm:w-96 text-sm rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white disabled:bg-gray-100"
        >
          <option value="">— Seleccionar programa —</option>
          {(programas ?? []).filter((prog: any) => prog.estado !== 'CULMINADO').map((prog: any) => (
            <option key={prog.id} value={String(prog.id)}>
              {prog.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* ── Aviso: programa sin etapa de visita técnica ── */}
      {selectedProgramaId && !loadingEtapas && !tieneVisitaTecnica && (
        <div className="mb-6 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <span>Este programa <strong>no tiene una etapa de Visita Técnica activada</strong>. Debe activar la etapa desde la configuración del programa para poder gestionar visitas.</span>
        </div>
      )}

      {/* ── Contenido que requiere programa seleccionado ── */}
      {!selectedProgramaId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <p className="text-sm font-medium text-gray-500">Selecciona un programa para comenzar</p>
          <p className="text-xs text-gray-400 mt-1">El mapa y las estadísticas se cargarán una vez que selecciones un programa</p>
        </div>
      ) : (
      <>

      {/* ── Tarjetas estadísticas ── */}
      <div className={`grid grid-cols-1 gap-4 mb-6 ${activeTab === 'gestion' ? 'md:grid-cols-4' : 'md:grid-cols-3'}`}>
        <StatCard title="Aprobadas" value={totalAprobadas} color="green" description="Postulaciones aprobadas" />
        <StatCard title="Ubicadas en mapa" value={totalUbicadas} color="blue" description="Direcciones geolocalizadas" />
        {activeTab === 'mapa' && (
          <StatCard title="Sin ubicación" value={totalNoUbicadas} color="orange" description="No se pudo resolver la dirección" />
        )}
        {activeTab === 'gestion' && (
          <>
            <StatCard title="Grupos" value={clusters.length} color="purple" description={`${numClusters} grupos configurados`} />
            <StatCard title="Asignadas" value={asignadas} color="orange" description="Hogares con técnico asignado" />
          </>
        )}
      </div>

      {/* ── Progreso de geocodificación ── */}
      {isGeocoding && (
        <GeocodingProgress done={geoProgress.done} total={geoProgress.total} cached={geoProgress.cached} />
      )}

      {/* ── Barra de pestañas ── */}
      <div className="mb-6 flex bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <TabButton
          active={activeTab === 'mapa'}
          onClick={() => setActiveTab('mapa')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          }
          label="Mapa de ubicaciones"
        />
        <TabButton
          active={activeTab === 'gestion'}
          onClick={() => setActiveTab('gestion')}
          icon={
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          }
          label="Gestión y asignación"
        />
      </div>

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── Pestaña: MAPA ── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'mapa' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Mapa (2/3) */}
          <div className="xl:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-800">Mapa de ubicaciones</h3>
              <span className="text-xs text-gray-400">OpenStreetMap · Nominatim</span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center h-[500px] text-gray-500 gap-3">
                <svg className="animate-spin h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span className="text-sm">Cargando postulaciones…</span>
              </div>
            ) : error ? (
              <div className="flex items-center gap-3 p-6 text-red-700 bg-red-50 h-[500px]">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm">{error}</span>
              </div>
            ) : (
              <div ref={mapContainerRef} className="h-[500px]" />
            )}
          </div>

          {/* Panel lateral (1/3) */}
          <PostulantesListPanel
            postulantes={postulantes}
            markers={markers}
            isGeocoding={isGeocoding}
            selectedId={selectedId}
            onSelect={handleRowSelect}
          />
        </div>
      )}

      {/* ════════════════════════════════════════════════════════════════════ */}
      {/* ── Pestaña: GESTIÓN ── */}
      {/* ════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'gestion' && (
        <>
          {totalUbicadas === 0 && !isGeocoding ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 flex flex-col items-center justify-center text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-sm font-medium text-gray-500">
                {totalAprobadas === 0 ? 'No hay postulaciones aprobadas en este programa' : 'No se pudieron geolocalizar las direcciones'}
              </p>
            </div>
          ) : totalUbicadas > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Encabezado */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-bold text-gray-900">Agrupación Automática por Cercanía</h3>
                  <p className="text-xs text-gray-500">Sugerencias inteligentes para optimizar rutas de visita</p>
                </div>

                {/* Toggle mapa */}
                <button
                  type="button"
                  onClick={() => {
                    setShowGestionMap(prev => {
                      if (prev) {
                        // Destruir mapa al cerrar
                        gestionMapRefsRef.current?.map.remove();
                        gestionMapRefsRef.current = null;
                      }
                      return !prev;
                    });
                  }}
                  className="text-xs px-3 py-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  {showGestionMap ? 'Ocultar mapa' : 'Ver mapa'}
                </button>
              </div>

              {/* Slider de grupos */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-4">
                <span className="text-sm font-medium text-gray-700 whitespace-nowrap">Número de grupos:</span>
                <input
                  type="range"
                  min={1}
                  max={maxClusters}
                  value={sliderValue}
                  onChange={e => setSliderValue(Number(e.target.value))}
                  className="flex-1 h-2 bg-indigo-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                />
                <span className="text-lg font-bold text-gray-800 tabular-nums w-8 text-center">{sliderValue}</span>
                <button
                  type="button"
                  onClick={handleRecalcular}
                  className="text-xs font-semibold px-4 py-1.5 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 transition-colors whitespace-nowrap"
                >
                  Recalcular
                </button>
              </div>

              {/* Banner informativo */}
              <div className="mx-6 mt-4 mb-2 bg-blue-50 border border-blue-200 rounded-lg px-4 py-2.5 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-xs text-blue-700">
                  <strong>Información:</strong> Los grupos se generan automáticamente agrupando hogares cercanos geográficamente.
                  Haz clic en «Seleccionar grupo» para asignarle un técnico visitante.
                </p>
              </div>

              {/* Mapa colapsable */}
              {showGestionMap && (
                <div className="mx-6 mt-4 rounded-lg overflow-hidden border border-gray-200">
                  <div ref={gestionMapContainerRef} className="h-[400px]" />
                </div>
              )}

              {/* Tarjetas de grupo */}
              <div className="p-6 space-y-4">
                {clusters.length === 0 && !isGeocoding && (
                  <div className="text-center py-8 text-gray-400">
                    <p className="text-sm">No hay grupos para mostrar</p>
                  </div>
                )}

                {clusters.map(cluster => (
                  <ClusterGroupCard
                    key={cluster.index}
                    cluster={cluster}
                    tecnicos={tecnicos as any}
                    loadingTec={loadingTec}
                    tecnicoAssignments={tecnicoAssignments}
                    isExpanded={expandedGroup === cluster.index}
                    isAssigning={selectedGroupForAssign === cluster.index}
                    onToggleExpand={() => setExpandedGroup(prev => prev === cluster.index ? null : cluster.index)}
                    onToggleAssign={() => setSelectedGroupForAssign(prev => prev === cluster.index ? null : cluster.index)}
                    onAssignTecnico={handleAssignTecnico}
                  />
                ))}
              </div>

              {/* Pie: crear visitas */}
              {clusters.length > 0 && (
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between gap-4 flex-wrap">
                    <div className="text-xs text-gray-500">
                      {asignadas > 0
                        ? `${asignadas} hogar${asignadas !== 1 ? 'es' : ''} en ${clusters.filter(c => c.tecnicoId).length} grupo${clusters.filter(c => c.tecnicoId).length !== 1 ? 's' : ''} listo${clusters.filter(c => c.tecnicoId).length !== 1 ? 's' : ''} para crear visitas`
                        : 'Selecciona grupos y asígnalos a técnicos para crear visitas'}
                    </div>
                    <div className="flex items-center gap-3">
                      {createResult && (
                        <span className={`text-xs font-medium ${createResult.fail === 0 ? 'text-green-700' : 'text-amber-700'}`}>
                          {createResult.ok} creada{createResult.ok !== 1 ? 's' : ''}
                          {createResult.dup > 0 && `, ${createResult.dup} ya asignada${createResult.dup !== 1 ? 's' : ''}`}
                          {createResult.fail > 0 && `, ${createResult.fail} fallida${createResult.fail !== 1 ? 's' : ''}`}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={handleCrearVisitas}
                        disabled={creatingVisitas || asignadas === 0}
                        className="text-sm font-semibold rounded-lg px-5 py-2 bg-green-600 text-white hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                      >
                        {creatingVisitas ? 'Creando…' : `Crear visitas (${asignadas})`}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── Botón Ver visitas registradas ── */}
      {(() => {
        const etapaVisita = etapasPrograma.find(e => e.modulo_principal === 'VISITA_TECNICA');
        if (!etapaVisita) return null;
        return (
          <div className="mt-6 flex justify-center">
            <button
              onClick={() => navigate(`/programas/${selectedProgramaId}/etapas/${etapaVisita.id}/visitas-registradas`)}
              className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Ver visitas registradas
            </button>
          </div>
        );
      })()}

      </>
      )}

      {/* ── Nota informativa ── */}
      <div className="mt-6 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-xs text-amber-800 flex items-start gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          Las ubicaciones se obtienen a partir de la dirección registrada en cada postulación usando <strong>OpenStreetMap (Nominatim)</strong>.
          Si una dirección no aparece en el mapa, verifica que tenga municipio y departamento completos.
          Los resultados se almacenan en caché local para mejorar la velocidad en consultas posteriores.
        </span>
      </div>
    </div>
  );
};

// ── Componente auxiliar de pestaña ────────────────────────────────────────── //

const TabButton: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}> = ({ active, onClick, icon, label }) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-white text-gray-600 hover:bg-gray-50'
    }`}
  >
    {icon}
    {label}
  </button>
);
