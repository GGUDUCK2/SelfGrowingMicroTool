import type { GeoJSON, Feature, Geometry, Position, FeatureCollection } from './types';

function escapeXML(str: string): string {
    return str.replace(/&/g, '&amp;')
              .replace(/</g, '&lt;')
              .replace(/>/g, '&gt;')
              .replace(/"/g, '&quot;')
              .replace(/'/g, '&apos;');
}

function coordToKML(coords: Position): string {
    return `${coords[0]},${coords[1]}`;
}

function coordsToKML(coords: Position[]): string {
    return coords.map(coordToKML).join(' ');
}

function geometryToKML(geo: Geometry): string {
    switch (geo.type) {
        case 'Point':
            return `<Point><coordinates>${coordToKML(geo.coordinates as Position)}</coordinates></Point>`;
        case 'LineString':
            return `<LineString><coordinates>${coordsToKML(geo.coordinates as Position[])}</coordinates></LineString>`;
        case 'Polygon':
            // Only outer ring for simplicity
            return `<Polygon><outerBoundaryIs><LinearRing><coordinates>${coordsToKML((geo.coordinates as Position[][])[0])}</coordinates></LinearRing></outerBoundaryIs></Polygon>`;
        case 'MultiPoint':
            return `<MultiGeometry>${(geo.coordinates as Position[]).map(p => `<Point><coordinates>${coordToKML(p)}</coordinates></Point>`).join('')}</MultiGeometry>`;
        // ... others omitted
        default:
            return '';
    }
}

export function toKML(geo: GeoJSON): string {
    let placemarks = '';

    function process(g: GeoJSON, props: Record<string, unknown> = {}) {
        if (g.type === 'FeatureCollection') {
            (g as FeatureCollection).features.forEach(f => process(f));
        } else if (g.type === 'Feature') {
            process((g as Feature).geometry, (g as Feature).properties);
        } else {
            // Geometry
            const name = props.name || props.title || 'Untitled';
            const description = Object.entries(props).map(([k,v]) => `${k}: ${v}`).join('\n');
            placemarks += `
            <Placemark>
                <name>${escapeXML(String(name))}</name>
                <description>${escapeXML(description)}</description>
                ${geometryToKML(g as Geometry)}
            </Placemark>`;
        }
    }

    process(geo);

    return `<?xml version="1.0" encoding="UTF-8"?>
<kml xmlns="http://www.opengis.net/kml/2.2">
<Document>
${placemarks}
</Document>
</kml>`;
}

export function toGPX(geo: GeoJSON): string {
    let wpts = '';
    let trks = '';

    function process(g: GeoJSON, props: Record<string, unknown> = {}) {
        const name = escapeXML(String(props.name || props.title || 'Untitled'));

        if (g.type === 'FeatureCollection') {
            (g as FeatureCollection).features.forEach(f => process(f));
        } else if (g.type === 'Feature') {
            process((g as Feature).geometry, (g as Feature).properties);
        } else if (g.type === 'Point') {
             const [lon, lat] = (g as any).coordinates;
             wpts += `<wpt lat="${lat}" lon="${lon}"><name>${name}</name></wpt>\n`;
        } else if (g.type === 'LineString') {
             trks += `<trk><name>${name}</name><trkseg>\n`;
             (g as any).coordinates.forEach((p: Position) => {
                 trks += `<trkpt lat="${p[1]}" lon="${p[0]}"></trkpt>\n`;
             });
             trks += `</trkseg></trk>\n`;
        } else if (g.type === 'Polygon') {
             // Convert polygon to closed track
             trks += `<trk><name>${name} (Polygon)</name><trkseg>\n`;
             (g as any).coordinates[0].forEach((p: Position) => {
                 trks += `<trkpt lat="${p[1]}" lon="${p[0]}"></trkpt>\n`;
             });
             trks += `</trkseg></trk>\n`;
        }
    }

    process(geo);

    return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="Geo Forge">
${wpts}
${trks}
</gpx>`;
}
