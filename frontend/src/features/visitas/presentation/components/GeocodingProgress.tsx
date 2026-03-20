/**
 * GeocodingProgress – Barra de progreso de geocodificación.
 */

import React from 'react';

interface Props {
  done: number;
  total: number;
  cached?: number;
}

export const GeocodingProgress: React.FC<Props> = React.memo(({ done, total, cached }) => {
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <div className="mb-4 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 flex items-center gap-3">
      <svg className="animate-spin h-4 w-4 text-blue-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
      </svg>
      <div className="flex-1">
        <p className="text-sm font-medium text-blue-800">
          Geolocalizando direcciones… {done}/{total}
          {cached != null && cached > 0 && (
            <span className="text-blue-500 font-normal ml-2">({cached} desde caché)</span>
          )}
        </p>
        <div className="mt-1 h-1.5 bg-blue-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>
    </div>
  );
});

GeocodingProgress.displayName = 'GeocodingProgress';
