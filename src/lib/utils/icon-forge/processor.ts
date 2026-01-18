export interface IconConfig {
  background: string;
  padding: number; // 0 to 100
  radius: number; // 0 to 50 (50 is circle)
  transparent: boolean;
  name?: string; // PWA Name
  shortName?: string; // PWA Short Name
  startUrl?: string;
  display?: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
}

export interface GeneratedAsset {
  name: string;
  blob: Blob;
  size: number;
  type: 'image/png' | 'image/x-icon' | 'image/svg+xml' | 'application/json';
}

export class IconProcessor {
  private static async loadImage(source: File | string): Promise<HTMLImageElement> {
    if (typeof window === 'undefined') {
        throw new Error('IconProcessor requires a browser environment');
    }
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

  static async extractColors(source: File | HTMLImageElement): Promise<string[]> {
      if (typeof window === 'undefined') return [];

      let img: HTMLImageElement;
      if (source instanceof HTMLImageElement) {
          img = source;
      } else {
          img = await this.loadImage(source);
      }

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return [];

      // Resize for performance (max 100px)
      const max = 100;
      const scale = Math.min(max / img.width, max / img.height);
      const w = Math.floor(img.width * scale);
      const h = Math.floor(img.height * scale);

      canvas.width = w;
      canvas.height = h;

      ctx.drawImage(img, 0, 0, w, h);
      const data = ctx.getImageData(0, 0, w, h).data;

      const colorMap = new Map<string, number>();

      for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const a = data[i+3];

          if (a < 128) continue; // Skip transparent

          // Quantize (group similar colors)
          const qR = Math.round(r / 20) * 20;
          const qG = Math.round(g / 20) * 20;
          const qB = Math.round(b / 20) * 20;

          const key = `#${((1 << 24) + (qR << 16) + (qG << 8) + qB).toString(16).slice(1)}`;
          colorMap.set(key, (colorMap.get(key) || 0) + 1);
      }

      // Sort by frequency
      const sorted = [...colorMap.entries()].sort((a, b) => b[1] - a[1]);
      return sorted.slice(0, 5).map(x => x[0]);
  }

  static async generate(
    source: File,
    config: IconConfig
  ): Promise<GeneratedAsset[]> {
    if (typeof window === 'undefined') return [];

    const img = await this.loadImage(source);
    const assets: GeneratedAsset[] = [];

    // 0. Pass through SVG if source is SVG
    if (source.type === 'image/svg+xml') {
        assets.push({
            name: 'icon.svg',
            blob: source,
            size: 0,
            type: 'image/svg+xml'
        });
        assets.push({
            name: 'safari-pinned-tab.svg',
            blob: source,
            size: 0,
            type: 'image/svg+xml'
        });
    }

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
    const appleBlob = await this.createPng(img, 180, { ...config, transparent: false, radius: 0 });
    assets.push({
      name: 'apple-touch-icon.png',
      blob: appleBlob,
      size: 180,
      type: 'image/png'
    });

    // 4. Generate Maskable Icon (Safe Zone)
    const maskableBlob = await this.createPng(img, 512, { ...config, transparent: false, radius: 0 });
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
      display: config.display || "standalone",
      start_url: config.startUrl || "/"
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
    if (typeof window === 'undefined') throw new Error('Browser only');

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
