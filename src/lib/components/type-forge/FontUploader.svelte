<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Upload, Type } from 'lucide-svelte';
  import { loadFont } from '$lib/utils/type-forge/loader';

  export let dict: any;

  const dispatch = createEventDispatcher();
  let isDragging = false;
  let isLoading = false;
  let error = '';

  async function handleFile(file: File) {
      if (!file) return;
      isLoading = true;
      error = '';

      try {
          const font = await loadFont(file);
          dispatch('load', font);
      } catch (e) {
          console.error(e);
          error = 'Failed to parse font file. Ensure it is a valid TTF, OTF, or WOFF.';
      } finally {
          isLoading = false;
      }
  }

  function onDrop(e: DragEvent) {
      isDragging = false;
      if (e.dataTransfer?.files.length) {
          handleFile(e.dataTransfer.files[0]);
      }
  }

  function onChange(e: Event) {
      const input = e.target as HTMLInputElement;
      if (input.files?.length) {
          handleFile(input.files[0]);
      }
  }

  async function loadExample() {
      isLoading = true;
      try {
          const res = await fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hjp-Ek-_EeA.ttf');
          const blob = await res.blob();
          const file = new File([blob], "Inter-Variable.ttf");
          await handleFile(file);
      } catch(e) {
          error = "Failed to load example.";
      }
  }
</script>

<div
  class="relative border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 {isDragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/10' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'}"
  role="region"
  aria-label="File Upload Dropzone"
  on:dragover|preventDefault={() => isDragging = true}
  on:dragleave={() => isDragging = false}
  on:drop|preventDefault={onDrop}
>
  {#if isLoading}
      <div class="flex flex-col items-center justify-center space-y-4">
          <div class="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <p class="text-slate-500 dark:text-slate-400">Parsing font tables...</p>
      </div>
  {:else}
      <div class="flex flex-col items-center justify-center space-y-4">
          <div class="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-600 dark:text-indigo-400">
              <Upload size={32} />
          </div>
          <div>
              <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">{dict.upload.title}</h3>
              <p class="text-sm text-slate-500 dark:text-slate-400">{dict.upload.dragDrop}</p>
              <p class="text-xs text-slate-400 dark:text-slate-500 mt-2">{dict.upload.formats}</p>
          </div>

          <input
              type="file"
              accept=".ttf,.otf,.woff,.woff2"
              class="hidden"
              id="font-upload"
              on:change={onChange}
          />
          <label
              for="font-upload"
              class="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
          >
              Browse Files
          </label>

          <div class="pt-4">
              <button on:click={loadExample} class="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">
                  {dict.upload.loadExample}
              </button>
          </div>

          {#if error}
              <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg mt-4">
                  {error}
              </div>
          {/if}
      </div>
  {/if}
</div>
