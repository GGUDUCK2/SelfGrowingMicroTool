export async function convertImage(
  file: File,
  format: 'image/png' | 'image/jpeg' | 'image/webp',
  quality: number,
  width?: number,
  height?: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let targetWidth = width || img.width;
        let targetHeight = height || img.height;

        // Maintain aspect ratio if one dimension is missing or if requested
        if (width && !height) {
          const ratio = img.height / img.width;
          targetHeight = Math.round(width * ratio);
        } else if (height && !width) {
          const ratio = img.width / img.height;
          targetWidth = Math.round(height * ratio);
        }

        canvas.width = targetWidth;
        canvas.height = targetHeight;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Conversion failed'));
            }
          },
          format,
          quality
        );
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
