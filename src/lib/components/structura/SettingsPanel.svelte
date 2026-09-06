<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let indent: number = 2;
  export let csvDelimiter: string = ',';

  export let labels = {
    title: 'Conversion Settings',
    indent: 'Indentation (Spaces)',
    delimiter: 'CSV Delimiter',
    options: {
      spaces2: '2 Spaces',
      spaces4: '4 Spaces',
      minified: 'Minified (0)',
      comma: 'Comma (,)',
      semicolon: 'Semicolon (;)',
      pipe: 'Pipe (|)',
      tab: 'Tab (\\t)'
    }
  };

  const dispatch = createEventDispatcher();

  function update() {
    dispatch('change', { indent, csvDelimiter });
  }
</script>

<div class="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm space-y-4">
  <h3 class="text-sm font-semibold text-gray-900 dark:text-white">{labels.title}</h3>

  <div class="grid md:grid-cols-2 gap-4">
    <div>
      <label for="indent" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {labels.indent}
      </label>
      <div class="relative">
        <select
          id="indent"
          bind:value={indent}
          on:change={update}
          class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white"
        >
          <option value={2}>{labels.options.spaces2}</option>
          <option value={4}>{labels.options.spaces4}</option>
          <option value={0}>{labels.options.minified}</option>
        </select>
      </div>
    </div>

    <div>
      <label for="delimiter" class="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
        {labels.delimiter}
      </label>
      <div class="relative">
        <select
          id="delimiter"
          bind:value={csvDelimiter}
          on:change={update}
          class="block w-full pl-3 pr-10 py-2 text-sm border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md dark:bg-gray-700 dark:text-white"
        >
          <option value=",">{labels.options.comma}</option>
          <option value=";">{labels.options.semicolon}</option>
          <option value="|">{labels.options.pipe}</option>
          <option value="\t">{labels.options.tab}</option>
        </select>
      </div>
    </div>
  </div>
</div>
