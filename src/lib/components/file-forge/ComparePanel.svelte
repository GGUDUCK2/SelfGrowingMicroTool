<script lang="ts">
  import { calculateHash } from '$lib/utils/file-forge/hash';
  import { FileDiff, CheckCircle, XCircle, UploadCloud } from 'lucide-svelte';
  import { fade } from 'svelte/transition';

  export let file: File; // The primary file
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;

  let comparisonType: 'file' | 'hash' = 'file';
  let secondFile: File | null = null;
  let hashInput = '';
  let primaryHash = '';
  let secondaryHash = '';
  let loading = false;
  let match: boolean | null = null;
  let error: string | null = null;

  async function handleCompare() {
    loading = true;
    match = null;
    error = null;
    try {
      if (!primaryHash) {
        primaryHash = await calculateHash(file, 'SHA-256');
      }

      if (comparisonType === 'file') {
        if (secondFile) {
          secondaryHash = await calculateHash(secondFile, 'SHA-256');
        } else {
          loading = false;
          return;
        }
      } else if (comparisonType === 'hash') {
        if (hashInput.trim()) {
          secondaryHash = hashInput.trim().toLowerCase();
        } else {
          loading = false;
          return;
        }
      }

      match = primaryHash === secondaryHash;
    } catch (e) {
      console.error(e);
      error = 'Comparison failed. File might be too large or unreadable.';
    } finally {
      loading = false;
    }
  }

  function handleFileDrop(e: DragEvent) {
    e.preventDefault();
    if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
      secondFile = e.dataTransfer.files[0];
      handleCompare();
    }
  }

  function handleFileSelect(e: Event) {
    const input = e.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      secondFile = input.files[0];
      handleCompare();
    }
  }

  $: if (file) {
    primaryHash = '';
    match = null;
    // Auto-calculate on mount/change if needed, or wait for user action
  }
</script>

<div class="space-y-6">
  <div class="flex gap-4 border-b border-slate-200 dark:border-slate-700 pb-4">
    <button
      class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {comparisonType === 'file' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
      on:click={() => { comparisonType = 'file'; match = null; }}
    >
      {dict?.compare?.tabFile || 'Compare with File'}
    </button>
    <button
      class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {comparisonType === 'hash' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
      on:click={() => { comparisonType = 'hash'; match = null; }}
    >
      {dict?.compare?.tabHash || 'Compare with Hash'}
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
    <!-- Primary File Info -->
    <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 class="text-xs font-bold text-slate-500 uppercase mb-2">{dict?.compare?.primary || 'Primary File'}</h3>
      <div class="font-medium text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</div>
      <div class="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(2)} KB</div>
      {#if primaryHash}
        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="text-xs text-slate-500 mb-1">SHA-256 Hash</div>
          <div class="font-mono text-[10px] break-all text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 select-all leading-tight">
            {primaryHash}
          </div>
        </div>
      {:else if loading}
        <div class="mt-4 text-xs text-slate-400 animate-pulse">Calculating hash...</div>
      {:else}
         <div class="mt-4 text-xs text-slate-400 italic">Hash calculated on compare</div>
      {/if}
    </div>

    <!-- Secondary Input -->
    <div class="space-y-4">
      <h3 class="text-xs font-bold text-slate-500 uppercase mb-2">{dict?.compare?.secondary || 'Secondary Source'}</h3>

      {#if comparisonType === 'file'}
        <div
          class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-indigo-500 dark:hover:border-indigo-400 transition-colors cursor-pointer bg-slate-50 dark:bg-slate-800/50 min-h-[160px]"
          on:dragover|preventDefault
          on:drop={handleFileDrop}
          on:click={() => document.getElementById('compare-upload')?.click()}
          on:keypress={(e) => e.key === 'Enter' && document.getElementById('compare-upload')?.click()}
          role="button"
          tabindex="0"
        >
          <input type="file" id="compare-upload" class="hidden" on:change={handleFileSelect} />
          {#if secondFile}
            <FileDiff size={32} class="text-indigo-500 mb-2" />
            <div class="font-medium text-slate-900 dark:text-white truncate max-w-[200px]">{secondFile.name}</div>
            <div class="text-xs text-slate-400">{(secondFile.size / 1024).toFixed(2)} KB</div>
            <button
                class="mt-2 text-xs text-indigo-600 hover:underline"
                on:click|stopPropagation={() => document.getElementById('compare-upload')?.click()}
            >
                Change File
            </button>
          {:else}
            <UploadCloud size={32} class="text-slate-400 mb-2" />
            <div class="text-sm font-medium text-slate-600 dark:text-slate-300">{dict?.compare?.drop || 'Drop file to compare'}</div>
            <div class="text-xs text-slate-400 mt-1">or click to browse</div>
          {/if}
        </div>
      {:else}
        <div>
          <textarea
            bind:value={hashInput}
            on:input={handleCompare}
            class="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-xs h-[160px] resize-none"
            placeholder={dict?.compare?.pastePlaceholder || "Paste SHA-256 Hash here..."}
          ></textarea>
        </div>
      {/if}
    </div>
  </div>

  <!-- Result -->
  {#if match !== null && !loading}
    <div in:fade={{ duration: 200 }} class="p-6 rounded-xl flex items-center gap-4 border {match ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'}">
      {#if match}
        <div class="p-3 rounded-full bg-emerald-100 dark:bg-emerald-900 text-emerald-600 dark:text-emerald-400">
           <CheckCircle size={32} />
        </div>
        <div>
          <h3 class="font-bold text-emerald-800 dark:text-emerald-300 text-lg">{dict?.compare?.matchTitle || 'Match Confirmed'}</h3>
          <p class="text-emerald-600 dark:text-emerald-400 text-sm">{dict?.compare?.matchDesc || 'The files are identical (SHA-256).'}</p>
        </div>
      {:else}
        <div class="p-3 rounded-full bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400">
           <XCircle size={32} />
        </div>
        <div>
          <h3 class="font-bold text-red-800 dark:text-red-300 text-lg">{dict?.compare?.mismatchTitle || 'Mismatch Detected'}</h3>
          <p class="text-red-600 dark:text-red-400 text-sm">{dict?.compare?.mismatchDesc || 'The hashes do not match.'}</p>
        </div>
      {/if}
    </div>
  {:else if loading}
    <div class="flex justify-center p-8">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
    </div>
  {:else if error}
    <div class="p-4 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm text-center">
        {error}
    </div>
  {/if}
</div>
