import { browser } from '$app/environment';

export class AudioEngine {
  private ctx: AudioContext | null = null;
  private source: AudioBufferSourceNode | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];

  // State
  public isPlaying = false;
  public isRecording = false;

  constructor() {
    if (browser) {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        this.ctx = new AudioContext();
      }
    }
  }

  async init() {
    if (this.ctx?.state === 'suspended') {
      await this.ctx.resume();
    }
  }

  get context() {
    return this.ctx;
  }

  async load(blob: Blob): Promise<AudioBuffer> {
    if (!this.ctx) throw new Error('AudioContext not initialized');
    const arrayBuffer = await blob.arrayBuffer();
    return await this.ctx.decodeAudioData(arrayBuffer);
  }

  play(buffer: AudioBuffer, startOffset: number = 0, onEnded?: () => void) {
    if (!this.ctx) return;
    this.stop();

    this.source = this.ctx.createBufferSource();
    this.source.buffer = buffer;
    this.source.connect(this.ctx.destination);

    // Handle onEnded
    this.source.onended = () => {
      this.isPlaying = false;
      if (onEnded) onEnded();
    };

    this.source.start(0, startOffset);
    this.isPlaying = true;
  }

  stop() {
    if (this.source) {
      try {
        this.source.stop();
      } catch (e) {
        // Ignore if already stopped
      }
      this.source = null;
    }
    this.isPlaying = false;
  }

  async startRecording(): Promise<MediaStream> {
    if (!browser) throw new Error('Not in browser');

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.mediaRecorder = new MediaRecorder(stream);
    this.audioChunks = [];

    this.mediaRecorder.ondataavailable = (event) => {
      this.audioChunks.push(event.data);
    };

    this.mediaRecorder.start();
    this.isRecording = true;
    return stream;
  }

  stopRecording(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder) return reject('No recorder');

      this.mediaRecorder.onstop = () => {
        const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
        this.audioChunks = [];
        this.isRecording = false;
        resolve(audioBlob);
      };

      this.mediaRecorder.stop();

      // Stop all tracks
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    });
  }

  trim(buffer: AudioBuffer, start: number, end: number): AudioBuffer {
    if (!this.ctx) throw new Error('No context');

    const duration = end - start;
    if (duration <= 0) throw new Error('Invalid duration');

    const sampleRate = buffer.sampleRate;
    const startFrame = Math.floor(start * sampleRate);
    const endFrame = Math.floor(end * sampleRate);
    const frameCount = endFrame - startFrame;

    const newBuffer = this.ctx.createBuffer(
      buffer.numberOfChannels,
      frameCount,
      sampleRate
    );

    for (let i = 0; i < buffer.numberOfChannels; i++) {
      const channelData = buffer.getChannelData(i);
      const newChannelData = newBuffer.getChannelData(i);
      // Copy the slice
      for (let j = 0; j < frameCount; j++) {
        newChannelData[j] = channelData[startFrame + j];
      }
    }

    return newBuffer;
  }

  generateTone(type: OscillatorType, frequency: number, duration: number): AudioBuffer {
    if (!this.ctx) throw new Error('No context');

    const sampleRate = this.ctx.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    // Render offline to get buffer
    // Actually, simple math is faster than OfflineAudioContext for simple tones
    for (let i = 0; i < frameCount; i++) {
      const t = i / sampleRate;
      if (type === 'sine') {
        data[i] = Math.sin(2 * Math.PI * frequency * t);
      } else if (type === 'square') {
        data[i] = Math.sign(Math.sin(2 * Math.PI * frequency * t));
      } else if (type === 'sawtooth') {
         data[i] = 2 * (t * frequency - Math.floor(t * frequency + 0.5));
      } else if (type === 'triangle') {
         data[i] = 4 * Math.abs(t * frequency - Math.floor(t * frequency + 0.75) + 0.25) - 1;
      }
    }

    // Apply fade in/out to avoid clicks
    const fadeLen = Math.min(1000, frameCount / 2);
    for (let i = 0; i < fadeLen; i++) {
        data[i] *= i / fadeLen;
        data[frameCount - 1 - i] *= i / fadeLen;
    }

    return buffer;
  }

  generateNoise(type: 'white' | 'pink', duration: number): AudioBuffer {
    if (!this.ctx) throw new Error('No context');
    const sampleRate = this.ctx.sampleRate;
    const frameCount = sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, frameCount, sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'white') {
        for (let i = 0; i < frameCount; i++) {
            data[i] = Math.random() * 2 - 1;
        }
    } else {
        // Pink noise (approximation)
        let b0, b1, b2, b3, b4, b5, b6;
        b0 = b1 = b2 = b3 = b4 = b5 = b6 = 0.0;
        for (let i = 0; i < frameCount; i++) {
            const white = Math.random() * 2 - 1;
            b0 = 0.99886 * b0 + white * 0.0555179;
            b1 = 0.99332 * b1 + white * 0.0750759;
            b2 = 0.96900 * b2 + white * 0.1538520;
            b3 = 0.86650 * b3 + white * 0.3104856;
            b4 = 0.55000 * b4 + white * 0.5329522;
            b5 = -0.7616 * b5 - white * 0.0168980;
            data[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
            data[i] *= 0.11; // (roughly) compensate for gain
            b6 = white * 0.115926;
        }
    }

    return buffer;
  }

  // Simple WAV encoder
  exportWav(buffer: AudioBuffer): Blob {
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;

    let result: Float32Array;
    if (numChannels === 2) {
        result = interleave(buffer.getChannelData(0), buffer.getChannelData(1));
    } else {
        result = buffer.getChannelData(0);
    }

    return encodeWAV(result, numChannels, sampleRate, bitDepth);
  }
}

// Helpers
function interleave(inputL: Float32Array, inputR: Float32Array) {
  const length = inputL.length + inputR.length;
  const result = new Float32Array(length);

  let index = 0;
  let inputIndex = 0;

  while (index < length) {
    result[index++] = inputL[inputIndex];
    result[index++] = inputR[inputIndex];
    inputIndex++;
  }
  return result;
}

function encodeWAV(samples: Float32Array, numChannels: number, sampleRate: number, bitDepth: number) {
  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + samples.length * bytesPerSample);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* RIFF chunk length */
  view.setUint32(4, 36 + samples.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, 1, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, samples.length * bytesPerSample, true);

  if (bitDepth === 16) {
      floatTo16BitPCM(view, 44, samples);
  } else {
      floatTo32BitPCM(view, 44, samples);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function floatTo16BitPCM(output: DataView, offset: number, input: Float32Array) {
  for (let i = 0; i < input.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, input[i]));
    output.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
  }
}

function floatTo32BitPCM(output: DataView, offset: number, input: Float32Array) {
    for (let i = 0; i < input.length; i++, offset += 4) {
      output.setFloat32(offset, input[i], true);
    }
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

export const engine = new AudioEngine();
