<script lang="ts">
  import { gridStore, snapshotStore, type Snapshot } from '$lib/utils/grid-master/store';
  import { Camera, Trash2, RotateCcw } from '@lucide/svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let dict: GridMasterDictionary;

  function capture() {
      snapshotStore.add(
          `Snapshot ${$snapshotStore.length + 1}`,
          $gridStore
      );
  }

  function restore(snap: Snapshot) {
      if (confirm(dict.restoreConfirm || 'Restore this snapshot? Current work will be replaced.')) {
          gridStore.load(snap.state);
      }
  }

  function remove(id: string) {
      snapshotStore.delete(id);
  }

  function formatTime(ts: number) {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }
</script>

<div class="space-y-4">
    <div class="flex items-center justify-between">
        <h3 class="font-bold text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider">{dict.snapshots || 'Snapshots'}</h3>
        <button
          class="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded text-xs font-medium hover:bg-indigo-700 transition-colors shadow-sm"
          on:click={capture}
          aria-label={dict.capture || 'Capture'}
        >
            <Camera size={14} />
            {dict.capture || 'Capture'}
        </button>
    </div>

    <div class="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
        {#each $snapshotStore as snap (snap.id)}
            <div class="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-sm flex items-center justify-between group">
                <div class="flex flex-col min-w-0">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-200 truncate w-32">
                        {snap.name}
                    </span>
                    <span class="text-[10px] text-slate-400">
                        {formatTime(snap.timestamp)} • {snap.state.areas.length} Areas
                    </span>
                </div>
                <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      on:click={() => restore(snap)}
                      title={dict.restore || 'Restore'}
                      aria-label={dict.restore || 'Restore'}
                    >
                        <RotateCcw size={14} />
                    </button>
                    <button
                      class="p-1.5 text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded"
                      on:click={() => remove(snap.id)}
                      title={dict.delete || 'Delete'}
                      aria-label={dict.delete || 'Delete'}
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        {/each}

        {#if $snapshotStore.length === 0}
            <div class="text-center py-8 text-slate-400 text-xs italic">
                {dict.noSnapshots || 'No snapshots captured yet.'}
            </div>
        {/if}
    </div>
</div>
