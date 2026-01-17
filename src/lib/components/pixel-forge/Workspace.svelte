<script lang="ts">
  import { onMount } from 'svelte';
  import JSZip from 'jszip';
  import { Download, Trash2, Settings, Plus, Archive, History, Sliders } from 'lucide-svelte';
  import DropZone from './DropZone.svelte';
  import ImageCard from './ImageCard.svelte';
  import HistoryList from './HistoryList.svelte';
  import type { ImageJob, ExportOptions } from '$lib/utils/pixel-forge/types';
  import { nanoid } from 'nanoid';
  import { addToHistory } from '$lib/utils/pixel-forge/db';
  import { ImageProcessor } from '$lib/utils/pixel-forge/processor';

  export let dict: any;

  let jobs: ImageJob[] = [];
  let historyComponent: HistoryList;

  // Global Settings for new files
  let globalOptions: ExportOptions = {
    format: 'image/webp',
    quality: 0.8,
    maintainAspectRatio: true
  };

  async function handleFilesSelected(files: FileList) {
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (!file.type.startsWith('image/')) continue;

        const previewUrl = URL.createObjectURL(file);

        // Get dimensions
        const img = new Image();
        img.src = previewUrl;
        await img.decode();

        const job: ImageJob = {
            id: nanoid(),
            file,
            previewUrl,
            originalSize: file.size,
            originalDimensions: { width: img.naturalWidth, height: img.naturalHeight },
            status: 'pending',
            options: { ...globalOptions },
            createdAt: Date.now()
        };

        jobs = [job, ...jobs];
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
        // Just click the button of the first card programmatically or duplicate logic
        // But better to reuse logic
        const link = document.createElement('a');
        link.href = finishedJobs[0].result!.url;
        const ext = ImageProcessor.getFormatExtension(finishedJobs[0].options.format);
        const name = finishedJobs[0].file.name.split('.')[0];
        link.download = `${name}_optimized.${ext}`;
        link.click();
    } else {
        // Zip
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
          options: { ...globalOptions }, // copy values
          status: 'pending' // re-process
      }));
  }
</script>

<div class="space-y-8">
  <!-- Top Bar -->
  <div class="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
     <div class="flex items-center gap-4 w-full md:w-auto">
        <div class="flex flex-col">
            <label>
              <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">{dict.pixelForge.controls.format}</span>
              <select bind:value={globalOptions.format} class="bg-slate-700 border border-slate-600 text-sm text-slate-200 rounded px-3 py-2 focus:border-indigo-500 focus:outline-none min-w-[120px]">
                  <option value="image/webp">WebP (Best)</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
              </select>
            </label>
        </div>

        <div class="flex flex-col flex-1 md:w-48">
             <label>
               <span class="text-[10px] uppercase text-slate-500 font-bold tracking-wider mb-1 block">
                 {dict.pixelForge.controls.quality} ({Math.round(globalOptions.quality * 100)}%)
               </span>
               <input type="range" min="0.1" max="1" step="0.05" bind:value={globalOptions.quality} class="accent-indigo-500 h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer mt-2" />
             </label>
        </div>

        <button on:click={applyGlobalSettingsToAll} class="mt-4 p-2 text-slate-400 hover:text-indigo-400" title={dict.pixelForge.controls.applyAll}>
            <Sliders class="w-5 h-5" />
        </button>
     </div>

     <div class="flex items-center gap-3 w-full md:w-auto justify-end">
        {#if jobs.some(j => j.status === 'done')}
            <button on:click={downloadAll} class="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-indigo-900/20">
                <Archive class="w-4 h-4" />
                <span>{dict.pixelForge.controls.downloadAll}</span>
            </button>
        {/if}
        {#if jobs.length > 0}
            <button on:click={clearAll} class="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-red-900/30 hover:text-red-400 text-slate-300 rounded-lg font-medium transition-colors">
                <Trash2 class="w-4 h-4" />
                <span>{dict.pixelForge.controls.clear}</span>
            </button>
        {/if}
     </div>
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
          <p>{dict.pixelForge.dropZone.sub}</p>
      </div>
  {/if}

  <!-- History Section -->
  <div class="pt-8 border-t border-slate-700">
     <HistoryList bind:this={historyComponent} {dict} />
  </div>
</div>
