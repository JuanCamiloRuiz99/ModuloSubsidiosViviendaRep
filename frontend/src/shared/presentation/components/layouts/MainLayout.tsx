/**
 * MainLayout - Layout principal de la aplicación
 */

import React, { useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '../navigation/Navbar';
import { Footer } from '../navigation/Footer';
import { storageService } from '../../../../core/services';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: string;
  path: string;
  /** Roles que pueden ver este ítem. Si no se indica, todos lo ven. */
  roles?: number[];
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard',            icon: '📊', path: '/dashboard' },
  { label: 'Programa de Subsidio', icon: '🏠', path: '/programas',   roles: [1] },
  { label: 'Postulantes',          icon: '👥', path: '/postulantes', roles: [1] },
  { label: 'Postulaciones',         icon: '📝', path: '/mis-postulaciones', roles: [2] },
  { label: 'Documentos Internos',  icon: '📄', path: '/documentos-internos', roles: [1, 2] },
  { label: 'Visitas',              icon: '📋', path: '/visitas',     roles: [1] },
  { label: 'Mis Visitas',          icon: '📍', path: '/mis-visitas', roles: [3] },
  { label: 'Usuarios y Roles',     icon: '👤', path: '/usuarios',   roles: [1] },
];

export const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const { pathname } = useLocation();
  const user = storageService.getUser();
  const rol: number = user?.rol ?? 0;

  const navItems = useMemo(
    () => NAV_ITEMS.filter(item => !item.roles || item.roles.includes(rol)),
    [rol],
  );
  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      {/* Header */}
      <Navbar />

      {/* Main Content with Sidebar */}
      <div className="flex flex-1">
        {/* Sidebar Navigation */}
        <aside className="w-64 bg-gradient-to-b from-alcaldia-dark to-alcaldia-blue text-white shadow-lg border-r border-alcaldia-dark">
          <nav className="pt-6 px-4">
            {navItems.map((item) => {
              const isActive = pathname.startsWith(item.path);
              return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                  flex items-center gap-3 px-4 py-3 mb-2 rounded-lg transition-all duration-200
                  ${
                    isActive
                      ? 'bg-alcaldia-yellow text-alcaldia-dark font-semibold shadow-md'
                      : 'text-white/80 hover:bg-alcaldia-blue hover:text-white'
                  }
                `}
              >
                <span className="text-xl flex-shrink-0">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col">
          <div className="flex-1 p-8">
            {children}
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};
