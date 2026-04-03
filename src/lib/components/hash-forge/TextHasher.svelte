<script lang="ts">
  import { onMount } from 'svelte';
  import { Shield, KeyRound } from 'lucide-svelte';
  import { hashText, ALGORITHMS, type HashAlgorithm } from '$lib/utils/hash-forge/crypto';
  import HashOutput from './HashOutput.svelte';
  import { saveToHistory } from '$lib/db/hash-forge';

  export let dict: any;
  export let onNewHistory: () => void;

  let message = '';
  let selectedAlgorithm: HashAlgorithm = 'SHA-256';
  let hashResult = '';

  let lastSavedMessage = '';
  let lastSavedAlgorithm: HashAlgorithm | null = null;

  async function computeHash() {
    if (!message) {
      hashResult = '';
      return;
    }
    try {
      const result = await hashText(message, selectedAlgorithm);
      hashResult = result.hex;
    } catch (err) {
      console.error(err);
      hashResult = 'Error computing hash';
    }
  }

  async function saveCurrentToHistory() {
    if (!message || !hashResult) return;
    if (lastSavedMessage === message && lastSavedAlgorithm === selectedAlgorithm) return;

    lastSavedMessage = message;
    lastSavedAlgorithm = selectedAlgorithm;

    await saveToHistory({
      type: 'text',
      inputName: message.length > 30 ? message.substring(0, 30) + '...' : message,
      algorithm: selectedAlgorithm,
      result: hashResult
    });
    onNewHistory();
  }

  // Debounce the input slightly to prevent excessive re-renders
  let debounceTimer: ReturnType<typeof setTimeout>;
  function handleInput() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      computeHash();
    }, 50); // fast UI update
  }

  $: if (selectedAlgorithm && message) handleInput();
</script>

<div class="space-y-6">
  <!-- Algorithm Selection -->
  <div class="flex gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
    {#each ALGORITHMS as algo}
      <button
        class="px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {selectedAlgorithm === algo ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
        on:click={() => selectedAlgorithm = algo}
        aria-label="Select algorithm {algo}"
      >
        {algo}
      </button>
    {/each}
  </div>

  <div class="space-y-4">
    <div>
      <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-2">
        <Shield size={16} class="text-indigo-500" />
        {dict.textHash.inputLabel}
      </label>
      <textarea
        bind:value={message}
        on:input={handleInput}
        on:blur={saveCurrentToHistory}
        placeholder={dict.textHash.placeholder}
        class="w-full h-40 px-4 py-3 min-h-[44px] min-w-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono"
        aria-label={dict.textHash.inputLabel}
      ></textarea>
    </div>
  </div>

  {#if hashResult}
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <HashOutput
        value={hashResult}
        label="{selectedAlgorithm} Hash"
        uppercase={false}
      />
    </div>
  {/if}
</div>
