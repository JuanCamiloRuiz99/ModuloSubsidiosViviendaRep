import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { VisitasPage } from '../pages/VisitasPage';

const VisitasRoutes: React.FC = () => (
  <Routes>
    <Route index element={<VisitasPage />} />
  </Routes>
);

export default VisitasRoutes;
