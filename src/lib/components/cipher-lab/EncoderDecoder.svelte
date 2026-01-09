<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import {
    toBase64, fromBase64,
    toUrlEncode, fromUrlEncode,
    toHex, fromHex,
    toBinary, fromBinary,
    toHtmlEntity, fromHtmlEntity
  } from '$lib/utils/cipher/encoding';
  import { Copy, Save, ArrowLeftRight } from 'lucide-svelte';

  export let dict: any;

  let input = '';
  let output = '';
  let mode: 'encode' | 'decode' = 'encode';
  let method: 'base64' | 'url' | 'hex' | 'binary' | 'html' = 'base64';

  const dispatch = createEventDispatcher();

  function process() {
    if (!input) {
      output = '';
      return;
    }
    try {
      if (mode === 'encode') {
        switch (method) {
          case 'base64': output = toBase64(input); break;
          case 'url': output = toUrlEncode(input); break;
          case 'hex': output = toHex(input); break;
          case 'binary': output = toBinary(input); break;
          case 'html': output = toHtmlEntity(input); break;
        }
      } else {
        switch (method) {
          case 'base64': output = fromBase64(input); break;
          case 'url': output = fromUrlEncode(input); break;
          case 'hex': output = fromHex(input); break;
          case 'binary': output = fromBinary(input); break;
          case 'html': output = fromHtmlEntity(input); break;
        }
      }
    } catch (e) {
      output = 'Error processing text';
    }
  }

  $: {
    if (input) process();
    else output = '';
  }

  function swap() {
    mode = mode === 'encode' ? 'decode' : 'encode';
    input = output; // Swap input with output
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output);
    dispatch('copy');
  }

  function saveToHistory() {
    if (output) {
      dispatch('save', {
        type: 'encode',
        content: output,
        details: `${method.toUpperCase()} (${mode})`
      });
    }
  }
</script>

<div class="space-y-6" in:slide>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Method Selection -->
    <div class="space-y-2">
      <label for="method" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dict.algo}
      </label>
      <select
        id="method"
        bind:value={method}
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        <option value="base64">{dict.encoding.base64}</option>
        <option value="url">{dict.encoding.url}</option>
        <option value="hex">{dict.encoding.hex}</option>
        <option value="binary">{dict.encoding.binary}</option>
        <option value="html">{dict.encoding.html}</option>
      </select>
    </div>

    <!-- Mode Selection -->
    <div class="space-y-2">
      <label for="enc-mode" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dict.mode}
      </label>
      <div class="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
        <button
          class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all {mode === 'encode' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
          on:click={() => (mode = 'encode')}
        >
          {dict.encode}
        </button>
        <button
          class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all {mode === 'decode' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
          on:click={() => (mode = 'decode')}
        >
          {dict.decode}
        </button>
      </div>
    </div>
  </div>

  <!-- Inputs -->
  <div class="space-y-4">
    <div class="space-y-2">
      <div class="flex justify-between items-center">
        <label for="enc-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dict.input}
        </label>
        <button on:click={swap} class="text-xs text-slate-500 hover:text-indigo-600 flex items-center space-x-1" title={dict.swap}>
           <ArrowLeftRight size={14} />
           <span>Swap</span>
        </button>
      </div>
      <textarea
        id="enc-input"
        bind:value={input}
        rows="4"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
        placeholder="Type here..."
      ></textarea>
    </div>
  </div>

  <!-- Output -->
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label for="enc-output" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dict.output}
      </label>
      <div class="flex space-x-2">
        <button
          on:click={copyToClipboard}
          class="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          disabled={!output}
        >
          <Copy size={14} />
          <span>{dict.copy}</span>
        </button>
        <button
          on:click={saveToHistory}
          class="flex items-center space-x-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
          disabled={!output}
        >
          <Save size={14} />
          <span>{dict.save}</span>
        </button>
      </div>
    </div>
    <textarea
      id="enc-output"
      value={output}
      readonly
      rows="4"
      class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-mono break-all"
    ></textarea>
  </div>
</div>
