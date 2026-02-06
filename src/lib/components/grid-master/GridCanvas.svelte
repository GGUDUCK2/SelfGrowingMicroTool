<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import { nanoid } from 'nanoid';
  import { fade } from 'svelte/transition';
  import { COLOR_MAP, getRandomColor } from '$lib/utils/grid-master/constants';
  import type { GridArea } from '$lib/utils/grid-master/types';
  import { getPlaceholderContent, getSemanticTag } from '$lib/utils/grid-master/placeholders';
  import AreaSettingsModal from './AreaSettingsModal.svelte';
  import { dictionaries } from '$lib/dictionaries';

  export let previewMode = false;
  export let viewMode: 'desktop' | 'mobile' = 'desktop';
  export let theme = 'standard';
  export let dict: typeof dictionaries.en.tools.gridMaster = dictionaries.en.tools.gridMaster;

  let editingAreaId: string | null = null;
  let isSettingsOpen = false;

  function openSettings(id: string) {
      editingAreaId = id;
      isSettingsOpen = true;
  }

  $: isMobileView = viewMode === 'mobile';

  function getThemeStyles(area: GridArea, theme: string) {
      if (theme === 'blueprint') {
          return `
            background-color: #1e3a8a10;
            border: 2px dashed #60a5fa;
            color: #1e3a8a;
          `;
      }
      if (theme === 'wireframe') {
          return `
            background-color: #ffffff;
            border: 2px solid #94a3b8;
            color: #000000;
          `;
      }
      if (theme === 'cyber') {
          return `
            background-color: #000000;
            border: 1px solid #00ff00;
            color: #00ff00;
            box-shadow: 0 0 5px #00ff00;
            text-shadow: 0 0 5px #00ff00;
          `;
      }
      // Standard
      return `
        background-color: ${area.color.startsWith('#') ? area.color : COLOR_MAP[area.color] || '#cbd5e1'};
        border: 1px solid rgba(0,0,0,0.05);
      `;
  }

  function getMobileAreas(areas: GridArea[], strategy: 'stack' | 'hide-sidebar' = 'stack') {
     let filtered = areas;
     if (strategy === 'hide-sidebar') {
         filtered = areas.filter(a => {
             const tag = a.tag || getSemanticTag(a);
             return tag !== 'aside' && !a.name.includes('sidebar');
         });
     }

     const sorted = [...filtered].sort((a, b) => {
        if (a.mobileOrder !== undefined && b.mobileOrder !== undefined) {
             return a.mobileOrder - b.mobileOrder;
        }
        if (a.rowStart !== b.rowStart) return a.rowStart - b.rowStart;
        return a.colStart - b.colStart;
     });
     return sorted.map(a => `"${a.name}"`).join(' ');
  }

  let isSelecting = false;
  let selectionStart = { row: -1, col: -1 };
  let selectionEnd = { row: -1, col: -1 };
  let hoveredCell = { row: -1, col: -1 };

  function handleMouseDown(r: number, c: number) {
      if (previewMode) return;
      isSelecting = true;
      selectionStart = { row: r, col: c };
      selectionEnd = { row: r, col: c };
  }

  function handleMouseOver(r: number, c: number) {
      hoveredCell = { row: r, col: c };
      if (isSelecting) {
          selectionEnd = { row: r, col: c };
      }
  }

  function handleMouseLeave() {
      hoveredCell = { row: -1, col: -1 };
  }

  function handleMouseUp() {
      if (isSelecting) {
          const rStart = Math.min(selectionStart.row, selectionEnd.row) + 1;
          const rEnd = Math.max(selectionStart.row, selectionEnd.row) + 2;
          const cStart = Math.min(selectionStart.col, selectionEnd.col) + 1;
          const cEnd = Math.max(selectionStart.col, selectionEnd.col) + 2;

          gridStore.addArea({
              id: nanoid(),
              name: `area-${$gridStore.areas.length + 1}`,
              rowStart: rStart,
              rowEnd: rEnd,
              colStart: cStart,
              colEnd: cEnd,
              color: getRandomColor()
          });

          isSelecting = false;
          selectionStart = { row: -1, col: -1 };
          selectionEnd = { row: -1, col: -1 };
      }
  }

  function handleCellKeyDown(e: KeyboardEvent, r: number, c: number) {
      if (previewMode) return;
      let nextR = r;
      let nextC = c;

      if (e.key === 'ArrowUp') nextR = Math.max(0, r - 1);
      else if (e.key === 'ArrowDown') nextR = Math.min($gridStore.rows.length - 1, r + 1);
      else if (e.key === 'ArrowLeft') nextC = Math.max(0, c - 1);
      else if (e.key === 'ArrowRight') nextC = Math.min($gridStore.cols.length - 1, c + 1);
      else return;

      e.preventDefault();
      const el = document.getElementById(`grid-cell-${nextR}-${nextC}`);
      el?.focus();
      // Also update hover state for potential drag start
      handleMouseOver(nextR, nextC);
  }

  function getSelectionStyle(start: typeof selectionStart, end: typeof selectionEnd) {
      if (start.row === -1) return 'display: none;';
      const rStart = Math.min(start.row, end.row) + 1;
      const rEnd = Math.max(start.row, end.row) + 2;
      const cStart = Math.min(start.col, end.col) + 1;
      const cEnd = Math.max(start.col, end.col) + 2;
      return `grid-area: ${rStart} / ${cStart} / ${rEnd} / ${cEnd};`;
  }
</script>

<div
  class="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-inner border touch-none select-none transition-colors duration-300
  {theme === 'cyber' ? 'bg-black border-green-900' : (theme === 'blueprint' ? 'bg-blue-50 border-blue-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800')}"
  on:mouseup={handleMouseUp}
  on:mouseleave={handleMouseLeave}
  role="presentation"
>
  <!-- View Toggle (Overlay) -->
  <div class="absolute top-4 left-4 z-40 bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700 flex p-1 gap-1">
      <button
          class="px-2 py-1 text-xs font-bold rounded {viewMode === 'desktop' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}"
          on:click={() => viewMode = 'desktop'}
      >
          {dict.desktop || 'Desktop'}
      </button>
      <button
          class="px-2 py-1 text-xs font-bold rounded {viewMode === 'mobile' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}"
          on:click={() => { viewMode = 'mobile'; if (!$gridStore.includeMobile) gridStore.toggleMobile(); }}
      >
          {dict.mobile || 'Mobile'}
      </button>
  </div>

  <!-- The Grid Container -->
  <div
    class="absolute inset-4 grid"
    role="grid"
    tabindex="-1"
    style={isMobileView ? `
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      gap: ${$gridStore.gap};
      row-gap: ${$gridStore.rowGap};
      column-gap: ${$gridStore.colGap};
      justify-items: stretch;
      align-items: stretch;
      justify-content: start;
      align-content: start;
      grid-template-areas: ${getMobileAreas($gridStore.areas, $gridStore.mobileStrategy)};
      overflow-y: auto;
      display: grid;
      align-content: start;
    ` : `
      grid-template-rows: ${$gridStore.rows.join(' ')};
      grid-template-columns: ${$gridStore.cols.join(' ')};
      gap: ${$gridStore.gap};
      row-gap: ${$gridStore.rowGap};
      column-gap: ${$gridStore.colGap};
      justify-items: ${$gridStore.justifyItems};
      align-items: ${$gridStore.alignItems};
      justify-content: ${$gridStore.justifyContent};
      align-content: ${$gridStore.alignContent};
    `}
  >
      <!-- Background Grid Lines/Cells (for interaction) -->
      {#if !previewMode && !isMobileView}
          <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
          {#each $gridStore.rows as _row, r (r)}
              <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
              {#each $gridStore.cols as _col, c (c)}
                  <button
                      id={`grid-cell-${r}-${c}`}
                      role="gridcell"
                      class="border border-dashed transition-colors z-10
                      {theme === 'cyber' ? 'border-green-900/30 hover:bg-green-900/20' :
                       (theme === 'blueprint' ? 'border-blue-200 hover:bg-blue-100' :
                       'border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10')}"
                      on:mousedown={() => handleMouseDown(r, c)}
                      on:mouseover={() => handleMouseOver(r, c)}
                      on:focus={() => handleMouseOver(r, c)}
                      on:keydown={(e) => handleCellKeyDown(e, r, c)}
                      aria-label={`Cell ${r+1}, ${c+1}`}
                  ></button>
              {/each}
          {/each}
      {/if}

      <!-- Rendered Areas -->
      {#each $gridStore.areas as area (area.id)}
          <!-- Hide sidebars in mobile mode if strategy is hide-sidebar -->
          {#if isMobileView && $gridStore.mobileStrategy === 'hide-sidebar' && (area.tag === 'aside' || getSemanticTag(area) === 'aside' || area.name.includes('sidebar'))}
              <!-- Hidden Area -->
          {:else if previewMode}
              <svelte:element
                this={getSemanticTag(area)}
                class="z-20 p-4 shadow-sm rounded relative overflow-hidden transition-all {theme === 'cyber' ? 'font-mono text-green-400' : 'text-slate-800 dark:text-white'}"
                style="
                  grid-area: {area.name};
                  {getThemeStyles(area, theme)}
                "
                transition:fade
              >
                 <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                 {@html getPlaceholderContent(area)}
              </svelte:element>
          {:else}
              <div
                class="z-20 flex flex-col items-center justify-center font-bold shadow-sm rounded relative group overflow-hidden transition-all {theme === 'cyber' ? 'font-mono' : ''}"
                style="
                  grid-area: {area.name};
                  {getThemeStyles(area, theme)}
                "
                transition:fade
              >
                   <span class="relative z-10 pointer-events-none {theme === 'standard' ? 'mix-blend-multiply dark:mix-blend-normal' : ''}">{area.name}</span>

                   {#if area.tag && area.tag !== 'div'}
                       <span class="absolute bottom-1 left-2 text-[10px] opacity-50 pointer-events-none font-mono {theme === 'standard' ? 'mix-blend-multiply dark:mix-blend-normal' : ''}">&lt;{area.tag}&gt;</span>
                   {/if}

                   <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                       {#if isMobileView}
                           <button
                             class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                             on:click|stopPropagation={() => gridStore.reorderMobile(area.id, 'up')}
                             title={dict.moveUp || "Move Up"}
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                           </button>
                           <button
                             class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                             on:click|stopPropagation={() => gridStore.reorderMobile(area.id, 'down')}
                             title={dict.moveDown || "Move Down"}
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                           </button>
                       {/if}
                       <button
                         class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                         on:click|stopPropagation={() => openSettings(area.id)}
                         title={dict.settings || "Settings"}
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                       </button>
                       <button
                         class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm text-red-500"
                         on:click|stopPropagation={() => gridStore.removeArea(area.id)}
                         aria-label="Remove Area"
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                       </button>
                   </div>
              </div>
          {/if}
      {/each}

      <!-- Selection Overlay -->
      {#if isSelecting}
          <div
             class="z-30 bg-indigo-500/30 border-2 border-indigo-500 rounded pointer-events-none"
             style={getSelectionStyle(selectionStart, selectionEnd)}
          ></div>
      {/if}

      <!-- Interactive Tooltip -->
      {#if !isMobileView && !previewMode && hoveredCell.row !== -1}
          <div
              class="absolute z-50 pointer-events-none px-2 py-1 bg-slate-800 text-white text-[10px] rounded shadow-lg whitespace-nowrap border border-slate-700"
              style="
                  grid-area: {hoveredCell.row + 1} / {hoveredCell.col + 1} / {hoveredCell.row + 2} / {hoveredCell.col + 2};
                  justify-self: center;
                  align-self: end;
                  margin-bottom: 4px;
              "
              transition:fade={{ duration: 100 }}
          >
              <span class="opacity-60">R{hoveredCell.row + 1}:</span> <span class="font-bold">{$gridStore.rows[hoveredCell.row]}</span>
              <span class="opacity-30 mx-1">|</span>
              <span class="opacity-60">C{hoveredCell.col + 1}:</span> <span class="font-bold">{$gridStore.cols[hoveredCell.col]}</span>
          </div>
      {/if}
  </div>

  <AreaSettingsModal bind:isOpen={isSettingsOpen} areaId={editingAreaId} {dict} />
</div>
