<script lang="ts">
  import { Check } from 'lucide-svelte';
  import type { PDFPage } from '$lib/utils/pdf-forge/store';
  import { createEventDispatcher } from 'svelte';

  export let page: PDFPage;
  export let selected: boolean = false;
  export let index: number;

  const dispatch = createEventDispatcher();
</script>

<div
  role="button"
  tabindex="0"
  aria-pressed={selected}
  class="relative group cursor-pointer transition-all duration-200 select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 rounded-xl
  {selected ? 'ring-2 ring-indigo-500 scale-[0.98]' : 'hover:scale-[1.02] hover:shadow-lg'}"
  on:click
  on:keydown
>
  <!-- Selection Checkbox -->
  <div class="absolute top-2 left-2 z-10">
    <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shadow-sm
      {selected ? 'bg-indigo-500 border-indigo-500' : 'bg-white/90 border-slate-300 dark:border-slate-600 group-hover:border-indigo-400'}">
      {#if selected}
        <Check class="w-3.5 h-3.5 text-white" />
      {/if}
    </div>
  </div>

  <!-- Image Container -->
  <div class="bg-white rounded-lg shadow-sm overflow-hidden aspect-[1/1.414] relative flex items-center justify-center bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
    {#if page.imageSrc}
      <img
        src={page.imageSrc}
        alt="Page {page.pageIndex + 1}"
        class="max-w-full max-h-full object-contain transition-transform duration-300"
        style="transform: rotate({page.rotation}deg);"
        draggable="false"
      />
    {:else}
      <div class="animate-pulse w-full h-full bg-slate-200 dark:bg-slate-700"></div>
    {/if}
  </div>

  <!-- Footer Info -->
  <div class="mt-2 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium px-1">
    <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">#{index + 1}</span>
    <span class="opacity-60">Source: {page.pageIndex + 1}</span>
  </div>
</div>
