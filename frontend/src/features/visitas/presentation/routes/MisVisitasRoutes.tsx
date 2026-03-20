import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MisVisitasPage from '../pages/MisVisitasPage';
import FormularioVisitaEtapa2Page from '../pages/FormularioVisitaEtapa2Page';

const MisVisitasRoutes: React.FC = () => (
  <Routes>
    <Route path="/" element={<MisVisitasPage />} />
    <Route path="/:visitaId/formulario" element={<FormularioVisitaEtapa2Page />} />
  </Routes>
);

export default MisVisitasRoutes;
