<script lang="ts">
  import { onMount } from 'svelte';
  import JSZip from 'jszip';
  import { Download, Trash2, Settings, Plus, Archive, History, Sliders, Type } from '@lucide/svelte';
  import DropZone from './DropZone.svelte';
  import ImageCard from './ImageCard.svelte';
  import HistoryList from './HistoryList.svelte';
  import type { ImageJob, ExportOptions, PixelForgeDictionary } from '$lib/utils/pixel-forge/types';
  import { nanoid } from 'nanoid';
  import { addToHistory } from '$lib/utils/pixel-forge/db';
  import { ImageProcessor } from '$lib/utils/pixel-forge/processor';
  import { presets } from '$lib/utils/pixel-forge/presets';
  import { MetadataScanner } from '$lib/utils/pixel-forge/metadata';
  import { PaletteExtractor } from '$lib/utils/pixel-forge/palette';

  export let dict: PixelForgeDictionary;

  let jobs: ImageJob[] = [];
  let historyComponent: HistoryList;
  let showWatermarkSettings = false;

  // Global Settings for new files
  let globalOptions: ExportOptions = {
    format: 'image/webp',
    quality: 0.8,
    maintainAspectRatio: true,
    targetSizeKB: undefined,
    watermark: {
        text: '',
        opacity: 0.5,
        position: 'bottom-right',
        color: '#ffffff'
    }
  };

  let selectedPreset = '';

  function handlePresetChange() {
      if (!selectedPreset) return;
      const preset = presets.find(p => p.id === selectedPreset);
      if (preset) {
          // Preserve watermark if custom
          const wm = globalOptions.watermark;
          globalOptions = { ...globalOptions, ...preset.options };
          if (wm && wm.text) globalOptions.watermark = wm;
      }
  }

  async function handleFilesSelected(files: FileList) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const previewUrl = URL.createObjectURL(file);

        // Get dimensions
        const img = new Image();
        img.src = previewUrl;
        await img.decode();

        // Run analysis in background
        const metadataPromise = MetadataScanner.scan(file);
        const palettePromise = PaletteExtractor.extract(file); // Extract from original

        const job: ImageJob = {
            id: nanoid(),
            file,
            previewUrl,
            originalSize: file.size,
            originalDimensions: { width: img.naturalWidth, height: img.naturalHeight },
            status: 'pending',
            options: { ...globalOptions, watermark: { ...globalOptions.watermark! } },
            createdAt: Date.now()
        };

        jobs = [job, ...jobs];

        // Update job with analysis results once ready
        Promise.all([metadataPromise, palettePromise]).then(([metadata, palette]) => {
             updateJob(job.id, { metadataFound: metadata, palette });
        });
    }
  }

  function removeJob(id: string) {
    jobs = jobs.filter(j => {
        if (j.id === id) {
            URL.revokeObjectURL(j.previewUrl);
            if (j.result?.url) URL.revokeObjectURL(j.result.url);
            return false;
        }
        return true;
    });
  }

  function clearAll() {
    jobs.forEach(j => {
        URL.revokeObjectURL(j.previewUrl);
        if (j.result?.url) URL.revokeObjectURL(j.result.url);
    });
    jobs = [];
  }

  async function updateJob(id: string, updates: Partial<ImageJob>) {
    jobs = jobs.map(j => {
        if (j.id === id) {
            return { ...j, ...updates };
        }
        return j;
    });

    // Handle side effects outside map to avoid async issues
    const updatedJob = jobs.find(j => j.id === id);
    if (updatedJob && updates.status === 'done' && updatedJob.result) {

        // Ensure palette is available if it was missed (race condition backup)
        if (!updatedJob.palette) {
             PaletteExtractor.extract(updatedJob.file).then(palette => {
                 updateJob(id, { palette });
             });
        }

        await addToHistory({
            id: updatedJob.id,
            fileName: updatedJob.file.name,
            originalSize: updatedJob.originalSize,
            optimizedSize: updatedJob.result.size,
            format: updatedJob.options.format,
            savings: updatedJob.originalSize - updatedJob.result.size,
            timestamp: Date.now()
        });
        if (historyComponent) historyComponent.loadHistory();
    }
  }

  async function downloadAll() {
    const finishedJobs = jobs.filter(j => j.status === 'done' && j.result);
    if (finishedJobs.length === 0) return;

    if (finishedJobs.length === 1) {
        const link = document.createElement('a');
        link.href = finishedJobs[0].result!.url;
        const ext = ImageProcessor.getFormatExtension(finishedJobs[0].options.format);
        const name = finishedJobs[0].file.name.split('.')[0];
        link.download = `${name}_optimized.${ext}`;
        link.click();
    } else {
        const zip = new JSZip();
        finishedJobs.forEach(j => {
            const ext = ImageProcessor.getFormatExtension(j.options.format);
            const name = j.file.name.split('.')[0];
            zip.file(`${name}_optimized.${ext}`, j.result!.blob);
        });

        const content = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(content);
        const a = document.createElement('a');
        a.href = url;
        a.download = `optimized_images_${new Date().toISOString().slice(0,10)}.zip`;
        a.click();
        URL.revokeObjectURL(url);
    }
  }

  function applyGlobalSettingsToAll() {
      jobs = jobs.map(j => ({
          ...j,
          options: { ...globalOptions, watermark: { ...globalOptions.watermark! } },
          status: 'pending'
      }));
  }
</script>

<div class="space-y-8">
  <!-- Top Bar -->
  <div class="flex flex-col gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700">
     <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div class="flex flex-wrap items-center gap-4 w-full md:w-auto">

            <!-- Preset Selector -->
            <div class="flex flex-col">
                <label>
                <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.controls?.preset || "Preset"}</span>
                <select
                    bind:value={selectedPreset}
                    on:change={handlePresetChange}
                    class="bg-slate-700 border border-slate-600 text-sm text-slate-200 rounded px-3 py-2 min-h-[44px] focus:border-indigo-500 focus:outline-none w-full md:w-40"
                >
                    <option value="">{dict.controls?.custom || "Custom"}</option>
                    {#each presets as preset}
                        <option value={preset.id}>{preset.name}</option>
                    {/each}
                </select>
                </label>
            </div>

            <div class="w-px h-10 bg-slate-700 mx-2 hidden md:block"></div>

            <!-- Format -->
            <div class="flex flex-col">
                <label>
                <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.controls?.format || "Format"}</span>
                <select bind:value={globalOptions.format} class="bg-slate-700 border border-slate-600 text-sm text-slate-200 rounded px-3 py-2 min-h-[44px] focus:border-indigo-500 focus:outline-none min-w-[100px]">
                    <option value="image/webp">WebP</option>
                    <option value="image/jpeg">JPEG</option>
                    <option value="image/png">PNG</option>
                </select>
                </label>
            </div>

            <!-- Quality -->
            <div class="flex flex-col flex-1 md:min-w-[12rem]">
                <label>
                <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">
                    {dict.controls?.quality || "Quality"} ({globalOptions.targetSizeKB ? 'Auto' : Math.round(globalOptions.quality * 100) + '%'})
                </span>
                <input
                    type="range"
                    min="0.1"
                    max="1"
                    step="0.05"
                    bind:value={globalOptions.quality}
                    disabled={!!globalOptions.targetSizeKB}
                    on:input={() => { selectedPreset = ''; globalOptions.targetSizeKB = undefined; }}
                    class="accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2 disabled:opacity-50"
                />
                </label>
            </div>

            <!-- Watermark Toggle -->
             <button class="min-h-[44px] min-w-[44px] mt-4 p-2 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors {showWatermarkSettings ? 'bg-indigo-500/20 text-indigo-400' : 'text-slate-400 hover:text-indigo-400 hover:bg-slate-700'}" on:click={() => showWatermarkSettings = !showWatermarkSettings}
                title={dict.controls?.watermark || "Watermark Settings"}
                aria-label={dict.controls?.watermark || "Watermark Settings"}
             >
                <Type class="w-5 h-5" />
             </button>

            <!-- Apply All -->
            <button on:click={applyGlobalSettingsToAll} class="mt-4 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center text-slate-400 hover:text-indigo-400" title={dict.controls?.applyAll || "Apply to All"}>
                <Sliders class="w-5 h-5" />
            </button>
        </div>

        <!-- Action Buttons -->
        <div class="flex items-center gap-3 w-full md:w-auto justify-end">
            {#if jobs.some(j => j.status === 'done')}
                <button class="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20" on:click={downloadAll}>
                    <Archive class="w-4 h-4" />
                    <span>{dict.controls?.downloadAll || "Download All"}</span>
                </button>
            {/if}
            {#if jobs.length > 0}
                <button class="min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-4 py-2 bg-slate-700 hover:bg-red-900/30 hover:text-red-400 text-slate-300 rounded-lg font-medium transition-colors" on:click={clearAll}>
                    <Trash2 class="w-4 h-4" />
                    <span>{dict.controls?.clear || "Clear All"}</span>
                </button>
            {/if}
        </div>
     </div>

     <!-- Watermark Settings Panel -->
     {#if showWatermarkSettings && globalOptions.watermark}
        <div class="pt-4 border-t border-slate-700 grid md:grid-cols-4 gap-4 animate-in slide-in-from-top-2 duration-200">
            <label class="block col-span-2">
                 <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Watermark Text</span>
                 <input type="text" bind:value={globalOptions.watermark.text} placeholder="e.g. © 2025 My Brand" class="w-full bg-slate-700 border border-slate-600 text-sm text-slate-200 min-h-[44px] rounded px-3 py-2 focus:border-indigo-500 focus:outline-none" />
            </label>
            <label class="flex flex-col justify-center">
                 <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Opacity ({Math.round(globalOptions.watermark.opacity * 100)}%)</span>
                 <input type="range" min="0.1" max="1" step="0.1" bind:value={globalOptions.watermark.opacity} class="w-full accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2" />
            </label>
            <label class="block">
                 <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Position</span>
                 <select bind:value={globalOptions.watermark.position} class="w-full bg-slate-700 border border-slate-600 text-sm text-slate-200 min-h-[44px] rounded px-3 py-2 focus:border-indigo-500 focus:outline-none">
                     <option value="bottom-right">Bottom Right</option>
                     <option value="bottom-left">Bottom Left</option>
                     <option value="top-right">Top Right</option>
                     <option value="top-left">Top Left</option>
                     <option value="center">Center</option>
                 </select>
            </label>
            <label class="block">
                 <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">Color</span>
                 <div class="flex gap-2">
                     <input type="color" bind:value={globalOptions.watermark.color} class="min-h-[44px] min-w-[44px] rounded cursor-pointer bg-transparent border-0 p-0" />
                     <input type="text" bind:value={globalOptions.watermark.color} class="w-full bg-slate-700 border border-slate-600 text-sm text-slate-200 min-h-[44px] rounded px-3 py-2 focus:border-indigo-500 focus:outline-none uppercase" />
                 </div>
            </label>
        </div>
     {/if}
  </div>

  <DropZone onFilesSelected={handleFilesSelected} {dict} />

  {#if jobs.length > 0}
      <div class="grid gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {#each jobs as job (job.id)}
            <ImageCard {job} {dict} onRemove={removeJob} onUpdate={updateJob} />
        {/each}
      </div>
  {:else}
      <div class="text-center py-12 text-slate-500">
          <p>{dict.dropZone?.sub}</p>
      </div>
  {/if}

  <!-- History Section -->
  <div class="pt-8 border-t border-slate-700">
     <HistoryList bind:this={historyComponent} {dict} />
  </div>
</div>
