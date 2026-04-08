<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let content: string = '';
  export let t: any;

  const dispatch = createEventDispatcher();

  function handleFileChange(event: Event) {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        content = e.target?.result as string;
        dispatch('change', content);
      };
      reader.readAsText(file);
    }
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        content = e.target?.result as string;
        dispatch('change', content);
      };
      reader.readAsText(file);
    }
  }

  function handleInput(event: Event) {
      const target = event.target as HTMLTextAreaElement;
      content = target.value;
      dispatch('change', content);
  }

</script>

<div
  class="relative w-full h-full flex flex-col"
  on:dragover|preventDefault
  on:drop|preventDefault={handleDrop}
  role="region"
  aria-label="Editor Dropzone"
>
  <div class="flex-grow relative">
    <textarea
      class="w-full h-[500px] p-6 bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-mono text-sm border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors resize-none shadow-inner"
      placeholder={t.placeholder}
      value={content}
      on:input={handleInput}
      spellcheck="false"
      id="env-editor"
    ></textarea>
  </div>

  <div class="absolute top-4 right-4 flex space-x-2">
     <label for="env-upload" class="cursor-pointer inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm focus-within:ring-2 focus-within:ring-indigo-500">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
        {t.upload}
        <input id="env-upload" type="file" accept=".env,text/plain" class="sr-only" on:change={handleFileChange} />
     </label>

     <button class="inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium rounded-lg text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500" on:click={() => { content = ''; dispatch('change', content); }}>
       <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
       {t.clear}
     </button>
  </div>
</div>