/**
 * K-Means clustering para agrupar coordenadas geográficas por cercanía.
 *
 * Opera sobre { lat, lng } y devuelve la asignación de cluster para cada punto.
 * Usa distancia euclidiana (suficiente para áreas pequeñas como un departamento).
 */

export interface GeoPoint {
  lat: number;
  lng: number;
}

export interface ClusterResult<T extends GeoPoint> {
  /** Índice del cluster (0-based) asignado a cada punto de entrada */
  assignments: number[];
  /** Centroides finales de cada cluster */
  centroids: GeoPoint[];
  /** Puntos agrupados por cluster */
  groups: T[][];
}

/**
 * Ejecuta K-Means sobre un conjunto de puntos geográficos.
 *
 * @param points  Arreglo de puntos con al menos { lat, lng }
 * @param k       Número de clusters deseados (se ajusta si k > points.length)
 * @param maxIter Máximo de iteraciones (default 50)
 */
export function kmeans<T extends GeoPoint>(
  points: T[],
  k: number,
  maxIter = 50,
): ClusterResult<T> {
  const n = points.length;
  const effectiveK = Math.max(1, Math.min(k, n));

  if (n === 0) {
    return { assignments: [], centroids: [], groups: [] };
  }

  // Inicialización: elegir k puntos distintos como centroides iniciales (K-Means++)
  const centroids = initCentroidsKMeansPP(points, effectiveK);
  const assignments = new Array<number>(n).fill(0);

  for (let iter = 0; iter < maxIter; iter++) {
    let changed = false;

    // Paso 1: asignar cada punto al centroide más cercano
    for (let i = 0; i < n; i++) {
      const nearest = nearestCentroid(points[i], centroids);
      if (nearest !== assignments[i]) {
        assignments[i] = nearest;
        changed = true;
      }
    }

    if (!changed) break;

    // Paso 2: recalcular centroides
    for (let c = 0; c < effectiveK; c++) {
      let sumLat = 0;
      let sumLng = 0;
      let count = 0;
      for (let i = 0; i < n; i++) {
        if (assignments[i] === c) {
          sumLat += points[i].lat;
          sumLng += points[i].lng;
          count++;
        }
      }
      if (count > 0) {
        centroids[c] = { lat: sumLat / count, lng: sumLng / count };
      }
    }
  }

  // Agrupar puntos por cluster
  const groups: T[][] = Array.from({ length: effectiveK }, () => []);
  for (let i = 0; i < n; i++) {
    groups[assignments[i]].push(points[i]);
  }

  return { assignments, centroids, groups };
}

// ── Internos ──────────────────────────────────────────────────────────────── //

function distSq(a: GeoPoint, b: GeoPoint): number {
  const dLat = a.lat - b.lat;
  const dLng = a.lng - b.lng;
  return dLat * dLat + dLng * dLng;
}

function nearestCentroid(point: GeoPoint, centroids: GeoPoint[]): number {
  let minDist = Infinity;
  let minIdx = 0;
  for (let c = 0; c < centroids.length; c++) {
    const d = distSq(point, centroids[c]);
    if (d < minDist) {
      minDist = d;
      minIdx = c;
    }
  }
  return minIdx;
}

/** K-Means++ inicialización: elige centroides con probabilidad proporcional a d² */
function initCentroidsKMeansPP(points: GeoPoint[], k: number): GeoPoint[] {
  const n = points.length;
  const centroids: GeoPoint[] = [];

  // Primer centroide aleatorio
  const firstIdx = Math.floor(Math.random() * n);
  centroids.push({ lat: points[firstIdx].lat, lng: points[firstIdx].lng });

  for (let c = 1; c < k; c++) {
    // Calcular d² mínima de cada punto al centroide más cercano
    const dists = new Float64Array(n);
    let totalDist = 0;
    for (let i = 0; i < n; i++) {
      let minD = Infinity;
      for (const cent of centroids) {
        const d = distSq(points[i], cent);
        if (d < minD) minD = d;
      }
      dists[i] = minD;
      totalDist += minD;
    }

    // Elegir siguiente centroide proporcionalmente a d²
    if (totalDist === 0) {
      // Todos los puntos coinciden; duplicar el centroide
      centroids.push({ ...centroids[0] });
      continue;
    }

    let r = Math.random() * totalDist;
    let chosen = 0;
    for (let i = 0; i < n; i++) {
      r -= dists[i];
      if (r <= 0) {
        chosen = i;
        break;
      }
    }
    centroids.push({ lat: points[chosen].lat, lng: points[chosen].lng });
  }

  return centroids;
}
