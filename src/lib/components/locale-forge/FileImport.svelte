<script lang="ts">
  import { flatten } from '$lib/utils/locale-forge/flattener';
  import { projectStore } from '$lib/utils/locale-forge/store';
  import { Upload } from 'lucide-svelte';

  let dragging = false;

  function handleFiles(files: FileList) {
    if (!files || files.length === 0) return;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const lang = file.name.replace('.json', ''); // simple deduction
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const flat = flatten(json);

          projectStore.update(store => {
            const newLanguages = store.languages.includes(lang) ? store.languages : [...store.languages, lang];

            // Merge logic
            // 1. Get all existing keys
            const allKeys = new Set(store.data.map(item => item.key));

            // 2. Add new keys from file
            Object.keys(flat).forEach(k => allKeys.add(k));

            // 3. Rebuild data
            const newData = Array.from(allKeys).sort().map(key => {
              const existingItem = store.data.find(d => d.key === key);
              const existingValues = existingItem ? existingItem.values : {};

              // Update value for this lang if present in file
              const newValue = flat[key] !== undefined ? flat[key] : existingValues[lang];

              return {
                key,
                values: {
                  ...existingValues,
                  [lang]: newValue || '' // ensure string
                }
              };
            });

            return {
              ...store,
              languages: newLanguages,
              data: newData
            };
          });
        } catch (err) {
          console.error('Failed to parse ' + file.name, err);
          alert('Error parsing ' + file.name);
        }
      };

      reader.readAsText(file);
    }
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    dragging = false;
    if (e.dataTransfer?.files) {
      handleFiles(e.dataTransfer.files);
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
  class="border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer {dragging ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500'}"
  on:dragover|preventDefault={() => dragging = true}
  on:dragleave={() => dragging = false}
  on:drop={onDrop}
  on:click={() => document.getElementById('fileInput')?.click()}
  on:keydown={(e) => e.key === 'Enter' && document.getElementById('fileInput')?.click()}
>
  <input
    type="file"
    id="fileInput"
    multiple
    accept=".json"
    class="hidden"
    on:change={(e) => e.currentTarget.files && handleFiles(e.currentTarget.files)}
  />

  <div class="flex flex-col items-center gap-3 text-slate-500 dark:text-slate-400">
    <div class="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
      <Upload size={24} />
    </div>
    <p class="text-sm font-medium">
      <span class="text-indigo-600 dark:text-indigo-400">Click to upload</span> or drag and drop JSON files
    </p>
    <p class="text-xs">e.g. en.json, ko.json</p>
  </div>
</div>
