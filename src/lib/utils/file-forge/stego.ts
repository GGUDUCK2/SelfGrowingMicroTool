/**
 * Simple LSB Steganography implementation for hiding text in images.
 * Uses the Least Significant Bit of R, G, and B channels.
 * Alpha channel is preserved to avoid visual artifacts or transparency issues.
 */

export async function encodeStego(imageFile: File, message: string): Promise<Blob> {
  const bitmap = await createImageBitmap(imageFile);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Convert message to binary array
  // 1. Length header (32 bits)
  // 2. Message body (UTF-8 bytes)

  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const length = messageBytes.length;

  // Max capacity check (3 bits per pixel)
  const capacityBytes = Math.floor((canvas.width * canvas.height * 3) / 8);
  if (length + 4 > capacityBytes) {
    throw new Error(`Message is too long. Max capacity: ${capacityBytes} bytes.`);
  }

  // Helper to get bit at position
  const getBit = (val: number, pos: number) => (val >> pos) & 1;

  let byteIndex = 0; // Which byte we are writing (0-3 is length, 4+ is message)
  let bitIndex = 0;  // Which bit of current byte (0-7)

  // Current value we are serializing
  let currentByte = (length >> 24) & 0xFF; // Start with MSB of length

  // Iterate over pixels
  for (let i = 0; i < data.length; i += 4) {
    // Process R, G, B (skip A at i+3)
    for (let c = 0; c < 3; c++) {
      if (byteIndex >= length + 4) break; // Done

      const pixelIndex = i + c;
      const bit = getBit(currentByte, 7 - bitIndex); // MSB first

      // Modify LSB
      if (bit === 1) {
        data[pixelIndex] |= 1;
      } else {
        data[pixelIndex] &= ~1;
      }

      bitIndex++;
      if (bitIndex === 8) {
        bitIndex = 0;
        byteIndex++;

        // Load next byte
        if (byteIndex < 4) {
          // Still in length header
          const shift = (3 - byteIndex) * 8;
          currentByte = (length >> shift) & 0xFF;
        } else if (byteIndex < length + 4) {
          // Message body
          currentByte = messageBytes[byteIndex - 4];
        }
      }
    }
    if (byteIndex >= length + 4) break;
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to encode image'));
    }, 'image/png'); // Must be PNG to be lossless
  });
}

export async function decodeStego(imageFile: File): Promise<string> {
  const bitmap = await createImageBitmap(imageFile);
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;

  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  ctx.drawImage(bitmap, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // Read Length (32 bits = 4 bytes)
  let length = 0;
  let currentByte = 0;
  let bitIndex = 0;
  let byteIndex = 0;
  let messageBytes: Uint8Array | null = null;

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const pixelIndex = i + c;
      const bit = data[pixelIndex] & 1;

      // Add bit to current byte
      currentByte = (currentByte << 1) | bit;
      bitIndex++;

      if (bitIndex === 8) {
        if (byteIndex < 4) {
          // Constructing length
          length = (length << 8) | currentByte;
        } else {
          // Reading message body
          if (!messageBytes) {
             if (length <= 0 || length > 10000000) { // Sanity check (10MB limit)
                 // Likely random noise or not a stego image
                 throw new Error('No hidden message found or message is corrupted.');
             }
             messageBytes = new Uint8Array(length);
          }
          messageBytes[byteIndex - 4] = currentByte;
        }

        currentByte = 0;
        bitIndex = 0;
        byteIndex++;

        // Check completion
        if (messageBytes && byteIndex >= length + 4) {
           const decoder = new TextDecoder();
           // Remove null bytes if any, though our length logic should be precise
           return decoder.decode(messageBytes);
        }
      }
    }
    if (messageBytes && byteIndex >= length + 4) break;
  }

  throw new Error('No hidden message found (EOF).');
}
