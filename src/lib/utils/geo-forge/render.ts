import type { Geometry, Position, GeoJSON } from './types';
import { getBBox } from './measure';

export interface Viewport {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
  scale: number;
  offsetX: number;
  offsetY: number;
}

const R = 6378137;
const MAX_LAT = 85.051129;

function mercator(lon: number, lat: number): [number, number] {
  const d2r = Math.PI / 180;
  // Clip lat
  const clippedLat = Math.max(Math.min(lat, MAX_LAT), -MAX_LAT);
  const sin = Math.sin(clippedLat * d2r);

  const x = R * lon * d2r;
  const y = (R * Math.log((1 + sin) / (1 - sin))) / 2;
  return [x, y];
}

export function getViewport(geo: GeoJSON, width: number, height: number, padding = 20): Viewport {
  const bbox = getBBox(geo); // [minLon, minLat, maxLon, maxLat]

  const [minLon, minLat, maxLon, maxLat] = bbox;

  // Project corners
  const bl = mercator(minLon, minLat);
  const tr = mercator(maxLon, maxLat);

  let minX = bl[0];
  let minY = bl[1];
  let maxX = tr[0];
  let maxY = tr[1];

  // Handle single point or zero area
  if (minX === maxX) { minX -= 1000; maxX += 1000; }
  if (minY === maxY) { minY -= 1000; maxY += 1000; }

  const dataW = Math.abs(maxX - minX);
  const dataH = Math.abs(maxY - minY);

  const scaleX = (width - padding * 2) / dataW;
  const scaleY = (height - padding * 2) / dataH;
  const scale = Math.min(scaleX, scaleY);

  // Center
  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;

  // To map (x, y) -> screen:
  // screenX = (x - cx) * scale + width/2
  // screenY = height/2 - (y - cy) * scale (flip Y)

  return {
    minX, minY, maxX, maxY,
    width, height, scale,
    offsetX: cx,
    offsetY: cy
  };
}

export function projectToScreen(pos: Position, vp: Viewport): [number, number] {
  const [mx, my] = mercator(pos[0], pos[1]);
  const x = (mx - vp.offsetX) * vp.scale + vp.width / 2;
  const y = vp.height / 2 - (my - vp.offsetY) * vp.scale;
  return [x, y];
}

export function screenToGeo(x: number, y: number, vp: Viewport): Position {
    const mx = (x - vp.width / 2) / vp.scale + vp.offsetX;
    const my = vp.offsetY - (y - vp.height / 2) / vp.scale;

    const d2r = Math.PI / 180;
    const lon = mx / (R * d2r);
    const lat = (2 * Math.atan(Math.exp(my / R)) - Math.PI / 2) / d2r;

    return [lon, lat];
}

export function generatePath(geo: Geometry, vp: Viewport): string {
  function p(pos: Position) {
    const s = projectToScreen(pos, vp);
    return `${s[0].toFixed(1)},${s[1].toFixed(1)}`;
  }

  if (geo.type === 'Point') {
    const s = projectToScreen(geo.coordinates as Position, vp);
    return `M ${s[0]},${s[1]} m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0`; // Circle
  } else if (geo.type === 'LineString') {
    const coords = geo.coordinates as Position[];
    return `M ${coords.map(p).join(' L ')}`;
  } else if (geo.type === 'Polygon') {
    const rings = geo.coordinates as Position[][];
    return rings.map(ring => `M ${ring.map(p).join(' L ')} Z`).join(' ');
  } else if (geo.type === 'MultiPoint') {
      return (geo.coordinates as Position[]).map(pt => {
        const s = projectToScreen(pt, vp);
        return `M ${s[0]},${s[1]} m -3,0 a 3,3 0 1,0 6,0 a 3,3 0 1,0 -6,0`;
      }).join(' ');
  } else if (geo.type === 'MultiLineString') {
      return (geo.coordinates as Position[][]).map(line =>
        `M ${line.map(p).join(' L ')}`
      ).join(' ');
  } else if (geo.type === 'MultiPolygon') {
      return (geo.coordinates as Position[][][]).map(poly =>
         poly.map(ring => `M ${ring.map(p).join(' L ')} Z`).join(' ')
      ).join(' ');
  }
  return '';
}
