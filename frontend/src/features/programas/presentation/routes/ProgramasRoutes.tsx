/**
 * Rutas del módulo Programas
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProgramasPage, GestionarEtapasPage, ConstructorFormularioPage, RegistroHogarConfigPage, VisitaTecnicaConfigPage, GestionDocumentalConfigPage, GestionDocumentalPage, GestionDocumentosPostulacionPage, SorteoPage } from '../pages';

const ProgramasRoutes: React.FC = () => {
  return (
    <Routes>
      <Route index element={<ProgramasPage />} />
      <Route path=":id/etapas" element={<GestionarEtapasPage />} />
      <Route path=":id/etapas/:etapaId/formulario"      element={<ConstructorFormularioPage />} />
      <Route path=":id/etapas/:etapaId/registro-hogar" element={<RegistroHogarConfigPage />} />
      <Route path=":id/etapas/:etapaId/visita-tecnica" element={<VisitaTecnicaConfigPage />} />
      <Route path=":id/etapas/:etapaId/gestion-documental" element={<GestionDocumentalConfigPage />} />
      <Route path=":id/etapas/:etapaId/gestion-documental/documentos" element={<GestionDocumentalPage />} />
      <Route path=":id/etapas/:etapaId/gestion-documental/documentos/:postulacionId" element={<GestionDocumentosPostulacionPage />} />
      <Route path=":id/sorteo" element={<SorteoPage />} />
    </Routes>
  );
};

export default ProgramasRoutes;
