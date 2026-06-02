<script lang="ts">
  import { onMount } from 'svelte';
  import { Trash2, Download, RefreshCw, FileImage, Sliders, ArrowRight, Eye, Split, Target, Copy, Check } from '@lucide/svelte';
  import type { ImageJob, ExportOptions, PixelForgeDictionary } from '$lib/utils/pixel-forge/types';
  import { ImageProcessor } from '$lib/utils/pixel-forge/processor';
  import DiffSlider from './DiffSlider.svelte';

  export let job: ImageJob;
  export let onRemove: (id: string) => void;
  export let onUpdate: (id: string, updates: Partial<ImageJob>) => void;
  export let dict: PixelForgeDictionary;

  let isProcessing = false;
  let processingTime = 0;
  let showDiff = false;
  let copiedColor: string | null = null;

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
    } catch (err: unknown) {
      console.error(err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      onUpdate(job.id, { status: 'error', error: message });
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

  function copyColor(color: string) {
      navigator.clipboard.writeText(color);
      copiedColor = color;
      setTimeout(() => copiedColor = null, 2000);
  }
</script>

<div class="bg-slate-800/50 border border-slate-700 rounded-xl p-4 flex flex-col md:flex-row gap-6 transition-all hover:border-slate-600">
  <!-- Preview -->
  <div class="relative w-full md:w-64 aspect-video md:aspect-square bg-slate-900 rounded-lg overflow-hidden flex-shrink-0 border border-slate-700 group">
    {#if showDiff && job.result}
        <DiffSlider
            originalUrl={job.previewUrl}
            optimizedUrl={job.result.url}
            labelOriginal={dict.card?.original || "Original"}
            labelOptimized={dict.card?.optimized || "Optimized"}
        />
        <button class="min-h-[44px] min-w-[44px] absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg z-30 transition-colors" on:click={() => showDiff = false}
            title="Close Diff View"
            aria-label="Close Diff View"
        >
            <Eye class="w-4 h-4" />
        </button>
    {:else}
        <img src={job.previewUrl} alt="Preview" class="w-full h-full object-contain" />
        {#if job.status === 'done' && job.result}
            <button class="min-h-[44px] min-w-[44px] absolute top-2 right-2 min-h-[44px] min-w-[44px] flex items-center justify-center p-1.5 bg-indigo-600/90 hover:bg-indigo-500 text-white rounded-lg md:opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg" on:click={() => showDiff = true}
                title="Compare"
                aria-label="Compare Original and Optimized"
            >
                <Split class="w-4 h-4" />
            </button>
        {/if}
        <div class="absolute inset-x-0 bottom-0 bg-black/60 p-2 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <span class="text-xs text-slate-300 font-mono">{job.originalDimensions.width}x{job.originalDimensions.height}</span>
        </div>
    {/if}
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
                <span class="text-indigo-400 animate-pulse">{dict.card?.processing || "Processing..."}</span>
            {:else}
                <span>...</span>
            {/if}
        </div>
      </div>
      <button class="min-h-[44px] min-w-[44px] text-slate-500 hover:text-red-400 transition-colors p-1 min-h-[44px] min-w-[44px] flex items-center justify-center" on:click={() => onRemove(job.id)}
        aria-label="Remove image"
      >
        <Trash2 class="w-5 h-5" />
      </button>
    </div>

    <!-- Quick Settings -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
        <label class="block">
            <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.controls?.format || "Format"}</span>
            <select
                bind:value={job.options.format}
                on:change={handleOptionChange}
                class="w-full bg-slate-700 border border-slate-600 text-xs text-slate-200 rounded px-2 py-1.5 min-h-[44px] focus:border-indigo-500 focus:outline-none"
            >
                <option value="image/jpeg">JPEG</option>
                <option value="image/png">PNG</option>
                <option value="image/webp">WebP</option>
            </select>
        </label>

        <label class="flex flex-col justify-center">
            <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">
                {dict.controls?.quality || "Quality"} ({job.options.targetSizeKB ? 'Auto' : Math.round(job.options.quality * 100) + '%'})
            </span>
            <input
                type="range"
                min="0.1"
                max="1"
                step="0.05"
                bind:value={job.options.quality}
                on:input={() => { job.options.targetSizeKB = undefined; handleOptionChange(); }}
                disabled={!!job.options.targetSizeKB}
                class="w-full accent-indigo-500 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer disabled:opacity-50 mt-2"
            />
        </label>

        <label class="block relative">
            <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block flex items-center gap-1">
                {dict.controls?.targetSize || "Target Size (KB)"}
                <Target class="w-3 h-3 text-indigo-400" />
            </span>
            <input
                type="number"
                bind:value={job.options.targetSizeKB}
                placeholder="Optional"
                on:input={handleOptionChange}
                class="w-full bg-slate-700 border border-slate-600 text-xs text-slate-200 rounded px-2 py-1.5 min-h-[44px] focus:border-indigo-500 focus:outline-none placeholder:text-slate-500"
            />
        </label>

        <label class="block">
            <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.controls?.width || "Width"}</span>
            <input
                type="number"
                bind:value={job.options.width}
                placeholder="Auto"
                on:input={handleOptionChange}
                class="w-full bg-slate-700 border border-slate-600 text-xs text-slate-200 rounded px-2 py-1.5 min-h-[44px] focus:border-indigo-500 focus:outline-none"
            />
        </label>

         <div class="flex items-end pb-1 col-span-2 md:col-span-4 mt-2">
             <button class="min-h-[44px] min-w-[44px] w-full min-h-[44px] flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                disabled={job.status !== 'done'}
                on:click={download}
             >
                <Download class="w-4 h-4" />
                {dict.controls?.download || "Download"}
             </button>
         </div>
    </div>

    <!-- Smart Analysis (Palette & Privacy) -->
    {#if job.palette || (job.metadataFound && job.metadataFound.length > 0)}
        <div class="border-t border-slate-700 pt-3 flex flex-col gap-3">
             <!-- Magic Palette -->
             {#if job.palette && job.palette.length > 0}
                <div>
                     <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.card?.palette || "Magic Palette"}</span>
                     <div class="flex items-center gap-2">
                         {#each job.palette as color}
                             <button
                                 class="w-8 h-8 md:w-6 md:h-6 rounded-full border border-white/10 relative group min-h-[44px] min-w-[44px] md:min-h-0 md:min-w-0 flex items-center justify-center"
                                 style="background-color: {color};"
                                 on:click={() => copyColor(color)}
                                 title={color}
                                 aria-label={`Copy color ${color}`}
                             >
                                 <span class="absolute inset-0 md:flex items-center justify-center md:opacity-0 group-hover:opacity-100 bg-black/20 rounded-full transition-opacity">
                                      {#if copiedColor === color}
                                          <Check class="w-4 h-4 md:w-3 md:h-3 text-white" />
                                      {:else}
                                          <Copy class="w-4 h-4 md:w-3 md:h-3 text-white opacity-0 md:opacity-100 group-hover:opacity-100" />
                                      {/if}
                                 </span>
                             </button>
                         {/each}
                    </div>
                </div>
             {/if}

             <!-- Privacy Scanner -->
             {#if job.metadataFound && job.metadataFound.length > 0}
                <div>
                    <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block flex items-center gap-1">
                        {dict.card?.privacy || "Privacy Scanner"}
                        <span class="bg-indigo-500/20 text-indigo-400 px-1.5 py-0.5 rounded text-[9px]">{dict.card?.stripped || "Stripped"}</span>
                    </span>
                    <div class="flex flex-wrap gap-2">
                        {#each job.metadataFound as meta}
                            <span class="text-[10px] bg-red-900/20 text-red-300 border border-red-900/30 px-2 py-0.5 rounded flex items-center gap-1">
                                {meta}
                            </span>
                        {/each}
                    </div>
                </div>
             {/if}
        </div>
    {/if}
  </div>
</div>
