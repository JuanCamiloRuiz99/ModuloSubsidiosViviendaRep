import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LlamadasPage } from '../pages/LlamadasPage';

const LlamadasRoutes: React.FC = () => (
  <Routes>
    <Route index element={<LlamadasPage />} />
  </Routes>
);

export default LlamadasRoutes;
