<script lang="ts">
  import { calculateArea, calculateLength, getCentroid } from '$lib/utils/geo-forge';
  import type { GeoJSON } from '$lib/utils/geo-forge';
  import { Ruler, BoxSelect, MapPin, Hash } from 'lucide-svelte';

  export let geo: GeoJSON | null = null;
  export let dict: any;
  export let columns = 2;

  $: area = geo ? calculateArea(geo) : 0;
  $: length = geo ? calculateLength(geo) : 0;
  $: center = geo ? getCentroid(geo) : [0, 0];

  function formatMetric(val: number): string {
    if (val > 1000000) return `${(val / 1000000).toFixed(2)} km²`;
    if (val > 10000) return `${(val / 10000).toFixed(2)} ha`;
    return `${val.toFixed(2)} m²`;
  }

  function formatDist(val: number): string {
    if (val > 1000) return `${(val / 1000).toFixed(2)} km`;
    return `${val.toFixed(2)} m`;
  }

  function formatCoord(val: number): string {
    return val.toFixed(5);
  }
</script>

<div class="grid gap-4 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700" style="grid-template-columns: repeat({columns}, minmax(0, 1fr));">
  <div class="flex items-start gap-3">
    <div class="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
      <BoxSelect class="w-5 h-5" />
    </div>
    <div>
      <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">{dict?.area || 'Area'}</div>
      <div class="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{formatMetric(area)}</div>
    </div>
  </div>

  <div class="flex items-start gap-3">
    <div class="p-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
      <Ruler class="w-5 h-5" />
    </div>
    <div>
      <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">{dict?.length || 'Length'}</div>
      <div class="text-lg font-bold text-slate-900 dark:text-white tabular-nums">{formatDist(length)}</div>
    </div>
  </div>

  <div class="flex items-start gap-3">
    <div class="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
      <MapPin class="w-5 h-5" />
    </div>
    <div>
      <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">{dict?.center || 'Center'}</div>
      <div class="text-sm font-bold text-slate-900 dark:text-white tabular-nums">
        {formatCoord(center[1])}, {formatCoord(center[0])}
      </div>
    </div>
  </div>

  <div class="flex items-start gap-3">
    <div class="p-2 bg-purple-50 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
      <Hash class="w-5 h-5" />
    </div>
    <div>
      <div class="text-xs font-medium text-slate-500 uppercase tracking-wider">{dict?.type || 'Type'}</div>
      <div class="text-lg font-bold text-slate-900 dark:text-white truncate">
        {geo?.type || '-'}
      </div>
    </div>
  </div>
</div>
