<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { slide } from 'svelte/transition';
  import { computeHash, computeHmac } from '$lib/utils/cipher/hashing';
  import { Copy, Save } from 'lucide-svelte';

  export let dict: any; // Type inferred in parent

  let input = '';
  let key = '';
  let output = '';
  let algorithm: 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512' = 'SHA-256';
  let mode: 'hash' | 'hmac' = 'hash';
  let isCalculating = false;

  const dispatch = createEventDispatcher();

  async function calculate() {
    if (!input) {
      output = '';
      return;
    }
    isCalculating = true;
    try {
      if (mode === 'hmac') {
        if (!key) {
           output = ''; // Wait for key
           isCalculating = false;
           return;
        }
        output = await computeHmac(input, key, algorithm);
      } else {
        output = await computeHash(input, algorithm);
      }
    } catch (e) {
      console.error(e);
      output = 'Error calculating hash';
    } finally {
      isCalculating = false;
    }
  }

  $: {
    if (input || (mode === 'hmac' && key)) {
      calculate();
    } else {
      output = '';
    }
  }

  function copyToClipboard() {
    navigator.clipboard.writeText(output);
    dispatch('copy');
  }

  function saveToHistory() {
    if (output) {
      dispatch('save', {
        type: mode === 'hmac' ? 'hmac' : 'hash',
        content: output,
        details: `${algorithm} ${mode === 'hmac' ? '(HMAC)' : ''}`
      });
    }
  }
</script>

<div class="space-y-6" in:slide>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Mode Selection -->
    <div class="space-y-2">
      <label for="mode" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dict.mode}
      </label>
      <div class="flex rounded-lg bg-slate-100 dark:bg-slate-800 p-1">
        <button
          class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all {mode === 'hash' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
          on:click={() => (mode = 'hash')}
        >
          Hash
        </button>
        <button
          class="flex-1 py-1.5 text-sm font-medium rounded-md transition-all {mode === 'hmac' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}"
          on:click={() => (mode = 'hmac')}
        >
          HMAC
        </button>
      </div>
    </div>

    <!-- Algorithm Selection -->
    <div class="space-y-2">
      <label for="algo" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dict.algo}
      </label>
      <select
        id="algo"
        bind:value={algorithm}
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      >
        <option value="SHA-1">{dict.hashing.sha1}</option>
        <option value="SHA-256">{dict.hashing.sha256}</option>
        <option value="SHA-384">{dict.hashing.sha384}</option>
        <option value="SHA-512">{dict.hashing.sha512}</option>
      </select>
    </div>
  </div>

  <!-- Inputs -->
  <div class="space-y-4">
    <div class="space-y-2">
      <label for="input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {dict.input}
      </label>
      <textarea
        id="input"
        bind:value={input}
        rows="3"
        class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
        placeholder="Type here..."
      ></textarea>
    </div>

    {#if mode === 'hmac'}
      <div class="space-y-2" transition:slide>
        <label for="key" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
          {dict.key}
        </label>
        <input
          id="key"
          type="text"
          bind:value={key}
          class="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-white font-mono"
          placeholder="Enter secret key..."
        />
      </div>
    {/if}
  </div>

  <!-- Output -->
  <div class="space-y-2">
    <div class="flex items-center justify-between">
      <label for="output" class="block text-sm font-medium text-slate-700 dark:text-slate-300">
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
    <div class="relative">
      <textarea
        id="output"
        value={output}
        readonly
        rows="2"
        class="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 font-mono break-all"
      ></textarea>
      {#if isCalculating}
        <div class="absolute inset-0 flex items-center justify-center bg-white/50 dark:bg-black/50 rounded-lg">
          <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400">{dict.calculating}</span>
        </div>
      {/if}
    </div>
  </div>
</div>
