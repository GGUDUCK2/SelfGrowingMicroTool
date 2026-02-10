<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, scale } from 'svelte/transition';
  import { X, Smartphone, Tablet, Monitor } from 'lucide-svelte';
  import GridCanvas from './GridCanvas.svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let dict: GridMasterDictionary;
  export let theme = 'standard';

  const dispatch = createEventDispatcher();

  function close() {
      dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md" transition:fade role="dialog" aria-modal="true">
  <div class="w-full h-full flex flex-col" transition:scale>
      <!-- Header -->
      <div class="flex justify-between items-center mb-8 px-8 mt-4 text-white">
          <div>
              <h2 class="text-2xl font-bold flex items-center gap-3">
                  Responsive Check
              </h2>
              <p class="text-slate-400 text-sm mt-1">Verify your layout across standard breakpoints</p>
          </div>
          <button on:click={close} class="p-2 hover:bg-white/10 rounded-full transition-colors">
              <X size={32} />
          </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-x-auto overflow-y-hidden flex gap-12 items-start justify-center pb-8 px-8 custom-scrollbar">

          <!-- Mobile (375px) -->
          <div class="flex flex-col items-center gap-4 shrink-0 group">
              <div class="text-sm font-bold text-slate-400 flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                  <Smartphone size={18}/>
                  <span>Mobile</span>
                  <span class="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">375px</span>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-[2rem] overflow-hidden shadow-2xl border-4 border-slate-700 w-[375px] h-[667px] relative origin-top hover:border-indigo-500 transition-colors">
                  <!-- Force Mobile View -->
                  <GridCanvas viewMode="mobile" {theme} {dict} previewMode={true} />
              </div>
          </div>

          <!-- Tablet (768px) -->
          <div class="flex flex-col items-center gap-4 shrink-0 group">
              <div class="text-sm font-bold text-slate-400 flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                  <Tablet size={18}/>
                  <span>Tablet</span>
                  <span class="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">768px</span>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-[1.5rem] overflow-hidden shadow-2xl border-4 border-slate-700 w-[768px] h-[1024px] relative transform scale-[0.65] origin-top hover:border-indigo-500 transition-colors">
                  <!-- Desktop Layout constrained to Tablet width -->
                  <GridCanvas viewMode="desktop" {theme} {dict} previewMode={true} />
              </div>
          </div>

          <!-- Laptop (1280px) -->
          <div class="flex flex-col items-center gap-4 shrink-0 group">
              <div class="text-sm font-bold text-slate-400 flex items-center gap-2 group-hover:text-indigo-400 transition-colors">
                  <Monitor size={18}/>
                  <span>Laptop</span>
                  <span class="bg-slate-800 px-1.5 py-0.5 rounded text-xs font-mono">1280px</span>
              </div>
              <div class="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl border-4 border-slate-700 w-[1280px] h-[800px] relative transform scale-[0.5] origin-top hover:border-indigo-500 transition-colors">
                  <GridCanvas viewMode="desktop" {theme} {dict} previewMode={true} />
              </div>
          </div>

      </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    height: 12px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(255,255,255,0.05);
    border-radius: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(255,255,255,0.2);
    border-radius: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: rgba(255,255,255,0.3);
  }
</style>
