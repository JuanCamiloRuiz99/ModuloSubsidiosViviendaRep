import React from 'react';
import { Routes, Route } from 'react-router-dom';
import MisPostulacionesPage from '../pages/MisPostulacionesPage';

const MisPostulacionesRoutes: React.FC = () => (
  <Routes>
    <Route index element={<MisPostulacionesPage />} />
  </Routes>
);

export default MisPostulacionesRoutes;
