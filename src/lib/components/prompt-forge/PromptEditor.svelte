<script lang="ts">
  import type { PromptForgeDictionary } from '$lib/types/prompt-forge';

  export let systemPrompt: string = "";
  export let userPrompt: string = "";
  export let dict: PromptForgeDictionary;
</script>

<div class="flex flex-col h-full gap-4">
  <!-- System Prompt Section -->
  <div class="flex-none relative group">
    <div class="flex justify-between items-center mb-2">
         <label for="system-prompt" class="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {dict.editor.system}
        </label>
        <button on:click={() => systemPrompt = ""} class="text-xs text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Clear System Prompt" aria-label="Clear System Prompt">
            Clear
        </button>
    </div>

    <textarea
      id="system-prompt"
      bind:value={systemPrompt}
      class="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
      placeholder="You are a helpful AI assistant..."
    ></textarea>
  </div>

  <!-- User Prompt Section -->
  <div class="flex-1 flex flex-col min-h-0 relative group">
    <div class="flex justify-between items-center mb-2">
        <label for="user-prompt" class="block text-sm font-semibold text-slate-700 dark:text-slate-300">
          {dict.editor.user}
        </label>
         <button on:click={() => userPrompt = ""} class="text-xs text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity" title="Clear User Prompt" aria-label="Clear User Prompt">
            Clear
        </button>
    </div>

    <div class="relative flex-1">
      <textarea
        id="user-prompt"
        bind:value={userPrompt}
        class="w-full h-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder-slate-400 dark:placeholder-slate-500 shadow-sm"
        placeholder={dict.editor.placeholder}
      ></textarea>
    </div>
  </div>
</div>
