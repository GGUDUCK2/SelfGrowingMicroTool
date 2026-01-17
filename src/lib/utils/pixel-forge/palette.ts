export class PaletteExtractor {
    static async extract(blob: Blob, count: number = 5): Promise<string[]> {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const url = URL.createObjectURL(blob);
            img.src = url;
            img.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    // Resize to speed up processing and reduce noise
                    const size = 100;
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) {
                        resolve([]);
                        return;
                    }

                    ctx.drawImage(img, 0, 0, size, size);
                    const imageData = ctx.getImageData(0, 0, size, size);
                    const data = imageData.data;
                    const colorCounts: Record<string, number> = {};

                    for (let i = 0; i < data.length; i += 4) {
                        const r = data[i];
                        const g = data[i + 1];
                        const b = data[i + 2];
                        const a = data[i + 3];

                        if (a < 128) continue; // Skip transparent

                        // Quantize colors to group similar ones (round to nearest 10)
                        const qR = Math.round(r / 10) * 10;
                        const qG = Math.round(g / 10) * 10;
                        const qB = Math.round(b / 10) * 10;

                        const key = `${qR},${qG},${qB}`;
                        colorCounts[key] = (colorCounts[key] || 0) + 1;
                    }

                    const sorted = Object.entries(colorCounts)
                        .sort(([, a], [, b]) => b - a)
                        .slice(0, count)
                        .map(([key]) => {
                            const [r, g, b] = key.split(',').map(Number);
                            return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
                        });

                    resolve(sorted);
                } catch (e) {
                    console.error('Palette extraction failed', e);
                    resolve([]);
                } finally {
                    URL.revokeObjectURL(url);
                }
            };
            img.onerror = (e) => {
                URL.revokeObjectURL(url);
                reject(e);
            };
        });
    }
}
