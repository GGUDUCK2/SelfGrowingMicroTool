<script lang="ts">
  import { UploadCloud, File, AlertCircle, Copy, Check, Download, CheckCircle2, XCircle, Target } from '@lucide/svelte';
  import { hashFileChunked, ALGORITHMS, type HashAlgorithm } from '$lib/utils/hash-forge/crypto';
  import HashOutput from './HashOutput.svelte';
  import { saveToHistory, type HashForgeHistoryItem } from '$lib/db/hash-forge';

  export let dict: Record<string, unknown>;
  export let onNewHistory: () => void;
  export let restoredData: HashForgeHistoryItem | null = null;

  let selectedAlgorithm: HashAlgorithm = 'SHA-256';
  let isHashing = false;
  let errorMsg = '';

  interface ProcessedFile {
    file: window.File;
    progress: number;
    result: { hex: string, base64: string } | null;
    error: string | null;
    copied: boolean;
    speed?: string;
    eta?: string;
  }

  let filesList: ProcessedFile[] = [];

  // Note: For files, we cannot easily restore the actual File object from History
  // due to browser security. We can only show the previous result.
  let isRestoredView = false;
  let restoredFileName = '';
  let hashResult: { hex: string, base64: string } | null = null;
  let expectedHashes: Record<string, string> = {};
  let expectedChecksumInput = '';

  $: if (expectedChecksumInput) {
    const cleaned = expectedChecksumInput.trim().toLowerCase();
    let detectedAlgo: HashAlgorithm | null = null;
    if (cleaned.length === 32) detectedAlgo = 'MD5';
    else if (cleaned.length === 40) detectedAlgo = 'SHA-1';
    else if (cleaned.length === 64) detectedAlgo = 'SHA-256';
    else if (cleaned.length === 96) detectedAlgo = 'SHA-384';
    else if (cleaned.length === 128) detectedAlgo = 'SHA-512';

    if (detectedAlgo && selectedAlgorithm !== detectedAlgo) {
      handleAlgorithmChange(detectedAlgo);
    }
  }

  function parseChecksumFile(text: string): Record<string, string> {
    const hashes: Record<string, string> = {};
    const lines = text.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      // Typical format: <hash> *<filename> or <hash>  <filename>
      const match = trimmed.match(/^([a-fA-F0-9]+)\s+[* ]?(.*)$/);
      if (match) {
        const hash = match[1].toLowerCase();
        const filename = match[2].trim();
        hashes[filename] = hash;
      }
    }
    return hashes;
  }

  $: if (restoredData && restoredData.type === 'file') {
    selectedAlgorithm = restoredData.algorithm as HashAlgorithm;
    hashResult = { hex: restoredData.result, base64: restoredData.base64Result || '' };
    isRestoredView = true;
    restoredFileName = restoredData.inputName;
    filesList = []; // Clear current files
    restoredData = null; // Clear to prevent loops
  }

  async function handleFile(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      isRestoredView = false;

      const fileArray = Array.from(input.files);

      // Check for checksum files
      for (const file of fileArray) {
        if (file.name.endsWith('.sha256') || file.name.endsWith('.md5') || file.name.endsWith('.txt')) {
          try {
            const text = await file.text();
            const parsed = parseChecksumFile(text);
            if (Object.keys(parsed).length > 0) {
              expectedHashes = { ...expectedHashes, ...parsed };
            }
          } catch (e) {
            console.error('Failed to parse checksum file', e);
          }
        }
      }

      const newFiles = fileArray.map(file => {
        if (expectedChecksumInput.trim()) {
           expectedHashes[file.name] = expectedChecksumInput.trim().toLowerCase();
        }
        return {
          file,
          progress: 0,
          result: null,
          error: null,
          copied: false,
          speed: '',
          eta: ''
        };
      });

      filesList = [...newFiles, ...filesList];
      // reset input value so the same file can be selected again if needed
      input.value = '';

      await processFiles(newFiles);
    }
  }

  async function processFiles(filesToProcess: ProcessedFile[]) {
    isHashing = true;
    errorMsg = '';

    // Process sequentially to not freeze UI with many large files
    for (const item of filesToProcess) {
      try {
        const startTime = Date.now();
        let lastUpdateTime = startTime;
        let lastUpdateBytes = 0;

        const result = await hashFileChunked(item.file, selectedAlgorithm, (p, bytesProcessed) => {
          const now = Date.now();
          const timeSinceLastUpdate = now - lastUpdateTime;

          if (timeSinceLastUpdate > 500 && bytesProcessed !== undefined) {
            const bytesSinceLastUpdate = bytesProcessed - lastUpdateBytes;
            const speedBps = (bytesSinceLastUpdate / timeSinceLastUpdate) * 1000;
            item.speed = `${formatBytes(speedBps)}/s`;

            const remainingBytes = item.file.size - bytesProcessed;
            if (speedBps > 0) {
               const etaSeconds = remainingBytes / speedBps;
               item.eta = etaSeconds > 60 ? `${Math.round(etaSeconds/60)}m ${Math.round(etaSeconds%60)}s remaining` : `${Math.round(etaSeconds)}s remaining`;
            }

            lastUpdateTime = now;
            lastUpdateBytes = bytesProcessed;
          }

          item.progress = p;
          filesList = filesList; // trigger reactivity
        });
        item.speed = '';
        item.eta = '';
        item.result = result;
        filesList = filesList; // trigger reactivity

        await saveToHistory({
          type: 'file',
          inputName: item.file.name,
          algorithm: selectedAlgorithm,
          result: result.hex,
          base64Result: result.base64
        });
        onNewHistory();
      } catch (err) {
        console.error(err);
        item.error = 'Failed to hash';
        filesList = filesList;
      }
    }

    isHashing = false;
  }

  function formatBytes(bytes: number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  function handleAlgorithmChange(algo: HashAlgorithm) {
    selectedAlgorithm = algo;
    if (filesList.length > 0 && !isRestoredView) {
      // Re-hash all files with new algo
      filesList = filesList.map(f => ({...f, progress: 0, result: null, error: null}));
      processFiles(filesList);
    }
  }

  async function copyToClipboard(item: ProcessedFile) {
    if (!item.result) return;
    try {
      await navigator.clipboard.writeText(item.result.hex);
      item.copied = true;
      filesList = filesList;
      setTimeout(() => {
        item.copied = false;
        filesList = filesList;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

  function exportChecksums() {
    const validFiles = filesList.filter(f => f.result);
    if (validFiles.length === 0) return;

    // Standard format: <hash> *<filename>
    const content = validFiles.map(f => `${f.result?.hex} *${f.file.name}`).join('\n');
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `checksums_${selectedAlgorithm.toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

</script>

<div class="space-y-6">
  <!-- Algorithm Selection -->
  <div class="flex flex-wrap gap-2">
    {#each ALGORITHMS as algo (algo)}
      <button
        class="px-4 py-2 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-all {selectedAlgorithm === algo ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 dark:shadow-indigo-900/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
        on:click={() => handleAlgorithmChange(algo)}
        aria-label="Select algorithm {algo}"
      >
        {algo}
      </button>
    {/each}
  </div>

  <!-- Smart Checksum Verifier -->
  <div class="space-y-2">
    <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
      <Target size={16} class="text-indigo-500" />
      {dict?.fileHash?.expectedHashInput || "Expected Checksum (Optional)"}
    </label>
    <div class="relative">
      <input
        type="text"
        bind:value={expectedChecksumInput}
        placeholder={dict?.fileHash?.expectedHashPlaceholder || "Paste expected hex hash here to auto-detect and verify..."}
        class="w-full px-4 py-3 min-h-[44px] bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400 font-mono text-sm"
        aria-label={dict?.fileHash?.expectedHashInput || "Expected Checksum"}
      />
      {#if expectedChecksumInput.trim()}
        <div class="absolute right-3 top-1/2 -translate-y-1/2">
          {#if expectedChecksumInput.trim().length === 32 || expectedChecksumInput.trim().length === 40 || expectedChecksumInput.trim().length === 64 || expectedChecksumInput.trim().length === 96 || expectedChecksumInput.trim().length === 128}
            <span class="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-400 rounded-md">
              {dict?.fileHash?.autoDetectedAlgo?.replace('{algo}', selectedAlgorithm) || `Auto-detected ${selectedAlgorithm}`}
            </span>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Dropzone -->
  <div class="relative group">
    <input
      type="file"
      multiple
      class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
      on:change={handleFile}
      disabled={isHashing}
      aria-label={dict.fileHash.dropzone}
    />
    <div class="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 bg-slate-50 dark:bg-slate-900/50 group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/10 group-hover:border-indigo-400 dark:group-hover:border-indigo-500 transition-all min-h-[200px]">
      {#if isRestoredView}
        <File size={48} class="text-indigo-400" />
        <div class="text-center">
          <p class="text-slate-800 dark:text-slate-200 font-medium break-all px-4">{restoredFileName}</p>
          <p class="text-sm text-slate-500 mt-1">Restored from History</p>
          <p class="text-xs text-indigo-500 mt-2">Drop new files to hash again</p>
        </div>
      {:else}
        <UploadCloud size={48} class="text-slate-400 group-hover:text-indigo-500 transition-colors" />
        <div class="text-center">
          <p class="text-slate-600 dark:text-slate-400 font-medium">{dict?.fileHash?.batchTitle || "Drag & drop files here"}</p>
          <p class="text-sm text-slate-500 mt-1">or click to browse multiple files</p>
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

  {#if isRestoredView && hashResult}
    <!-- Output for single restored item -->
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
      <HashOutput
        result={hashResult}
        label="{selectedAlgorithm} Checksum"
        uppercase={false}
        dict={dict}
      />
    </div>
  {:else if filesList.length > 0}
    <!-- Batch Output -->
    <div class="animate-in fade-in slide-in-from-bottom-2 duration-300 space-y-4">
      <div class="flex items-center justify-between">
         <h3 class="font-medium text-slate-800 dark:text-slate-200">Processed Files ({filesList.length})</h3>
         {#if filesList.some(f => f.result)}
           <button
             on:click={exportChecksums}
             class="flex items-center gap-2 px-4 py-2 min-h-[44px] min-w-[44px] bg-indigo-50 text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg text-sm font-medium transition-colors"
           >
             <Download size={16} />
             {dict?.fileHash?.exportChecksums || "Export Checksums"}
           </button>
         {/if}
      </div>

      <div class="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
        <ul class="divide-y divide-slate-100 dark:divide-slate-800/50 max-h-[400px] overflow-y-auto">
          {#each filesList as item, i (item.file.name + i)}
            <li class="p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
               <div class="flex-1 min-w-0">
                  <div class="flex items-center justify-between mb-1">
                    <p class="text-sm font-medium text-slate-800 dark:text-slate-200 truncate pr-4">{item.file.name}</p>
                    <span class="text-xs text-slate-500 whitespace-nowrap">{formatBytes(item.file.size)}</span>
                  </div>

                  {#if !item.result && !item.error}
                     <div class="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 mt-2">
                        <div class="bg-indigo-500 h-1.5 rounded-full transition-all duration-300" style="width: {item.progress}%"></div>
                     </div>
                     <div class="flex justify-between items-center mt-1 text-xs text-slate-500">
                        <span>{item.speed || 'Calculating speed...'}</span>
                        <span>{item.eta || 'Estimating time...'}</span>
                     </div>
                  {:else if item.error}
                     <p class="text-xs text-red-500">{item.error}</p>
                  {:else if item.result}
                     <div class="mt-1 space-y-1">
                       <p class="text-xs font-mono text-slate-500 dark:text-slate-400 break-all bg-slate-100 dark:bg-slate-800 p-2 rounded">
                          {item.result.hex}
                       </p>
                       {#if expectedHashes[item.file.name]}
                         {#if expectedHashes[item.file.name] === item.result.hex.toLowerCase()}
                           <div class="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md text-xs font-medium border border-emerald-200 dark:border-emerald-800 w-fit">
                             <CheckCircle2 size={14} />
                             {dict?.common?.match || "Match"}
                           </div>
                         {:else}
                           <div class="flex items-center gap-1 text-red-500 bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded-md text-xs font-medium border border-red-200 dark:border-red-800 w-fit">
                             <XCircle size={14} />
                             {dict?.common?.mismatch || "Mismatch"}
                           </div>
                         {/if}
                       {/if}
                     </div>
                  {/if}
               </div>

               {#if item.result}
                 <button
                    on:click={() => copyToClipboard(item)}
                    class="flex items-center justify-center min-h-[44px] min-w-[44px] shrink-0 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 rounded-lg transition-colors {item.copied ? 'text-emerald-600 dark:text-emerald-400' : ''}"
                    aria-label="Copy hash"
                    title="Copy hash"
                 >
                    {#if item.copied}
                       <Check size={18} />
                    {:else}
                       <Copy size={18} />
                    {/if}
                 </button>
               {/if}
            </li>
          {/each}
        </ul>
      </div>
    </div>
  {/if}
</div>
