<script lang="ts">
  import { onMount } from 'svelte';
  import { File, UploadCloud, Loader2, AlertCircle } from 'lucide-svelte';
  import { hashFileChunked, ALGORITHMS, type HashAlgorithm } from '$lib/utils/hash-forge/crypto';
  import HashOutput from './HashOutput.svelte';
  import { saveToHistory, type HashForgeHistoryItem } from '$lib/db/hash-forge';

  export let dict: any;
  export let onNewHistory: () => void;

  let selectedAlgorithm: HashAlgorithm = 'SHA-256';
  let isHashing = false;
  let progress = 0;
  let currentFile: File | null = null;
  let hashResult = '';
  let errorMsg = '';

  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      currentFile = input.files[0];
      await performHash();
    }
  }

  async function performHash() {
    if (!currentFile) return;

    isHashing = true;
    errorMsg = '';
    hashResult = '';
    progress = 0;

    try {
      const result = await hashFileChunked(currentFile, selectedAlgorithm, (p) => {
        progress = p;
      });
      hashResult = result.hex;

      await saveToHistory({
        type: 'file',
        inputName: currentFile.name,
        algorithm: selectedAlgorithm,
        result: hashResult
      });
      onNewHistory();
    } catch (err) {
      console.error(err);
      errorMsg = 'Failed to hash file. It may be too large for memory processing.';
    } finally {
      isHashing = false;
    }
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  $: if (selectedAlgorithm && currentFile && !isHashing) {
    performHash();
  }
</script>

<div class="space-y-6">
  <!-- Algorithm Selection -->
  <div class="flex flex-wrap gap-2">
    {#each ALGORITHMS as algo}
      <button
        class="px-4 py-2 min-h-[44px] rounded-lg text-sm font-medium transition-all {selectedAlgorithm === algo ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
        on:click={() => selectedAlgorithm = algo}
        aria-label="Select algorithm {algo}"
      >
        {algo}
      </button>
    {/each}
  </div>

  <!-- Dropzone -->
  <div class="relative group">
    <input
      type="file"
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      on:change={handleFile}
      disabled={isHashing}
      aria-label={dict.fileHash.dropzone}
    />
    <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900/50 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-all min-h-[200px]">
      {#if isHashing}
        <Loader2 size={48} class="text-indigo-500 animate-spin" />
        <p class="text-slate-600 dark:text-slate-400 font-medium">{dict.fileHash.hashing} {progress}%</p>
      {:else if currentFile}
        <File size={48} class="text-indigo-500" />
        <div class="text-center">
          <p class="text-slate-800 dark:text-slate-200 font-medium break-all px-4">{currentFile.name}</p>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">{formatBytes(currentFile.size)}</p>
        </div>
      {:else}
        <UploadCloud size={48} class="text-slate-400 group-hover:text-indigo-500 transition-colors" />
        <div class="text-center">
          <p class="text-slate-600 dark:text-slate-400 font-medium">Drag & drop a file here</p>
          <p class="text-sm text-slate-500 mt-1">or click to browse</p>
        </div>
      {/if}
    </div>
  </div>

  {#if errorMsg}
    <div class="p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl flex items-center gap-3">
      <AlertCircle size={20} />
      <p class="text-sm font-medium">{errorMsg}</p>
    </div>
  {/if}

  <!-- Output -->
  {#if hashResult && !isHashing}
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <HashOutput
        value={hashResult}
        label="{selectedAlgorithm} Checksum"
        uppercase={false}
      />
    </div>
  {/if}
</div>
