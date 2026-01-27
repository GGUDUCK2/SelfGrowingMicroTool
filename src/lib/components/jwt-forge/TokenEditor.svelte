<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let token = '';
  export let label = 'Token';
  export let id = 'jwt-token-input'; // Deterministic ID for SSR

  const dispatch = createEventDispatcher();

  function handleInput(e: Event) {
    const target = e.target as HTMLTextAreaElement;
    token = target.value.trim();
    dispatch('input', token);
  }
</script>

<div class="flex flex-col gap-2">
  <label for={id} class="text-sm font-medium text-slate-700 dark:text-slate-300">
    {label}
  </label>
  <textarea
    id={id}
    class="w-full h-48 p-4 font-mono text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none outline-none transition-all shadow-sm break-all"
    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    value={token}
    on:input={handleInput}
    spellcheck="false"
  ></textarea>
</div>
