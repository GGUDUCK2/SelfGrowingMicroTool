<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Upload, FileText } from 'lucide-svelte';

  export let dict: any;

  const dispatch = createEventDispatcher();
  let isDragging = false;

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
    if (e.dataTransfer?.files) {
      dispatch('upload', e.dataTransfer.files);
    }
  }

  function handleChange(e: Event) {
    const target = e.target as HTMLInputElement;
    if (target.files) {
      dispatch('upload', target.files);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer overflow-hidden group
  {isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={() => document.getElementById('pdf-upload')?.click()}
>
  <input
    type="file"
    id="pdf-upload"
    class="hidden"
    multiple
    accept="application/pdf"
    on:change={handleChange}
  />

  <div class="flex flex-col items-center justify-center gap-4 relative z-10">
    <div class="w-16 h-16 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-300">
      {#if isDragging}
        <Upload class="w-8 h-8 text-indigo-500 animate-bounce" />
      {:else}
        <FileText class="w-8 h-8 text-slate-400 group-hover:text-indigo-500 transition-colors" />
      {/if}
    </div>
    <div class="space-y-1">
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200">
        {dict.dropZone}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        or <span class="text-indigo-500 font-medium hover:underline">{dict.browse}</span>
      </p>
    </div>
  </div>
</div>
