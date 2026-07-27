<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Map } from '@lucide/svelte';

  export let dict: any = {};
  const dispatch = createEventDispatcher();

  const examples = [
    {
      label: 'New York Central Park (Polygon)',
      wkt: 'POLYGON ((-73.958 40.800, -73.949 40.796, -73.973 40.764, -73.981 40.768, -73.958 40.800))'
    },
    {
      label: 'Route 66 Segment (LineString)',
      wkt: 'LINESTRING (-87.629 41.878, -90.199 38.627, -95.934 36.153, -101.831 35.222)'
    },
    {
      label: 'Bermuda Triangle (Polygon)',
      wkt: 'POLYGON ((-80.19 25.76, -66.11 18.46, -64.75 32.30, -80.19 25.76))'
    },
    {
      label: 'Tokyo Tower (Point)',
      wkt: 'POINT (139.745 35.658)'
    }
  ];

  function load(ex: typeof examples[0]) {
    dispatch('load', ex.wkt);
  }
</script>

<div class="relative group z-10">
  <button class="flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-sm font-medium text-slate-700 dark:text-slate-200">
    <Map class="w-4 h-4 text-indigo-500" />
    <span>{((dict as any)?.examples as any)?.label || 'Load Example'}</span>
  </button>

  <div class="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-100 dark:border-slate-700 py-2 hidden group-hover:block">
    {#each examples as ex (ex.label)}
      <button
        class="w-full text-left px-4 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
        on:click={() => load(ex)}
      >
        {ex.label}
      </button>
    {/each}
  </div>
</div>
