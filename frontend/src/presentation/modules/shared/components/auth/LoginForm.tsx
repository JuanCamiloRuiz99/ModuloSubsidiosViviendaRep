import { useDispatch } from "react-redux";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../../../../../app/slices/authSlice";
import { Role } from "../../../../../domain/auth/role.enum";
import { useNavigate } from "react-router-dom";
import { loginSchema, type LoginFormData } from "./loginSchema";

function LoginForm() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

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

  const onSubmit = (data: LoginFormData) => {
    console.log("Datos validados:", data);
    // Por ahora mantenemos el login hardcodeado como Admin
    // Cuando tengas las APIs, cambiarás esto
    handleLogin(Role.ADMIN);
  };

  return (
    <div className="bg-white w-full max-w-md p-8 rounded-2xl shadow-xl">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold">Acceso al Sistema</h2>
        <p className="text-gray-500 text-sm">
          Ingresa tus credenciales institucionales
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        {/* Email */}
        <div className="mb-4">
          <input
            {...register("email")}
            type="email"
            placeholder="usuario@popayan.gov.co"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.email
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-600"
            }`}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div className="mb-6">
          <input
            {...register("password")}
            type="password"
            placeholder="Contraseña"
            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 ${
              errors.password
                ? "border-red-500 focus:ring-red-500"
                : "border-gray-300 focus:ring-blue-600"
            }`}
          />
          {errors.password && (
            <p className="text-red-500 text-sm mt-1">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Botones */}
        <button
          type="button"
          onClick={() => handleLogin(Role.ADMIN)}
          className="w-full bg-blue-700 text-white py-2 rounded-lg hover:bg-blue-600 transition mb-3"
        >
          Iniciar como Admin
        </button>

        <button
          type="button"
          onClick={() => handleLogin(Role.FUNCIONARIO)}
          className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-500 transition mb-3"
        >
          Iniciar como Funcionario
        </button>

        <button
          type="button"
          onClick={() => handleLogin(Role.VISITANTE)}
          className="w-full bg-gray-700 text-white py-2 rounded-lg hover:bg-gray-600 transition"
        >
          Iniciar como Visitante
        </button>
      </form>
    </div>
  );
}

export default LoginForm;
