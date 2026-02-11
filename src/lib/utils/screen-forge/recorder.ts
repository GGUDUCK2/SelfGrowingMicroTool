export interface RecorderOptions {
  audio: boolean; // Mic
  systemAudio: boolean; // System
}

export class ScreenRecorder {
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  private stream: MediaStream | null = null;
  private audioContext: AudioContext | null = null;
  private micStream: MediaStream | null = null;

  onDataAvailable: (blob: Blob) => void = () => {};
  onStop: () => void = () => {};

  async start(options: RecorderOptions): Promise<MediaStream> {
    // 1. Get Screen Stream (with system audio if possible)
    try {
      this.stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: options.systemAudio
      });
    } catch (err) {
      console.error("Error accessing display media.", err);
      throw err;
    }

    // 2. Get Mic Stream if requested
    if (options.audio) {
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false
        });
      } catch (err) {
        console.warn("Microphone access denied or failed.", err);
        // Continue without mic
      }
    }

    // 3. Mix Audio if both exist
    let finalStream = this.stream;

    // Check if we have system audio track
    const systemAudioTrack = this.stream.getAudioTracks()[0];
    const micAudioTrack = this.micStream?.getAudioTracks()[0];

    if (systemAudioTrack && micAudioTrack) {
       // Mix them
       this.audioContext = new AudioContext();
       const dest = this.audioContext.createMediaStreamDestination();

       const sysSource = this.audioContext.createMediaStreamSource(new MediaStream([systemAudioTrack]));
       const micSource = this.audioContext.createMediaStreamSource(this.micStream!);

       sysSource.connect(dest);
       micSource.connect(dest);

       // Combine video from screen and mixed audio
       finalStream = new MediaStream([
         ...this.stream.getVideoTracks(),
         ...dest.stream.getAudioTracks()
       ]);
    } else if (micAudioTrack && !systemAudioTrack) {
        // Only Mic + Video
        finalStream = new MediaStream([
            ...this.stream.getVideoTracks(),
            micAudioTrack
        ]);
    }
    // Else: System Audio Only or No Audio -> Original stream is fine

    // 4. Setup MediaRecorder
    this.recordedChunks = [];
    const mimeType = this.getSupportedMimeType();

    try {
        this.mediaRecorder = new MediaRecorder(finalStream, { mimeType });
    } catch (e) {
        console.warn(`Failed to create MediaRecorder with ${mimeType}, falling back to default.`);
        this.mediaRecorder = new MediaRecorder(finalStream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        this.recordedChunks.push(event.data);
      }
    };

    this.mediaRecorder.onstop = () => {
      const blob = new Blob(this.recordedChunks, { type: this.mediaRecorder?.mimeType || 'video/webm' });
      this.onDataAvailable(blob);
      this.cleanup();
      this.onStop();
    };

    // If user stops sharing via browser UI
    const videoTrack = this.stream.getVideoTracks()[0];
    if (videoTrack) {
        videoTrack.onended = () => {
            this.stop();
        };
    }

    this.mediaRecorder.start(1000); // 1s chunks
    return finalStream;
  }

  stop() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  pause() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
        this.mediaRecorder.pause();
    }
  }

  resume() {
    if (this.mediaRecorder && this.mediaRecorder.state === 'paused') {
        this.mediaRecorder.resume();
    }
  }

  private cleanup() {
      // Stop all tracks
      if (this.stream) {
          this.stream.getTracks().forEach(track => track.stop());
      }
      if (this.micStream) {
          this.micStream.getTracks().forEach(track => track.stop());
      }
      if (this.audioContext) {
          this.audioContext.close();
      }

      this.stream = null;
      this.micStream = null;
      this.audioContext = null;
      this.mediaRecorder = null;
  }

  private getSupportedMimeType() {
      const types = [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
          'video/mp4' // Some browsers might support this now
      ];
      for (const type of types) {
          if (MediaRecorder.isTypeSupported(type)) {
              return type;
          }
      }
      return 'video/webm';
  }
}
