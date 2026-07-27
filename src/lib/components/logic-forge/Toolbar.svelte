<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';

  export let lang: string = 'en';

  $: dict = (getDictionary(lang) as any)?.tools?.logicForge as any;
  const dispatch = createEventDispatcher();

  let copied = false;

  function handleCopy() {
      dispatch('copy');
      copied = true;
      setTimeout(() => copied = false, 2000);
  }
</script>

<div class="flex items-center gap-2">
    <button
        on:click={() => dispatch('save')}
        class="flex items-center gap-2 px-3 py-1.5 min-h-[44px] min-w-[44px] bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
    >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-save"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
        {dict.save}
    </button>
    <button
        on:click={handleCopy}
        class="flex items-center gap-2 px-3 py-1.5 min-h-[44px] min-w-[44px] bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
    >
        {#if copied}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-check text-green-500"><polyline points="20 6 9 17 4 12"/></svg>
            <span class="text-green-600">{dict.copied}</span>
        {:else}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-copy"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            {dict.copy}
        {/if}
    </button>
</div>
