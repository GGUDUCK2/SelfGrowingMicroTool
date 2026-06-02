<script lang="ts">
  import { calculateHash } from '$lib/utils/file-forge/hash';
  import { FileDiff, CheckCircle, XCircle, UploadCloud, Binary, GitCompare, Image as ImageIcon } from '@lucide/svelte';
  import { fade } from 'svelte/transition';
  import { onDestroy } from 'svelte';

  export let file: File; // The primary file
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;

  let comparisonType: 'file' | 'hash' = 'file';
  let diffMode = false; // Toggle between Hash Compare and Binary Diff
  let secondFile: File | null = null;
  let hashInput = '';
  let primaryHash = '';
  let secondaryHash = '';
  let loading = false;
  let match: boolean | null = null;
  let error: string | null = null;

  // Binary Diff State
  interface DiffByte {
      offset: number;
      val1: number;
      val2: number;
      isDiff: boolean;
  }
  let diffLines: { offset: string; bytes: DiffByte[]; ascii1: string; ascii2: string }[] = [];
  let firstDiffOffset = -1;

  // Visual Image Diff State
  let isImageDiff = false;
  let primaryImageUrl: string | null = null;
  let secondaryImageUrl: string | null = null;
  let sliderValue = 50;

  function cleanupImageUrls() {
      if (primaryImageUrl) URL.revokeObjectURL(primaryImageUrl);
      if (secondaryImageUrl) URL.revokeObjectURL(secondaryImageUrl);
      primaryImageUrl = null;
      secondaryImageUrl = null;
  }

  onDestroy(() => {
      cleanupImageUrls();
  });

  async function handleCompare() {
    loading = true;
    match = null;
    error = null;
    diffLines = [];
    firstDiffOffset = -1;

    try {
      if (!diffMode) {
          // Hash Comparison Logic
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
      } else {
          // Binary Diff Logic
          if (!secondFile) {
              loading = false;
              return;
          }

          isImageDiff = file.type.startsWith('image/') && secondFile.type.startsWith('image/');

          if (isImageDiff) {
              cleanupImageUrls();
              primaryImageUrl = URL.createObjectURL(file);
              secondaryImageUrl = URL.createObjectURL(secondFile);
          } else {
              await performBinaryDiff();
          }
      }

    } catch (e) {
      console.error(e);
      error = 'Comparison failed. File might be too large or unreadable.';
    } finally {
      loading = false;
    }
  }

  async function performBinaryDiff() {
      // Read first 1KB of both files
      const chunkSize = 1024;
      const buf1 = await file.slice(0, chunkSize).arrayBuffer();
      const buf2 = await secondFile!.slice(0, chunkSize).arrayBuffer();

      const view1 = new Uint8Array(buf1);
      const view2 = new Uint8Array(buf2);

      const maxLen = Math.max(view1.length, view2.length);

      let localDiffLines = [];

      for (let i = 0; i < maxLen; i += 8) { // 8 bytes per line for side-by-side
          const rowBytes: DiffByte[] = [];

          for (let j = 0; j < 8; j++) {
              const offset = i + j;
              if (offset >= maxLen) break;

              const v1 = view1[offset] ?? -1; // -1 indicates EOF/Missing
              const v2 = view2[offset] ?? -1;
              const isDiff = v1 !== v2;

              if (isDiff && firstDiffOffset === -1) {
                  firstDiffOffset = offset;
              }

              rowBytes.push({ offset, val1: v1, val2: v2, isDiff });
          }

          const ascii1 = rowBytes.map(b => (b.val1 >= 32 && b.val1 <= 126) ? String.fromCharCode(b.val1) : '.').join('');
          const ascii2 = rowBytes.map(b => (b.val2 >= 32 && b.val2 <= 126) ? String.fromCharCode(b.val2) : '.').join('');

          localDiffLines.push({
              offset: i.toString(16).padStart(4, '0').toUpperCase(),
              bytes: rowBytes,
              ascii1,
              ascii2
          });
      }

      diffLines = localDiffLines;
      match = firstDiffOffset === -1 && file.size === secondFile!.size; // Simple equality check for diff
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
  <div class="flex flex-wrap gap-4 border-b border-slate-200 dark:border-slate-700 pb-4 justify-between items-center">
    <div class="flex gap-2">
        <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {comparisonType === 'file' && !diffMode ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
        on:click={() => { comparisonType = 'file'; diffMode = false; match = null; }}
        >
        {dict?.compare?.tabFile || 'Compare with File'}
        </button>
        <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors {comparisonType === 'hash' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}"
        on:click={() => { comparisonType = 'hash'; diffMode = false; match = null; }}
        >
        {dict?.compare?.tabHash || 'Compare with Hash'}
        </button>
    </div>

    <button
        class="px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 {diffMode ? 'bg-indigo-600 text-white shadow-md' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}"
        on:click={() => { diffMode = !diffMode; comparisonType = 'file'; match = null; }}
    >
        <Binary size={16} />
        {dict?.compare?.binaryDiff || 'Binary Diff Mode'}
    </button>
  </div>

  <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
    <!-- Primary File Info -->
    <div class="p-4 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
      <h3 class="text-xs font-bold text-slate-500 uppercase mb-2">{dict?.compare?.primary || 'Primary File'}</h3>
      <div class="font-medium text-slate-900 dark:text-white truncate" title={file.name}>{file.name}</div>
      <div class="text-xs text-slate-400 mt-1">{(file.size / 1024).toFixed(2)} KB</div>
      {#if primaryHash && !diffMode}
        <div class="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div class="text-xs text-slate-500 mb-1">SHA-256 Hash</div>
          <div class="font-mono text-[10px] break-all text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded border border-slate-200 dark:border-slate-700 select-all leading-tight">
            {primaryHash}
          </div>
        </div>
      {/if}
    </div>

    <!-- Secondary Input -->
    <div class="space-y-4">
      <h3 class="text-xs font-bold text-slate-500 uppercase mb-2">{dict?.compare?.secondary || 'Secondary Source'}</h3>

      {#if comparisonType === 'file' || diffMode}
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
  {#if diffMode && isImageDiff && primaryImageUrl && secondaryImageUrl}
      <div class="space-y-4 animate-in fade-in">
          <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <ImageIcon size={16} class="text-indigo-500" /> Visual Image Diff
              </h3>
              <span class="text-xs text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">Interactive Overlay</span>
          </div>

          <div class="relative w-full aspect-video bg-[url('/checker.png')] bg-white rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-inner group">
              <!-- Primary Image (Background) -->
              <img src={primaryImageUrl} alt="Primary File" class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none" />

              <!-- Secondary Image (Clipped) -->
              <div
                  class="absolute inset-0 overflow-hidden"
                  style="clip-path: polygon(0 0, {sliderValue}% 0, {sliderValue}% 100%, 0 100%);"
              >
                  <img src={secondaryImageUrl} alt="Secondary File" class="absolute inset-0 w-full h-full object-contain pointer-events-none select-none max-w-none" />
              </div>

              <!-- Slider Input -->
              <input
                  type="range"
                  min="0" max="100"
                  bind:value={sliderValue}
                  class="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-10"
                  aria-label="Image difference slider"
              />

              <!-- Slider Line -->
              <div
                  class="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_5px_rgba(0,0,0,0.5)] z-0 pointer-events-none flex flex-col items-center justify-center transition-transform"
                  style="left: calc({sliderValue}% - 2px);"
              >
                  <div class="w-8 h-8 bg-white rounded-full shadow-md flex items-center justify-center">
                      <GitCompare size={14} class="text-indigo-600" />
                  </div>
              </div>
          </div>
          <div class="flex justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
              <span>{dict?.compare?.secondary || 'Secondary Source'}</span>
              <span>{dict?.compare?.primary || 'Primary File'}</span>
          </div>
      </div>
  {:else if diffMode && diffLines.length > 0}
      <!-- Binary Diff View -->
      <div class="space-y-4">
          <div class="flex items-center justify-between">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2">
                  <GitCompare size={16} /> Binary Diff (First 1KB)
              </h3>
              {#if firstDiffOffset !== -1}
                  <span class="text-xs font-mono text-red-500 bg-red-50 dark:bg-red-900/30 px-2 py-1 rounded">
                      First diff at 0x{firstDiffOffset.toString(16).toUpperCase()}
                  </span>
              {:else}
                  <span class="text-xs font-mono text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">
                      Identical (First 1KB)
                  </span>
              {/if}
          </div>

          <div class="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 font-mono text-xs shadow-lg">
              <div class="grid grid-cols-[60px_1fr_1fr] bg-slate-950 border-b border-slate-800 text-slate-500 px-4 py-2 font-bold">
                  <div>OFFSET</div>
                  <div>FILE 1 (ORIGINAL)</div>
                  <div>FILE 2 (COMPARED)</div>
              </div>
              <div class="max-h-[400px] overflow-y-auto p-4 space-y-1">
                  {#each diffLines as line (line.offset)}
                      <div class="grid grid-cols-[60px_1fr_1fr] hover:bg-white/5 rounded transition-colors group">
                          <div class="text-slate-600">{line.offset}</div>

                          <!-- File 1 Bytes -->
                          <div class="flex gap-2">
                              <span class="text-slate-300 w-48 font-medium">
                                  {#each line.bytes as b (b.offset)}
                                      <span class={b.isDiff ? 'text-red-400 bg-red-900/30' : (b.val1 === -1 ? 'text-slate-700' : 'text-slate-400')}>
                                          {b.val1 !== -1 ? b.val1.toString(16).padStart(2,'0').toUpperCase() : '..'}
                                      </span>
                                  {/each}
                              </span>
                              <span class="text-amber-500/50 border-l border-slate-800 pl-2">{line.ascii1}</span>
                          </div>

                          <!-- File 2 Bytes -->
                          <div class="flex gap-2">
                              <span class="text-slate-300 w-48 font-medium">
                                  {#each line.bytes as b (b.offset)}
                                      <span class={b.isDiff ? 'text-emerald-400 bg-emerald-900/30 font-bold' : (b.val2 === -1 ? 'text-slate-700' : 'text-slate-400')}>
                                          {b.val2 !== -1 ? b.val2.toString(16).padStart(2,'0').toUpperCase() : '..'}
                                      </span>
                                  {/each}
                              </span>
                              <span class="text-amber-500/50 border-l border-slate-800 pl-2">{line.ascii2}</span>
                          </div>
                      </div>
                  {/each}
              </div>
          </div>
      </div>

  {:else if match !== null && !loading && !diffMode}
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
