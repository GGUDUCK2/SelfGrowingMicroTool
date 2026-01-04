<script lang="ts">
  export let dictionary: any;

  const cheatSheetItems = [
    { label: 'Any character except newline', code: '.' },
    { label: 'Zero or more of previous', code: '*' },
    { label: 'One or more of previous', code: '+' },
    { label: 'Zero or one of previous', code: '?' },
    { label: 'Start of string', code: '^' },
    { label: 'End of string', code: '$' },
    { label: 'Escape special character', code: '\\' },
    { label: 'Or', code: '|' },
    { label: 'Group', code: '(...)' },
    { label: 'Any single character in brackets', code: '[...]' },
    { label: 'Any character NOT in brackets', code: '[^...]' },
    { label: 'Range', code: '[a-z]' },
    { label: 'Digit', code: '\\d' },
    { label: 'Non-digit', code: '\\D' },
    { label: 'Word character', code: '\\w' },
    { label: 'Non-word character', code: '\\W' },
    { label: 'Whitespace', code: '\\s' },
    { label: 'Non-whitespace', code: '\\S' },
    { label: 'Word boundary', code: '\\b' },
    { label: 'Non-word boundary', code: '\\B' },
  ];
</script>

<div class="bg-white/50 dark:bg-slate-800/50 backdrop-blur-md rounded-xl p-4 border border-indigo-100 dark:border-indigo-900 shadow-sm h-full overflow-hidden flex flex-col">
  <h3 class="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 px-2">{dictionary.cheatsheet}</h3>
  <div class="flex-grow overflow-y-auto pr-2 custom-scrollbar">
    <div class="grid grid-cols-1 gap-2">
      {#each cheatSheetItems as item}
        <div class="flex items-center justify-between p-2 rounded-lg hover:bg-white dark:hover:bg-slate-700 transition-colors group">
          <span class="text-sm text-slate-600 dark:text-slate-300">{item.label}</span>
          <code class="px-2 py-1 bg-slate-100 dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 rounded text-xs font-mono font-bold group-hover:bg-indigo-50 dark:group-hover:bg-slate-800 transition-colors">
            {item.code}
          </code>
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: rgba(156, 163, 175, 0.3);
    border-radius: 20px;
  }
</style>
