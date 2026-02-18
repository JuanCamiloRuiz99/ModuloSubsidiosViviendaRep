import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../../../../app/slices/authSlice";
import type { RootState } from "../../../../../app/store";

function Header() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-blue-900 text-white px-6 py-4 flex justify-between items-center shadow-md">
      <div>
        <h1 className="text-xl font-bold">Alcaldía de Popayán</h1>
        <p className="text-sm">Sistema de Gestión de Subsidios de Vivienda</p>
      </div>

      <div className="flex gap-4 items-center">
        {user && (
          <>
            <div className="text-sm">
              <p className="font-semibold">{user.nombre}</p>
              <p className="text-blue-200 text-xs uppercase">{user.role}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition"
            >
              Cerrar Sesión
            </button>
          </>
        )}
        {!user && (
          <>
            <button className="bg-blue-700 px-4 py-2 rounded-lg hover:bg-blue-600 transition">
              Inicio
            </button>
            <button
              onClick={() => navigate("/login")}
              className="bg-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-500 transition"
            >
              Acceso Funcionarios
            </button>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
