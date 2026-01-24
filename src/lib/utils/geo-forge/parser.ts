import type { FeatureCollection, Geometry, Position, Feature, GeoJSON, Point } from './types';
import { repairWKT } from './repair';
import Papa from 'papaparse';

// --- CSV Parser ---

type CSVRow = Record<string, unknown>;

export function parseCSV(csv: string): FeatureCollection {
  const result = Papa.parse(csv, { header: true, dynamicTyping: true, skipEmptyLines: true });
  const data = result.data as CSVRow[];

  if (!data || data.length === 0) {
    return { type: 'FeatureCollection', features: [] };
  }

  const keys = Object.keys(data[0]).map(k => k.toLowerCase());

  // Detect lat/lon columns
  let latKey = keys.find(k => ['lat', 'latitude', 'y'].includes(k));
  let lonKey = keys.find(k => ['lon', 'lng', 'longitude', 'x'].includes(k));

  // Map back to original case
  if (latKey) latKey = Object.keys(data[0]).find(k => k.toLowerCase() === latKey);
  if (lonKey) lonKey = Object.keys(data[0]).find(k => k.toLowerCase() === lonKey);

  if (!latKey || !lonKey) {
    throw new Error("Could not detect Latitude/Longitude columns in CSV.");
  }

  const features = data.map((row): Feature | null => {
    const lat = typeof row[latKey!] === 'number' ? row[latKey!] as number : parseFloat(row[latKey!] as string);
    const lon = typeof row[lonKey!] === 'number' ? row[lonKey!] as number : parseFloat(row[lonKey!] as string);

    if (isNaN(lat) || isNaN(lon)) return null;

    const geometry: Point = {
      type: 'Point',
      coordinates: [lon, lat]
    };

    return {
      type: 'Feature',
      geometry,
      properties: row
    };
  }).filter((f): f is Feature => f !== null);

  return {
    type: 'FeatureCollection',
    features
  };
}

export function toCSV(geo: GeoJSON): string {
  const features: Feature[] = [];

  function extract(g: GeoJSON) {
     if (g.type === 'FeatureCollection') {
         (g as FeatureCollection).features.forEach(extract);
     } else if (g.type === 'Feature') {
         const f = g as Feature;
         if (f.geometry.type === 'Point') {
             features.push(f);
         }
     } else if (g.type === 'Point') {
         features.push({ type: 'Feature', geometry: g as Geometry, properties: {} });
     }
  }

  extract(geo);

  const rows = features.map(f => {
      // Safe access to coordinates for Point type
      const coords = f.geometry.coordinates as Position;
      const [lon, lat] = coords;
      return {
          latitude: lat,
          longitude: lon,
          ...f.properties
      };
  });

  return Papa.unparse(rows);
}

// --- WKT Parser ---

function cleanWKT(wkt: string): string {
  return wkt.replace(/[\n\r]/g, ' ').trim().toUpperCase();
}

function parsePointText(text: string): Position {
  const parts = text.trim().split(/\s+/).map(Number);
  return [parts[0], parts[1]];
}

function parseLineStringText(text: string): Position[] {
  return text.split(',').map(pair => parsePointText(pair));
}

function parsePolygonText(text: string): Position[][] {
  // Remove outer parens if they exist, then split by ), (
  // Example: ((30 10, 40 40, ...), (20 30, ...))
  // Regex to find content inside parens
  const ringTexts = text.match(/\(([^()]+)\)/g);
  if (!ringTexts) return [];
  return ringTexts.map(r => parseLineStringText(r.replace(/[()]/g, '')));
}

function parseMultiPolygonText(text: string): Position[][][] {
    // (((...)), ((...)))
    // This is hard with regex. Simple state machine is better.
    // Hacky approach: Split by ")), (("
    const polyTexts = text.split(/\)\)\s*,\s*\(\(/);
    return polyTexts.map(p => {
        const clean = p.replace(/^\(+/, '').replace(/\)+$/, '');
        // Re-wrap in parens for Polygon parser if needed? No, Polygon expects ((...)) format usually.
        // Actually my parsePolygonText expects ((ring), (hole)) format matching.
        // Let's manually construct.
        const rings = clean.split(/\)\s*,\s*\(/);
        return rings.map(r => parseLineStringText(r));
    });
}

export function parseWKT(wkt: string): Geometry {
  const clean = cleanWKT(wkt);
  const typeMatch = clean.match(/^([A-Z]+)\s*\((.*)\)$/);

  if (!typeMatch) throw new Error("Invalid WKT format");

  const type = typeMatch[1];
  const content = typeMatch[2];

  switch (type) {
    case 'POINT':
      return { type: 'Point', coordinates: parsePointText(content) };
    case 'LINESTRING':
      return { type: 'LineString', coordinates: parseLineStringText(content) };
    case 'POLYGON':
      return { type: 'Polygon', coordinates: parsePolygonText(content) };
    case 'MULTIPOINT': {
        // (10 10, 20 20) or ((10 10), (20 20)) depending on flavor
        const points = content.replace(/[()]/g, '').split(',');
        return { type: 'MultiPoint', coordinates: points.map(p => parsePointText(p)) };
    }
    case 'MULTILINESTRING': {
        // ((10 10, 20 20), (15 15, 25 25))
        const lines = content.match(/\(([^()]+)\)/g);
        if (!lines) return { type: 'MultiLineString', coordinates: [] };
        return { type: 'MultiLineString', coordinates: lines.map(l => parseLineStringText(l.replace(/[()]/g, ''))) };
    }
    case 'MULTIPOLYGON':
        return { type: 'MultiPolygon', coordinates: parseMultiPolygonText(content) };
    default:
      throw new Error(`Unsupported WKT type: ${type}`);
  }
}

export function toWKT(geo: Geometry): string {
    function pair(p: Position) { return `${p[0]} ${p[1]}`; }
    function ring(r: Position[]) { return `(${r.map(pair).join(', ')})`; }
    function poly(p: Position[][]) { return `(${p.map(ring).join(', ')})`; }

    switch(geo.type) {
        case 'Point':
            return `POINT (${pair(geo.coordinates as Position)})`;
        case 'LineString':
            return `LINESTRING ${ring(geo.coordinates as Position[])}`; // ring adds parens
        case 'Polygon':
            return `POLYGON ${poly(geo.coordinates as Position[][])}`;
        case 'MultiPoint':
            return `MULTIPOINT (${(geo.coordinates as Position[]).map(pair).join(', ')})`;
        case 'MultiLineString':
            return `MULTILINESTRING (${(geo.coordinates as Position[][]).map(ring).join(', ')})`;
        case 'MultiPolygon':
            return `MULTIPOLYGON (${(geo.coordinates as Position[][][]).map(poly).join(', ')})`;
        default:
            return '';
    }
}

export interface ParsedResult {
    data: GeoJSON;
    format: 'wkt' | 'geojson' | 'csv';
}

export function detectAndParse(input: string): ParsedResult {
    const trimmed = input.trim();

    // 1. Try JSON (GeoJSON)
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
            const json = JSON.parse(trimmed);
            // Basic validation: must have type
            if (json.type) {
                return { data: json as GeoJSON, format: 'geojson' };
            }
        } catch (e) {
            // Not JSON
        }
    }

    // 2. Try WKT
    // Starts with a letter
    if (/^[a-zA-Z]/.test(trimmed)) {
        try {
            const wkt = parseWKT(trimmed);
            return { data: wkt, format: 'wkt' };
        } catch (e) {
            // Try Repair
            try {
                const repaired = repairWKT(trimmed);
                const wkt = parseWKT(repaired);
                return { data: wkt, format: 'wkt' };
            } catch (e2) {
                // Failed WKT
            }
        }
    }

    // 3. Try CSV (Last resort)
    // Heuristic: check for commas and newlines
    try {
        const csv = parseCSV(trimmed);
        if (csv.features.length > 0) {
            return { data: csv, format: 'csv' };
        }
    } catch (e) {
        // Failed CSV
    }

    throw new Error("Could not detect format (GeoJSON, WKT, or CSV).");
}
