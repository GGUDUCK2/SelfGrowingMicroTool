<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { X, Layout, FileText, LayoutDashboard, Frame, ArrowRight, ArrowLeft, Check, Smartphone, Monitor } from 'lucide-svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';
  import { nanoid } from 'nanoid';
  import { getRandomColor } from '$lib/utils/grid-master/constants';

  export let dict: GridMasterDictionary;

  const dispatch = createEventDispatcher();
  let step = 1;

  // Configuration State
  let layoutType: 'dashboard' | 'blog' | 'landing' | 'app' = 'dashboard';
  let structure: 'header-footer' | 'sidebar-left' | 'sidebar-right' | 'holy-grail' = 'sidebar-left';
  let density: 'compact' | 'comfortable' | 'spacious' = 'comfortable';
  let mobileStrategy: 'stack' | 'hide-sidebar' = 'stack';

  function close() {
      dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
  }

  function next() {
      if (step < 4) step++;
  }

  function prev() {
      if (step > 1) step--;
  }

  function generate() {
      // 1. Density Settings
      let gap = '1rem';
      if (density === 'compact') gap = '0.5rem';
      if (density === 'spacious') gap = '2rem';

      // 2. Base Grid
      let rows = ['auto', '1fr', 'auto']; // Default: Header, Main, Footer
      let cols = ['250px', '1fr']; // Default: Sidebar, Main
      let areas = [];

      // 3. Structure Logic
      if (structure === 'header-footer') {
          rows = ['80px', '1fr', '60px'];
          cols = ['1fr'];
          areas = [
              { name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 2, tag: 'header' },
              { name: 'main', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, tag: 'main' },
              { name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 2, tag: 'footer' }
          ];
      } else if (structure === 'sidebar-left') {
          rows = ['60px', '1fr'];
          cols = ['240px', '1fr'];
          areas = [
              { name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 3, tag: 'header' },
              { name: 'sidebar', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, tag: 'aside' },
              { name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, tag: 'main' }
          ];
      } else if (structure === 'sidebar-right') {
          rows = ['60px', '1fr'];
          cols = ['1fr', '240px'];
          areas = [
              { name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 3, tag: 'header' },
              { name: 'main', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, tag: 'main' },
              { name: 'sidebar', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, tag: 'aside' }
          ];
      } else if (structure === 'holy-grail') {
          rows = ['auto', '1fr', 'auto'];
          cols = ['200px', '1fr', '200px'];
          areas = [
              { name: 'header', rowStart: 1, rowEnd: 2, colStart: 1, colEnd: 4, tag: 'header' },
              { name: 'nav', rowStart: 2, rowEnd: 3, colStart: 1, colEnd: 2, tag: 'nav' },
              { name: 'main', rowStart: 2, rowEnd: 3, colStart: 2, colEnd: 3, tag: 'main' },
              { name: 'aside', rowStart: 2, rowEnd: 3, colStart: 3, colEnd: 4, tag: 'aside' },
              { name: 'footer', rowStart: 3, rowEnd: 4, colStart: 1, colEnd: 4, tag: 'footer' }
          ];
      }

      // Add IDs and Colors
      const finalAreas = areas.map(a => ({
          ...a,
          id: nanoid(),
          color: getRandomColor(),
          contentType: 'none' // Default
      }));

      // Apply Layout Type Specifics (inject content types)
      if (layoutType === 'dashboard') {
          const main = finalAreas.find(a => a.name === 'main');
          if (main) main.contentType = 'chart';
      } else if (layoutType === 'landing') {
          const main = finalAreas.find(a => a.name === 'main');
          if (main) main.contentType = 'hero';
      } else if (layoutType === 'blog') {
          const main = finalAreas.find(a => a.name === 'main');
          if (main) main.contentType = 'article';
      }

      gridStore.load({
          rows,
          cols,
          gap,
          rowGap: gap,
          colGap: gap,
          areas: finalAreas,
          items: [],
          justifyItems: 'stretch',
          alignItems: 'stretch',
          justifyContent: 'stretch',
          alignContent: 'stretch',
          includeMobile: true // Always include mobile base
      });

      close();
  }

  const steps = [
      { id: 1, title: 'Type' },
      { id: 2, title: 'Structure' },
      { id: 3, title: 'Density' },
      { id: 4, title: 'Review' }
  ];
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade role="dialog" aria-modal="true" aria-labelledby="wizard-title">
  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]" transition:fly={{ y: 20 }}>

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
              <h2 id="wizard-title" class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {dict.wizard?.title || 'Grid Wizard'}
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Step {step} of 4</p>
          </div>
          <button on:click={close} class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} />
          </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
          {#if step === 1}
              <h3 class="text-lg font-semibold mb-4">{dict.wizard?.step1 || 'Choose a Layout Type'}</h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    class="p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 {layoutType === 'dashboard' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                    on:click={() => layoutType = 'dashboard'}
                  >
                      <div class="p-3 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 rounded-lg">
                          <LayoutDashboard size={24} />
                      </div>
                      <div>
                          <div class="font-bold">Dashboard</div>
                          <div class="text-xs text-slate-500 mt-1">Sidebar, Header, Main content area. Perfect for SaaS.</div>
                      </div>
                  </button>

                  <button
                    class="p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 {layoutType === 'blog' ? 'border-emerald-600 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-emerald-300'}"
                    on:click={() => layoutType = 'blog'}
                  >
                      <div class="p-3 bg-emerald-100 dark:bg-emerald-800 text-emerald-600 dark:text-emerald-200 rounded-lg">
                          <FileText size={24} />
                      </div>
                      <div>
                          <div class="font-bold">Blog / Article</div>
                          <div class="text-xs text-slate-500 mt-1">Centered content with optional sidebar. Readability focused.</div>
                      </div>
                  </button>

                  <button
                    class="p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 {layoutType === 'landing' ? 'border-amber-600 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'}"
                    on:click={() => layoutType = 'landing'}
                  >
                      <div class="p-3 bg-amber-100 dark:bg-amber-800 text-amber-600 dark:text-amber-200 rounded-lg">
                          <Monitor size={24} />
                      </div>
                      <div>
                          <div class="font-bold">Landing Page</div>
                          <div class="text-xs text-slate-500 mt-1">Stacked sections (Hero, Features, Footer). Full width.</div>
                      </div>
                  </button>

                  <button
                    class="p-4 rounded-xl border-2 transition-all text-left flex items-start gap-4 {layoutType === 'app' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}"
                    on:click={() => layoutType = 'app'}
                  >
                      <div class="p-3 bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200 rounded-lg">
                          <Smartphone size={24} />
                      </div>
                      <div>
                          <div class="font-bold">Mobile App Shell</div>
                          <div class="text-xs text-slate-500 mt-1">Fixed header/footer, scrollable main. App-like feel.</div>
                      </div>
                  </button>
              </div>
          {:else if step === 2}
              <h3 class="text-lg font-semibold mb-4">{dict.wizard?.step2 || 'Select Structure'}</h3>
              <div class="grid grid-cols-2 gap-4">
                  {#each ['header-footer', 'sidebar-left', 'sidebar-right', 'holy-grail'] as s}
                      <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 {structure === s ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                        on:click={() => structure = s}
                      >
                          <div class="w-full h-24 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-600 relative p-1">
                              <!-- Mini Visuals -->
                              {#if s === 'header-footer'}
                                  <div class="h-4 bg-indigo-200 dark:bg-indigo-800 w-full mb-1"></div>
                                  <div class="h-10 bg-slate-200 dark:bg-slate-700 w-full mb-1"></div>
                                  <div class="h-4 bg-slate-300 dark:bg-slate-600 w-full absolute bottom-1 left-1 right-1"></div>
                              {:else if s === 'sidebar-left'}
                                  <div class="h-4 bg-indigo-200 dark:bg-indigo-800 w-full mb-1"></div>
                                  <div class="flex gap-1 h-14">
                                      <div class="w-1/4 bg-slate-300 dark:bg-slate-600 h-full"></div>
                                      <div class="w-3/4 bg-slate-200 dark:bg-slate-700 h-full"></div>
                                  </div>
                              {:else if s === 'sidebar-right'}
                                  <div class="h-4 bg-indigo-200 dark:bg-indigo-800 w-full mb-1"></div>
                                  <div class="flex gap-1 h-14">
                                      <div class="w-3/4 bg-slate-200 dark:bg-slate-700 h-full"></div>
                                      <div class="w-1/4 bg-slate-300 dark:bg-slate-600 h-full"></div>
                                  </div>
                              {:else}
                                  <div class="h-4 bg-indigo-200 dark:bg-indigo-800 w-full mb-1"></div>
                                  <div class="flex gap-1 h-10 mb-1">
                                      <div class="w-1/5 bg-slate-300 dark:bg-slate-600 h-full"></div>
                                      <div class="w-3/5 bg-slate-200 dark:bg-slate-700 h-full"></div>
                                      <div class="w-1/5 bg-slate-300 dark:bg-slate-600 h-full"></div>
                                  </div>
                                  <div class="h-4 bg-slate-300 dark:bg-slate-600 w-full"></div>
                              {/if}
                          </div>
                          <span class="font-medium capitalize">{s.replace('-', ' ')}</span>
                      </button>
                  {/each}
              </div>
          {:else if step === 3}
              <h3 class="text-lg font-semibold mb-4">{dict.wizard?.step3 || 'Spacing & Density'}</h3>
              <div class="space-y-4">
                  <div class="flex gap-4">
                      {#each ['compact', 'comfortable', 'spacious'] as d}
                          <button
                            class="flex-1 p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 {density === d ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                            on:click={() => density = d}
                          >
                              <div class="flex gap-1">
                                  {#if d === 'compact'}
                                      <div class="w-2 h-2 bg-slate-400"></div><div class="w-2 h-2 bg-slate-400"></div>
                                  {:else if d === 'comfortable'}
                                      <div class="w-2 h-2 bg-slate-400 mr-1"></div><div class="w-2 h-2 bg-slate-400"></div>
                                  {:else}
                                      <div class="w-2 h-2 bg-slate-400 mr-2"></div><div class="w-2 h-2 bg-slate-400"></div>
                                  {/if}
                              </div>
                              <span class="font-medium capitalize">{d}</span>
                          </button>
                      {/each}
                  </div>

                  <div class="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <h4 class="font-medium mb-3">Mobile Strategy</h4>
                      <div class="flex gap-4">
                          <label class="flex items-center gap-2 cursor-pointer">
                              <input type="radio" value="stack" bind:group={mobileStrategy} class="text-indigo-600 focus:ring-indigo-500">
                              <span>Stack All (Column)</span>
                          </label>
                          <label class="flex items-center gap-2 cursor-pointer opacity-60" title="Coming soon">
                              <input type="radio" value="hide-sidebar" disabled class="text-indigo-600 focus:ring-indigo-500">
                              <span>Hide Sidebar</span>
                          </label>
                      </div>
                  </div>
              </div>
          {:else if step === 4}
              <div class="text-center py-8">
                  <div class="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check size={32} />
                  </div>
                  <h3 class="text-2xl font-bold mb-2">Ready to Build!</h3>
                  <p class="text-slate-500 max-w-xs mx-auto mb-8">
                      We'll generate a <strong>{density}</strong> <strong>{layoutType}</strong> layout using the <strong>{structure}</strong> structure.
                  </p>

                  <div class="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 text-left text-sm font-mono opacity-80 max-w-sm mx-auto">
                      grid-template-areas:<br>
                      {#if structure === 'header-footer'}
                        "header"<br>"main"<br>"footer"
                      {:else if structure === 'sidebar-left'}
                        "header header"<br>"sidebar main"
                      {:else}
                        ...
                      {/if}
                  </div>
              </div>
          {/if}
      </div>

      <!-- Footer -->
      <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
          {#if step > 1}
              <button on:click={prev} class="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium flex items-center gap-2">
                  <ArrowLeft size={18} /> Back
              </button>
          {:else}
              <div></div>
          {/if}

          <div class="flex gap-2">
              {#each steps as s}
                  <div class="w-2 h-2 rounded-full {s.id === step ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'}"></div>
              {/each}
          </div>

          {#if step < 4}
              <button on:click={next} class="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-indigo-500/20 transition-all">
                  Next <ArrowRight size={18} />
              </button>
          {:else}
              <button on:click={generate} class="px-8 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-indigo-500/30 transition-all transform hover:scale-105">
                  <Layout size={18} /> Generate
              </button>
          {/if}
      </div>
  </div>
</div>
