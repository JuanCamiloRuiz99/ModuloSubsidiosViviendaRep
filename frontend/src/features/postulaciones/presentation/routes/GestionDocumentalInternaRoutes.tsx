import { Routes, Route } from 'react-router-dom';
import { GestionDocumentalInternaPage } from '../pages/GestionDocumentalInternaPage';
import { DocumentosPostulacionInternaPage } from '../pages/DocumentosPostulacionInternaPage';

export default function GestionDocumentalInternaRoutes() {
  return (
    <Routes>
      <Route index element={<GestionDocumentalInternaPage />} />
      <Route path=":postulacionId" element={<DocumentosPostulacionInternaPage />} />
    </Routes>
  );
}
