<script lang="ts">
  import { onMount } from 'svelte';
  import { engine } from '$lib/utils/audio-forge/engine';
  import { db, type AudioForgeHistory } from '$lib/db';
  import Waveform from './Waveform.svelte';
  import Controls from './Controls.svelte';
  import Toolbar from './Toolbar.svelte';
  import GeneratorModal from './GeneratorModal.svelte';
  import HistoryDrawer from './HistoryDrawer.svelte';

  export let dict: any;

  let buffer: AudioBuffer | null = null;
  let isPlaying = false;
  let isRecording = false;
  let currentTime = 0;
  let selectionStart = 0;
  let selectionEnd = 0;

  let showGenerator = false;
  let showHistory = false;
  let loading = false;
  let fileName = 'Untitled Project';

  let animationFrame: number;

  onMount(() => {
      // AudioContext needs user interaction
      const unlock = () => {
          engine.init();
          document.removeEventListener('click', unlock);
          document.removeEventListener('keydown', unlock);
      };
      document.addEventListener('click', unlock);
      document.addEventListener('keydown', unlock);

      return () => {
          cancelAnimationFrame(animationFrame);
          engine.stop();
      };
  });

  function updateTime() {
      if (isPlaying) {
         animationFrame = requestAnimationFrame(updateTime);
      }
  }

  // Engine wrappers
  async function loadFile(file: File) {
      loading = true;
      try {
          buffer = await engine.load(file);
          fileName = file.name.replace(/\.[^/.]+$/, "");
          resetState();
      } catch (e) {
          alert(dict.alerts.errorLoad + ': ' + e);
      }
      loading = false;
  }

  async function handleOpen() {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'audio/*';
      input.onchange = (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) loadFile(file);
      };
      input.click();
  }

  function handlePlay() {
      if (!buffer) return;
      engine.play(buffer, selectionStart, () => {
          isPlaying = false;
          cancelAnimationFrame(animationFrame);
      });
      isPlaying = true;
      // Start time tracking
      const startTime = engine.context?.currentTime || 0;
      const offset = selectionStart;

      const loop = () => {
          if (!isPlaying) return;
          const now = engine.context?.currentTime || 0;
          currentTime = offset + (now - startTime);
          if (currentTime >= buffer!.duration) {
              currentTime = buffer!.duration;
              isPlaying = false;
          }
          if (isPlaying) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
  }

  function handlePause() {
      engine.stop();
      isPlaying = false;
  }

  function handleStop() {
      engine.stop();
      isPlaying = false;
      currentTime = selectionStart;
  }

  async function handleRecord() {
      if (isRecording) {
          // Stop
          try {
              const blob = await engine.stopRecording();
              buffer = await engine.load(blob);
              fileName = `Recording ${new Date().toLocaleTimeString()}`;
              resetState();
          } catch (e) {
              alert(e);
          }
          isRecording = false;
      } else {
          // Start
          try {
              await engine.init();
              await engine.startRecording();
              isRecording = true;
              buffer = null; // Clear current
          } catch (e) {
              alert(dict.alerts.errorMic);
          }
      }
  }

  function handleTrim() {
      if (!buffer || selectionEnd <= selectionStart) return;
      try {
          const newBuffer = engine.trim(buffer, selectionStart, selectionEnd);
          buffer = newBuffer;
          resetState();
      } catch (e) {
          alert(e);
      }
  }

  async function handleGenerate(e: CustomEvent) {
      const { type, frequency, duration } = e.detail;
      try {
          if (type.includes('noise')) {
              buffer = engine.generateNoise(type === 'white-noise' ? 'white' : 'pink', duration);
          } else {
              buffer = engine.generateTone(type, frequency, duration);
          }
          fileName = `${type} ${frequency}Hz`;
          resetState();
      } catch (e) {
          alert(e);
      }
  }

  async function handleExport(format: 'wav' | 'webm') {
      if (!buffer) return;
      let blob: Blob;
      if (format === 'wav') {
          blob = engine.exportWav(buffer);
      } else {
          alert('WebM export requires re-encoding. Using WAV.');
          blob = engine.exportWav(buffer);
          format = 'wav';
      }

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${fileName}.${format}`;
      a.click();
      URL.revokeObjectURL(url);
  }

  async function handleSave() {
      if (!buffer) return;
      const blob = engine.exportWav(buffer);
      await db.audioForgeHistory.add({
          name: fileName,
          blob: blob,
          duration: buffer.duration,
          format: 'wav',
          createdAt: new Date(),
          starred: 0
      });
      alert(dict.alerts.saved);
  }

  async function handleRestore(e: CustomEvent<AudioForgeHistory>) {
      loading = true;
      try {
          const item = e.detail;
          buffer = await engine.load(item.blob);
          fileName = item.name;
          resetState();
          showHistory = false;
      } catch (e) {
          alert(dict.alerts.errorLoad);
      }
      loading = false;
  }

  function resetState() {
      currentTime = 0;
      selectionStart = 0;
      selectionEnd = 0;
      isPlaying = false;
  }

  function handleNew() {
      if (confirm(dict.alerts.confirmNew)) {
          buffer = null;
          fileName = 'Untitled Project';
          resetState();
      }
  }

</script>

<div class="flex flex-col h-full bg-slate-100 dark:bg-black overflow-hidden relative">
    <Toolbar
        hasSelection={selectionEnd > selectionStart}
        hasAudio={!!buffer}
        {dict}
        onTrim={handleTrim}
        onExportWav={() => handleExport('wav')}
        onExportWebM={() => handleExport('webm')}
        onNew={handleNew}
        onOpen={handleOpen}
        onSave={handleSave}
        onGenerate={() => showGenerator = true}
    />

    <div class="flex-1 flex flex-col overflow-hidden p-4 gap-4">
        <!-- Main Visualizer Area -->
        <div class="flex-1 bg-slate-800 rounded-xl shadow-inner border border-slate-700 overflow-hidden flex flex-col relative group">
             {#if loading}
                <div class="absolute inset-0 flex items-center justify-center bg-black/50 z-20">
                    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                </div>
             {/if}

             <div class="absolute top-4 left-4 z-10 bg-black/40 backdrop-blur px-3 py-1 rounded text-xs text-white font-mono border border-white/10">
                 {fileName}
             </div>

             <div class="flex-1 flex items-center justify-center p-4">
                 <Waveform
                    {buffer}
                    bind:selectionStart
                    bind:selectionEnd
                    {currentTime}
                    height={300}
                 />
             </div>
        </div>

        <!-- Controls -->
        <div class="rounded-xl overflow-hidden shadow-lg border border-slate-200 dark:border-slate-800">
            <Controls
                {isPlaying}
                {isRecording}
                {currentTime}
                duration={buffer?.duration || 0}
                {dict}
                onPlay={handlePlay}
                onPause={handlePause}
                onStop={handleStop}
                onRecord={handleRecord}
            />
        </div>
    </div>

    <!-- Sidebar Toggle -->
    <button
        class="absolute top-20 right-0 bg-white dark:bg-slate-800 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-l-lg shadow-md border-y border-l border-slate-200 dark:border-slate-700 text-slate-500 hover:text-indigo-600 transition-transform hover:-translate-x-1"
        on:click={() => showHistory = !showHistory}
        title={dict.history.title}
    >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
    </button>

    <HistoryDrawer
        bind:show={showHistory}
        {dict}
        on:restore={handleRestore}
        on:close={() => showHistory = false}
    />

    <GeneratorModal
        bind:show={showGenerator}
        {dict}
        on:generate={handleGenerate}
    />
</div>
