<script lang="ts">
  import { onMount } from 'svelte';
  import { extractMetadata, type FileMetadata } from '$lib/utils/file-forge/metadata';
  import { convertImage } from '$lib/utils/file-forge/converter';
  import { Download, File as FileIcon, Image as ImageIcon } from 'lucide-svelte';

  export let file: File;
  export let dict: any;

  let metadata: FileMetadata | null = null;
  let previewUrl: string | null = null;
  let loading = true;

  // Conversion state
  let convertFormat: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png';
  let convertQuality = 0.9;
  let converting = false;

  async function load() {
    loading = true;
    // Revoke previous URL if exists
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      previewUrl = null;
    }

    try {
      metadata = await extractMetadata(file);
      if (file.type.startsWith('image/')) {
        previewUrl = URL.createObjectURL(file);
      }
    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  async function handleConvert() {
    converting = true;
    try {
      const blob = await convertImage(file, convertFormat, convertQuality);
      const url = URL.createObjectURL(blob);
      const ext = convertFormat.split('/')[1];
      const a = document.createElement('a');
      a.href = url;
      a.download = file.name.replace(/\.[^/.]+$/, "") + '.' + ext;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error(e);
      alert('Conversion failed');
    } finally {
      converting = false;
    }
  }

  $: if (file) load();

  import { onDestroy } from 'svelte';
  onDestroy(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
  });
</script>

<div class="space-y-6">
  <!-- Info Grid -->
  <div class="grid grid-cols-2 gap-4">
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-500 block mb-1">{dict.info.name}</span>
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200 break-all">{file.name}</span>
      </div>
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-500 block mb-1">{dict.info.size}</span>
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{(file.size / 1024).toFixed(1)} KB</span>
      </div>
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-500 block mb-1">{dict.info.type}</span>
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{file.type || 'Unknown'}</span>
      </div>
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700">
          <span class="text-xs text-slate-500 block mb-1">{dict.info.lastModified}</span>
          <span class="text-sm font-medium text-slate-800 dark:text-slate-200">{new Date(file.lastModified).toLocaleDateString()}</span>
      </div>
  </div>

  <!-- Deep Metadata -->
  {#if metadata}
      {#if metadata.dimensions}
          <div class="flex gap-4 p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800">
              <ImageIcon class="text-indigo-500" />
              <div>
                  <h4 class="text-sm font-bold text-indigo-900 dark:text-indigo-200">{dict.info.dimensions}</h4>
                  <p class="text-xs text-indigo-700 dark:text-indigo-300">{metadata.dimensions.width} x {metadata.dimensions.height} px</p>
              </div>
          </div>
      {/if}

      {#if metadata.pageCount}
          <div class="flex gap-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-100 dark:border-red-800">
              <FileIcon class="text-red-500" />
              <div>
                  <h4 class="text-sm font-bold text-red-900 dark:text-red-200">{dict.info.pageCount}</h4>
                  <p class="text-xs text-red-700 dark:text-red-300">{metadata.pageCount} pages</p>
              </div>
          </div>
      {/if}

      {#if metadata.fileCount}
          <div class="bg-slate-100 dark:bg-slate-800 rounded-xl p-4 max-h-64 overflow-y-auto">
              <h4 class="text-sm font-bold mb-2 sticky top-0 bg-slate-100 dark:bg-slate-800 pb-2 border-b dark:border-slate-700">{dict.info.fileCount}: {metadata.fileCount}</h4>
              <ul class="text-xs font-mono space-y-1">
                  {#each (metadata.files || []) as f}
                      <li class="truncate text-slate-600 dark:text-slate-400">{f}</li>
                  {/each}
                  {#if (metadata.files?.length || 0) < (metadata.fileCount || 0)}
                      <li class="italic text-slate-400">...and more</li>
                  {/if}
              </ul>
          </div>
      {/if}
  {/if}

  <!-- Image Preview & Convert -->
  {#if previewUrl}
      <div class="space-y-4 border-t border-slate-200 dark:border-slate-800 pt-6">
          <img src={previewUrl} alt="Preview" class="max-w-full max-h-96 rounded-lg mx-auto shadow-md object-contain bg-[url('/checker.png')] bg-white" />

          <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
              <h4 class="text-sm font-bold mb-4 flex items-center gap-2">
                  <ImageIcon size={16} />
                  {dict.tabs.convert}
              </h4>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 items-end">
                  <div>
                      <label class="block text-xs font-medium mb-1">{dict.convert.format}</label>
                      <select bind:value={convertFormat} class="w-full text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-lg p-2">
                          <option value="image/png">PNG</option>
                          <option value="image/jpeg">JPEG</option>
                          <option value="image/webp">WebP</option>
                      </select>
                  </div>
                  <div>
                      <label class="block text-xs font-medium mb-1">{dict.convert.quality} ({convertQuality})</label>
                      <input type="range" min="0.1" max="1" step="0.1" bind:value={convertQuality} class="w-full" />
                  </div>
                  <button
                      on:click={handleConvert}
                      disabled={converting}
                      class="sm:col-span-2 w-full py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center gap-2"
                  >
                      {#if converting}
                          Processing...
                      {:else}
                          <Download size={16} />
                          {dict.convert.download}
                      {/if}
                  </button>
              </div>
          </div>
      </div>
  {/if}
</div>
