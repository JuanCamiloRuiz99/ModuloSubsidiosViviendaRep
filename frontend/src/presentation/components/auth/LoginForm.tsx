import { useDispatch } from "react-redux";
import { login } from "../../../app/slices/authSlice";
import { Role } from "../../../domain/auth/role.enum";
import { useNavigate } from "react-router-dom";

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

const handleLogin = (role: Role) => {
  dispatch(
    login({
      id: "1",
      nombre: "Usuario Prueba",
      email: "usuario@popayan.gov.co",
      role: role,
      token: "fake-jwt-token",
    })
  );

  if (role === "ADMIN") navigate("/dashboard");
  if (role === "FUNCIONARIO") navigate("/postulantes");
  if (role === "VISITANTE") navigate("/visitas");
};


  return (
    <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Acceso al Sistema</h2>
        <p className="text-gray-500 text-sm">
          Ingresa tus credenciales institucionales
        </p>
      </div>

      <input
        type="email"
        placeholder="usuario@popayan.gov.co"
        className="w-full border rounded-lg px-4 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      <input
        type="password"
        placeholder="********"
        className="w-full border rounded-lg px-4 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-600"
      />

      <button
        onClick={() => handleLogin(Role.ADMIN)}
        className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-600 transition mb-3"
      >
        Iniciar como Admin
      </button>

      <button
        onClick={() => handleLogin(Role.FUNCIONARIO)}
        className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 transition mb-3"
      >
        Iniciar como Funcionario
      </button>

      <button
        onClick={() => handleLogin(Role.VISITANTE)}
        className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
      >
        Iniciar como Visitante
      </button>
    </div>
  );
}

export default LoginForm;
