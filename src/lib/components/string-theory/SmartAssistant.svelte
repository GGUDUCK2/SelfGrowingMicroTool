<script lang="ts">
  import { slide } from 'svelte/transition';
  import { createEventDispatcher } from 'svelte';
  import { SmartMagic, type SmartSuggestion } from '$lib/utils/string-theory/smart-magic';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  export let text = '';
  const dispatch = createEventDispatcher();

  $: suggestions = SmartMagic.detect(text);
  $: dict = getDictionary($page.params.lang || 'en').tools.stringTheory;

  function getLabel(key: string): string {
      return dict.smartMagic?.[key] || key;
  }

  function apply(suggestion: SmartSuggestion) {
      dispatch('action', { type: suggestion.action, mode: suggestion.mode });
  }
</script>

{#if suggestions.length > 0}
  <div transition:slide class="flex justify-center gap-2 mt-4">
      {#each suggestions as s}
        <button
          class="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-full shadow-lg text-sm font-medium flex items-center gap-2"
          on:click={() => apply(s)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-yellow-300" viewBox="0 0 20 20" fill="currentColor">
            <path fill-rule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clip-rule="evenodd" />
          </svg>
          {getLabel(s.label)}
        </button>
      {/each}
  </div>
{/if}
