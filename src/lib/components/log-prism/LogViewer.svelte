<script lang="ts">
  import type { LogEntry } from '$lib/utils/log-prism/types';
  import type { LogCluster } from '$lib/utils/log-prism/clustering';
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  export let entries: LogEntry[] = [];
  export let clusteredEntries: LogCluster[] = [];
  export let viewMode: 'list' | 'cluster' = 'list';
  export let selectedId: string | null = null;
  export let dict: any;

  const dispatch = createEventDispatcher();
  let limit = 100;
  let observer: IntersectionObserver;
  let sentinel: HTMLDivElement;

  $: visibleEntries = entries.slice(0, limit);

  $: if (entries) {
      // Reset limit when filter changes (entries array ref changes)
      // Actually we should detect if entries *content* changed dramatically, but array ref change is good proxy
      // We will rely on parent to pass new array on filter
  }

  onMount(() => {
      observer = new IntersectionObserver((entries) => {
          if (entries[0].isIntersecting) {
              limit += 100;
          }
      }, { rootMargin: '200px' });

      if (sentinel) observer.observe(sentinel);

      return () => observer.disconnect();
  });

  function getLevelClass(level: string) {
      switch(level) {
          case 'error': return 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/10 border-l-4 border-red-500';
          case 'warn': return 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10 border-l-4 border-amber-500';
          case 'info': return 'text-blue-600 dark:text-blue-400 border-l-4 border-blue-500';
          case 'debug': return 'text-slate-500 dark:text-slate-400 border-l-4 border-slate-300 dark:border-slate-700';
          default: return 'text-slate-600 dark:text-slate-300 border-l-4 border-transparent';
      }
  }

  function formatTime(d: Date | null) {
      if (!d) return '--:--:--';
      return d.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
  }
</script>

<div class="flex-1 overflow-y-auto bg-white dark:bg-slate-900 font-mono text-xs sm:text-sm">
    {#if viewMode === 'list'}
        {#if entries.length === 0}
            <div class="p-8 text-center text-slate-400 italic">
                {dict.guide.intro}
            </div>
        {:else}
            {#each visibleEntries as entry (entry.id)}
                <div
                    class="p-2 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors flex gap-2 sm:gap-4 items-start {getLevelClass(entry.level)} {selectedId === entry.id ? 'bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-inset ring-indigo-500' : ''}"
                    on:click={() => dispatch('select', entry)}
                    on:keydown={(e) => e.key === 'Enter' && dispatch('select', entry)}
                    role="button"
                    tabindex="0"
                >
                    <div class="w-24 shrink-0 text-slate-400 tabular-nums select-none">
                        {formatTime(entry.timestamp)}
                    </div>
                    <div class="w-12 shrink-0 font-bold uppercase text-[10px] sm:text-xs pt-0.5">
                        {entry.level}
                    </div>
                    <div class="flex-1 break-all line-clamp-2">
                        {entry.message}
                    </div>
                </div>
            {/each}
            <div bind:this={sentinel} class="h-4 w-full"></div>

            <div class="p-2 text-center text-slate-400 text-xs border-t border-slate-100 dark:border-slate-800">
                Showing {Math.min(limit, entries.length)} / {entries.length} entries
            </div>
        {/if}
    {:else}
        {#if clusteredEntries.length === 0}
            <div class="p-8 text-center text-slate-400 italic">No patterns found.</div>
        {:else}
            {#each clusteredEntries as cluster (cluster.id)}
                 <div class="p-3 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex gap-3 items-start group">
                    <div class="shrink-0 pt-0.5">
                       <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase
                          {cluster.level === 'error' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                           cluster.level === 'warn' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                           'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'}">
                           {cluster.level}
                       </span>
                    </div>
                    <div class="shrink-0 pt-0.5">
                        <span class="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold">
                            {cluster.count}x
                        </span>
                    </div>
                    <div class="flex-1 break-all text-slate-700 dark:text-slate-300">
                        {cluster.signature}
                    </div>
                 </div>
            {/each}
        {/if}
    {/if}
</div>
