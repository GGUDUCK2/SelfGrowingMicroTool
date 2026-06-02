<script lang="ts">
  import { db, type ScreenForgeHistory } from '$lib/db';
  import { liveQuery } from 'dexie';
  import { Play, Trash2, Download, Calendar, Clock, Film } from '@lucide/svelte';

  export let t: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  export let onPlay: (blob: Blob) => void;

  let history$ = liveQuery(() => db.screenForgeHistory.orderBy('createdAt').reverse().toArray());

  function formatSize(bytes: number) {
      if (bytes === 0) return '0 B';
      const k = 1024;
      const sizes = ['B', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function formatDuration(sec: number) {
      if (!sec) return '00:00';
      const m = Math.floor(sec / 60).toString().padStart(2, '0');
      const s = Math.floor(sec % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
  }

  function download(item: ScreenForgeHistory) {
      const url = URL.createObjectURL(item.blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.name}.webm`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  async function remove(id: number) {
      if (confirm('Delete this recording?')) {
          await db.screenForgeHistory.delete(id);
      }
  }
</script>

<div class="space-y-6">
    <h3 class="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Film class="text-indigo-500" />
        {t.history}
    </h3>

    {#if $history$}
        {#if $history$.length === 0}
            <div class="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800">
                <p class="text-slate-500">{t.noHistory}</p>
            </div>
        {:else}
            <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {#each $history$ as item (item.id)}
                    <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow group">
                        <div class="flex items-start justify-between mb-2">
                            <h4 class="font-medium text-slate-900 dark:text-white truncate pr-2" title={item.name}>{item.name}</h4>
                            <button class="min-h-[44px] min-w-[44px] text-slate-400 hover:text-red-500 transition-colors p-1 opacity-0 group-hover:opacity-100 focus:opacity-100"
                                on:click={() => remove(item.id!)}
                                title={t.delete}
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div class="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mb-4">
                            <span class="flex items-center gap-1">
                                <Clock size={12} />
                                {formatDuration(item.duration)}
                            </span>
                            <span class="flex items-center gap-1">
                                <Calendar size={12} />
                                {item.createdAt.toLocaleDateString()}
                            </span>
                            <span class="bg-slate-100 dark:bg-slate-700 px-1.5 py-0.5 rounded text-[10px] font-mono">
                                {formatSize(item.size)}
                            </span>
                        </div>

                        <div class="flex gap-2">
                            <button class="min-h-[44px] min-w-[44px] flex-1 flex items-center justify-center gap-2 py-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 text-sm font-medium transition-colors"
                                on:click={() => onPlay(item.blob)}
                            >
                                <Play size={14} />
                                {t.play}
                            </button>
                             <button class="min-h-[44px] min-w-[44px] p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                on:click={() => download(item)}
                                title={t.download}
                            >
                                <Download size={14} />
                            </button>
                        </div>
                    </div>
                {/each}
            </div>
        {/if}
    {:else}
        <div class="animate-pulse space-y-4">
             <div class="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
             <div class="h-24 bg-slate-100 dark:bg-slate-800 rounded-xl"></div>
        </div>
    {/if}
</div>
