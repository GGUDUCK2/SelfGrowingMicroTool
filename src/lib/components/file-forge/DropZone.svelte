<script lang="ts">
  import { UploadCloud } from '@lucide/svelte';
  import { createEventDispatcher } from 'svelte';
  import SmartExamples from './SmartExamples.svelte';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;

  const dispatch = createEventDispatcher();
  let isDragging = false;

  function handleDragOver(e: DragEvent) {
    e.preventDefault();
    isDragging = true;
  }

  function handleDragLeave(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
  }

  let fileInput: HTMLInputElement;

  function handleDrop(e: DragEvent) {
    e.preventDefault();
    isDragging = false;
    const files = e.dataTransfer?.files;
    if (files && files.length > 0) {
      dispatch('file', files[0]);
    }
  }

  function handleChange(e: Event) {
    const files = (e.target as HTMLInputElement).files;
    if (files && files.length > 0) {
      dispatch('file', files[0]);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-200 cursor-pointer
  {isDragging
    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'}"
  on:dragover={handleDragOver}
  on:dragleave={handleDragLeave}
  on:drop={handleDrop}
  on:click={() => fileInput?.click()}
  on:keydown={(e) => e.key === 'Enter' && fileInput?.click()}
>
  <input
    bind:this={fileInput}
    type="file"
    class="hidden"
    on:change={handleChange}
  />
  <div class="flex flex-col items-center gap-4">
    <div class="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
      <UploadCloud size={32} />
    </div>
    <div>
      <h3 class="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-1">
        {dict.dropZone}
      </h3>
      <p class="text-sm text-slate-500 dark:text-slate-400">
        {dict.browse}
      </p>
    </div>
  </div>
</div>

<SmartExamples {dict} on:file />
