<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-svelte';

  export let t: any;

  const dispatch = createEventDispatcher<{
    upload: File;
  }>();

  let isDragging = false;
  let fileInput: HTMLInputElement;
  let error: string | null = null;

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const file = e.dataTransfer?.files[0];
    validateAndEmit(file);
  }

  function handleFileSelect(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    validateAndEmit(file);
  }

  function validateAndEmit(file?: File) {
    error = null;
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      error = "Invalid file type. Please upload an image.";
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      error = "File too large. Max 10MB.";
      return;
    }

    dispatch('upload', file);
  }

  function handlePaste(e: ClipboardEvent) {
    const file = e.clipboardData?.files[0];
    if (file) validateAndEmit(file);
  }
</script>

<svelte:window on:paste={handlePaste} />

<div
  class="relative group cursor-pointer"
  role="button"
  tabindex="0"
  on:click={() => fileInput.click()}
  on:keydown={(e) => e.key === 'Enter' && fileInput.click()}
  on:dragover|preventDefault={() => (isDragging = true)}
  on:dragleave={() => (isDragging = false)}
  on:drop={handleDrop}
>
  <input
    type="file"
    accept="image/*"
    class="hidden"
    bind:this={fileInput}
    on:change={handleFileSelect}
  />

  <div
    class="relative h-64 w-full rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6
    {isDragging
      ? 'border-indigo-500 bg-indigo-500/10 scale-[1.01]'
      : 'border-slate-700 hover:border-indigo-500/50 hover:bg-slate-800/50 bg-slate-800/30'}"
  >
    <div class="mb-4 p-4 rounded-full bg-slate-800 ring-1 ring-slate-700 group-hover:scale-110 transition-transform duration-200">
      <Upload class="w-8 h-8 text-indigo-400" />
    </div>

    <h3 class="text-lg font-medium text-slate-200 mb-2">
      {t.upload.title}
    </h3>
    <p class="text-sm text-slate-400 text-center max-w-sm mb-4">
      {t.upload.dragDrop}
    </p>
    <div class="inline-flex items-center space-x-2 text-xs text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-full border border-slate-700/50">
      <ImageIcon class="w-3.5 h-3.5" />
      <span>{t.upload.formats}</span>
    </div>
  </div>

  {#if error}
    <div class="absolute -bottom-10 left-0 right-0 flex items-center justify-center text-red-400 text-sm animate-fade-in">
      <AlertCircle class="w-4 h-4 mr-1.5" />
      {error}
    </div>
  {/if}
</div>
