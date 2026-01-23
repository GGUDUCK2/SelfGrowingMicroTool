import type { GeoJSON, Geometry, Feature } from './types';
import { simplify } from './measure';

export function reverseGeometry(geo: GeoJSON): GeoJSON {
    if (geo.type === 'FeatureCollection') {
        return {
            type: 'FeatureCollection',
            features: geo.features.map(f => reverseGeometry(f) as Feature)
        };
    } else if (geo.type === 'Feature') {
        return {
            type: 'Feature',
            properties: geo.properties,
            geometry: reverseGeometry(geo.geometry) as Geometry
        };
    } else if (geo.type === 'Point' || geo.type === 'MultiPoint') {
        return geo; // Points don't have direction
    } else if (geo.type === 'LineString') {
        return {
            type: 'LineString',
            coordinates: [...geo.coordinates].reverse()
        };
    } else if (geo.type === 'Polygon') {
        return {
            type: 'Polygon',
            coordinates: geo.coordinates.map(ring => [...ring].reverse())
        };
    } else if (geo.type === 'MultiLineString') {
        return {
            type: 'MultiLineString',
            coordinates: geo.coordinates.map(line => [...line].reverse())
        };
    } else if (geo.type === 'MultiPolygon') {
        return {
            type: 'MultiPolygon',
            coordinates: geo.coordinates.map(poly => poly.map(ring => [...ring].reverse()))
        };
    }
    return geo;
}

export function simplifyGeometry(geo: GeoJSON, tolerance: number): GeoJSON {
    if (tolerance <= 0) return geo;

    if (geo.type === 'FeatureCollection') {
        return {
            type: 'FeatureCollection',
            features: geo.features.map(f => simplifyGeometry(f, tolerance) as Feature)
        };
    } else if (geo.type === 'Feature') {
        return {
            type: 'Feature',
            properties: geo.properties,
            geometry: simplifyGeometry(geo.geometry, tolerance) as Geometry
        };
    } else if (geo.type === 'Point' || geo.type === 'MultiPoint') {
        return geo;
    } else if (geo.type === 'LineString') {
        return {
            type: 'LineString',
            coordinates: simplify(geo.coordinates, tolerance)
        };
    } else if (geo.type === 'Polygon') {
        return {
            type: 'Polygon',
            coordinates: geo.coordinates.map(ring => {
                const s = simplify(ring, tolerance);
                // Ensure ring is closed
                if (s.length > 1 && (s[0][0] !== s[s.length-1][0] || s[0][1] !== s[s.length-1][1])) {
                    s.push(s[0]);
                }
                return s;
            })
        };
    } else if (geo.type === 'MultiLineString') {
        return {
            type: 'MultiLineString',
            coordinates: geo.coordinates.map(line => simplify(line, tolerance))
        };
    } else if (geo.type === 'MultiPolygon') {
         return {
            type: 'MultiPolygon',
            coordinates: geo.coordinates.map(poly => poly.map(ring => {
                const s = simplify(ring, tolerance);
                if (s.length > 1 && (s[0][0] !== s[s.length-1][0] || s[0][1] !== s[s.length-1][1])) {
                    s.push(s[0]);
                }
                return s;
            }))
        };
    }
    return geo;
}
