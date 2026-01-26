<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import { nanoid } from 'nanoid';
  import { fade } from 'svelte/transition';

  export let previewMode = false;

  let isSelecting = false;
  let selectionStart = { row: -1, col: -1 };
  let selectionEnd = { row: -1, col: -1 };

  // Tailwind color names for generating code later
  const colorNames = [
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
    'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'
  ];

  function getRandomColor() {
      const idx = Math.floor(Math.random() * colorNames.length);
      // Store the name for codegen, but we need to render hex here
      // Wait, codegen needs the name? Or we just export hex.
      // Codegen uses `bg-${area.color}-500`. So I should store the name in the store.
      // But for rendering here, I need to map name to hex if I don't trust dynamic classes.
      return colorNames[idx];
  }

  const colorMap: Record<string, string> = {
    red: '#f87171', orange: '#fb923c', amber: '#fbbf24', yellow: '#facc15',
    lime: '#a3e635', green: '#4ade80', emerald: '#34d399', teal: '#2dd4bf',
    sky: '#38bdf8', blue: '#60a5fa', indigo: '#818cf8', violet: '#a78bfa',
    purple: '#c084fc', fuchsia: '#e879f9', pink: '#f472b6', rose: '#fb7185'
  };

  function handleMouseDown(r: number, c: number) {
      if (previewMode) return;
      isSelecting = true;
      selectionStart = { row: r, col: c };
      selectionEnd = { row: r, col: c };
  }

  function handleMouseOver(r: number, c: number) {
      if (isSelecting) {
          selectionEnd = { row: r, col: c };
      }
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

  function getSelectionStyle(start: typeof selectionStart, end: typeof selectionEnd) {
      if (start.row === -1) return 'display: none;';
      const rStart = Math.min(start.row, end.row) + 1;
      const rEnd = Math.max(start.row, end.row) + 2;
      const cStart = Math.min(start.col, end.col) + 1;
      const cEnd = Math.max(start.col, end.col) + 2;
      return `grid-area: ${rStart} / ${cStart} / ${rEnd} / ${cEnd};`;
  }

  function escapeHtml(text: string) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

  function getSemanticTag(name: string) {
      const n = name.toLowerCase();
      if (n.includes('head')) return 'header';
      if (n.includes('foot')) return 'footer';
      if (n.includes('side') || n.includes('nav') || n.includes('menu')) return 'aside';
      if (n.includes('main') || n.includes('content')) return 'main';
      if (n.includes('sect')) return 'section';
      if (n.includes('art')) return 'article';
      return 'div';
  }

  function getPlaceholderContent(name: string) {
      const tag = getSemanticTag(name);
      const n = name.toLowerCase();

      if (tag === 'header') return `
        <div class="flex items-center justify-between h-full px-4">
            <h2 class="text-xl font-bold tracking-tight">Brand</h2>
            <nav class="hidden sm:flex gap-4 text-sm font-medium opacity-80">
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
            </nav>
        </div>`;

      if (tag === 'footer') return `
        <div class="flex flex-col items-center justify-center h-full text-center gap-2 p-2">
             <p class="text-sm font-medium">© 2024 Company Name</p>
             <div class="flex gap-2 text-xs opacity-60">
                 <span>Privacy</span> &bull; <span>Terms</span>
             </div>
        </div>`;

      if (tag === 'aside') return `
        <nav class="flex flex-col gap-3 h-full p-2">
            <div class="h-8 w-3/4 bg-black/10 dark:bg-white/10 rounded"></div>
            <div class="h-px bg-black/5 dark:bg-white/5 my-2"></div>
            <div class="flex flex-col gap-2 opacity-70">
                <div class="h-2 w-2/3 bg-current rounded"></div>
                <div class="h-2 w-1/2 bg-current rounded"></div>
                <div class="h-2 w-3/4 bg-current rounded"></div>
                <div class="h-2 w-4/5 bg-current rounded"></div>
            </div>
            <div class="mt-auto p-3 bg-black/5 dark:bg-white/5 rounded text-xs text-center opacity-75">
                Ads / Promo
            </div>
        </nav>`;

      if (n.includes('hero')) return `
        <div class="flex flex-col items-center justify-center h-full text-center p-4">
             <h1 class="text-2xl sm:text-3xl font-extrabold mb-2">Hero Title</h1>
             <p class="text-sm sm:text-base opacity-80 max-w-[90%]">This is a hero section subtitle highlighting the main value proposition.</p>
             <button class="mt-4 px-4 py-2 bg-black/10 dark:bg-white/20 rounded-lg text-xs sm:text-sm font-bold border border-current">Call to Action</button>
        </div>`;

      if (n.includes('img') || n.includes('pic') || n.includes('photo') || n.includes('gallery')) return `
         <div class="w-full h-full flex items-center justify-center bg-black/5 dark:bg-white/5 relative overflow-hidden group">
             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-30 group-hover:scale-110 transition-transform"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
         </div>
      `;

      return `
        <article class="h-full flex flex-col p-2">
            <h3 class="font-bold text-lg capitalize mb-2">${escapeHtml(name)}</h3>
            <div class="flex-1 text-sm opacity-80 leading-relaxed overflow-hidden text-ellipsis">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <div class="h-2"></div>
                <p class="hidden sm:block">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            </div>
        </article>`;
  }
</script>

<div
  class="relative w-full h-full min-h-[400px] bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-inner border border-slate-200 dark:border-slate-800 touch-none select-none"
  on:mouseup={handleMouseUp}
  role="presentation"
>
  <!-- The Grid Container -->
  <div
    class="absolute inset-4 grid"
    style="
      grid-template-rows: {$gridStore.rows.join(' ')};
      grid-template-columns: {$gridStore.cols.join(' ')};
      gap: {$gridStore.gap};
      row-gap: {$gridStore.rowGap};
      column-gap: {$gridStore.colGap};
    "
  >
      <!-- Background Grid Lines/Cells (for interaction) -->
      {#if !previewMode}
          {#each $gridStore.rows as _, r (r)}
              {#each $gridStore.cols as __, c (c)}
                  <button
                      class="border border-dashed border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10 transition-colors z-10"
                      on:mousedown={() => handleMouseDown(r, c)}
                      on:mouseover={() => handleMouseOver(r, c)}
                      on:focus={() => handleMouseOver(r, c)}
                      aria-label={`Cell ${r+1}, ${c+1}`}
                  ></button>
              {/each}
          {/each}
      {/if}

      <!-- Rendered Areas -->
      {#each $gridStore.areas as area (area.id)}
          {#if previewMode}
              <svelte:element
                this={getSemanticTag(area.name)}
                class="z-20 p-4 text-slate-800 dark:text-white shadow-sm border border-black/5 dark:border-white/5 rounded relative overflow-hidden"
                style="
                  grid-area: {area.rowStart} / {area.colStart} / {area.rowEnd} / {area.colEnd};
                  background-color: {area.color.startsWith('#') ? area.color : colorMap[area.color] || '#cbd5e1'};
                "
                transition:fade
              >
                 <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                 {@html getPlaceholderContent(area.name)}
              </svelte:element>
          {:else}
              <div
                class="z-20 flex items-center justify-center font-bold text-slate-800 dark:text-white shadow-sm border border-black/5 dark:border-white/5 rounded relative group overflow-hidden"
                style="
                  grid-area: {area.rowStart} / {area.colStart} / {area.rowEnd} / {area.colEnd};
                  background-color: {area.color.startsWith('#') ? area.color : colorMap[area.color] || '#cbd5e1'};
                "
                transition:fade
              >
                   <span class="relative z-10 pointer-events-none mix-blend-multiply dark:mix-blend-normal">{area.name}</span>

                   <button
                     class="absolute top-1 right-1 p-1 bg-white/80 hover:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-30"
                     on:click|stopPropagation={() => gridStore.removeArea(area.id)}
                     aria-label="Remove Area"
                   >
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-red-500"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                   </button>
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
  </div>
</div>
