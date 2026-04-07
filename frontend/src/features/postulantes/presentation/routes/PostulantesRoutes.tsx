import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { PostulantesPage } from '../pages/PostulantesPage';

const PostulantesRoutes: React.FC = () => (
  <Routes>
    <Route index element={<PostulantesPage />} />
  </Routes>
);

export default PostulantesRoutes;
