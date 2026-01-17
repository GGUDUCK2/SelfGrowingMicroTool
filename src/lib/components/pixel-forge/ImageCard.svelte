<script lang="ts">
  import { onMount } from 'svelte';
  import { Trash2, Download, RefreshCw, FileImage, Sliders, ArrowRight } from 'lucide-svelte';
  import type { ImageJob, ExportOptions } from '$lib/utils/pixel-forge/types';
  import { ImageProcessor } from '$lib/utils/pixel-forge/processor';

  export let job: ImageJob;
  export let onRemove: (id: string) => void;
  export let onUpdate: (id: string, updates: Partial<ImageJob>) => void;
  export let dict: any;

  let isProcessing = false;
  let processingTime = 0;

  $: if (job.status === 'pending') {
    processImage();
  }

  // Debounce processing when options change
  let debounceTimer: ReturnType<typeof setTimeout>;

  function handleOptionChange() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
        processImage();
    }, 500);
  }

  async function processImage() {
    if (isProcessing) return;
    isProcessing = true;
    onUpdate(job.id, { status: 'processing' });

    const start = performance.now();
    try {
      const result = await ImageProcessor.processImage(job.file, job.options);

      const url = URL.createObjectURL(result.blob);
      // Revoke old url if exists
      if (job.result?.url) URL.revokeObjectURL(job.result.url);

      onUpdate(job.id, {
        status: 'done',
        result: {
          blob: result.blob,
          url,
          size: result.blob.size,
          dimensions: result.dimensions
        }
      });
    } catch (err: any) {
      console.error(err);
      onUpdate(job.id, { status: 'error', error: err.message });
    } finally {
      processingTime = Math.round(performance.now() - start);
      isProcessing = false;
    }
  }

  function formatSize(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function getSavings(): string {
    if (!job.result) return '0%';
    const saved = job.originalSize - job.result.size;
    const percent = Math.round((saved / job.originalSize) * 100);
    return percent > 0 ? `-${percent}%` : `+${Math.abs(percent)}%`;
  }

  function download() {
    if (!job.result) return;
    const a = document.createElement('a');
    a.href = job.result.url;
    const ext = ImageProcessor.getFormatExtension(job.options.format);
    const name = job.file.name.substring(0, job.file.name.lastIndexOf('.')) || job.file.name;
    a.download = `${name}_optimized.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
</script>

<div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-6 transition-all hover:border-slate-600">
  <!-- Preview -->
  <div class="relative w-full md:w-48 aspect-video md:aspect-square bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700 group">
    <img src={job.previewUrl} alt="Preview" class="w-full h-full object-contain" />
    <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <span class="text-xs text-slate-300 font-mono">{dict.pixelForge.card.original}: {job.originalDimensions.width}x{job.originalDimensions.height}</span>
    </div>
  </div>

  <!-- Controls & Stats -->
  <div class="flex-1 min-w-0 flex flex-col justify-between gap-4">
    <div class="flex items-start justify-between">
      <div>
        <h4 class="text-slate-200 font-medium truncate max-w-[200px]" title={job.file.name}>
          {job.file.name}
        </h4>
        <div class="text-xs text-slate-400 mt-1 flex gap-2">
            <span>{formatSize(job.originalSize)}</span>
            <ArrowRight class="w-3 h-3 mt-0.5" />
            {#if job.status === 'done' && job.result}
                <span class="{job.result.size < job.originalSize ? 'text-green-400' : 'text-amber-400'} font-bold">
                    {formatSize(job.result.size)}
                </span>
                <span class="text-slate-500">({getSavings()})</span>
            {:else if job.status === 'processing'}
                <span class="text-indigo-400 animate-pulse">{dict.pixelForge.card.processing}</span>
            {:else}
                <span>...</span>
            {/if}
        </div>
      </div>
      <button
        on:click={() => onRemove(job.id)}
        class="text-slate-500 hover:text-red-400 transition-colors p-1"
        aria-label="Remove image"
      >
        <Trash2 class="w-5 h-5" />
      </button>
    </div>

    <!-- Quick Settings -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label class="block">
            <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.pixelForge.controls.format}</span>
            <select
                bind:value={job.options.format}
                on:change={handleOptionChange}
                class="w-full bg-slate-700 border border-slate-600 text-xs text-slate-200 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none"
            >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
            </select>
        </label>

        <label class="block">
            <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.pixelForge.controls.quality} ({Math.round(job.options.quality * 100)}%)</span>
            <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                bind:value={job.options.quality}
                on:input={handleOptionChange}
                class="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
        </label>

        <label class="block">
            <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.pixelForge.controls.width}</span>
            <input
                type="number"
                bind:value={job.options.width}
                placeholder="Auto"
                on:input={handleOptionChange}
                class="w-full bg-slate-700 border border-slate-600 text-xs text-slate-200 rounded px-2 py-1.5 focus:border-indigo-500 focus:outline-none"
            />
        </label>

         <div class="flex items-end pb-1">
             <button
                class="w-full h-[30px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={job.status !== 'done'}
                on:click={download}
             >
                <Download class="w-3.5 h-3.5" />
                {dict.pixelForge.controls.download}
             </button>
         </div>
    </div>
  </div>
</div>
