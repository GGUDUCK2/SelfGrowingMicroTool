<script lang="ts">
  import type { GridState } from '$lib/utils/grid-master/types';

  export let state: GridState;

  const colorMap: Record<string, string> = {
    red: '#f87171', orange: '#fb923c', amber: '#fbbf24', yellow: '#facc15',
    lime: '#a3e635', green: '#4ade80', emerald: '#34d399', teal: '#2dd4bf',
    sky: '#38bdf8', blue: '#60a5fa', indigo: '#818cf8', violet: '#a78bfa',
    purple: '#c084fc', fuchsia: '#e879f9', pink: '#f472b6', rose: '#fb7185',
    slate: '#94a3b8', zinc: '#a1a1aa'
  };
</script>

<div
  class="grid w-full h-full pointer-events-none"
  style="
    grid-template-rows: {state.rows.join(' ')};
    grid-template-columns: {state.cols.join(' ')};
    gap: {state.gap};
    row-gap: {state.rowGap};
    column-gap: {state.colGap};
  "
>
  {#each state.areas as area (area.id)}
      <div
        class="rounded-sm opacity-80 border border-black/5 dark:border-white/5"
        style="
          grid-area: {area.rowStart} / {area.colStart} / {area.rowEnd} / {area.colEnd};
          background-color: {area.color.startsWith('#') ? area.color : colorMap[area.color] || '#cbd5e1'};
        "
      ></div>
  {/each}

  <!-- Render cells to show structure if no areas -->
  {#if state.areas.length === 0}
      <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
      {#each state.rows as _row, r (r)}
          <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
          {#each state.cols as _col, c (c)}
              <div class="border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50"></div>
          {/each}
      {/each}
  {/if}
</div>
