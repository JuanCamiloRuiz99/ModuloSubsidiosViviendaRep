import React, { useState, useEffect } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const tokenParam = searchParams.get('token') ?? '';
  const [token, setToken] = useState(tokenParam);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const {
    resetPassword,
    isResetting,
    resetError,
    resetResult,
    resetReset,
  } = usePasswordRecovery();

  useEffect(() => {
    resetReset();
  }, [resetReset]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      return;
    }

    resetPassword({ token, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alcaldia-dark via-alcaldia-blue to-alcaldia-dark px-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <img src="/logo-alcaldia.png" alt="Escudo Alcaldía" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Restablecer contraseña</h1>
          <p className="text-alcaldia-yellow-light text-sm mt-1">Ingresa el token recibido en tu correo y una nueva contraseña.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-gray-900">Actualizar contraseña</h2>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5">
            {resetError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {resetError}
              </div>
            )}

            {resetResult?.message && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-sm text-green-700">
                {resetResult.message}
              </div>
            )}

            <div>
              <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1.5">
                Token de restablecimiento
              </label>
              <input
                id="token"
                type="text"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                placeholder="Pegue aquí el token del correo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-alcaldia-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Nueva contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Nueva contraseña"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-alcaldia-blue focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1.5">
                Confirmar contraseña
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                placeholder="Repite la nueva contraseña"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-alcaldia-blue focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isResetting || password.length < 8 || password !== confirmPassword}
              className="w-full py-2.5 px-4 bg-alcaldia-blue hover:bg-alcaldia-dark disabled:bg-alcaldia-blue/50 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              {isResetting ? 'Restableciendo...' : 'Restablecer contraseña'}
            </button>

            <div className="text-center text-sm text-gray-500">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-alcaldia-blue hover:text-alcaldia-dark font-medium"
              >
                Volver al inicio de sesión
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-alcaldia-yellow-light/60 text-xs mt-6">
          © {new Date().getFullYear()} Alcaldía de Popayán — Módulo de Subsidios de Vivienda
        </p>
      </div>
    </div>
  );
}
