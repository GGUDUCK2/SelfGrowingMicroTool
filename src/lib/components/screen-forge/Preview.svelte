<script lang="ts">
  import { onMount } from 'svelte';
  import { Download, RotateCcw, Save, Trash2, Check } from 'lucide-svelte';
  import { db } from '$lib/db';

  export let blob: Blob;
  export let t: any;
  export let onDiscard: () => void;

  let videoUrl = '';
  let videoEl: HTMLVideoElement;
  let isSaved = false;
  let isSaving = false;
  let size = 0;

  onMount(() => {
    videoUrl = URL.createObjectURL(blob);
    size = blob.size;
    return () => {
      URL.revokeObjectURL(videoUrl);
    };
  });

  function formatSize(bytes: number) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function download() {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `recording-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
  }

  async function save() {
      if (isSaved) return;
      isSaving = true;
      try {
          // Duration? We can get it from videoEl
          const duration = videoEl?.duration || 0;
          await db.screenForgeHistory.add({
              name: `Recording ${new Date().toLocaleString()}`,
              blob: blob,
              duration: duration,
              size: blob.size,
              createdAt: new Date(),
              starred: 0
          });
          isSaved = true;
      } catch (e) {
          console.error("Failed to save", e);
          alert("Failed to save to history (Quota might be exceeded).");
      } finally {
          isSaving = false;
      }
  }
</script>

<div class="flex flex-col items-center justify-center space-y-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
    <div class="relative w-full max-w-4xl aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
        <!-- svelte-ignore a11y-media-has-caption -->
        <video
            bind:this={videoEl}
            src={videoUrl}
            controls
            class="w-full h-full object-contain"
        ></video>
    </div>

    <div class="flex flex-wrap gap-4 items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 w-full max-w-3xl">
         <div class="mr-auto px-4">
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.size}</p>
            <p class="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{formatSize(size)}</p>
         </div>

         <div class="flex gap-2">
            <button
                class="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium"
                on:click={onDiscard}
            >
                <Trash2 size={20} />
                <span class="hidden sm:inline">{t.discard}</span>
            </button>

            <button
                class="flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors font-medium relative overflow-hidden"
                on:click={save}
                disabled={isSaved || isSaving}
            >
                {#if isSaved}
                    <Check size={20} class="text-green-500" />
                    <span class="text-green-600 dark:text-green-400 hidden sm:inline">Saved</span>
                {:else}
                    <Save size={20} />
                    <span class="hidden sm:inline">{t.save}</span>
                {/if}
            </button>

            <button
                class="flex items-center gap-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5 font-bold"
                on:click={download}
            >
                <Download size={20} />
                <span class="hidden sm:inline">{t.download}</span>
            </button>
         </div>
    </div>
</div>
