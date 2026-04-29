<script lang="ts">
  import { onMount } from 'svelte';
  import { Shield, KeyRound, Sparkles } from 'lucide-svelte';
  import { hashText, ALGORITHMS, type HashAlgorithm } from '$lib/utils/hash-forge/crypto';
  import HashOutput from './HashOutput.svelte';
  import { saveToHistory, type HashForgeHistoryItem } from '$lib/db/hash-forge';

  export let dict: any;
  export let onNewHistory: () => void;
  export let restoredData: HashForgeHistoryItem | null = null;

  let message = '';
  let selectedAlgorithm: HashAlgorithm = 'SHA-256';
  let hashResult: { hex: string, base64: string } | null = null;

  let lastSavedMessage = '';
  let lastSavedAlgorithm: HashAlgorithm | null = null;

  // Smart Examples
  const EXAMPLES = [
    { label: "Empty String", value: "" },
    { label: "JSON Payload", value: '{\n  "user": "admin",\n  "role": "superuser"\n}' },
    { label: "Auth Token", value: "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI..." }
  ];

  function applyExample(exampleValue: string) {
    message = exampleValue;
    handleInput();
  }

  $: if (restoredData && restoredData.type === 'text') {
    message = restoredData.fullMessage || restoredData.inputName;
    selectedAlgorithm = restoredData.algorithm as HashAlgorithm;
    hashResult = { hex: restoredData.result, base64: restoredData.base64Result || '' };
    restoredData = null; // Clear to prevent loops
  }

  async function computeHash() {
    if (message === '') { // Explicitly allow empty string
      // hashResult = null; // Actually, empty string can be hashed!
    }
    try {
      const result = await hashText(message, selectedAlgorithm);
      hashResult = result;
    } catch (err) {
      console.error(err);
      hashResult = null;
    }
  }

  async function saveCurrentToHistory() {
    if (message === null || message === undefined || !hashResult) return;
    if (lastSavedMessage === message && lastSavedAlgorithm === selectedAlgorithm) return;

    lastSavedMessage = message;
    lastSavedAlgorithm = selectedAlgorithm;

    await saveToHistory({
      type: 'text',
      inputName: message.length > 30 ? message.substring(0, 30) + '...' : (message === '' ? '[Empty String]' : message),
      fullMessage: message,
      algorithm: selectedAlgorithm,
      result: hashResult.hex,
      base64Result: hashResult.base64
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

  // Handle keyboard shortcuts
  function handleKeydown(e: KeyboardEvent) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      message = '';
      hashResult = null;
    }
  }

  $: if (selectedAlgorithm && message !== undefined) handleInput();
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
  <!-- Algorithm Selection -->
  <div class="flex flex-wrap gap-2">
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

  <!-- Smart Examples -->
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
      <Sparkles size={14} /> {dict?.common?.examples || "Examples"}:
    </span>
    {#each EXAMPLES as example}
      <button
        class="px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors font-medium border border-indigo-100 dark:border-indigo-800"
        on:click={() => applyExample(example.value)}
        aria-label={`Load example ${example.label}`}
      >
        {example.label}
      </button>
    {/each}
  </div>

  <div class="space-y-4">
    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Shield size={16} class="text-indigo-500" />
          {dict.textHash.inputLabel}
        </label>
        <span class="text-xs text-slate-400">Ctrl+K to clear</span>
      </div>
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
        result={hashResult}
        label="{selectedAlgorithm} Hash"
        uppercase={false}
        dict={dict}
      />
    </div>
  {/if}
</div>
