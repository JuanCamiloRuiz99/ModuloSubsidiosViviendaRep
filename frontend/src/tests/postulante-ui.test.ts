/**
 * Tests unitarios — utilidades de presentación del módulo Postulantes.
 * Son funciones puras: no requieren DOM ni mocks.
 */
import { nombreCompleto, formatFecha, ESTADO_STYLES, ESTADOS_FILTRO } from '../features/postulantes/presentation/utils/postulante-ui';

describe('nombreCompleto()', () => {
  it('combina todas las partes con espacio', () => {
    expect(nombreCompleto('Juan', 'Carlos', 'Pérez', 'López')).toBe('Juan Carlos Pérez López');
  });

  it('omite partes nulas o vacías', () => {
    expect(nombreCompleto('Ana', null, 'García', undefined)).toBe('Ana García');
  });

  it('retorna — cuando todas las partes están vacías', () => {
    expect(nombreCompleto(null, undefined, '')).toBe('—');
  });

  it('funciona con un solo nombre', () => {
    expect(nombreCompleto('Pedro')).toBe('Pedro');
  });
});

describe('formatFecha()', () => {
  it('formatea ISO a dd/mm/yyyy en locale es-CO', () => {
    // Usamos una fecha fija sin zona horaria ambigua
    const result = formatFecha('2026-04-09T00:00:00');
    expect(result).toMatch(/09\/04\/2026|9\/4\/2026/);
  });

  it('no lanza con fecha válida', () => {
    expect(() => formatFecha('2025-01-01')).not.toThrow();
  });
});

describe('ESTADO_STYLES', () => {
  const estadosEsperados = [
    'REGISTRADA',
    'EN_REVISION',
    'SUBSANACION',
    'VISITA_PENDIENTE',
    'VISITA_PROGRAMADA',
    'VISITA_REALIZADA',
    'DOCUMENTOS_INCOMPLETOS',
    'DOCUMENTOS_CARGADOS',
    'BENEFICIADO',
    'NO_BENEFICIARIO',
    'APROBADA',
    'RECHAZADA',
  ];

  it.each(estadosEsperados)('tiene estilos para el estado %s', (estado) => {
    expect(ESTADO_STYLES[estado]).toBeDefined();
    expect(ESTADO_STYLES[estado].length).toBeGreaterThan(0);
  });

  it('incluye VISITA_PROGRAMADA (estado añadido esta sesión)', () => {
    expect(ESTADO_STYLES['VISITA_PROGRAMADA']).toContain('indigo');
  });
});

describe('ESTADOS_FILTRO', () => {
  it('la primera opción es "Todos los estados" con value vacío', () => {
    expect(ESTADOS_FILTRO[0].value).toBe('');
    expect(ESTADOS_FILTRO[0].label).toBe('Todos los estados');
  });

  it('incluye VISITA_PROGRAMADA', () => {
    const valores = ESTADOS_FILTRO.map(e => e.value);
    expect(valores).toContain('VISITA_PROGRAMADA');
  });

  it('no hay valores duplicados', () => {
    const valores = ESTADOS_FILTRO.map(e => e.value).filter(Boolean);
    expect(new Set(valores).size).toBe(valores.length);
  });
});
