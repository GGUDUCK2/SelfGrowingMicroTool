export interface IconConfig {
  background: string;
  padding: number; // 0 to 100
  radius: number; // 0 to 50 (50 is circle)
  transparent: boolean;
  name?: string; // PWA Name
  shortName?: string; // PWA Short Name
}

export interface GeneratedAsset {
  name: string;
  blob: Blob;
  size: number;
  type: 'image/png' | 'image/x-icon' | 'image/svg+xml' | 'application/json';
}

export class IconProcessor {
  private static async loadImage(source: File | string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = typeof source === 'string' ? source : URL.createObjectURL(source);
      img.src = url;
      img.onload = () => {
        if (typeof source !== 'string') URL.revokeObjectURL(url);
        resolve(img);
      };
      img.onerror = (e) => {
        if (typeof source !== 'string') URL.revokeObjectURL(url);
        reject(e);
      };
    });
  }

  static async generate(
    source: File,
    config: IconConfig
  ): Promise<GeneratedAsset[]> {
    const img = await this.loadImage(source);
    const assets: GeneratedAsset[] = [];

    // 1. Generate PNGs (Favicon & PWA)
    const sizes = [16, 32, 48, 64, 128, 192, 512];
    const pngBuffers: { size: number; buffer: Uint8Array }[] = [];

    for (const size of sizes) {
      const blob = await this.createPng(img, size, config);
      assets.push({
        name: `icon-${size}.png`,
        blob,
        size,
        type: 'image/png'
      });

      // Keep 16, 32, 48 for ICO
      if ([16, 32, 48].includes(size)) {
        const buf = await blob.arrayBuffer();
        pngBuffers.push({ size, buffer: new Uint8Array(buf) });
      }
    }

    // 2. Generate ICO (combining 16, 32, 48)
    const icoBlob = this.createIco(pngBuffers);
    assets.push({
      name: 'favicon.ico',
      blob: icoBlob,
      size: 0, // Composite
      type: 'image/x-icon'
    });

    // 3. Generate Apple Touch Icon (180x180, usually white background, no transparency)
    const appleConfig = { ...config, transparent: false, radius: 0 }; // iOS adds radius automatically, better to provide square
    // Actually, iOS expects a square image and applies the mask.
    // If user wants transparent, it will render black on iOS.
    // Standard practice: If transparent, fill with background.

    // However, for "Apple Touch Icon", we should probably force a background if the user has selected one,
    // or default to white if transparent is selected but that might be wrong.
    // Let's stick to user config but ensure it's square (which it is).

    const appleBlob = await this.createPng(img, 180, { ...config, transparent: false });
    assets.push({
      name: 'apple-touch-icon.png',
      blob: appleBlob,
      size: 180,
      type: 'image/png'
    });

    // 4. Generate Maskable Icon (Safe Zone)
    // Maskable icons should have padding to ensure critical content is within the safe zone (center 80%).
    // We can offer a specific "Maskable" version with more padding if needed,
    // or just use the 512 version if the user set appropriate padding.
    // For now, let's generate a specific 'maskable-icon.png' with forced minimum padding if user padding is low?
    // No, let's trust the user config but provide a 'maskable' variant.
    const maskableBlob = await this.createPng(img, 512, { ...config, transparent: false });
    assets.push({
        name: 'maskable-icon.png',
        blob: maskableBlob,
        size: 512,
        type: 'image/png'
    });

    // 5. Generate Manifest
    const manifest = {
      name: config.name || "My PWA",
      short_name: config.shortName || "PWA",
      icons: [
        { src: "/icon-192.png", type: "image/png", sizes: "192x192" },
        { src: "/icon-512.png", type: "image/png", sizes: "512x512" },
        { src: "/maskable-icon.png", type: "image/png", sizes: "512x512", purpose: "maskable" }
      ],
      theme_color: config.background,
      background_color: config.background,
      display: "standalone"
    };

    assets.push({
      name: 'manifest.json',
      blob: new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json' }),
      size: 0,
      type: 'application/json'
    });

    return assets;
  }

  static async createPng(
    img: HTMLImageElement,
    size: number,
    config: IconConfig
  ): Promise<Blob> {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not available');

    // Enable high quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // 1. Draw Background
    if (!config.transparent) {
      ctx.fillStyle = config.background;

      if (config.radius > 0) {
        // Draw rounded rect
        const r = (size * config.radius) / 100;
        ctx.beginPath();
        ctx.moveTo(r, 0);
        ctx.lineTo(size - r, 0);
        ctx.quadraticCurveTo(size, 0, size, r);
        ctx.lineTo(size, size - r);
        ctx.quadraticCurveTo(size, size, size - r, size);
        ctx.lineTo(r, size);
        ctx.quadraticCurveTo(0, size, 0, size - r);
        ctx.lineTo(0, r);
        ctx.quadraticCurveTo(0, 0, r, 0);
        ctx.closePath();
        ctx.fill();

        // Clip for the image
        ctx.clip();
      } else {
        ctx.fillRect(0, 0, size, size);
      }
    } else {
       // If transparent, we still might want radius clipping?
       // Usually icons with radius have a background.
       // If transparent, radius doesn't make much sense unless we clip the image itself.
       if (config.radius > 0) {
          const r = (size * config.radius) / 100;
          ctx.beginPath();
          ctx.moveTo(r, 0);
          ctx.lineTo(size - r, 0);
          ctx.quadraticCurveTo(size, 0, size, r);
          ctx.lineTo(size, size - r);
          ctx.quadraticCurveTo(size, size, size - r, size);
          ctx.lineTo(r, size);
          ctx.quadraticCurveTo(0, size, 0, size - r);
          ctx.lineTo(0, r);
          ctx.quadraticCurveTo(0, 0, r, 0);
          ctx.closePath();
          ctx.clip();
       }
    }

    // 2. Draw Image with Padding
    const paddingPx = (size * config.padding) / 100;
    const drawSize = size - (paddingPx * 2);

    // Center the image (contain)
    // We assume the input image might not be square, so we center it.
    const aspect = img.width / img.height;
    let dw = drawSize;
    let dh = drawSize;

    if (aspect > 1) {
        dh = drawSize / aspect;
    } else {
        dw = drawSize * aspect;
    }

    const dx = paddingPx + (drawSize - dw) / 2;
    const dy = paddingPx + (drawSize - dh) / 2;

    ctx.drawImage(img, dx, dy, dw, dh);

    return new Promise((resolve) => {
      canvas.toBlob((blob) => resolve(blob!), 'image/png');
    });
  }

  // Simple ICO generator (Wraps PNGs)
  static createIco(pngs: { size: number; buffer: Uint8Array }[]): Blob {
    const numImages = pngs.length;
    const headerSize = 6;
    const directorySize = 16 * numImages;
    let offset = headerSize + directorySize;

    const parts: (Uint8Array | ArrayBuffer)[] = [];

    // Header
    const header = new DataView(new ArrayBuffer(6));
    header.setUint16(0, 0, true); // Reserved
    header.setUint16(2, 1, true); // Type (1 = ICO)
    header.setUint16(4, numImages, true); // Count
    parts.push(header.buffer);

    // Directory
    for (const png of pngs) {
      const entry = new DataView(new ArrayBuffer(16));
      const w = png.size === 256 ? 0 : png.size;
      const h = png.size === 256 ? 0 : png.size;

      entry.setUint8(0, w);
      entry.setUint8(1, h);
      entry.setUint8(2, 0); // Palette count
      entry.setUint8(3, 0); // Reserved
      entry.setUint16(4, 1, true); // Color planes
      entry.setUint16(6, 32, true); // Bits per pixel
      entry.setUint32(8, png.buffer.byteLength, true); // Size
      entry.setUint32(12, offset, true); // Offset

      parts.push(entry.buffer);
      offset += png.buffer.byteLength;
    }

    // Image Data
    for (const png of pngs) {
      parts.push(png.buffer);
    }

    return new Blob(parts as BlobPart[], { type: 'image/x-icon' });
  }
}
