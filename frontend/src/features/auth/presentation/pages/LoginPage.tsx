/**
 * LoginPage – Página de inicio de sesión para funcionarios del sistema
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function LoginPage() {
  const { login, isLoading, error, serverError, reset } = useAuth();
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Limpiar error cuando el usuario cambia los campos
  useEffect(() => {
    if (error || serverError) reset();
  }, [correo, password]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login({ correo, password });
  };

  const displayError = serverError || error;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-alcaldia-dark via-alcaldia-blue to-alcaldia-dark px-4">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-alcaldia-yellow/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-alcaldia-blue/20 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Cabecera con escudo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <img src="/logo-alcaldia.png" alt="Escudo Alcaldía de Popayán" className="h-16 w-auto" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">ALCALDÍA DE POPAYÁN</h1>
          <p className="text-alcaldia-yellow-light text-sm mt-1">Sistema de Gestión de Subsidios de Vivienda</p>
        </div>

        {/* Tarjeta de login */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-gray-900">Iniciar Sesión</h2>
            <p className="text-sm text-gray-500 mt-1">Ingrese sus credenciales para acceder al sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="px-8 pb-8 pt-4 space-y-5">
            {/* Error */}
            {displayError && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {displayError}
              </div>
            )}

            {/* Correo */}
            <div>
              <label htmlFor="correo" className="block text-sm font-medium text-gray-700 mb-1.5">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <input
                  id="correo"
                  type="email"
                  autoComplete="email"
                  required
                  value={correo}
                  onChange={e => setCorreo(e.target.value)}
                  placeholder="funcionario@alcaldia.gov.co"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-alcaldia-blue focus:border-transparent transition-shadow"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-11 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-alcaldia-blue focus:border-transparent transition-shadow"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Botón */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-alcaldia-blue hover:bg-alcaldia-dark disabled:bg-alcaldia-blue/50 text-white rounded-lg font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Verificando...
                </>
              ) : (
                'Ingresar al Sistema'
              )}
            </button>
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm text-alcaldia-blue hover:text-alcaldia-dark font-medium"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-alcaldia-yellow-light/60 text-xs mt-6">
          © {new Date().getFullYear()} Alcaldía de Popayán — Módulo de Subsidios de Vivienda
        </p>
      </div>
    </div>
  );
}
