import type { GeoJSON, Geometry, Feature } from './types';
import { simplify } from './measure';
import {
    isFeature, isFeatureCollection, isLineString, isPolygon,
    isMultiLineString, isMultiPolygon, isPoint, isMultiPoint
} from './guards';

export function reverseGeometry(geo: GeoJSON): GeoJSON {
    if (isFeatureCollection(geo)) {
        return {
            type: 'FeatureCollection',
            features: geo.features.map(f => reverseGeometry(f) as Feature)
        };
    } else if (isFeature(geo)) {
        return {
            type: 'Feature',
            properties: geo.properties,
            geometry: reverseGeometry(geo.geometry) as Geometry
        };
    }

    const g = geo as Geometry;

    if (isPoint(g) || isMultiPoint(g)) {
        return g;
    } else if (isLineString(g)) {
        return {
            type: 'LineString',
            coordinates: [...g.coordinates].reverse()
        };
    } else if (isPolygon(g)) {
        return {
            type: 'Polygon',
            coordinates: g.coordinates.map(ring => [...ring].reverse())
        };
    } else if (isMultiLineString(g)) {
        return {
            type: 'MultiLineString',
            coordinates: g.coordinates.map(line => [...line].reverse())
        };
    } else if (isMultiPolygon(g)) {
        return {
            type: 'MultiPolygon',
            coordinates: g.coordinates.map(poly => poly.map(ring => [...ring].reverse()))
        };
    }
    return geo;
}

export function simplifyGeometry(geo: GeoJSON, tolerance: number): GeoJSON {
    if (tolerance <= 0) return geo;

    if (isFeatureCollection(geo)) {
        return {
            type: 'FeatureCollection',
            features: geo.features.map(f => simplifyGeometry(f, tolerance) as Feature)
        };
    } else if (isFeature(geo)) {
        return {
            type: 'Feature',
            properties: geo.properties,
            geometry: simplifyGeometry(geo.geometry, tolerance) as Geometry
        };
    }

    const g = geo as Geometry;

    if (isPoint(g) || isMultiPoint(g)) {
        return g;
    } else if (isLineString(g)) {
        return {
            type: 'LineString',
            coordinates: simplify(g.coordinates, tolerance)
        };
    } else if (isPolygon(g)) {
        return {
            type: 'Polygon',
            coordinates: g.coordinates.map(ring => {
                const s = simplify(ring, tolerance);
                // Ensure ring is closed
                if (s.length > 1 && (s[0][0] !== s[s.length-1][0] || s[0][1] !== s[s.length-1][1])) {
                    s.push(s[0]);
                }
                return s;
            })
        };
    } else if (isMultiLineString(g)) {
        return {
            type: 'MultiLineString',
            coordinates: g.coordinates.map(line => simplify(line, tolerance))
        };
    } else if (isMultiPolygon(g)) {
         return {
            type: 'MultiPolygon',
            coordinates: g.coordinates.map(poly => poly.map(ring => {
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
