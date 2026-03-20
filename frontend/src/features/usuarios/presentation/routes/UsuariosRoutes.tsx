/**
 * Rutas del módulo Usuarios
 */

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { UsuariosPage } from '../pages';

const UsuariosRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<UsuariosPage />} />
    </Routes>
  );
};

export default UsuariosRoutes;
