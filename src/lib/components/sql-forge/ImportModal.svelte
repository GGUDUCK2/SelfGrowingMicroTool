<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Upload, X, FileJson, FileSpreadsheet } from 'lucide-svelte';
  import Papa from 'papaparse';

  export let t: any;
  const dispatch = createEventDispatcher();

  let files: FileList | null = null;
  let tableName = '';
  let isProcessing = false;
  let error = '';

  function handleFileSelect(e: Event) {
      files = (e.target as HTMLInputElement).files;
      if (files && files.length > 0) {
          const file = files[0];
          // Suggest table name from filename
          tableName = file.name.split('.')[0].replace(/[^a-zA-Z0-9_]/g, '_');
      }
  }

  async function handleImport() {
      if (!files || files.length === 0 || !tableName) return;

      isProcessing = true;
      error = '';
      const file = files[0];

      try {
          let data: any[] = [];

          if (file.name.endsWith('.csv')) {
              await new Promise((resolve, reject) => {
                  Papa.parse(file, {
                      header: true,
                      dynamicTyping: true,
                      skipEmptyLines: true,
                      complete: (results) => {
                          if (results.errors.length) {
                              console.warn('CSV errors:', results.errors);
                          }
                          data = results.data;
                          resolve(null);
                      },
                      error: (err) => reject(err)
                  });
              });
          } else if (file.name.endsWith('.json')) {
              const text = await file.text();
              const json = JSON.parse(text);
              if (Array.isArray(json)) {
                  data = json;
              } else {
                  throw new Error('JSON must be an array of objects');
              }
          } else {
              throw new Error('Unsupported file type');
          }

          dispatch('import', { name: tableName, data });
      } catch (e: any) {
          error = e.message || 'Import failed';
      } finally {
          isProcessing = false;
      }
  }
</script>

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true">
    <div class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-lg border border-gray-200 dark:border-gray-700">
        <div class="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 class="font-bold text-lg text-gray-900 dark:text-white">{t.import}</h3>
            <button class="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-gray-500" on:click={() => dispatch('close')} aria-label="Close">
                <X size={20} />
            </button>
        </div>

        <div class="p-6 space-y-6">
            <!-- File Input -->
            <div class="space-y-2">
                <label for="file-upload" class="block text-sm font-medium text-gray-700 dark:text-gray-300">Select File (CSV or JSON)</label>
                <div class="flex items-center justify-center w-full">
                    <label for="file-upload" class="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                        <div class="flex flex-col items-center justify-center pt-5 pb-6">
                            {#if files && files.length > 0}
                                {#if files[0].name.endsWith('.csv')}
                                    <FileSpreadsheet class="w-8 h-8 mb-2 text-green-500" />
                                {:else}
                                    <FileJson class="w-8 h-8 mb-2 text-yellow-500" />
                                {/if}
                                <p class="text-sm text-gray-500 dark:text-gray-400 font-medium">{files[0].name}</p>
                                <p class="text-xs text-gray-400">{(files[0].size / 1024).toFixed(1)} KB</p>
                            {:else}
                                <Upload class="w-8 h-8 mb-2 text-gray-400" />
                                <p class="text-sm text-gray-500 dark:text-gray-400"><span class="font-semibold">Click to upload</span> or drag and drop</p>
                                <p class="text-xs text-gray-500 dark:text-gray-400">CSV or JSON (Array)</p>
                            {/if}
                        </div>
                        <input id="file-upload" type="file" accept=".csv,.json" class="hidden" on:change={handleFileSelect} />
                    </label>
                </div>
            </div>

            <!-- Table Name -->
            <div>
                <label for="table-name" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Table Name</label>
                <input
                    id="table-name"
                    type="text"
                    bind:value={tableName}
                    placeholder="my_table"
                    class="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p class="mt-1 text-xs text-gray-500">Only letters, numbers, and underscores.</p>
            </div>

            {#if error}
                <div class="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm rounded-lg border border-red-200 dark:border-red-800">
                    {error}
                </div>
            {/if}
        </div>

        <div class="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-3 bg-gray-50 dark:bg-gray-900/50 rounded-b-xl">
            <button
                class="px-4 py-2 min-h-[44px] min-w-[44px] text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
                on:click={() => dispatch('close')}
            >
                Cancel
            </button>
            <button
                class="px-4 py-2 min-h-[44px] min-w-[44px] text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                on:click={handleImport}
                disabled={!files || !tableName || isProcessing}
            >
                {#if isProcessing}
                    <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {/if}
                Import
            </button>
        </div>
    </div>
</div>
