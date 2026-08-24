<script lang="ts">
  import { DATABASE_DEFINITIONS } from '$lib/utils/deploy-forge/defaults';
  import type { DatabaseId } from '$lib/utils/deploy-forge/types';
  import { createEventDispatcher } from 'svelte';
  import { Database } from '@lucide/svelte';

  export let selectedDatabases: DatabaseId[] = [];
  const dispatch = createEventDispatcher();

  // Cast to any to iterate
  const dbs = Object.entries(DATABASE_DEFINITIONS).map(([id, def]) => ({
      id: id as DatabaseId,
      ...(def as any)
  }));

  function toggle(id: DatabaseId) {
      if (selectedDatabases.includes(id)) {
          selectedDatabases = selectedDatabases.filter(d => d !== id);
      } else {
          selectedDatabases = [...selectedDatabases, id];
      }
      dispatch('change', selectedDatabases);
  }
</script>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    {#each dbs as db (db.id)}
        <button type="button"
            class="flex items-center p-3 rounded-lg border transition-all gap-3 text-left min-h-[44px] {selectedDatabases.includes(db.id) ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-slate-600 text-slate-400'} min-w-[44px]"
            on:click={() => toggle(db.id)}
            aria-label={`Toggle ${db.name} database`}
        >
            <div class="{selectedDatabases.includes(db.id) ? 'text-emerald-500' : 'text-slate-500'}">
                <Database size={20} />
            </div>
            <div>
                <div class="font-medium text-sm">{db.name}</div>
                <div class="text-xs opacity-70">Port: {db.port}</div>
            </div>
        </button>
    {/each}
</div>
