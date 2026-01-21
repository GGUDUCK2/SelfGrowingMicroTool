export type Position = [number, number]; // [lon, lat]

export interface Geometry {
  type: string;
  coordinates: Position | Position[] | Position[][] | Position[][][];
}

export interface Point extends Geometry {
  type: 'Point';
  coordinates: Position;
}

export interface LineString extends Geometry {
  type: 'LineString';
  coordinates: Position[];
}

export interface Polygon extends Geometry {
  type: 'Polygon';
  coordinates: Position[][];
}

export interface MultiPoint extends Geometry {
  type: 'MultiPoint';
  coordinates: Position[];
}

export interface MultiLineString extends Geometry {
  type: 'MultiLineString';
  coordinates: Position[][];
}

export interface MultiPolygon extends Geometry {
  type: 'MultiPolygon';
  coordinates: Position[][][];
}

export interface Feature {
  type: 'Feature';
  geometry: Geometry;
  properties?: Record<string, any>;
}

export interface FeatureCollection {
  type: 'FeatureCollection';
  features: Feature[];
}

export type GeoJSON = Feature | FeatureCollection | Geometry;
