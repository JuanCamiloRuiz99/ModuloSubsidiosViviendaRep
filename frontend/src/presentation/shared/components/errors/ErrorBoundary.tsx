import React from 'react';
import type { ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends React.Component<Props, State> {
  private timeoutId: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    // Silenciar errores de portales Radix UI que no afectan funcionalidad
    // Estos ocurren cuando portales y React compiten por limpiar nodos del DOM
    const isDOMPortalError = error.message?.includes('removeChild') ||
                             error.message?.includes('The node to be removed is not a child') ||
                             error.message?.includes('parentNode is null');
    
    if (isDOMPortalError) {
      return { hasError: false, error: null };
    }
    
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error);
    console.error('Error info:', errorInfo);
    
    // Auto-limpiar errores después de 8 segundos
    if (this.timeoutId) clearTimeout(this.timeoutId);
    this.timeoutId = setTimeout(() => {
      this.setState({ hasError: false, error: null });
      this.timeoutId = null;
    }, 8000);
  }

  componentWillUnmount() {
    if (this.timeoutId) clearTimeout(this.timeoutId);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
            <h2 className="text-lg font-semibold text-red-800 mb-2">
              Ha ocurrido un error
            </h2>
            <p className="text-red-700 text-sm mb-4">
              {this.state.error?.message || 'Error desconocido'}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-red-600 text-white rounded font-semibold hover:bg-red-700"
            >
              Reintentar
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
