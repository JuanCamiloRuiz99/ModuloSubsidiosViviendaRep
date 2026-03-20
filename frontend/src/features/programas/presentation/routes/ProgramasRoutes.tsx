/**
 * Rutas del módulo Programas
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ProgramasPage, GestionarEtapasPage, ConstructorFormularioPage, RegistroHogarConfigPage, VisitaTecnicaConfigPage } from '../pages';

const ProgramasRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<ProgramasPage />} />
      <Route path="/:id/etapas" element={<GestionarEtapasPage />} />
      <Route path="/:id/etapas/:etapaId/formulario"      element={<ConstructorFormularioPage />} />
      <Route path="/:id/etapas/:etapaId/registro-hogar" element={<RegistroHogarConfigPage />} />
      <Route path="/:id/etapas/:etapaId/visita-tecnica" element={<VisitaTecnicaConfigPage />} />
    </Routes>
  );
};

export default ProgramasRoutes;
