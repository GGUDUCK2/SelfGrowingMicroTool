<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';

  export let lang: string = 'en';
  export let value: string = '';
  export let error: string | null = null;

  $: dict = getDictionary(lang).logicForge;
  const dispatch = createEventDispatcher();

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    value = target.value;
    dispatch('input', value);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      dispatch('submit');
    }
  }
</script>

<div class="relative group">
  <div class="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl opacity-20 group-focus-within:opacity-100 transition duration-500 blur"></div>
  <div class="relative bg-white rounded-xl shadow-xl flex items-center p-2 gap-2">
    <div class="pl-3 text-gray-400">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-function-square"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 17c2 0 2.8-1 2.8-2.8V10c0-2 1-3.3 3.2-3"/><path d="M9 11.2h5.7"/></svg>
    </div>
    <input
      type="text"
      bind:value
      on:input={handleInput}
      on:keydown={handleKeydown}
      placeholder="e.g. A & (B | !C)"
      class="w-full bg-transparent border-none focus:ring-0 text-lg font-mono text-gray-800 placeholder-gray-400 h-12 outline-none"
      spellcheck="false"
      autocomplete="off"
    />
    <button
      on:click={() => dispatch('submit')}
      class="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
    >
      {dict.analyze}
    </button>
  </div>
  {#if error}
    <div class="absolute top-full left-0 mt-2 text-sm text-red-500 font-medium px-2 flex items-center gap-1 animate-pulse">
       <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-alert-circle"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
       {error}
    </div>
  {/if}
</div>
