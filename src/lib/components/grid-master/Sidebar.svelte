<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import {
    Plus, Trash2, LayoutTemplate, Clock, Settings2, Wand2,
    AlignLeft, AlignCenter, AlignRight, Maximize
  } from '@lucide/svelte';
  import type { GridMasterDictionary, JustifyItems, AlignItems, JustifyContent, AlignContent } from '$lib/utils/grid-master/types';
  import { templates } from '$lib/utils/grid-master/templates';
  import { generateMagicLayout, generateLayoutFromText, remixLayout } from '$lib/utils/grid-master/generators';
  import { nanoid } from 'nanoid';
  import { tick } from 'svelte';
  import TemplatePreview from './TemplatePreview.svelte';
  import HistoryPanel from './HistoryPanel.svelte';
  import SnapshotPanel from './SnapshotPanel.svelte';
  import TrackEditor from './TrackEditor.svelte';
  import WizardModal from './WizardModal.svelte';
  import GalleryModal from './GalleryModal.svelte';
  import { COLOR_MAP } from '$lib/utils/grid-master/constants';

  export let dict: GridMasterDictionary;
  export let theme = 'standard';

  let activeTab: 'build' | 'templates' | 'history' = 'build';
  let showWizard = false;
  let showGallery = false;

  function loadTemplate(key: string) {
      if (confirm(dict.loadTemplateConfirm || 'Load template? This will replace your current grid.')) {
          const t = JSON.parse(JSON.stringify(templates[key]));
          // Ensure includeMobile is preserved or set default
          t.includeMobile = t.includeMobile ?? false;
          gridStore.load(t);
      }
  }

  function updateRow(idx: number, val: string) {
      gridStore.updateRow(idx, val);
  }

  function updateCol(idx: number, val: string) {
      gridStore.updateCol(idx, val);
  }

  function updateAreaName(id: string, name: string) {
      gridStore.updateArea(id, { name });
  }

  function updateAreaTag(id: string, tag: string) {
      gridStore.updateArea(id, { tag });
  }

  async function addArea() {
      // Add a default area at 1,1
      gridStore.addArea({
          id: nanoid(),
          name: `area-${$gridStore.areas.length + 1}`,
          rowStart: 1,
          rowEnd: 2,
          colStart: 1,
          colEnd: 2,
          color: 'indigo' // Default color
      });

      // Scroll to bottom after update
      await tick();
      const list = document.getElementById('areas-list');
      if (list) list.scrollTop = list.scrollHeight;
  }

  let textLayoutInput = '';

  function handleTextLayout() {
      if (!textLayoutInput.trim()) return;
      const layout = generateLayoutFromText(textLayoutInput);
      gridStore.load(layout);
      textLayoutInput = '';
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          if (textLayoutInput.trim()) {
              handleTextLayout();
          } else {
              const input = document.getElementById('text-layout');
              input?.focus();
          }
      }
  }
</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<div class="space-y-6">
  <!-- Tabs -->
  <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg" role="tablist" aria-label="Sidebar Tabs">
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'build'}
        aria-controls="tab-panel-build"
        id="tab-build"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 {activeTab === 'build' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'build'}
      >
          <Settings2 size={14} />
          {dict.build || 'Build'}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'templates'}
        aria-controls="tab-panel-templates"
        id="tab-templates"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 {activeTab === 'templates' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'templates'}
      >
          <LayoutTemplate size={14} />
          {dict.templates || 'Templates'}
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === 'history'}
        aria-controls="tab-panel-history"
        id="tab-history"
        class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 {activeTab === 'history' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
        on:click={() => activeTab = 'history'}
      >
          <Clock size={14} />
          {dict.history || 'History'}
      </button>
  </div>

  {#if activeTab === 'build'}
    <div role="tabpanel" id="tab-panel-build" aria-labelledby="tab-build" class="space-y-6">
      <div class="grid grid-cols-2 gap-3">
          <!-- Responsive Mode -->
          <div class="flex items-center justify-between p-2 px-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg border border-indigo-100 dark:border-indigo-800">
              <div class="flex items-center gap-2">
                  <span class="text-indigo-600 dark:text-indigo-400"><Settings2 size={14} /></span>
                  <span class="text-xs font-medium text-slate-700 dark:text-slate-300">{dict.includeMobile || 'Mobile Stack'}</span>
              </div>
              <input
                type="checkbox"
                checked={$gridStore.includeMobile}
                on:change={() => gridStore.toggleMobile()}
                class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                aria-label={dict.includeMobile || 'Include Mobile Stack'}
              />
          </div>
          <!-- Theme Selector -->
          <div class="flex items-center justify-between p-2 px-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span class="text-[10px] font-bold text-slate-500 uppercase">{dict.previewTheme || 'Theme'}</span>
              <select
                 bind:value={theme}
                 class="bg-transparent text-xs font-medium text-slate-700 dark:text-slate-300 focus:outline-none cursor-pointer text-right w-24"
                 aria-label={dict.previewTheme || 'Theme'}
              >
                  {#each Object.entries(dict.themes || { standard: 'Standard', blueprint: 'Blueprint', wireframe: 'Wireframe', cyber: 'Cyber' }) as [key, label] (key)}
                      <option value={key}>{label}</option>
                  {/each}
              </select>
          </div>
      </div>

      <!-- Tracks Configuration -->
      <div class="space-y-4">
          <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.rows}</h3>
          <div class="space-y-2">
              {#each $gridStore.rows as row, i (i)}
                 <TrackEditor
                    index={i}
                    value={row}
                    label={dict.rows}
                    {dict}
                    on:change={(e) => updateRow(i, e.detail)}
                    on:remove={() => gridStore.removeRow(i)}
                 />
              {/each}
              <button
                class="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 rounded text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                on:click={() => gridStore.addRow()}
                aria-label="Add Row"
              >
                 <Plus size={14} />
                 {dict.add}
              </button>
          </div>
      </div>

      <div class="space-y-4">
          <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.cols}</h3>
          <div class="space-y-2">
              {#each $gridStore.cols as col, i (i)}
                 <TrackEditor
                    index={i}
                    value={col}
                    label={dict.cols}
                    {dict}
                    on:change={(e) => updateCol(i, e.detail)}
                    on:remove={() => gridStore.removeCol(i)}
                 />
              {/each}
              <button
                class="w-full py-2 flex items-center justify-center gap-2 border border-dashed border-slate-300 dark:border-slate-700 rounded text-sm text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                on:click={() => gridStore.addCol()}
                aria-label="Add Column"
              >
                 <Plus size={14} />
                 {dict.add}
              </button>
          </div>
      </div>

      <div class="space-y-4">
          <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.gap}</h3>
          <div class="grid grid-cols-2 gap-3">
              <div>
                  <label for="row-gap" class="text-xs text-slate-500 block mb-1">{dict.rowGap}</label>
                  <input
                    id="row-gap"
                    type="text"
                    value={$gridStore.rowGap}
                    on:change={(e) => gridStore.setRowGap(e.currentTarget.value)}
                    class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>
              <div>
                  <label for="col-gap" class="text-xs text-slate-500 block mb-1">{dict.colGap}</label>
                  <input
                    id="col-gap"
                    type="text"
                    value={$gridStore.colGap}
                    on:change={(e) => gridStore.setColGap(e.currentTarget.value)}
                    class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
              </div>
          </div>
          <!-- Gap Presets -->
          <div class="flex p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {#each [
                  { label: dict.gapPresets?.small || 'Small', val: '0.5rem' },
                  { label: dict.gapPresets?.medium || 'Medium', val: '1rem' },
                  { label: dict.gapPresets?.large || 'Large', val: '2rem' }
              ] as preset (preset.val)}
                  <button
                    class="flex-1 py-1.5 text-xs font-medium rounded-md transition-all {$gridStore.rowGap === preset.val && $gridStore.colGap === preset.val ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                    on:click={() => { gridStore.setRowGap(preset.val); gridStore.setColGap(preset.val); }}
                    aria-label={`${preset.label} Gap`}
                  >
                      {preset.label}
                  </button>
              {/each}
          </div>
      </div>

      <div class="space-y-4">
          <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.alignment || 'Alignment'}</h3>
          <div class="grid grid-cols-2 gap-4">
              <div>
                  <label for="justify-items" class="text-xs text-slate-500 block mb-2">{dict.justifyItems || 'Justify Items'}</label>
                  <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      {#each [
                          { val: 'start', icon: AlignLeft, label: 'Start' },
                          { val: 'center', icon: AlignCenter, label: 'Center' },
                          { val: 'end', icon: AlignRight, label: 'End' },
                          { val: 'stretch', icon: Maximize, label: 'Stretch' }
                      ] as opt (opt.val)}
                          <button
                            class="flex-1 p-1.5 rounded flex items-center justify-center transition-all {$gridStore.justifyItems === opt.val ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}"
                            on:click={() => gridStore.setJustifyItems(opt.val as JustifyItems)}
                            title={opt.label}
                            aria-label={opt.label}
                          >
                              <svelte:component this={opt.icon} size={14} />
                          </button>
                      {/each}
                  </div>
              </div>
              <div>
                  <label for="align-items" class="text-xs text-slate-500 block mb-2">{dict.alignItems || 'Align Items'}</label>
                  <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                      {#each [
                          { val: 'start', icon: AlignLeft, label: 'Start' }, // Using Left/Right as proxies for Start/End vertical
                          { val: 'center', icon: AlignCenter, label: 'Center' },
                          { val: 'end', icon: AlignRight, label: 'End' },
                          { val: 'stretch', icon: Maximize, label: 'Stretch' }
                      ] as opt (opt.val)}
                          <button
                            class="flex-1 p-1.5 rounded flex items-center justify-center transition-all {$gridStore.alignItems === opt.val ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}"
                            on:click={() => gridStore.setAlignItems(opt.val as AlignItems)}
                            title={opt.label}
                            aria-label={opt.label}
                            style={opt.val !== 'stretch' ? 'transform: rotate(90deg)' : ''}
                          >
                              <svelte:component this={opt.icon} size={14} />
                          </button>
                      {/each}
                  </div>
              </div>
              <div>
                  <label for="justify-content" class="text-xs text-slate-500 block mb-1">{dict.justifyContent || 'Justify Content'}</label>
                  <select
                    id="justify-content"
                    value={$gridStore.justifyContent}
                    on:change={(e) => gridStore.setJustifyContent(e.currentTarget.value as JustifyContent)}
                    class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                      <option value="start">Start</option>
                      <option value="end">End</option>
                      <option value="center">Center</option>
                      <option value="stretch">Stretch</option>
                      <option value="space-around">Space Around</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-evenly">Space Evenly</option>
                  </select>
              </div>
              <div>
                  <label for="align-content" class="text-xs text-slate-500 block mb-1">{dict.alignContent || 'Align Content'}</label>
                  <select
                    id="align-content"
                    value={$gridStore.alignContent}
                    on:change={(e) => gridStore.setAlignContent(e.currentTarget.value as AlignContent)}
                    class="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                  >
                      <option value="start">Start</option>
                      <option value="end">End</option>
                      <option value="center">Center</option>
                      <option value="stretch">Stretch</option>
                      <option value="space-around">Space Around</option>
                      <option value="space-between">Space Between</option>
                      <option value="space-evenly">Space Evenly</option>
                  </select>
              </div>
          </div>
      </div>

      <!-- Areas List -->
      <div class="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="flex items-center justify-between">
              <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.areas}</h3>
              <button
                 class="p-1 text-slate-400 hover:text-indigo-600 rounded transition-colors"
                 on:click={addArea}
                 aria-label={dict.newArea || 'Add Area'}
                 title={dict.newArea || 'Add Area'}
              >
                  <Plus size={14} />
              </button>
          </div>
          <div id="areas-list" class="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {#each $gridStore.areas as area (area.id)}
                 <div class="flex flex-col gap-2 p-2 bg-slate-50 dark:bg-slate-800/50 rounded border border-slate-100 dark:border-slate-800 group">
                     <div class="flex items-center gap-2">
                         <div class="w-3 h-3 rounded-full shrink-0 shadow-sm" style="background-color: {area.color.startsWith('#') ? area.color : COLOR_MAP[area.color] || '#cbd5e1'}"></div>
                         <input
                           type="text"
                           value={area.name}
                           on:change={(e) => updateAreaName(area.id, e.currentTarget.value)}
                           class="flex-1 min-w-0 bg-transparent text-sm font-medium border-none p-0 focus:ring-0 text-slate-700 dark:text-slate-200"
                           aria-label="Area name"
                         />
                         <button
                           class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity focus:opacity-100"
                           on:click={() => gridStore.removeArea(area.id)}
                           aria-label={dict.remove}
                         >
                            <Trash2 size={14} />
                         </button>
                     </div>
                     <div class="flex items-center gap-2">
                         <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider w-8">TAG</span>
                         <select
                            value={area.tag || 'div'}
                            on:change={(e) => updateAreaTag(area.id, e.currentTarget.value)}
                            class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none"
                            aria-label={dict.semanticTag || 'Semantic Tag'}
                         >
                            {#each Object.entries(dict.tags || { div: 'div', header: 'header', footer: 'footer', main: 'main', nav: 'nav', section: 'section', aside: 'aside', article: 'article' }) as [val, label] (val)}
                                <option value={val}>{label}</option>
                            {/each}
                         </select>
                     </div>
                     <div class="flex items-center gap-2">
                         <span class="text-[10px] text-slate-400 uppercase font-bold tracking-wider w-8">PRE</span>
                         <select
                            on:change={(e) => {
                                const val = e.currentTarget.value;
                                if (val) {
                                    updateAreaName(area.id, val);
                                    if (['pricing', 'testimonial', 'team', 'hero'].some(k => val.includes(k))) updateAreaTag(area.id, 'section');
                                    else if (val.includes('map') || val.includes('chart')) updateAreaTag(area.id, 'div');
                                    else if (val.includes('header')) updateAreaTag(area.id, 'header');
                                    else if (val.includes('footer')) updateAreaTag(area.id, 'footer');
                                    e.currentTarget.value = '';
                                }
                            }}
                            class="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-1 text-xs focus:ring-1 focus:ring-indigo-500 outline-none text-slate-500"
                            aria-label="Apply Content Preset"
                         >
                            <option value="">{dict.contentPreset || 'Apply Preset...'}</option>
                            <option value="header">Header</option>
                            <option value="hero-section">Hero Section</option>
                            <option value="pricing-table">Pricing Table</option>
                            <option value="team-member">Team Member</option>
                            <option value="testimonial-card">Testimonial</option>
                            <option value="map-embed">Map / Location</option>
                            <option value="login-form">Login Form</option>
                            <option value="signup-form">Sign Up Form</option>
                            <option value="chart-widget">Chart / Analytics</option>
                            <option value="footer">Footer</option>
                         </select>
                     </div>
                     {#if dict.tagHelp?.[area.tag || 'div']}
                        <p class="text-[10px] text-slate-400 pl-8 leading-tight">
                            {dict.tagHelp[area.tag || 'div']}
                        </p>
                     {/if}
                 </div>
              {/each}
              {#if $gridStore.areas.length === 0}
                  <div class="text-sm text-slate-400 italic text-center py-4">
                      No areas defined. Draw on the grid or click + to add.
                  </div>
              {/if}
          </div>
      </div>
    </div> <!-- End of tabpanel -->

  {:else if activeTab === 'templates'}
      <div role="tabpanel" id="tab-panel-templates" aria-labelledby="tab-templates" class="space-y-4">
          <!-- Wizard Launcher -->
          <button
              class="w-full p-3 flex items-center justify-between bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md transition-all group mb-4"
              on:click={() => showWizard = true}
              aria-label="Open Grid Wizard"
          >
              <div class="flex items-center gap-3">
                   <div class="bg-white/20 p-2 rounded-lg">
                       <Wand2 size={20} />
                   </div>
                   <div class="text-left">
                       <div class="font-bold text-sm">{dict.wizard?.title || 'Grid Wizard'}</div>
                       <div class="text-[10px] opacity-80">Step-by-step Builder</div>
                   </div>
              </div>
              <div class="bg-white/20 rounded-full p-1 group-hover:bg-white/30 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
          </button>

          <!-- Gallery Launcher -->
          <button
              class="w-full p-3 flex items-center justify-between bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 text-slate-700 dark:text-slate-200 rounded-xl shadow-sm transition-all group"
              on:click={() => showGallery = true}
              aria-label="Open Layout Gallery"
          >
              <div class="flex items-center gap-3">
                   <div class="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 p-2 rounded-lg">
                       <LayoutTemplate size={20} />
                   </div>
                   <div class="text-left">
                       <div class="font-bold text-sm">{dict.browseGallery || 'Browse Gallery'}</div>
                       <div class="text-[10px] opacity-60">{dict.professionalLayouts || 'Professional Layouts'}</div>
                   </div>
              </div>
              <div class="text-slate-400 group-hover:text-indigo-500">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
              </div>
          </button>

          <div class="flex gap-2">
              <button
                  class="flex-1 p-3 flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg shadow-sm hover:from-purple-600 hover:to-indigo-700 transition-all font-medium"
                  on:click={() => {
                      const layout = generateMagicLayout();
                      gridStore.load(layout);
                  }}
                  aria-label={dict.magicLayout || 'Magic Layout'}
              >
                  <Wand2 size={18} />
                  {dict.magicLayout || 'Random'}
              </button>
              <button
                  class="flex-1 p-3 flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-all font-medium"
                  on:click={() => {
                      const layout = remixLayout($gridStore);
                      gridStore.load(layout);
                  }}
                  aria-label={dict.remixLayout || 'Remix Layout'}
              >
                  <Settings2 size={18} />
                  {dict.remixLayout || 'Remix'}
              </button>
          </div>

          <div class="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
             <label for="text-layout" class="text-xs font-bold text-slate-500 uppercase">{dict.textToGrid || 'Text to Grid'}</label>
             <div class="flex gap-2">
                 <input
                   id="text-layout"
                   type="text"
                   bind:value={textLayoutInput}
                   placeholder="header sidebar main footer"
                   on:keydown={(e) => e.key === 'Enter' && handleTextLayout()}
                   class="flex-1 min-w-0 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                   aria-label={dict.textToGrid || 'Text to Grid'}
                 />
                 <button
                   class="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 transition-colors shadow-sm"
                   on:click={handleTextLayout}
                   aria-label="Generate Grid"
                 >
                   Go
                 </button>
             </div>
             <div class="flex flex-wrap gap-1 mt-1">
                 {#each dict.smartExamples || ['header sidebar main footer', 'header 80px sidebar 250px main', 'nav main aside footer'] as ex (ex)}
                     <button
                       class="px-2 py-0.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-[10px] text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                       on:click={() => { textLayoutInput = ex; handleTextLayout(); }}
                     >
                         {ex}
                     </button>
                 {/each}
             </div>
             <p class="text-[10px] text-slate-400 mt-2 italic">
                 {dict.smartHints || "Try: 'grid 4x4', 'gallery 6', 'timeline'"}
             </p>
          </div>

          <div class="grid grid-cols-2 gap-3">
              {#each Object.entries(templates) as [key, state] (key)}
                  <button
                      class="p-2 text-left bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg hover:border-indigo-500 dark:hover:border-indigo-500 transition-all group"
                      on:click={() => loadTemplate(key)}
                      aria-label={`Load template ${key.replace(/-/g, ' ')}`}
                  >
                      <div class="aspect-[4/3] bg-slate-50 dark:bg-slate-900 rounded mb-2 overflow-hidden border border-slate-100 dark:border-slate-800">
                          <TemplatePreview {state} />
                      </div>
                      <span class="text-xs font-medium text-slate-700 dark:text-slate-300 capitalize group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {key.replace(/-/g, ' ')}
                      </span>
                  </button>
              {/each}
          </div>
      </div>
  {:else if activeTab === 'history'}
      <div role="tabpanel" id="tab-panel-history" aria-labelledby="tab-history" class="space-y-6">
         <SnapshotPanel {dict} />
         <div class="h-px bg-slate-200 dark:bg-slate-700"></div>
         <HistoryPanel {dict} />
      </div>
  {/if}

  {#if showWizard}
      <WizardModal {dict} on:close={() => showWizard = false} />
  {/if}

  {#if showGallery}
      <GalleryModal {dict} on:close={() => showGallery = false} />
  {/if}
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
</style>
