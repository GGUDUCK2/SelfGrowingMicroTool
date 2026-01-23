import type { GeoJSON, Position, Feature } from './types';

const EARTH_RADIUS = 6371008.8; // meters

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

function toDeg(rad: number): number {
  return (rad * 180) / Math.PI;
}

function destinationPoint(p: Position, distance: number, bearing: number): Position {
    const lat1 = toRad(p[1]);
    const lon1 = toRad(p[0]);
    const brng = toRad(bearing);
    const dR = distance / EARTH_RADIUS;

    const lat2 = Math.asin(Math.sin(lat1) * Math.cos(dR) + Math.cos(lat1) * Math.sin(dR) * Math.cos(brng));
    const lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(dR) * Math.cos(lat1), Math.cos(dR) - Math.sin(lat1) * Math.sin(lat2));

    return [toDeg(lon2), toDeg(lat2)];
}

export function createCircle(center: Position, radiusMeters: number, steps = 64): Position[] {
    const coords: Position[] = [];
    for (let i = 0; i < steps; i++) {
        const bearing = (i * 360) / steps;
        coords.push(destinationPoint(center, radiusMeters, bearing));
    }
    coords.push(coords[0]); // Close ring
    return coords;
}

export function createBuffer(geo: GeoJSON, distanceMeters: number): GeoJSON {
    if (distanceMeters <= 0) return geo;

    if (geo.type === 'Point') {
        return {
            type: 'Polygon',
            coordinates: [createCircle(geo.coordinates, distanceMeters)]
        };
    } else if (geo.type === 'MultiPoint') {
        return {
            type: 'MultiPolygon',
            coordinates: geo.coordinates.map(p => [createCircle(p, distanceMeters)])
        };
    } else if (geo.type === 'Feature' && geo.geometry.type === 'Point') {
        return {
             type: 'Feature',
             properties: geo.properties,
             geometry: {
                 type: 'Polygon',
                 coordinates: [createCircle((geo.geometry as any).coordinates, distanceMeters)]
             }
        };
    } else if (geo.type === 'FeatureCollection') {
        return {
            type: 'FeatureCollection',
            features: geo.features.map(f => {
                if (f.geometry.type === 'Point') {
                    return {
                        type: 'Feature',
                        properties: f.properties,
                        geometry: {
                            type: 'Polygon',
                            coordinates: [createCircle((f.geometry as any).coordinates, distanceMeters)]
                        }
                    } as Feature;
                }
                return f;
            })
        };
    }

    // Fallback for lines/polys: just return original for now as implementing offset curves is out of scope
    return geo;
}
