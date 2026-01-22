import type { Position, Geometry, Feature, FeatureCollection, GeoJSON } from './types';

const EARTH_RADIUS = 6371008.8; // meters

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

export function distance(p1: Position, p2: Position): number {
  const dLat = toRad(p2[1] - p1[1]);
  const dLon = toRad(p2[0] - p1[0]);
  const lat1 = toRad(p1[1]);
  const lat2 = toRad(p2[1]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS * c;
}

export function bearing(start: Position, end: Position): number {
  const startLat = toRad(start[1]);
  const startLng = toRad(start[0]);
  const destLat = toRad(end[1]);
  const destLng = toRad(end[0]);

  const y = Math.sin(destLng - startLng) * Math.cos(destLat);
  const x =
    Math.cos(startLat) * Math.sin(destLat) -
    Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
  let brng = Math.atan2(y, x);
  brng = toDeg(brng);
  return (brng + 360) % 360;
}

// Calculate area of a polygon ring in square meters
function ringArea(coords: Position[]): number {
  let area = 0;
  if (coords.length > 2) {
    for (let i = 0; i < coords.length; i++) {
      const j = (i + 1) % coords.length;
      const p1 = coords[i];
      const p2 = coords[j];
      area += toRad(p2[0] - p1[0]) * (2 + Math.sin(toRad(p1[1])) + Math.sin(toRad(p2[1])));
    }
    area = (area * EARTH_RADIUS * EARTH_RADIUS) / 2.0;
  }
  return Math.abs(area);
}

export function calculateArea(geo: Geometry): number {
  let total = 0;
  if (geo.type === 'Polygon') {
    const coords = geo.coordinates as Position[][];
    if (coords.length > 0) {
      total += ringArea(coords[0]); // Outer ring
      for (let i = 1; i < coords.length; i++) {
        total -= ringArea(coords[i]); // Holes
      }
    }
  } else if (geo.type === 'MultiPolygon') {
    const coords = geo.coordinates as Position[][][];
    for (const poly of coords) {
      if (poly.length > 0) {
        let polyArea = ringArea(poly[0]);
        for (let i = 1; i < poly.length; i++) {
          polyArea -= ringArea(poly[i]);
        }
        total += polyArea;
      }
    }
  }
  return Math.max(0, total);
}

export function calculateLength(geo: Geometry): number {
  let total = 0;
  if (geo.type === 'LineString') {
    const coords = geo.coordinates as Position[];
    for (let i = 0; i < coords.length - 1; i++) {
      total += distance(coords[i], coords[i + 1]);
    }
  } else if (geo.type === 'MultiLineString') {
    const coords = geo.coordinates as Position[][];
    for (const line of coords) {
      for (let i = 0; i < line.length - 1; i++) {
        total += distance(line[i], line[i + 1]);
      }
    }
  } else if (geo.type === 'Polygon') {
     // Perimeter
     const coords = geo.coordinates as Position[][];
     for (const ring of coords) {
        for (let i = 0; i < ring.length - 1; i++) {
           total += distance(ring[i], ring[i+1]);
        }
     }
  }
  return total;
}

export function getBBox(geo: GeoJSON): [number, number, number, number] {
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

  function expand(pos: Position) {
    if (pos[0] < minX) minX = pos[0];
    if (pos[1] < minY) minY = pos[1];
    if (pos[0] > maxX) maxX = pos[0];
    if (pos[1] > maxY) maxY = pos[1];
  }

  function traverse(g: any) {
    if (g.type === 'FeatureCollection') {
      g.features.forEach((f: any) => traverse(f));
    } else if (g.type === 'Feature') {
      traverse(g.geometry);
    } else if (g.type === 'Point') {
      expand(g.coordinates);
    } else if (g.type === 'LineString' || g.type === 'MultiPoint') {
      g.coordinates.forEach(expand);
    } else if (g.type === 'Polygon' || g.type === 'MultiLineString') {
      g.coordinates.flat().forEach(expand);
    } else if (g.type === 'MultiPolygon') {
      g.coordinates.flat(2).forEach(expand);
    }
  }

  traverse(geo);

  if (minX === Infinity) return [-180, -90, 180, 90];
  return [minX, minY, maxX, maxY];
}

export function getCentroid(geo: GeoJSON): Position {
  const bbox = getBBox(geo);
  return [(bbox[0] + bbox[2]) / 2, (bbox[1] + bbox[3]) / 2];
}

export function simplify(points: Position[], tolerance: number): Position[] {
    if (points.length <= 2) return points;

    const sqTolerance = tolerance * tolerance;
    let maxSqDist = 0;
    let index = 0;

    for (let i = 1; i < points.length - 1; i++) {
        const sqDist = getSqSegDist(points[i], points[0], points[points.length - 1]);
        if (sqDist > maxSqDist) {
            index = i;
            maxSqDist = sqDist;
        }
    }

    if (maxSqDist > sqTolerance) {
        const left = simplify(points.slice(0, index + 1), tolerance);
        const right = simplify(points.slice(index), tolerance);
        return left.slice(0, left.length - 1).concat(right);
    } else {
        return [points[0], points[points.length - 1]];
    }
}

function getSqSegDist(p: Position, p1: Position, p2: Position): number {
    let x = p1[0], y = p1[1];
    let dx = p2[0] - x, dy = p2[1] - y;

    if (dx !== 0 || dy !== 0) {
        const t = ((p[0] - x) * dx + (p[1] - y) * dy) / (dx * dx + dy * dy);
        if (t > 1) {
            x = p2[0];
            y = p2[1];
        } else if (t > 0) {
            x += dx * t;
            y += dy * t;
        }
    }

    dx = p[0] - x;
    dy = p[1] - y;

    return dx * dx + dy * dy;
}

// Convex Hull (Monotone Chain)
function crossProduct(o: Position, a: Position, b: Position): number {
    return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

export function getConvexHull(points: Position[]): Position[] {
    const n = points.length;
    if (n <= 3) return points;

    // Sort by x-coordinate (and y-coordinate for ties)
    const sorted = points.slice().sort((a, b) => {
        return a[0] === b[0] ? a[1] - b[1] : a[0] - b[0];
    });

    const lower: Position[] = [];
    for (const p of sorted) {
        while (lower.length >= 2 && crossProduct(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
            lower.pop();
        }
        lower.push(p);
    }

    const upper: Position[] = [];
    for (let i = n - 1; i >= 0; i--) {
        const p = sorted[i];
        while (upper.length >= 2 && crossProduct(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
            upper.pop();
        }
        upper.push(p);
    }

    lower.pop();
    upper.pop();
    return lower.concat(upper);
}

export function getAllPoints(geo: GeoJSON): Position[] {
    const points: Position[] = [];
    function traverse(g: any) {
        if (g.type === 'FeatureCollection') {
            g.features.forEach((f: any) => traverse(f));
        } else if (g.type === 'Feature') {
            traverse(g.geometry);
        } else if (g.type === 'Point') {
            points.push(g.coordinates);
        } else if (g.type === 'LineString' || g.type === 'MultiPoint') {
            g.coordinates.forEach((p: Position) => points.push(p));
        } else if (g.type === 'Polygon' || g.type === 'MultiLineString') {
            g.coordinates.flat().forEach((p: Position) => points.push(p));
        } else if (g.type === 'MultiPolygon') {
            g.coordinates.flat(2).forEach((p: Position) => points.push(p));
        }
    }
    traverse(geo);
    return points;
}
