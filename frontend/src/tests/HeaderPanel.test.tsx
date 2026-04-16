/**
 * Tests unitarios — componente HeaderPanel.
 * Verifica renderizado de título, subtítulo y botón de acción.
 */
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { HeaderPanel } from '../shared/presentation/components/panels/HeaderPanel';

describe('HeaderPanel', () => {
  it('muestra el título', () => {
    render(<HeaderPanel title="Gestión de Programas" />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Gestión de Programas');
  });

  it('muestra el subtítulo cuando se pasa', () => {
    render(<HeaderPanel title="Programas" subtitle="Administra los programas de subsidio" />);
    expect(screen.getByText('Administra los programas de subsidio')).toBeInTheDocument();
  });

  it('no muestra subtítulo cuando no se pasa', () => {
    render(<HeaderPanel title="Programas" />);
    expect(screen.queryByText(/Administra/)).not.toBeInTheDocument();
  });

  it('muestra el botón de acción cuando se pasan actionLabel y onAction', () => {
    const onAction = vi.fn();
    render(<HeaderPanel title="Postulantes" actionLabel="Nuevo" onAction={onAction} />);
    // El botón incluye un span "+" antes del label → name accesible: "+ Nuevo"
    const btn = screen.getByRole('button', { name: /Nuevo/i });
    expect(btn).toBeInTheDocument();
  });

  it('llama a onAction al hacer clic en el botón', () => {
    const onAction = vi.fn();
    render(<HeaderPanel title="Usuarios" actionLabel="Guardar" onAction={onAction} />);
    fireEvent.click(screen.getByRole('button', { name: /Guardar/i }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('no muestra botón cuando no se pasa onAction', () => {
    render(<HeaderPanel title="Sin botón" actionLabel="Acción" />);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  // actionLabel tiene default='Crear', así que si no se pasa pero sí onAction,
  // el componente sigue mostrando el botón con "Crear". Verificamos eso.
  it('muestra botón con label por defecto "Crear" cuando solo se pasa onAction', () => {
    render(<HeaderPanel title="Con default" onAction={() => {}} />);
    expect(screen.getByRole('button', { name: /Crear/i })).toBeInTheDocument();
  });
});
