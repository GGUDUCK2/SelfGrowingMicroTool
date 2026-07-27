<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type MotionMasterHistory } from '$lib/db';
  import { animationStore } from '$lib/utils/motion-master/store';
  import { Trash2, Star, Clock, X } from '@lucide/svelte';

  export let dict: any;
  export let onClose: () => void;

  let history$ = liveQuery(() => db.motionMasterHistory.orderBy('createdAt').reverse().toArray());

  function loadItem(item: MotionMasterHistory) {
      if (item.state) {
          $animationStore = JSON.parse(JSON.stringify(item.state)); // Deep copy
          onClose();
      }
  }

  function deleteItem(id: number) {
      db.motionMasterHistory.delete(id);
  }

  function toggleStar(item: MotionMasterHistory) {
      db.motionMasterHistory.update(item.id!, { starred: item.starred ? 0 : 1 });
  }
</script>

<div class="h-full flex flex-col bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 w-full md:w-80">
    <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <h2 class="font-bold text-lg text-slate-800 dark:text-white">{(dict as any)?.history ?? 'History'}</h2>
        <button on:click={onClose} class="md:hidden text-slate-500">
             <span class="sr-only">Close</span>
             <X class="w-6 h-6" />
        </button>
    </div>

    <div class="flex-1 overflow-y-auto p-2 space-y-2">
        {#if $history$?.length === 0}
            <div class="text-center py-10 text-slate-400">
                <p>{(dict as any)?.noHistory ?? 'No animations saved yet.'}</p>
            </div>
        {/if}

        {#each $history$ || [] as item (item.id)}
            <div class="bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg border border-transparent hover:border-indigo-500 transition-colors group relative">
                <button
                    class="absolute top-2 right-2 text-slate-400 hover:text-yellow-400 {item.starred ? 'text-yellow-400' : ''}"
                    on:click|stopPropagation={() => toggleStar(item)}
                >
                    <Star class="w-4 h-4" fill={item.starred ? "currentColor" : "none"} />
                </button>

                <div on:click={() => loadItem(item)} class="cursor-pointer" role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && loadItem(item)}>
                    <h3 class="font-bold text-slate-800 dark:text-slate-200 text-sm mb-1 pr-6 truncate">{item.name}</h3>
                    <div class="flex items-center text-xs text-slate-500 gap-2">
                        <Clock class="w-3 h-3" />
                        <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>

                <div class="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                     <button
                        on:click|stopPropagation={() => deleteItem(item.id!)}
                        class="text-xs text-red-400 hover:text-red-600 flex items-center gap-1"
                     >
                        <Trash2 class="w-3 h-3" /> {(dict as any)?.delete ?? 'Delete'}
                     </button>
                </div>
            </div>
        {/each}
    </div>
</div>
