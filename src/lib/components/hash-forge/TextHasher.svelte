<script lang="ts">

  import { Shield, Sparkles, Download, Copy, Check, Search } from '@lucide/svelte';
  import { hashText, ALGORITHMS, type HashAlgorithm, type InputFormat } from '$lib/utils/hash-forge/crypto';
  import HashOutput from './HashOutput.svelte';
  import { saveToHistory, type HashForgeHistoryItem } from '$lib/db/hash-forge';

  export let dict: any;
  export let onNewHistory: () => void;
  export let restoredData: HashForgeHistoryItem | null = null;

  let message = '';
  let inputFormat: InputFormat = 'text';
  let selectedAlgorithm: HashAlgorithm = 'SHA-256';
  let hashResult: { hex: string, base64: string } | null = null;
  let matrixMode = false;
  let matrixResult: Record<string, {hex: string, base64: string}> | null = null;

  let lastSavedMessage = '';
  let lastSavedAlgorithm: HashAlgorithm | null = null;
  let salt = '';
  let saltPosition: 'prepend' | 'append' = 'append';
  let isSaltEnabled = false;
  let lastSavedSalt = '';
  let lastSavedSaltPosition = 'append';
  let lastSavedIsSaltEnabled = false;

  let copiedJson = false;

  let analyzedHashType: string | null = null;

  $: if (message && typeof message === 'string') {
    const cleaned = message.trim();
    if (/^[a-fA-F0-9]+$/.test(cleaned)) {
      if (cleaned.length === 32) analyzedHashType = 'MD5';
      else if (cleaned.length === 40) analyzedHashType = 'SHA-1';
      else if (cleaned.length === 64) analyzedHashType = 'SHA-256';
      else if (cleaned.length === 96) analyzedHashType = 'SHA-384';
      else if (cleaned.length === 128) analyzedHashType = 'SHA-512';
      else analyzedHashType = null;
    } else {
      analyzedHashType = null;
    }
  } else {
    analyzedHashType = null;
  }

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
    inputFormat = (restoredData.inputFormat as InputFormat) || 'text';
    selectedAlgorithm = restoredData.algorithm as HashAlgorithm;
    hashResult = { hex: restoredData.result, base64: restoredData.base64Result || '' };
    if (restoredData.salt !== undefined || restoredData.isSaltEnabled !== undefined) {
      salt = restoredData.salt || '';
      saltPosition = (restoredData.saltPosition as 'prepend' | 'append') || 'append';
      isSaltEnabled = !!restoredData.isSaltEnabled;
    }
    restoredData = null; // Clear to prevent loops
  }

  async function computeHash() {
    let finalMessage = message;
    // Note: Applying salt natively when format is hex or base64 is tricky.
    // We will append/prepend the string value and assume the format applies to the combined string.
    if (isSaltEnabled && salt) {
       finalMessage = saltPosition === 'prepend' ? (salt + message) : (message + salt);
    }

    try {
      if (matrixMode) {
        const promises = ALGORITHMS.map(async (algo) => {
          const res = await hashText(finalMessage, algo, inputFormat);
          return { algo, res };
        });
        const results = await Promise.all(promises);
        const newMatrix: Record<string, {hex: string, base64: string}> = {};
        for (const {algo, res} of results) {
          newMatrix[algo] = res;
        }
        matrixResult = newMatrix;
        hashResult = null;
      } else {
        const result = await hashText(finalMessage, selectedAlgorithm, inputFormat);
        hashResult = result;
        matrixResult = null;
      }
    } catch (err) {
      console.error(err);
      hashResult = null;
      matrixResult = null;
    }
  }

  async function saveCurrentToHistory() {
    if (message === null || message === undefined || !hashResult) return;
    if (lastSavedMessage === message && lastSavedAlgorithm === selectedAlgorithm && lastSavedSalt === salt && lastSavedSaltPosition === saltPosition && lastSavedIsSaltEnabled === isSaltEnabled) return;

    lastSavedMessage = message;
    lastSavedAlgorithm = selectedAlgorithm;
    lastSavedSalt = salt;
    lastSavedSaltPosition = saltPosition;
    lastSavedIsSaltEnabled = isSaltEnabled;

    await saveToHistory({
      type: 'text',
      inputName: message.length > 30 ? message.substring(0, 30) + '...' : (message === '' ? '[Empty String]' : message),
      fullMessage: message,
      inputFormat: inputFormat,
      algorithm: selectedAlgorithm,
      salt: salt,
      saltPosition: saltPosition,
      isSaltEnabled: isSaltEnabled,
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
      salt = '';
      hashResult = null;
      matrixResult = null;
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleInput();
    } else if (e.key === 'Escape') {
      message = '';
      salt = '';
      hashResult = null;
      matrixResult = null;
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveCurrentToHistory();
    }
  }

  async function copyMatrixJson() {
    if (!matrixResult) return;
    try {
      await navigator.clipboard.writeText(JSON.stringify(matrixResult, null, 2));
      copiedJson = true;
      setTimeout(() => copiedJson = false, 2000);
    } catch (err) {
      console.error('Failed to copy matrix JSON', err);
    }
  }

  function downloadMatrixJson() {
    if (!matrixResult) return;
    const blob = new Blob([JSON.stringify(matrixResult, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `matrix-hashes.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  $: if ((selectedAlgorithm || matrixMode || inputFormat || salt || saltPosition || isSaltEnabled) && message !== undefined) handleInput();
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="space-y-6">
  <!-- Algorithm Selection -->
  <div class="flex flex-wrap items-center gap-2">
    {#if !matrixMode}
      {#each ALGORITHMS as algo (algo)}
        <button
          class="px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {selectedAlgorithm === algo ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
          on:click={() => selectedAlgorithm = algo}
          aria-label="Select algorithm {algo}"
        >
          {algo}
        </button>
      {/each}
    {/if}

    <button
      class="px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {matrixMode ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'} ml-auto flex items-center gap-2"
      on:click={() => { matrixMode = !matrixMode; handleInput(); }}
      aria-label={(dict as any)?.hashForge?.matrixMode || "Matrix Mode"}
    >
      <Sparkles size={16} />
      {(dict as any)?.hashForge?.matrixMode || "Matrix Mode"}
    </button>
  </div>

  <!-- Smart Examples -->
  <div class="flex flex-wrap items-center gap-2">
    <span class="text-xs font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
      <Sparkles size={14} /> {(dict as any)?.common?.examples || "Examples"}:
    </span>
    {#each EXAMPLES as example (example.label)}
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
    <div class="flex items-center gap-2 mb-2">
      <label class="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300">
        <input type="checkbox" bind:checked={isSaltEnabled} class="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 dark:bg-slate-800" />
        {(dict as any)?.textHash?.enableSalt || "Add Salt"}
      </label>
    </div>

    {#if isSaltEnabled}
      <div class="flex items-center gap-3 animate-in fade-in slide-in-from-top-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
        <div class="flex items-center bg-slate-200 dark:bg-slate-900 rounded-lg p-0.5 shrink-0">
          <button
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[44px] {saltPosition === 'prepend' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
            on:click={() => saltPosition = 'prepend'}
            aria-label={(dict as any)?.textHash?.prependSalt || "Prepend Salt"}
          >
            {(dict as any)?.textHash?.prependSalt || "Prepend"}
          </button>
          <button
            class="px-3 py-1.5 text-xs font-medium rounded-md transition-colors min-h-[44px] {saltPosition === 'append' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
            on:click={() => saltPosition = 'append'}
            aria-label={(dict as any)?.textHash?.appendSalt || "Append Salt"}
          >
            {(dict as any)?.textHash?.appendSalt || "Append"}
          </button>
        </div>
        <input
          type="text"
          bind:value={salt}
          on:input={handleInput}
          placeholder={(dict as any)?.textHash?.saltPlaceholder || "Enter salt string..."}
          class="flex-1 px-3 py-2 min-h-[44px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono text-sm"
          aria-label={(dict as any)?.textHash?.saltPlaceholder || "Salt"}
        />
      </div>
    {/if}
    <div>
      <div class="flex items-center justify-between mb-1">
        <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Shield size={16} class="text-indigo-500" />
          {dict.textHash.inputLabel}
        </label>
        <div class="flex items-center gap-3">
          <div class="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5">
            {#each ['text', 'hex', 'base64'] as format (format)}
              <button
                class="px-3 py-1 text-xs font-medium rounded-md transition-colors min-h-[32px] min-w-[44px] {inputFormat === format ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                on:click={() => { inputFormat = format as InputFormat; }}
                aria-label={`Input format ${format}`}
              >
                {(dict as any)?.common?.[format] || format.toUpperCase()}
              </button>
            {/each}
          </div>
          <span class="text-xs text-slate-400 hidden sm:inline">Ctrl+K to clear</span>
        </div>
      </div>
      <textarea
        bind:value={message}
        on:input={handleInput}
        on:blur={saveCurrentToHistory}
        placeholder={dict.textHash.placeholder}
        class="w-full h-40 px-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-y focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono"
        aria-label={dict.textHash.inputLabel}
      ></textarea>

      {#if analyzedHashType}
        <div class="mt-2 flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-3 py-2 rounded-lg border border-indigo-100 dark:border-indigo-800 animate-in fade-in slide-in-from-top-1">
          <Search size={16} />
          <span>{(dict as any)?.textHash?.looksLikeHash?.replace('{algo}', analyzedHashType) || `Looks like a ${analyzedHashType} hash`}</span>
        </div>
      {/if}
    </div>
  </div>

  {#if matrixMode && matrixResult}
    <div class="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div class="flex items-center justify-end gap-2 -mb-4">
        <button
          on:click={downloadMatrixJson}
          class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium rounded-md transition-colors bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50"
          aria-label="Download Matrix JSON"
        >
          <Download size={14} />
          {(dict as any)?.common?.downloadJson || "Download JSON"}
        </button>
        <button
          on:click={copyMatrixJson}
          class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium rounded-md transition-colors {copiedJson ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
          aria-label="Copy Matrix JSON"
        >
          {#if copiedJson}
            <Check size={14} /> {(dict as any)?.common?.copied || "Copied!"}
          {:else}
            <Copy size={14} /> {(dict as any)?.common?.copyJson || "Copy JSON"}
          {/if}
        </button>
      </div>

      {#each ALGORITHMS as algo (algo)}
        <div class="pb-6 border-b border-slate-100 dark:border-slate-800 last:border-0">
          <HashOutput
            result={matrixResult[algo]}
            label="{algo} Hash"
            uppercase={false}
            dict={dict}
          />
        </div>
      {/each}
    </div>
  {:else if hashResult}
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
