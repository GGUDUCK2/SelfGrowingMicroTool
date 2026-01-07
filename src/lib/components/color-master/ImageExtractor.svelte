<script lang="ts">
  import { fade } from 'svelte/transition';
  import { extractColorsFromImage } from '$lib/utils/image-color-extractor';
  import { createEventDispatcher } from 'svelte';
  import type { ColorMasterDictionary } from '$lib/types/color-master';

  export let t: ColorMasterDictionary;

  const dispatch = createEventDispatcher();
  let dragging = false;
  let processing = false;
  let error = '';
  let inputElement: HTMLInputElement;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    dragging = true;
  }

  function handleDragLeave() {
    dragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;

    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      processFile(input.files[0]);
    }
  }

  function triggerUpload() {
    inputElement?.click();
  }

  async function processFile(file: File) {
    if (!file.type.startsWith('image/')) {
      error = 'Please upload an image file.';
      return;
    }

    processing = true;
    error = '';

    try {
      const colors = await extractColorsFromImage(file, 1); // Get dominant color
      if (colors.length > 0) {
        dispatch('colorSelected', colors[0]);
      } else {
        error = 'Could not extract colors.';
      }
    } catch (err) {
      console.error(err);
      error = 'Failed to process image.';
    } finally {
      processing = false;
    }
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
  <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.imageExtraction.title || 'Extract from Image'}</h3>

  <div
    class="relative border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer
    {dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-indigo-400 dark:hover:border-indigo-500'}"
    on:dragover={handleDragOver}
    on:dragleave={handleDragLeave}
    on:drop={handleDrop}
    role="button"
    tabindex="0"
    on:keydown={(e) => (e.key === 'Enter' || e.key === ' ') && triggerUpload()}
    on:click={triggerUpload}
    aria-label="Upload image to extract color"
  >
    <input
      bind:this={inputElement}
      type="file"
      accept="image/*"
      class="hidden"
      on:change={handleFileSelect}
    />

    {#if processing}
      <div class="animate-pulse text-indigo-500 font-medium">Processing...</div>
    {:else}
      <div class="space-y-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="mx-auto h-10 w-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <p class="text-slate-600 dark:text-slate-300 text-sm">
          {t.imageExtraction.dragDrop || 'Drag & drop or click to upload'}
        </p>
      </div>
    {/if}
  </div>

  {#if error}
    <p class="mt-2 text-sm text-red-500" transition:fade>{error}</p>
  {/if}
</div>
