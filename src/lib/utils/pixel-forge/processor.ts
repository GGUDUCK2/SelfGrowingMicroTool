import type { ImageFormat, ExportOptions } from './types';

export class ImageProcessor {
  static async createImageBitmap(file: File): Promise<ImageBitmap> {
    return createImageBitmap(file);
  }

  static async processImage(
    source: File | ImageBitmap,
    options: ExportOptions
  ): Promise<{ blob: Blob; dimensions: { width: number; height: number } }> {
    let bitmap: ImageBitmap;
    let closeBitmap = false;

    if (source instanceof File) {
      bitmap = await createImageBitmap(source);
      closeBitmap = true;
    } else {
      bitmap = source;
    }

    const { width: originalWidth, height: originalHeight } = bitmap;
    let targetWidth = options.width || originalWidth;
    let targetHeight = options.height || originalHeight;

    if (options.maintainAspectRatio) {
      if (options.width && !options.height) {
        const ratio = originalHeight / originalWidth;
        targetHeight = Math.round(targetWidth * ratio);
      } else if (!options.width && options.height) {
        const ratio = originalWidth / originalHeight;
        targetWidth = Math.round(targetHeight * ratio);
      } else if (options.width && options.height) {
        // If both provided but maintain aspect ratio, fit within box
        const ratio = Math.min(
          options.width / originalWidth,
          options.height / originalHeight
        );
        targetWidth = Math.round(originalWidth * ratio);
        targetHeight = Math.round(originalHeight * ratio);
      }
    }

    // Use OffscreenCanvas if available for better performance in workers (future proofing)
    // but for now, we run in main thread, so HTMLCanvasElement is fine if Offscreen not supported.
    let canvas: HTMLCanvasElement | OffscreenCanvas;
    let ctx: CanvasRenderingContext2D | OffscreenCanvasRenderingContext2D | null;

    if (typeof OffscreenCanvas !== 'undefined') {
      canvas = new OffscreenCanvas(targetWidth, targetHeight);
      ctx = canvas.getContext('2d');
    } else {
      canvas = document.createElement('canvas');
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      ctx = canvas.getContext('2d');
    }

    if (!ctx) {
      if (closeBitmap) bitmap.close();
      throw new Error('Could not get canvas context');
    }

    // High quality scaling
    if (ctx instanceof CanvasRenderingContext2D) {
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
    }

    ctx.drawImage(bitmap, 0, 0, targetWidth, targetHeight);

    if (closeBitmap) bitmap.close();

    // Convert to Blob
    let blob: Blob;
    if (canvas instanceof OffscreenCanvas) {
        blob = await canvas.convertToBlob({
            type: options.format,
            quality: options.quality
        });
    } else {
        blob = await new Promise<Blob>((resolve, reject) => {
            (canvas as HTMLCanvasElement).toBlob(
                (b) => {
                    if (b) resolve(b);
                    else reject(new Error('Canvas toBlob failed'));
                },
                options.format,
                options.quality
            );
        });
    }

    return {
      blob,
      dimensions: { width: targetWidth, height: targetHeight }
    };
  }

  static getFormatExtension(format: ImageFormat): string {
    switch (format) {
      case 'image/jpeg': return 'jpg';
      case 'image/png': return 'png';
      case 'image/webp': return 'webp';
      default: return 'jpg';
    }
  }
}
