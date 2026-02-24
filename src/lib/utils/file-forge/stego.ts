/**
 * Robust LSB Steganography implementation.
 * Hides data in the Least Significant Bit of R, G, B channels.
 * Format: [MAGIC: 'STEGO' (5 bytes)] [LENGTH: UInt32 (4 bytes)] [DATA: N bytes]
 */

const MAGIC = new TextEncoder().encode('STEGO'); // 5 bytes

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

  // Prepare Payload
  const encoder = new TextEncoder();
  const messageBytes = encoder.encode(message);
  const lengthBytes = new Uint8Array(4);
  new DataView(lengthBytes.buffer).setUint32(0, messageBytes.length); // Big Endian

  // Concatenate: MAGIC + LENGTH + MESSAGE
  const payload = new Uint8Array(MAGIC.length + lengthBytes.length + messageBytes.length);
  payload.set(MAGIC, 0);
  payload.set(lengthBytes, MAGIC.length);
  payload.set(messageBytes, MAGIC.length + lengthBytes.length);

  // Capacity Check
  // Each pixel has 3 available bits (R, G, B). Alpha is ignored.
  const capacityBits = (canvas.width * canvas.height * 3);
  const requiredBits = payload.length * 8;

  if (requiredBits > capacityBits) {
    throw new Error(`Message too long. Image capacity: ${Math.floor(capacityBits / 8)} bytes. Message needs: ${payload.length} bytes.`);
  }

  // Embed Bits
  let payloadByteIndex = 0;
  let payloadBitIndex = 0; // 0-7

  for (let i = 0; i < data.length; i += 4) {
    if (payloadByteIndex >= payload.length) break;

    // Channels R(0), G(1), B(2)
    for (let c = 0; c < 3; c++) {
      if (payloadByteIndex >= payload.length) break;

      const byte = payload[payloadByteIndex];
      const bit = (byte >> (7 - payloadBitIndex)) & 1; // MSB first

      // Clear LSB then OR with bit
      data[i + c] = (data[i + c] & 0xFE) | bit;

      payloadBitIndex++;
      if (payloadBitIndex === 8) {
        payloadBitIndex = 0;
        payloadByteIndex++;
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Failed to create image blob'));
    }, 'image/png');
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

  // Helper to read bits
  let bitBuffer = 0;
  let bitCount = 0;
  const bytes: number[] = [];

  // We need to read at least header (5 + 4 = 9 bytes) to know if it's valid
  let state: 'magic' | 'length' | 'body' = 'magic';
  let magicBuffer: number[] = [];
  let lengthBuffer: number[] = [];
  let messageLength = 0;
  let messageBuffer: number[] = [];

  for (let i = 0; i < data.length; i += 4) {
    for (let c = 0; c < 3; c++) {
      const bit = data[i + c] & 1;
      bitBuffer = (bitBuffer << 1) | bit;
      bitCount++;

      if (bitCount === 8) {
        const byte = bitBuffer;
        bitBuffer = 0;
        bitCount = 0;

        // State Machine
        if (state === 'magic') {
          magicBuffer.push(byte);
          if (magicBuffer.length === MAGIC.length) {
            // Check Magic
            const magicStr = new TextDecoder().decode(new Uint8Array(magicBuffer));
            if (magicStr !== 'STEGO') {
              throw new Error('No hidden message found (Invalid Magic Header).');
            }
            state = 'length';
          }
        } else if (state === 'length') {
          lengthBuffer.push(byte);
          if (lengthBuffer.length === 4) {
            messageLength = new DataView(new Uint8Array(lengthBuffer).buffer).getUint32(0);
            if (messageLength <= 0 || messageLength > 50000000) { // Sanity limit 50MB
                throw new Error('Invalid message length.');
            }
            state = 'body';
          }
        } else if (state === 'body') {
          messageBuffer.push(byte);
          if (messageBuffer.length === messageLength) {
            // Done!
            return new TextDecoder().decode(new Uint8Array(messageBuffer));
          }
        }
      }
    }
    if (state === 'body' && messageBuffer.length === messageLength) break;
  }

  if (state !== 'body' || messageBuffer.length < messageLength) {
      throw new Error('Incomplete message.');
  }

  return new TextDecoder().decode(new Uint8Array(messageBuffer));
}
