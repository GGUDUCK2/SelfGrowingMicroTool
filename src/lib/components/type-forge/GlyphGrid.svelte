<script lang="ts">
  import type { LoadedFont } from '$lib/utils/type-forge/types';
  import { onMount } from 'svelte';

  export let font: LoadedFont;
  export let dict: any;

  let glyphs: { index: number; name: string; unicode: number }[] = [];
  let searchQuery = '';
  let currentPage = 0;
  const pageSize = 200;

  onMount(() => {
      loadGlyphs();
  });

  function loadGlyphs() {
      // opentype.js Font object
      const numGlyphs = font.font.numGlyphs;
      const list = [];
      for (let i = 0; i < numGlyphs; i++) {
          const glyph = font.font.glyphs.get(i);
          list.push({
              index: i,
              name: glyph.name || '',
              unicode: glyph.unicode
          });
      }
      glyphs = list;
  }

  // Filter
  $: filteredGlyphs = glyphs.filter(g => {
      if (!searchQuery) return true;
      const q = searchQuery.toLowerCase();
      return g.name.toLowerCase().includes(q) || (g.unicode && g.unicode.toString(16).includes(q));
  });

  $: paginatedGlyphs = filteredGlyphs.slice(0, (currentPage + 1) * pageSize);

  function loadMore() {
      if (paginatedGlyphs.length < filteredGlyphs.length) {
          currentPage++;
      }
  }

  // Infinite scroll trigger
  let sentinel: HTMLDivElement;
  onMount(() => {
      const observer = new IntersectionObserver((entries) => {
          if(entries[0].isIntersecting) loadMore();
      }, { rootMargin: '200px' });

      if(sentinel) observer.observe(sentinel);
      return () => observer.disconnect();
  });
</script>

<div class="space-y-4">
  <div class="flex items-center justify-between">
      <h3 class="font-bold text-lg text-slate-800 dark:text-white">{dict.glyphs.title}</h3>
      <div class="flex items-center gap-4">
          <span class="text-xs text-slate-500">{filteredGlyphs.length} {dict.glyphs.total}</span>
          <input
              type="text"
              placeholder={dict.glyphs.search}
              bind:value={searchQuery}
              class="bg-slate-100 dark:bg-slate-700 border-none rounded-lg px-3 py-1.5 text-sm w-48 focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
      </div>
  </div>

  <div class="grid grid-cols-[repeat(auto-fill,minmax(60px,1fr))] gap-2 p-4 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 max-h-[500px] overflow-y-auto">
      {#each paginatedGlyphs as glyph (glyph.index)}
          <div
              class="aspect-square bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center hover:border-indigo-500 transition-colors group relative"
              title={`${glyph.name} (U+${glyph.unicode?.toString(16).toUpperCase() || '?'})`}
          >
              <span
                  class="text-2xl text-slate-900 dark:text-white"
                  style={`font-family: '${font.meta.family}';`}
              >
                  {#if glyph.unicode}
                      {String.fromCharCode(glyph.unicode)}
                  {:else}
                      <span class="text-[10px] text-slate-300">?</span>
                  {/if}
              </span>
              <span class="absolute bottom-1 right-1 text-[8px] text-slate-400 opacity-0 group-hover:opacity-100 font-mono">
                  {glyph.index}
              </span>
          </div>
      {/each}
      <div bind:this={sentinel} class="h-4 w-full"></div>
  </div>
</div>
