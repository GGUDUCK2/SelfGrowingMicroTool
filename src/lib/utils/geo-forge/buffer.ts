import type { GeoJSON, Position, Feature, Geometry } from './types';
import { isFeature, isFeatureCollection, isPoint, isMultiPoint } from './guards';

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

    if (isFeatureCollection(geo)) {
        return {
            type: 'FeatureCollection',
            features: geo.features.map(f => {
                if (isPoint(f.geometry)) {
                    return {
                        type: 'Feature',
                        properties: f.properties,
                        geometry: {
                            type: 'Polygon',
                            coordinates: [createCircle(f.geometry.coordinates, distanceMeters)]
                        }
                    } as Feature;
                }
                if (isMultiPoint(f.geometry)) {
                     return {
                        type: 'Feature',
                        properties: f.properties,
                        geometry: {
                            type: 'MultiPolygon',
                            coordinates: f.geometry.coordinates.map(p => [createCircle(p, distanceMeters)])
                        }
                    } as Feature;
                }
                return f;
            })
        };
    } else if (isFeature(geo)) {
        if (isPoint(geo.geometry)) {
            return {
                type: 'Feature',
                properties: geo.properties,
                geometry: {
                    type: 'Polygon',
                    coordinates: [createCircle(geo.geometry.coordinates, distanceMeters)]
                }
            };
        }
        if (isMultiPoint(geo.geometry)) {
             return {
                type: 'Feature',
                properties: geo.properties,
                geometry: {
                    type: 'MultiPolygon',
                    coordinates: geo.geometry.coordinates.map(p => [createCircle(p, distanceMeters)])
                }
            };
        }
        return geo;
    } else {
        // Geometry
        // We need to cast to Geometry to use the guards effectively if TS is confused,
        // but since we eliminated Feature and FeatureCollection, it must be Geometry.
        // However, 'geo' is still typed as GeoJSON (narrowed).
        const geometry = geo as Geometry;

        if (isPoint(geometry)) {
            return {
                type: 'Polygon',
                coordinates: [createCircle(geometry.coordinates, distanceMeters)]
            };
        } else if (isMultiPoint(geometry)) {
            return {
                type: 'MultiPolygon',
                coordinates: geometry.coordinates.map(p => [createCircle(p, distanceMeters)])
            };
        }
    }

    // Fallback for lines/polys
    return geo;
}
