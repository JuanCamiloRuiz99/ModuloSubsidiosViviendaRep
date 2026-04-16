/**
 * Test utilities — render helpers with standard providers.
 *
 * Usage:
 *   import { renderWithProviders } from '../../tests/test-utils';
 *   const { getByText } = renderWithProviders(<MyComponent />);
 */
import React from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions extends RenderOptions {
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: React.ReactElement,
  { initialEntries = ['/'], ...options }: WrapperOptions = {},
) {
  const queryClient = makeQueryClient();

  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </QueryClientProvider>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

export { screen, fireEvent, waitFor, within } from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
