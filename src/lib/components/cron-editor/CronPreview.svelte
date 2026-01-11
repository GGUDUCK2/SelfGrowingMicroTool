<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';

  export let value: string = '* * * * *';
  export let description: string = '';

  const dispatch = createEventDispatcher();

  function handleInput() {
    dispatch('change', value);
  }
</script>

<div class="bg-slate-800 rounded-xl p-6 border border-slate-700 shadow-lg mb-6">
  <div class="flex flex-col md:flex-row gap-4 items-start md:items-center">
    <div class="flex-1 w-full">
      <label for="cron-input" class="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Cron Expression
      </label>
      <div class="relative group">
        <input
          id="cron-input"
          type="text"
          bind:value
          on:input={handleInput}
          placeholder="0 0 * * * (매일 자정)"
          aria-label="Cron 표현식 입력"
          class="w-full text-2xl font-mono font-bold bg-slate-700 text-slate-50 border border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all placeholder:text-slate-500"
        />
      </div>
    </div>
  </div>

  {#if description}
    <div transition:fade class="mt-4 flex items-center text-indigo-300 bg-indigo-900/20 px-4 py-3 rounded-lg border border-indigo-500/20">
      <svg class="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
      <span class="font-medium">{description}</span>
    </div>
  {/if}
</div>
