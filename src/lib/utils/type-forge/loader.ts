import opentype from 'opentype.js';
import type { LoadedFont, VariableAxis, FontMeta } from './types';

export async function loadFont(file: File): Promise<LoadedFont> {
  const buffer = await file.arrayBuffer();

  return new Promise((resolve, reject) => {
    try {
        const font = opentype.parse(buffer);
        const meta = extractMeta(font);
        const axes = extractAxes(font);
        const url = URL.createObjectURL(file);

        resolve({
            font,
            meta,
            axes,
            fileName: file.name,
            fileSize: file.size,
            url
        });
    } catch (e) {
        reject(e);
    }
  });
}

function extractMeta(font: opentype.Font): FontMeta {
    const names = font.names;
    return {
        family: getLocalName(names.fontFamily) || 'Unknown',
        style: getLocalName(names.fontSubfamily) || 'Regular',
        version: getLocalName(names.version) || '',
        copyright: getLocalName(names.copyright) || '',
        manufacturer: getLocalName(names.manufacturer) || '',
        designer: getLocalName(names.designer) || '',
        license: getLocalName(names.license) || ''
    };
}

function getLocalName(nameRecord: any): string {
    if (!nameRecord) return '';
    // opentype.js returns LocalizedName { en: '...', ... }
    return nameRecord.en || Object.values(nameRecord)[0] as string || '';
}

function extractAxes(font: opentype.Font): VariableAxis[] {
    const fvar = (font.tables as any).fvar;
    if (!fvar || !fvar.axes) return [];

    return fvar.axes.map((axis: any) => ({
        tag: axis.tag,
        name: getAxisName(font, axis.axisNameID) || axis.tag,
        min: axis.minValue,
        max: axis.maxValue,
        default: axis.defaultValue,
        current: axis.defaultValue
    }));
}

function getAxisName(font: opentype.Font, nameID: number): string {
    const nameTable = (font.tables as any).name;
    // nameTable is an object with a 'names' array property which contains the NameRecords
    if (nameTable && Array.isArray(nameTable)) {
         // Try to find English name (Platform 3, Encoding 1, Lang 1033 (0x409))
         const entry = nameTable.find((n: any) => n.nameID === nameID && n.platformID === 3 && n.encodingID === 1 && n.langID === 0x409);
         if (entry) return entry.nameString;

         // Fallback to any platform if not found
         const fallback = nameTable.find((n: any) => n.nameID === nameID);
         if (fallback) return fallback.nameString;
    } else if (nameTable && nameTable.names && Array.isArray(nameTable.names)) {
         // opentype.js structure variation
         const entry = nameTable.names.find((n: any) => n.nameID === nameID && n.platformID === 3 && n.encodingID === 1 && n.langID === 0x409);
         if (entry) return entry.nameString;

         const fallback = nameTable.names.find((n: any) => n.nameID === nameID);
         if (fallback) return fallback.nameString;
    }

    return '';
}
