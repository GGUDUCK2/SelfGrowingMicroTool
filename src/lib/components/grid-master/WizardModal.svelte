<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { generateLayoutFromText } from '$lib/utils/grid-master/generators';
  import { X, Layout, FileText, LayoutDashboard, ArrowRight, ArrowLeft, Check, Smartphone, Monitor, Wand2, Image, Database, Type } from '@lucide/svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';
  import { nanoid } from 'nanoid';
  import { getRandomColor } from '$lib/utils/grid-master/constants';

  export let dict: GridMasterDictionary;

  const dispatch = createEventDispatcher();
  let step = 0;
  let mode: 'wizard' | 'magic' = 'wizard';
  let magicInput = '';

  // Configuration State
  let layoutType: 'dashboard' | 'blog' | 'landing' | 'app' = 'dashboard';
  type StructureType = 'header-footer' | 'sidebar-left' | 'sidebar-right' | 'holy-grail';
  let structure: StructureType = 'sidebar-left';
  let strategy: 'visual' | 'text' | 'data' = 'data';
  let mobileStrategy: 'stack' | 'hide-sidebar' = 'stack';

  function close() {
      dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
  }

  function next() {
      if (step === 0) {
          step = 1;
      } else if (step < 4) {
          step++;
      }
  }

  function prev() {
      if (step === 1) {
          step = 0;
      } else if (step > 1) {
          step--;
      }
  }

  function handleMagicGenerate() {
      if (!magicInput.trim()) return;
      const state = generateLayoutFromText(magicInput);
      gridStore.load(state);
      close();
  }

  function generate() {
      const gap = strategy === 'visual' ? '0px' : (strategy === 'text' ? '2rem' : '1rem');

      // We'll construct manually to respect the "Structure" selection exactly
      let rows = ['auto', '1fr', 'auto'];
      let cols = ['250px', '1fr'];
      let areas = [];

      // Structure Logic
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

      // Assign Content Types based on Strategy & Layout Type
      const finalAreas = areas.map(a => {
          let contentType = 'none';
          const n = a.name;

          if (n === 'header') contentType = 'header';
          else if (n === 'footer') contentType = 'footer';
          else if (n === 'sidebar' || n === 'nav') contentType = 'form'; // Default
          else if (n === 'main') {
              if (strategy === 'visual') contentType = 'gallery';
              else if (strategy === 'data') contentType = 'chart';
              else contentType = 'article'; // Text
          }

          // Refine based on layoutType
          if (layoutType === 'landing' && n === 'main') contentType = 'hero';
          if (layoutType === 'app' && n === 'main') contentType = 'feed';

          return {
              ...a,
              id: nanoid(),
              color: getRandomColor(),
              contentType
          };
      });

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
          includeMobile: true,
          mobileStrategy
      });

      close();
  }

  const steps = [
      { id: 1, title: 'Type' },
      { id: 2, title: 'Structure' },
      { id: 3, title: 'Strategy' },
      { id: 4, title: 'Review' }
  ];
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade role="dialog" aria-modal="true" aria-labelledby="wizard-title">
  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]" transition:fly={{ y: 20 }}>

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
              <h2 id="wizard-title" class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {dict.wizard?.title || 'Grid Wizard'}
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">
                  {#if step > 0}Step {step} of 4{:else}Start{/if}
              </p>
          </div>
          <button on:click={close} class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
              <X size={20} />
          </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
          {#if step === 0}
              <h3 class="text-lg font-semibold mb-6 text-center">{dict.wizard?.title || 'How do you want to start?'}</h3>
              <div class="grid sm:grid-cols-2 gap-6">
                  <button
                    class="p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-4 group {mode === 'wizard' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                    on:click={() => { mode = 'wizard'; step = 1; }}
                  >
                      <div class="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <LayoutDashboard size={32} />
                      </div>
                      <div>
                          <div class="font-bold text-lg mb-1">{dict.wizard?.manual || 'Manual Wizard'}</div>
                          <div class="text-sm text-slate-500">Step-by-step configuration</div>
                      </div>
                  </button>

                  <button
                    class="p-6 rounded-2xl border-2 transition-all text-center flex flex-col items-center gap-4 group {mode === 'magic' ? 'border-purple-600 bg-purple-50 dark:bg-purple-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-purple-300'}"
                    on:click={() => { mode = 'magic'; }}
                  >
                      <div class="w-16 h-16 rounded-full bg-purple-100 dark:bg-purple-800 text-purple-600 dark:text-purple-200 flex items-center justify-center group-hover:scale-110 transition-transform">
                          <Wand2 size={32} />
                      </div>
                      <div>
                          <div class="font-bold text-lg mb-1">{dict.wizard?.magic || 'Magic Generator'}</div>
                          <div class="text-sm text-slate-500">Describe it in plain text</div>
                      </div>
                  </button>
              </div>

              {#if mode === 'magic'}
                  <div class="mt-8" transition:fade>
                      <label for="magic-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {dict.wizard?.magicLabel || 'Describe your layout:'}
                      </label>
                      <textarea
                          id="magic-input"
                          bind:value={magicInput}
                          rows="4"
                          class="w-full rounded-xl border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-shadow p-3"
                          placeholder={dict.wizard?.magicPlaceholder || "e.g. Dashboard with sidebar 250px, header, and 3 charts in main area"}
                      ></textarea>
                      <div class="mt-4 flex justify-end">
                          <button
                              class="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center gap-2 shadow-lg shadow-purple-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                              on:click={handleMagicGenerate}
                              disabled={!magicInput.trim()}
                          >
                              <Wand2 size={18} />
                              Generate Layout
                          </button>
                      </div>
                  </div>
              {/if}

          {:else if step === 1}
              <h3 class="text-lg font-semibold mb-4">{dict.wizard?.step1 || 'Choose a Layout Type'}</h3>
              <div class="grid sm:grid-cols-2 gap-4">
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
                  {#each ['header-footer', 'sidebar-left', 'sidebar-right', 'holy-grail'] as s (s)}
                      <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-3 {structure === s ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                        on:click={() => structure = s as StructureType}
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
              <h3 class="text-lg font-semibold mb-4">Content Strategy</h3>
              <div class="space-y-4">
                  <div class="grid sm:grid-cols-3 gap-4">
                      <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center {strategy === 'visual' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                        on:click={() => strategy = 'visual'}
                      >
                          <div class="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 rounded-full">
                              <Image size={20} />
                          </div>
                          <span class="font-bold">Visual</span>
                          <span class="text-[10px] opacity-60">Zero gap, full width, image placeholders</span>
                      </button>

                      <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center {strategy === 'data' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                        on:click={() => strategy = 'data'}
                      >
                          <div class="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 rounded-full">
                              <Database size={20} />
                          </div>
                          <span class="font-bold">Data</span>
                          <span class="text-[10px] opacity-60">Standard gap, charts & table placeholders</span>
                      </button>

                      <button
                        class="p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center {strategy === 'text' ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300'}"
                        on:click={() => strategy = 'text'}
                      >
                          <div class="p-2 bg-indigo-100 dark:bg-indigo-800 text-indigo-600 dark:text-indigo-200 rounded-full">
                              <Type size={20} />
                          </div>
                          <span class="font-bold">Text</span>
                          <span class="text-[10px] opacity-60">Wide gap, readable measure, article placeholders</span>
                      </button>
                  </div>

                  <div class="mt-8 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-800">
                      <h4 class="font-medium mb-3">{dict.wizard?.mobileStrategy || 'Mobile Strategy'}</h4>
                      <div class="flex gap-4">
                          <label class="flex items-center gap-2 cursor-pointer">
                              <input type="radio" value="stack" bind:group={mobileStrategy} class="text-indigo-600 focus:ring-indigo-500">
                              <span>{dict.wizard?.stackAll || 'Stack All (Column)'}</span>
                          </label>
                          <label class="flex items-center gap-2 cursor-pointer">
                              <input type="radio" value="hide-sidebar" bind:group={mobileStrategy} class="text-indigo-600 focus:ring-indigo-500">
                              <span>{dict.wizard?.hideSidebar || 'Hide Sidebar'}</span>
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
                      We'll generate a <strong>{strategy}</strong> <strong>{layoutType}</strong> layout using the <strong>{structure}</strong> structure.
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
      {#if step > 0}
          <div class="p-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-900/50 rounded-b-2xl">
              <button on:click={prev} class="px-4 py-2 text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium flex items-center gap-2">
                  <ArrowLeft size={18} /> Back
              </button>

              <div class="flex gap-2">
                  {#each steps as s (s.id)}
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
      {/if}
  </div>
</div>
