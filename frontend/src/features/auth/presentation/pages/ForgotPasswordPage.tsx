import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { usePasswordRecovery } from '../hooks/usePasswordRecovery';

export default function ForgotPasswordPage() {
  const [correo, setCorreo] = useState('');
  const navigate = useNavigate();
  const {
    requestPasswordReset,
    isRequesting,
    requestError,
    requestResult,
    resetRequest,
  } = usePasswordRecovery();

  useEffect(() => {
    resetRequest();
  }, [resetRequest]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    requestPasswordReset({ correo });
  };

  const handleGoToReset = () => {
    if (requestResult?._debug_token) {
      navigate(`/reset-password?token=${requestResult._debug_token}`);
    }
  };

  // Si ya se solicitó la recuperación, mostrar instrucciones
  if (requestResult?.success && requestResult?._debug_token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alcaldia-dark via-alcaldia-blue to-alcaldia-dark px-4">
        <div className="relative w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
              <img src="/logo-alcaldia.png" alt="Escudo Alcaldía" className="h-16 w-auto" />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Enlace de recuperación</h1>
            <p className="text-alcaldia-yellow-light text-sm mt-1">Usa el siguiente enlace para cambiar tu contraseña</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-2">
              <h2 className="text-xl font-bold text-gray-900">
                <span className="text-green-600">✓</span> Enlace generado
              </h2>
              <p className="text-sm text-gray-500 mt-1">Se ha generado un enlace de recuperación para {correo}</p>
            </div>

            <div className="px-8 pb-8 pt-6 space-y-6">
              {/* Instrucciones */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2 text-sm">Instrucciones:</h3>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
                  <li>Haz clic en el botón "Cambiar contraseña" abajo</li>
                  <li>Ingresa una contraseña nueva (mínimo 8 caracteres)</li>
                  <li>Confirma tu nueva contraseña</li>
                  <li>Listo, ya puedes iniciar sesión con tu nueva contraseña</li>
                </ol>
              </div>

              {/* Token (para copiar) */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Token de recuperación (cópialo si lo necesitas):
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={requestResult._debug_token}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(requestResult._debug_token);
                      alert('Token copiado al portapapeles');
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              {/* Enlace directo */}
              <div>
                <button
                  type="button"
                  onClick={handleGoToReset}
                  className="w-full py-3 px-4 bg-alcaldia-blue hover:bg-alcaldia-dark text-white rounded-lg font-semibold text-sm transition-colors"
                >
                  Cambiar contraseña
                </button>
              </div>

              {/* O copiar el enlace */}
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-2">O copia este enlace en tu navegador:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={requestResult._debug_reset_link}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono bg-gray-50 text-gray-600 truncate"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(requestResult._debug_reset_link);
                      alert('Enlace copiado al portapapeles');
                    }}
                    className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    Copiar
                  </button>
                </div>
              </div>

              <div className="border-t pt-4">
                <button
                  type="button"
                  onClick={() => {
                    resetRequest();
                    setCorreo('');
                  }}
                  className="w-full text-center text-sm text-alcaldia-blue hover:text-alcaldia-dark font-medium"
                >
                  Solicitar otro enlace
                </button>
              </div>

              <div className="text-center text-sm text-gray-500">
                <Link to="/login" className="text-alcaldia-blue hover:text-alcaldia-dark font-medium">
                  Volver al inicio de sesión
                </Link>
              </div>
            </div>
          </div>

          <p className="text-center text-alcaldia-yellow-light/60 text-xs mt-6">
            © {new Date().getFullYear()} Alcaldía de Popayán — Módulo de Subsidios de Vivienda
          </p>
        </div>
      </div>
    );
  }

  // Formulario inicial
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alcaldia-dark via-alcaldia-blue to-alcaldia-dark px-4">
      <div className="relative w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <img src="/logo-alcaldia.png" alt="Escudo Alcaldía" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Recuperar contraseña</h1>
          <p className="text-alcaldia-yellow-light text-sm mt-1">Recibe un enlace de restablecimiento en tu correo registrado.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-gray-900">Solicitar enlace</h2>
            <p className="text-sm text-gray-500 mt-1">Escribe el correo con el que te registraste.</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5">
            {requestError && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {requestError}
              </div>
            )}

            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="correo"
                type="email"
                value={correo}
                onChange={(event) => setCorreo(event.target.value)}
                placeholder="usuario@alcaldia.gov.co"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-alcaldia-blue focus:border-transparent"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isRequesting}
              className="w-full py-2.5 px-4 bg-alcaldia-blue hover:bg-alcaldia-dark disabled:bg-alcaldia-blue/50 text-white rounded-lg font-semibold text-sm transition-colors"
            >
              {isRequesting ? 'Enviando...' : 'Enviar instrucciones'}
            </button>

            <div className="text-center text-sm text-gray-500">
              <Link to="/login" className="text-alcaldia-blue hover:text-alcaldia-dark font-medium">
                Volver al inicio de sesión
              </Link>
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
