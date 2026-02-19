import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState } from "../../../../../app/store";
import { Role } from "../../../../../domain/auth/role.enum";

interface MenuItem {
  label: string;
  path: string;
  icon: string;
}

function Sidebar() {
  const { user } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  const menuItems: Record<Role, MenuItem[]> = {
    [Role.ADMIN]: [
      { label: "Dashboard", path: "/dashboard", icon: "📊" },
      { label: "Gestionar Usuarios", path: "/usuarios", icon: "👥" },
      { label: "Gestión de Postulantes", path: "/postulantes", icon: "📋" },
      { label: "Gestionar Visitas", path: "/reportes", icon: "📑" },
      { label: "Configurar Programas", path: "/programas", icon: "⚙️" },
    ],
    [Role.FUNCIONARIO]: [
      { label: "Dashboard", path: "/postulantes", icon: "📊" },
      { label: "Gestionar Postulaciones", path: "/postulaciones", icon: "📝" },
    ],
    [Role.VISITANTE]: [
      { label: "Dashboard", path: "/visitas", icon: "📊" },
      { label: "Gestionar Visitas", path: "/mis-visitas", icon: "🔍" },
    ],
  };

  const currentMenu = user ? menuItems[user.role] : [];

  return (
    <aside className="w-64 bg-gray-900 text-white min-h-screen shadow-lg">
      {/* Header del menú */}
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-lg font-bold">Menú</h2>
        {user && <p className="text-sm text-gray-400 mt-1">{user.role}</p>}
      </div>

      {/* Items del menú */}
      <nav className="p-4">
        <ul className="space-y-2">
          {currentMenu.map((item) => (
            <li key={item.path}>
              <button
                onClick={() => navigate(item.path)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-800 transition text-left font-semibold"
              >
                <span className="text-xl">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Spacer */}
      <div className="flex-1"></div>

      {/* Footer del menú */}
      <div className="p-4 border-t border-gray-700 text-xs text-gray-400">
        <p>Sistema de Subsidios</p>
        <p>v1.0.0</p>
      </div>
    </aside>
  );
}

export default Sidebar;
