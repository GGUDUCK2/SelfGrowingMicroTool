<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { X, Download, Copy, Check } from '@lucide/svelte';
  import { fade, fly } from 'svelte/transition';
  import { toWKT, toCSV, toKML, toGPX } from '$lib/utils/geo-forge';
  import type { GeoJSON } from '$lib/utils/geo-forge/types';

  export let data: GeoJSON | null;
  export let name: string = 'geoforge';
  export let initialFormat: 'wkt' | 'geojson' | 'csv' = 'wkt';

  const dispatch = createEventDispatcher();

  let format = initialFormat;
  let prettyPrint = true;
  let copied = false;

  $: content = generateContent(format, prettyPrint, data);

  function generateContent(fmt: string, pretty: boolean, geo: GeoJSON | null): string {
      if (!geo) return '';
      try {
          if (fmt === 'wkt') return toWKT(geo);
          if (fmt === 'csv') return toCSV(geo);
          if (fmt === 'kml') return toKML(geo);
          if (fmt === 'gpx') return toGPX(geo);
          if (fmt === 'geojson') return JSON.stringify(geo, null, pretty ? 2 : 0);
      } catch (e) {
          return 'Error generating content: ' + e;
      }
      return '';
  }

  function handleCopy() {
      navigator.clipboard.writeText(content);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }

  function handleDownload() {
      const extMap: Record<string, string> = {
          wkt: 'txt', csv: 'csv', kml: 'kml', gpx: 'gpx', geojson: 'json'
      };
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${name}.${extMap[format] || 'txt'}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      dispatch('close');
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
    <button class="absolute inset-0 bg-black/50 backdrop-blur-sm cursor-default" on:click={() => dispatch('close')} on:keydown={(e) => e.key === 'Escape' && dispatch('close')} transition:fade aria-label="Close modal"></button>
    <div class="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 z-10" transition:fly={{y: 20}}>
        <div class="flex justify-between items-center mb-6">
            <h2 class="text-xl font-bold text-slate-800 dark:text-white">Export Geometry</h2>
            <button class="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full" on:click={() => dispatch('close')}>
                <X class="w-5 h-5" />
            </button>
        </div>

        <div class="space-y-4">
            <div role="group" aria-labelledby="formatLabel">
                <p id="formatLabel" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Format</p>
                <div class="grid grid-cols-3 gap-2">
                    {#each ['wkt', 'geojson', 'csv', 'kml', 'gpx'] as fmt}
                        <button
                            class="px-3 py-2 rounded-lg text-sm font-medium border transition-colors {format === fmt ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'}"
                            on:click={() => format = fmt}
                        >
                            {fmt.toUpperCase()}
                        </button>
                    {/each}
                </div>
            </div>

            {#if format === 'geojson'}
                <div class="flex items-center gap-2">
                    <input type="checkbox" id="pretty" bind:checked={prettyPrint} class="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500">
                    <label for="pretty" class="text-sm text-slate-700 dark:text-slate-300">Pretty Print (Indented)</label>
                </div>
            {/if}

            <div class="relative">
                <textarea
                    readonly
                    class="w-full h-40 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-xs resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    value={content}
                ></textarea>
                <div class="absolute top-2 right-2">
                     <button
                        class="p-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md shadow-sm text-slate-500 hover:text-indigo-600 transition-colors"
                        on:click={handleCopy}
                        title="Copy to clipboard"
                     >
                        {#if copied}
                            <Check class="w-4 h-4 text-green-500" />
                        {:else}
                            <Copy class="w-4 h-4" />
                        {/if}
                     </button>
                </div>
            </div>

            <div class="flex gap-3 pt-2">
                <button class="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl font-medium transition-colors" on:click={() => dispatch('close')}>
                    Cancel
                </button>
                <button class="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-lg shadow-indigo-200 dark:shadow-none flex items-center justify-center gap-2 transition-colors" on:click={handleDownload}>
                    <Download class="w-4 h-4" />
                    Download File
                </button>
            </div>
        </div>
    </div>
</div>
