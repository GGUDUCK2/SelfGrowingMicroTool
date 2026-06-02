<script lang="ts">
  import { onMount } from 'svelte';
  import { Monitor, Smartphone, Cpu, Wifi } from '@lucide/svelte';

  export let dict: any;

  let info: any[] = [];

  onMount(() => {
    function update() {
        const nav: any = navigator;

        info = [
            {
                label: dict.screen.resolution,
                value: `${window.screen.width} x ${window.screen.height}`,
                icon: Monitor,
                color: 'text-indigo-500'
            },
            {
                label: dict.screen.viewport,
                value: `${window.innerWidth} x ${window.innerHeight}`,
                icon: Smartphone, // Approximating viewport concept
                color: 'text-purple-500'
            },
            {
                label: dict.screen.pixelRatio,
                value: window.devicePixelRatio.toFixed(2),
                sub: `1 logical px = ${window.devicePixelRatio} physical px`,
                icon: Monitor,
                color: 'text-blue-500'
            },
            {
                label: dict.screen.colorDepth,
                value: `${window.screen.colorDepth}-bit`,
                icon: Monitor,
                color: 'text-green-500'
            },
            {
                label: dict.screen.cores,
                value: nav.hardwareConcurrency || 'Unknown',
                icon: Cpu,
                color: 'text-orange-500'
            },
            {
                label: dict.screen.memory,
                value: nav.deviceMemory ? `~${nav.deviceMemory} GB` : 'Unknown',
                icon: Cpu,
                color: 'text-red-500'
            },
            {
                label: dict.screen.online,
                value: nav.onLine ? 'Online' : 'Offline',
                icon: Wifi,
                color: nav.onLine ? 'text-green-500' : 'text-slate-500'
            },
            {
                label: dict.screen.language,
                value: nav.language,
                icon: Smartphone,
                color: 'text-slate-500'
            }
        ];
    }

    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  });
</script>

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each info as item}
        <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-start space-x-4">
             <div class="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl {item.color}">
                 <svelte:component this={item.icon} size={24} />
             </div>
             <div>
                 <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wide">{item.label}</h4>
                 <div class="text-xl font-bold text-slate-900 dark:text-white mt-1">{item.value}</div>
                 {#if item.sub}
                    <div class="text-xs text-slate-400 mt-1">{item.sub}</div>
                 {/if}
             </div>
        </div>
    {/each}

    <div class="col-span-1 md:col-span-2 lg:col-span-3 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
         <h4 class="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">{dict.screen.userAgent}</h4>
         <code class="text-sm text-slate-700 dark:text-slate-300 font-mono bg-slate-50 dark:bg-slate-800 p-4 rounded-lg block break-all">
             {typeof navigator !== 'undefined' ? navigator.userAgent : ''}
         </code>
    </div>
</div>
