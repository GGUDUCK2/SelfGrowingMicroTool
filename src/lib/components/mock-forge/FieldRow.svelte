<script lang="ts">
  import { slide } from 'svelte/transition';
  import { Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-svelte';
  import type { SchemaField, FieldType } from '$lib/utils/mock-forge/types';

  export let field: SchemaField;
  export let dictionary: any;
  export let onDelete: () => void;

  let showOptions = false;

  const types: FieldType[] = [
    'id', 'name', 'firstName', 'lastName', 'email', 'phone',
    'date', 'number', 'boolean', 'select', 'city', 'country', 'lorem'
  ];

  function toggleOptions() {
    showOptions = !showOptions;
  }
</script>

<div class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-3 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors group">
  <div class="flex items-center gap-3">
    <!-- Drag Handle (Visual only for now, parent handles logic if needed) -->
    <div class="cursor-grab text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
      <GripVertical size={18} />
    </div>

    <!-- Field Name -->
    <div class="flex-1 min-w-[120px]">
      <input
        type="text"
        bind:value={field.name}
        placeholder="Field Name"
        class="w-full bg-transparent border-b border-transparent focus:border-indigo-500 outline-none text-sm font-medium px-1 py-1 transition-colors"
      />
    </div>

    <!-- Field Type -->
    <div class="flex-1 min-w-[140px]">
      <select
        bind:value={field.type}
        class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1.5 text-sm outline-none focus:ring-1 focus:ring-indigo-500"
      >
        {#each types as t}
          <option value={t}>{dictionary.types[t]}</option>
        {/each}
      </select>
    </div>

    <!-- Actions -->
    <div class="flex items-center gap-1">
      <button
        on:click={toggleOptions}
        class="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
        title="Options"
      >
        {#if showOptions}
          <ChevronUp size={16} />
        {:else}
          <ChevronDown size={16} />
        {/if}
      </button>
      <button
        on:click={onDelete}
        class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
        title="Delete"
      >
        <Trash2 size={16} />
      </button>
    </div>
  </div>

  <!-- Extended Options -->
  {#if showOptions}
    <div transition:slide class="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">

      {#if field.type === 'number'}
        <label class="flex flex-col gap-1">
          <span class="text-slate-500">Min</span>
          <input type="number" bind:value={field.options.min} class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-slate-500">Max</span>
          <input type="number" bind:value={field.options.max} class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1" />
        </label>
        <label class="flex flex-col gap-1 sm:col-span-2">
          <span class="text-slate-500">Format</span>
          <select bind:value={field.options.format} class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">
            <option value="int">Integer</option>
            <option value="float">Float (2 decimals)</option>
          </select>
        </label>
      {/if}

      {#if field.type === 'date'}
        <label class="flex flex-col gap-1">
          <span class="text-slate-500">Start Date</span>
          <input type="date" bind:value={field.options.min} class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1" />
        </label>
        <label class="flex flex-col gap-1">
          <span class="text-slate-500">End Date</span>
          <input type="date" bind:value={field.options.max} class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1" />
        </label>
      {/if}

      {#if field.type === 'select'}
        <label class="flex flex-col gap-1 sm:col-span-2">
          <span class="text-slate-500">Choices (Comma Separated)</span>
          <input type="text" bind:value={field.options.choices} placeholder="A, B, C" class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1" />
        </label>
      {/if}

      {#if field.type === 'id'}
        <label class="flex flex-col gap-1 sm:col-span-2">
          <span class="text-slate-500">Format</span>
          <select bind:value={field.options.format} class="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-2 py-1">
            <option value="uuid">UUID v4</option>
            <option value="sequence">Sequential Integer</option>
          </select>
        </label>
      {/if}

      {#if !['number', 'date', 'select', 'id'].includes(field.type)}
        <div class="col-span-2 text-slate-400 italic py-1">No additional options for this type.</div>
      {/if}

    </div>
  {/if}
</div>
