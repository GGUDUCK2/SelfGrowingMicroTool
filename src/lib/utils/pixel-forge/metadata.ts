export class MetadataScanner {
    static async scan(file: File): Promise<string[]> {
        const found: string[] = [];
        const buffer = await file.slice(0, 64 * 1024).arrayBuffer(); // Read first 64KB
        const view = new DataView(buffer);
        const bytes = new Uint8Array(buffer);

        if (file.type === 'image/jpeg') {
            // Check for APP1 (Exif) - 0xFF 0xE1
            for (let i = 0; i < bytes.length - 1; i++) {
                if (bytes[i] === 0xFF && bytes[i + 1] === 0xE1) {
                    // Check if it's Exif
                    const header = String.fromCharCode(...bytes.slice(i + 4, i + 10));
                    if (header.includes('Exif')) {
                         if (!found.includes('Exif Data')) found.push('Exif Data');
                    }
                    if (header.includes('http://ns.adobe.com/xap/1.0/')) {
                         if (!found.includes('XMP Metadata')) found.push('XMP Metadata');
                    }
                }
                // APP13 (IPTC) - 0xFF 0xED
                 if (bytes[i] === 0xFF && bytes[i + 1] === 0xED) {
                     if (!found.includes('IPTC Data')) found.push('IPTC Data');
                 }
                 // APP2 (ICC) - 0xFF 0xE2
                 if (bytes[i] === 0xFF && bytes[i + 1] === 0xE2) {
                     if (!found.includes('ICC Profile')) found.push('ICC Profile');
                 }
            }
        } else if (file.type === 'image/png') {
            // Simple string search for chunks
            const text = new TextDecoder().decode(bytes);
            if (text.includes('eXIf')) found.push('Exif Data');
            if (text.includes('iTXt') || text.includes('tEXt') || text.includes('zTXt')) found.push('Text Metadata');
            if (text.includes('iCCP')) found.push('ICC Profile');
        } else if (file.type === 'image/webp') {
             const text = new TextDecoder().decode(bytes);
             if (text.includes('EXIF')) found.push('Exif Data');
             if (text.includes('XMP ')) found.push('XMP Metadata');
        }

        // GPS Heuristic (very rough, usually inside Exif)
        // If we found Exif, we can assume GPS might be there, but specific parsing is hard without lib.
        // We'll stick to high-level categories.

        return found;
    }
}
