<script lang="ts">
  import { convertImage } from '$lib/utils/file-forge/image';
  import { Download, RefreshCw, AlertCircle } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let file: File;
  export let dict: any;

  let format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png';
  let quality = 0.9;
  let width = 0;
  let height = 0;
  let maintainAspectRatio = true;
  let processing = false;
  let convertedBlob: Blob | null = null;
  let convertedUrl: string | null = null;
  let error: string | null = null;
  let originalDimensions = { width: 0, height: 0 };

  // Load image dimensions on mount
  $: if (file) {
    const img = new Image();
    img.onload = () => {
      originalDimensions = { width: img.width, height: img.height };
      if (width === 0) width = img.width;
      if (height === 0) height = img.height;
    };
    img.src = URL.createObjectURL(file);
  }

  $: if (width && maintainAspectRatio && originalDimensions.width > 0) {
    // Recalculate height when width changes
    // This is a simple one-way binding for now to avoid loops
  }

  function handleWidthChange(e: Event) {
    const w = parseInt((e.target as HTMLInputElement).value);
    width = w;
    if (maintainAspectRatio && originalDimensions.width > 0) {
      height = Math.round(w * (originalDimensions.height / originalDimensions.width));
    }
  }

  function handleHeightChange(e: Event) {
    const h = parseInt((e.target as HTMLInputElement).value);
    height = h;
    if (maintainAspectRatio && originalDimensions.height > 0) {
      width = Math.round(h * (originalDimensions.width / originalDimensions.height));
    }
  }

  async function handleConvert() {
    processing = true;
    error = null;
    convertedBlob = null;
    if (convertedUrl) URL.revokeObjectURL(convertedUrl);
    convertedUrl = null;

    try {
      convertedBlob = await convertImage(file, format, quality, width, height);
      convertedUrl = URL.createObjectURL(convertedBlob);
    } catch (e) {
      error = 'Conversion failed. The file might be corrupted or too large.';
      console.error(e);
    } finally {
      processing = false;
    }
  }

  function download() {
    if (!convertedUrl || !convertedBlob) return;
    const a = document.createElement('a');
    a.href = convertedUrl;
    const ext = format.split('/')[1];
    a.download = `converted-${file.name.split('.')[0]}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
</script>

<div class="space-y-6">
  {#if !file.type.startsWith('image/')}
    <div class="flex flex-col items-center justify-center p-12 text-center text-slate-500 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <AlertCircle size={48} class="mb-4 text-amber-500" />
      <h3 class="text-lg font-medium text-slate-900 dark:text-white">Image Conversion Only</h3>
      <p class="mt-2 text-sm">The selected file is not an image. Only image files (PNG, JPG, WebP, etc.) can be converted.</p>
    </div>
  {:else}
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
      <!-- Settings -->
      <div class="space-y-6">
        <div>
          <span class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            {dict?.convert?.format || 'Format'}
          </span>
          <div class="flex gap-2" role="group" aria-label="Image Format Selection">
            {#each ['image/png', 'image/jpeg', 'image/webp'] as f}
              <button
                class="px-4 py-2 rounded-lg text-sm font-medium transition-colors border
                {format === f
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                on:click={() => format = f}
                aria-pressed={format === f}
              >
                {f.split('/')[1].toUpperCase()}
              </button>
            {/each}
          </div>
        </div>

        {#if format !== 'image/png'}
          <div>
            <label for="quality-slider" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 flex justify-between">
              <span>{dict?.convert?.quality || 'Quality'}</span>
              <span>{Math.round(quality * 100)}%</span>
            </label>
            <input
              id="quality-slider"
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              bind:value={quality}
              class="w-full accent-indigo-600"
            />
          </div>
        {/if}

        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="img-width" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {dict?.convert?.width || 'Width'} (px)
            </label>
            <input
              id="img-width"
              type="number"
              value={width}
              on:input={handleWidthChange}
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
          <div>
            <label for="img-height" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {dict?.convert?.height || 'Height'} (px)
            </label>
            <input
              id="img-height"
              type="number"
              value={height}
              on:input={handleHeightChange}
              class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
            />
          </div>
        </div>

        <div class="flex items-center gap-2">
          <input
            type="checkbox"
            id="aspect"
            bind:checked={maintainAspectRatio}
            class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
          />
          <label for="aspect" class="text-sm text-slate-600 dark:text-slate-400">
            {dict?.convert?.aspectRatio || 'Maintain Aspect Ratio'}
          </label>
        </div>

        <button
          on:click={handleConvert}
          disabled={processing}
          class="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {#if processing}
            <RefreshCw size={18} class="animate-spin" />
            Converting...
          {:else}
            <RefreshCw size={18} />
            Convert Image
          {/if}
        </button>
      </div>

      <!-- Preview -->
      <div class="bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-4 flex flex-col items-center justify-center min-h-[300px]">
        {#if error}
          <div class="text-red-500 flex flex-col items-center gap-2">
            <AlertCircle size={32} />
            <span class="text-sm">{error}</span>
          </div>
        {:else if convertedUrl}
          <div class="relative group w-full h-full flex flex-col items-center">
            <img src={convertedUrl} alt="Converted Preview" class="max-h-[300px] max-w-full object-contain shadow-lg rounded-lg mb-4" />
            <div class="text-sm text-slate-500 mb-4">
              {(convertedBlob?.size ? (convertedBlob.size / 1024).toFixed(2) : 0)} KB
            </div>
            <button
              on:click={download}
              class="py-2 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg shadow-sm flex items-center gap-2 transition-colors"
            >
              <Download size={18} />
              {dict?.convert?.download || 'Download'}
            </button>
          </div>
        {:else}
          <div class="text-slate-400 text-center">
            <p>Click "Convert Image" to see preview</p>
          </div>
        {/if}
      </div>
    </div>
  {/if}
</div>
