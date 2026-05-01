<script lang="ts">
  import { STACKS } from '$lib/utils/deploy-forge/defaults';
  import type { StackId } from '$lib/utils/deploy-forge/types';
  import { createEventDispatcher } from 'svelte';
  import { Hexagon, FileCode, Box, Cog, LayoutTemplate } from 'lucide-svelte';

  export let selectedStackId: StackId;
  const dispatch = createEventDispatcher();

  function getIcon(id: string) {
    switch (id) {
        case 'node': return Hexagon;
        case 'python': return FileCode;
        case 'go': return Box;
        case 'rust': return Cog;
        case 'static': return LayoutTemplate;
        default: return Box;
    }
  }
</script>

<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
  {#each STACKS as stack}
    <button
      type="button"
      class="flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all gap-3 h-32 min-h-[44px]
      {selectedStackId === stack.id ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400 shadow-lg shadow-indigo-500/20' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 text-slate-400'}"
      on:click={() => dispatch('select', stack.id)}
      aria-label={`Select ${stack.name} stack`}
    >
      <svelte:component this={getIcon(stack.id)} size={32} strokeWidth={1.5} />
      <span class="font-medium text-sm text-center">{stack.name}</span>
    </button>
  {/each}
</div>
