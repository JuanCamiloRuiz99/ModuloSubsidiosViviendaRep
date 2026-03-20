/**
 * GestionarEtapasPage — Página para gestionar etapas de un programa
 *
 * Obtiene el programa por ID desde la URL y renderiza el componente
 * reusable EtapasManager.
 */

import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { EtapasManager } from '../components/EtapasManager';
import { programaService } from '../di';
import { ObtenerProgramaDTO } from '../../application/dtos';

export const GestionarEtapasPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: programa,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['programa', id],
    queryFn: () => programaService.obtener(new ObtenerProgramaDTO(id!)),
    enabled: !!id,
  });

  if (!id) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-red-600">ID de programa no proporcionado.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-400">Cargando programa...</p>
      </div>
    );
  }

  if (error || !programa) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center flex-col gap-4">
        <p className="text-red-600">No se pudo cargar el programa.</p>
        <button
          onClick={() => navigate('/programas')}
          className="text-blue-700 hover:underline text-sm"
        >
          Volver a Programas
        </button>
      </div>
    );
  }

  return (
    <EtapasManager
      programaId={id}
      programaNombre={programa.nombre}
      programaDescripcion={programa.descripcion}
      onVolver={() => navigate('/programas')}
    />
  );
};
