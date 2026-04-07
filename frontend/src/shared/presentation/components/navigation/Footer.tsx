/**
 * Footer - Pie de página
 */

import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-alcaldia-dark text-gray-300 mt-auto border-t-4 border-alcaldia-yellow">
      {/* Main Footer Content */}
      <div className="px-8 py-12">
        <div className="grid grid-cols-4 gap-8 max-w-7xl mx-auto mb-8">
          {/* Column 1: About */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Sobre Nosotros</h4>
            <p className="text-xs leading-relaxed">Sistema de Gestión de Subsidios de Vivienda para la Alcaldía de Popayán.</p>
          </div>

          {/* Column 2: Contact */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Contacto</h4>
            <ul className="text-xs space-y-2">
              <li>📍 Calle 4 # 4-29, Popayán</li>
              <li>📞 (602) 824 4517</li>
              <li>✉️ contacto@popayan.gov.co</li>
            </ul>
          </div>

          {/* Column 3: Hours */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Horarios</h4>
            <ul className="text-xs space-y-2">
              <li><strong>Lunes - Viernes</strong></li>
              <li>8:00 AM - 12:00 PM</li>
              <li>2:00 PM - 6:00 PM</li>
            </ul>
          </div>

          {/* Column 4: Transparency */}
          <div>
            <h4 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">Transparencia</h4>
            <p className="text-xs mb-2">Línea anticorrupción:</p>
            <p className="text-base font-bold text-alcaldia-yellow">018000 913 040</p>
            <p className="text-xs mt-3 text-gray-400">Disponible 24/7</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 my-6"></div>

        {/* Bottom Section */}
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">&copy; 2024 Alcaldía de Popayán. Todos los derechos reservados.</p>
          <div className="text-xs text-gray-400">
            <span className="text-alcaldia-yellow font-bold">GOV.CO</span> - Gobierno en Línea
          </div>
        </div>
      </div>
    </footer>
  );
};
