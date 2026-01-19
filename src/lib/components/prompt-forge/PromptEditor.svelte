<script lang="ts">
  export let systemPrompt: string = "";
  export let userPrompt: string = "";
  export let dict: Record<string, any>;
</script>

<div class="flex flex-col h-full gap-4">
  <!-- System Prompt Section -->
  <div class="flex-none">
    <label for="system-prompt" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
      {dict.editor.system}
    </label>
    <textarea
      id="system-prompt"
      bind:value={systemPrompt}
      class="w-full h-32 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
      placeholder="You are a helpful AI assistant..."
    ></textarea>
  </div>

  <!-- User Prompt Section -->
  <div class="flex-1 flex flex-col min-h-0">
    <label for="user-prompt" class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
      {dict.editor.user}
    </label>
    <div class="relative flex-1">
      <textarea
        id="user-prompt"
        bind:value={userPrompt}
        class="w-full h-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg p-4 text-sm font-mono text-slate-800 dark:text-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none resize-none transition-all placeholder-slate-400 dark:placeholder-slate-500"
        placeholder={dict.editor.placeholder}
      ></textarea>

      <!-- Helper text or hints could go here -->
    </div>
  </div>
</div>
