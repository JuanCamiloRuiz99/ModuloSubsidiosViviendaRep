/**
 * Sidebar - Menú de navegación lateral
 */

import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface NavItem {
  label: string;
  icon: string;
  path: string;
}

import { storageService } from '../../../../core/services';

function getNavItems(): NavItem[] {
  const user = storageService.getUser();
  const rol = user?.rol ?? 0;

  // Funcionario: solo ve sus postulaciones asignadas
  if (rol === 2) {
    return [
      { label: 'Mis Postulaciones', icon: '📋', path: '/mis-postulaciones' },
      { label: 'Llamadas', icon: '📞', path: '/llamadas' },
      { label: 'Programa de subsidio', icon: '🏠', path: '/programas' },
    ];
  }

  // Técnico visitante: solo ve sus visitas
  if (rol === 3) {
    return [
      { label: 'Mis Visitas', icon: '📋', path: '/mis-visitas' },
    ];
  }

  // Admin: acceso completo
  return [
    { label: 'Dashboard', icon: '📊', path: '/dashboard' },
    { label: 'Programa de subsidio', icon: '🏠', path: '/programas' },
    { label: 'Postulantes', icon: '👥', path: '/postulantes' },
    { label: 'Llamadas', icon: '📞', path: '/llamadas' },
    { label: 'Visitas', icon: '📋', path: '/visitas' },
    { label: 'Usuarios y Roles', icon: '👤', path: '/usuarios' },
  ];
}

export const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const location = useLocation();
  const navItems = getNavItems();

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Sidebar */}
      <div className={`
        bg-alcaldia-dark text-white h-screen fixed left-0 top-0 pt-24 z-40
        transition-all duration-300 ease-in-out
        ${isOpen ? 'w-64' : 'w-20'}
        overflow-y-auto
      `}>
        {/* Navigation Items */}
        <div className="px-4 py-8">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`
                flex items-center gap-4 px-4 py-3 rounded-lg mb-2 transition-colors duration-200
                ${isActive(item.path)
                  ? 'bg-alcaldia-yellow text-alcaldia-dark font-semibold'
                  : 'text-white/80 hover:bg-alcaldia-blue hover:text-white'
                }
              `}
              title={!isOpen ? item.label : ''}
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {isOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed left-4 top-24 z-50 p-2 bg-alcaldia-dark text-white rounded-lg hover:bg-alcaldia-blue transition-colors"
        aria-label="Toggle sidebar"
      >
        {isOpen ? '◀' : '▶'}
      </button>

      {/* Content Offset */}
      <div className={`transition-all duration-300 ease-in-out ${isOpen ? 'ml-64' : 'ml-20'}`}>
        {/* Este div será utilizado por MainLayout */}
      </div>
    </>
  );
};
