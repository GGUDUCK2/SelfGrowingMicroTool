<script lang="ts">
  import { Upload, ImageIcon } from '@lucide/svelte';
  import type { PixelForgeDictionary } from '$lib/utils/pixel-forge/types';

  export let onFilesSelected: (files: FileList) => void;
  export let dict: PixelForgeDictionary;

  let isDragging = false;
  let fileInput: HTMLInputElement;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave() {
    isDragging = false;
  }

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
      onFilesSelected(e.dataTransfer.files);
    }
  }

  function handleClick() {
    fileInput.click();
  }

  function handleKeyDown(e: KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      fileInput.click();
    }
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files && target.files.length > 0) {
      onFilesSelected(target.files);
    }
  }
</script>

<div
  class="relative w-full overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 ease-out group cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900
  {isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 bg-slate-800/50 hover:border-indigo-500/50 hover:bg-slate-800'}"
  role="button"
  tabindex="0"
  aria-label={dict.dropZone?.title || "Drop images here"}
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={handleClick}
  on:keydown={handleKeyDown}
>
  <input
    bind:this={fileInput}
    type="file"
    accept="image/*"
    multiple
    class="hidden"
    on:change={handleChange}
    tabindex="-1"
  />

  <div class="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div class="mb-4 relative">
      <div class="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse group-hover:opacity-30 transition-opacity"></div>
      <div class="relative w-16 h-16 bg-slate-800 rounded-2xl shadow-xl flex items-center justify-center border border-slate-700 group-hover:scale-110 transition-transform duration-300">
        {#if isDragging}
          <Upload class="w-8 h-8 text-indigo-400 animate-bounce" />
        {:else}
          <ImageIcon class="w-8 h-8 text-indigo-400" />
        {/if}
      </div>
    </div>

    <h3 class="text-xl font-semibold text-slate-200 mb-2">
      {isDragging ? dict.dropZone?.title : dict.dropZone?.sub}
    </h3>
    <p class="text-slate-400 max-w-sm">
      {dict.dropZone?.info}
    </p>
  </div>
</div>
