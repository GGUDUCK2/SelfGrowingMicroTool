<script lang="ts">
  import { policyStore } from '$lib/stores/policy-forge';
  import { generatePrivacy, generateTerms } from '$lib/utils/policy-forge/templates';
  import { marked } from 'marked';
  import { Copy, Download, RotateCcw, Save, FolderOpen } from 'lucide-svelte';

  export let dict: any;
  export let lang: string = 'en';
  export let onSave: () => void;
  export let onReset: () => void;
  export let onLoad: () => void;

  let activeTab = 'privacy';
  let copied = false;

  $: privacyMd = generatePrivacy($policyStore, lang);
  $: termsMd = generateTerms($policyStore, lang);
  $: activeMd = activeTab === 'privacy' ? privacyMd : termsMd;
  $: activeHtml = marked.parse(activeMd);

  function copy() {
      navigator.clipboard.writeText(activeMd);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }

  function download() {
      const blob = new Blob([activeHtml], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${activeTab}-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
  }
</script>

<div class="flex flex-col h-full bg-slate-50 dark:bg-black">
    <!-- Toolbar -->
    <div class="h-14 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 bg-white dark:bg-slate-900 shrink-0">
        <div class="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
            <button
                class="px-3 py-1 text-xs font-medium rounded-md transition-all {activeTab === 'privacy' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}"
                on:click={() => activeTab = 'privacy'}
            >
                {dict.tabs.privacy}
            </button>
            <button
                class="px-3 py-1 text-xs font-medium rounded-md transition-all {activeTab === 'terms' ? 'bg-white dark:bg-slate-700 shadow text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'}"
                on:click={() => activeTab = 'terms'}
            >
                {dict.tabs.terms}
            </button>
        </div>

        <div class="flex items-center gap-2">
             <button class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hidden md:block" on:click={onLoad} title={dict.actions.load}>
                <FolderOpen size={18} />
            </button>
            <button class="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hidden md:block" on:click={onReset} title={dict.actions.reset}>
                <RotateCcw size={18} />
            </button>
            <button class="p-2 text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 hidden md:block" on:click={onSave} title={dict.actions.save}>
                <Save size={18} />
            </button>
            <div class="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1 hidden md:block"></div>
            <button
                class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                on:click={copy}
            >
                <Copy size={14} />
                {copied ? 'Copied!' : dict.actions.copy}
            </button>
            <button
                class="flex items-center gap-1 px-3 py-1.5 text-xs font-medium bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                on:click={download}
            >
                <Download size={14} />
                {dict.actions.download}
            </button>
        </div>
    </div>

    <!-- Preview Area -->
    <div class="flex-1 overflow-y-auto p-4 md:p-12">
        <div class="max-w-3xl mx-auto bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800 rounded-xl p-8 md:p-12 min-h-[800px] prose dark:prose-invert prose-slate prose-sm md:prose-base focus:outline-none">
            {@html activeHtml}
        </div>
    </div>
</div>
