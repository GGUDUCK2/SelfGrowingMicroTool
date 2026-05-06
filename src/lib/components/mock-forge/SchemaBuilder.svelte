<script lang="ts">
  import { flip } from 'svelte/animate';
  import { Plus } from 'lucide-svelte';
  import type { SchemaField } from '$lib/utils/mock-forge/types';
  import FieldRow from './FieldRow.svelte';

  export let fields: SchemaField[] = [];
  export let dictionary: Record<string, any>;

  function addField() {
    const id = crypto.randomUUID();
    fields = [...fields, {
      id,
      name: `field_${fields.length + 1}`,
      type: 'name',
      options: {}
    }];
  }

  function deleteField(id: string) {
    fields = fields.filter(f => f.id !== id);
  }
</script>

<div class="space-y-4">
  <div class="space-y-2">
    {#each fields as field (field.id)}
      <div animate:flip={{duration: 200}}>
        <FieldRow
          bind:field={field}
          dictionary={dictionary}
          onDelete={() => deleteField(field.id)}
        />
      </div>
    {/each}
  </div>

  <button
    on:click={addField}
    class="w-full py-3 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl text-slate-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all flex items-center justify-center gap-2 font-medium"
  >
    <Plus size={20} />
    {dictionary.addField}
  </button>
</div>
