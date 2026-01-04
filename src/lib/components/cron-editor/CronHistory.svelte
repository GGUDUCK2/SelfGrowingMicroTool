<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db, type CronHistory } from '$lib/db';
  import { slide } from 'svelte/transition';
  import { browser } from '$app/environment';

  export let onSelect: (expression: string) => void;
  export let lang: string = 'en';

  let history = liveQuery(async () => {
    if (!browser) return [];
    return await db.cronHistory.orderBy('createdAt').reverse().limit(10).toArray();
  });

  async function deleteItem(id: number) {
    await db.cronHistory.delete(id);
  }

  function formatDate(date: Date) {
     if (lang === 'ko') {
        return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
     }
     return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(date);
  }
</script>

<div class="mt-8">
  <h3 class="mb-4 text-lg font-semibold text-white">
    {lang === 'ko' ? '최근 기록' : 'Recent History'}
  </h3>

  {#if $history}
    <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {#each $history as item (item.id)}
        <div
          class="group relative flex flex-col justify-between rounded-lg border border-white/10 bg-white/5 p-4 transition-all hover:bg-white/10 hover:shadow-lg hover:border-indigo-500/30"
          in:slide
        >
          <button
            class="flex-1 text-left"
            on:click={() => onSelect(item.expression)}
          >
            <div class="mb-2 font-mono text-lg font-bold text-indigo-400">
              {item.expression}
            </div>
            <div class="text-sm text-gray-300 line-clamp-2">
              {item.description}
            </div>
            <div class="mt-2 text-xs text-gray-500">
              {formatDate(item.createdAt)}
            </div>
          </button>

          <button
            on:click|stopPropagation={() => item.id && deleteItem(item.id)}
            class="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 p-1 text-gray-400 hover:text-red-400"
            aria-label="Delete"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
          </button>
        </div>
      {/each}

      {#if $history.length === 0}
        <div class="col-span-full py-8 text-center text-gray-500 italic">
          {lang === 'ko' ? '저장된 기록이 없습니다.' : 'No history yet.'}
        </div>
      {/if}
    </div>
  {:else}
    <div class="py-8 text-center text-gray-500">Loading...</div>
  {/if}
</div>
