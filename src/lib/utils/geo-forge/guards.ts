import type {
    GeoJSON, Feature, FeatureCollection, Geometry,
    Point, MultiPoint, LineString, MultiLineString, Polygon, MultiPolygon
} from './types';

export function isFeature(geo: GeoJSON): geo is Feature {
    return geo.type === 'Feature';
}

export function isFeatureCollection(geo: GeoJSON): geo is FeatureCollection {
    return geo.type === 'FeatureCollection';
}

export function isGeometry(geo: GeoJSON): geo is Geometry {
    return !isFeature(geo) && !isFeatureCollection(geo);
}

export function isPoint(geo: Geometry): geo is Point {
    return geo.type === 'Point';
}

export function isMultiPoint(geo: Geometry): geo is MultiPoint {
    return geo.type === 'MultiPoint';
}

export function isLineString(geo: Geometry): geo is LineString {
    return geo.type === 'LineString';
}

export function isMultiLineString(geo: Geometry): geo is MultiLineString {
    return geo.type === 'MultiLineString';
}

export function isPolygon(geo: Geometry): geo is Polygon {
    return geo.type === 'Polygon';
}

export function isMultiPolygon(geo: Geometry): geo is MultiPolygon {
    return geo.type === 'MultiPolygon';
}
