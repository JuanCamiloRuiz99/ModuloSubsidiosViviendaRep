/**
 * Navbar - Header principal
 */

import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { storageService } from '../../../../core/services';

const ROL_LABELS: Record<number, string> = {
  1: 'Administrador',
  2: 'Funcionario',
  3: 'Técnico Visitante',
};

export const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const user = storageService.getUser();

  const handleLogout = () => {
    storageService.clear();
    navigate('/login', { replace: true });
  };

  return (
    <nav className="bg-gradient-to-r from-blue-900 to-blue-800 text-white shadow-lg border-b-4 border-blue-600">
      <div className="px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo y Información */}
          <div className="flex items-center gap-6">
            {/* Escudo */}
            <div className="w-14 h-14 bg-white rounded-lg flex items-center justify-center font-bold text-blue-900 text-2xl shadow-md">
              🏛️
            </div>
            {/* Texto */}
            <div className="border-l-2 border-blue-400 pl-6">
              <h1 className="text-2xl font-bold tracking-tight">ALCALDÍA DE POPAYÁN</h1>
              <p className="text-sm text-blue-100 font-light">Sistema de Gestión de Subsidios de Vivienda</p>
            </div>
          </div>

          {/* Usuario y acciones */}
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="text-right mr-2">
                  <p className="text-sm font-semibold">{user.nombre}</p>
                  <p className="text-xs text-blue-200">{ROL_LABELS[user.rol] ?? 'Usuario'}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 rounded-lg bg-red-500/80 hover:bg-red-600 transition-colors font-medium text-sm flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  Salir
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 transition-colors font-semibold text-sm"
              >
                Acceso de Empleados
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
