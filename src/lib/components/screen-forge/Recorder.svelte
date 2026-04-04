<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import { Mic, MicOff, Monitor, StopCircle, Pause, Play, Video } from 'lucide-svelte';
  import { ScreenRecorder } from '$lib/utils/screen-forge/recorder';

  export let onRecordingComplete: (blob: Blob) => void;
  export let t: any;

  let recorder: ScreenRecorder;
  let videoEl: HTMLVideoElement;
  let isRecording = false;
  let isPaused = false;
  let micEnabled = false;
  let systemAudioEnabled = true;
  let duration = 0;
  let timerInterval: any;
  let stream: MediaStream | null = null;

  onMount(() => {
    recorder = new ScreenRecorder();
    recorder.onDataAvailable = (blob) => {
        onRecordingComplete(blob);
    };
    recorder.onStop = () => {
        stopTimer();
        isRecording = false;
        isPaused = false;
        if (videoEl) videoEl.srcObject = null;
    };
  });

  onDestroy(() => {
      stopTimer();
      if (recorder) recorder.stop();
  });

  async function start() {
      try {
          stream = await recorder.start({
              audio: micEnabled,
              systemAudio: systemAudioEnabled
          });
          if (videoEl) {
              videoEl.srcObject = stream;
          }
          isRecording = true;
          startTimer();
      } catch (e) {
          console.error("Failed to start recording", e);
          // Only alert if it's not a user cancellation (which usually throws NotAllowedError)
          if (e.name !== 'NotAllowedError') {
              alert("Could not start recording. Please check permissions.");
          }
      }
  }

  function stop() {
      recorder.stop();
  }

  function togglePause() {
      if (isPaused) {
          recorder.resume();
          isPaused = false;
          startTimer();
      } else {
          recorder.pause();
          isPaused = true;
          stopTimer();
      }
  }

  function startTimer() {
      stopTimer();
      timerInterval = setInterval(() => {
          duration++;
      }, 1000);
  }

  function stopTimer() {
      clearInterval(timerInterval);
  }

  function formatDuration(sec: number) {
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = (sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  }
</script>

<div class="flex flex-col items-center justify-center space-y-8 py-12">
    <!-- Preview Window -->
    <div class="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800 group">
        {#if isRecording}
            <!-- svelte-ignore a11y-media-has-caption -->
            <video
                bind:this={videoEl}
                autoplay
                muted
                playsinline
                class="w-full h-full object-contain"
            ></video>

            <div class="absolute top-4 right-4 bg-red-600/90 backdrop-blur text-white px-3 py-1 rounded-full text-sm font-medium animate-pulse flex items-center gap-2 shadow-lg z-10">
                <div class="w-2 h-2 bg-white rounded-full"></div>
                REC {formatDuration(duration)}
            </div>
        {:else}
            <div class="absolute inset-0 flex flex-col items-center justify-center text-slate-500 bg-slate-900/50 backdrop-blur-sm">
                <div class="p-6 bg-slate-800/50 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300 ring-1 ring-slate-700">
                    <Monitor size={64} class="text-indigo-500" />
                </div>
                <p class="text-lg font-medium text-slate-400">Ready to Capture</p>
                <p class="text-sm text-slate-500 mt-2">Select your options below</p>
            </div>
        {/if}
    </div>

    <!-- Controls -->
    <div class="flex flex-wrap gap-4 items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-w-2xl w-full relative z-20">
        {#if !isRecording}
            <!-- Config Mode -->
             <div class="flex gap-4">
                <button style="min-height: 44px; min-width: 44px;"
                    class="flex flex-col items-center gap-2 p-4 rounded-xl transition-all w-24 {micEnabled ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-700' : 'bg-slate-50 dark:bg-slate-700 text-slate-500 border border-transparent hover:bg-slate-100 dark:hover:bg-slate-600'}"
                    on:click={() => micEnabled = !micEnabled}
                    title={micEnabled ? t.micOn : t.micOff}
                >
                    {#if micEnabled}
                        <Mic size={24} />
                        <span class="text-xs font-medium">{t.micOn}</span>
                    {:else}
                        <MicOff size={24} />
                        <span class="text-xs font-medium">{t.micOff}</span>
                    {/if}
                </button>

                <button style="min-height: 44px; min-width: 44px;"
                    class="flex flex-col items-center gap-2 p-4 rounded-xl transition-all w-32 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 hover:shadow-indigo-500/50 hover:-translate-y-0.5 active:translate-y-0"
                    on:click={start}
                >
                    <div class="w-6 h-6 rounded-full border-2 border-white flex items-center justify-center">
                        <div class="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    </div>
                    <span class="text-sm font-bold">{t.start}</span>
                </button>
             </div>

             <div class="hidden sm:block w-px h-12 bg-slate-200 dark:bg-slate-700 mx-2"></div>

             <div class="hidden sm:block text-sm text-slate-500 dark:text-slate-400 max-w-xs text-center leading-relaxed">
                <p>{t.guide?.intro?.split('.')[0] || "Capture high quality video."}</p>
             </div>
        {:else}
            <!-- Recording Mode -->
            <button style="min-height: 44px; min-width: 44px;"
                class="p-4 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                on:click={togglePause}
                title={isPaused ? t.resume : t.pause}
            >
                {#if isPaused}
                    <Play size={32} class="fill-current" />
                {:else}
                    <Pause size={32} class="fill-current" />
                {/if}
            </button>

            <button style="min-height: 44px; min-width: 44px;"
                class="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30 transition-all hover:scale-105 active:scale-95"
                on:click={stop}
                title={t.stop}
            >
                <div class="w-8 h-8 rounded bg-white"></div>
            </button>

            <div class="ml-4 flex flex-col items-start min-w-[100px]">
                <span class="text-2xl font-mono font-bold text-slate-800 dark:text-white tabular-nums">
                    {formatDuration(duration)}
                </span>
                <span class="text-xs text-slate-500 uppercase tracking-wider font-bold">
                    {isPaused ? 'Paused' : 'Recording'}
                </span>
            </div>
        {/if}
    </div>
</div>
