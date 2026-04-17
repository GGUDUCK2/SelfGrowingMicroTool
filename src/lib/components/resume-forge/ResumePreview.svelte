<script lang="ts">
  import { resumeStore } from '$lib/utils/resume-forge/store';
  import Seoul from './templates/Seoul.svelte';
  import Tokyo from './templates/Tokyo.svelte';
  import NewYork from './templates/NewYork.svelte';
  import { Printer, Download, Save, RotateCcw, FileJson, Layout, Type, Palette, Maximize, Minimize } from 'lucide-svelte';

  export let dict: any;
  export let onSave: () => void;
  export let onReset: () => void;
  export let onExportJson: () => void;

  let fitToScreen = false;
  let containerWidth = 0;
  // 210mm is approx 794px. We add padding (32px * 2 = 64px) to calculation.
  $: scale = fitToScreen && containerWidth ? Math.min((containerWidth - 64) / 794, 1) : 1;

  const templates = {
    seoul: Seoul,
    tokyo: Tokyo,
    newYork: NewYork
  };

  const themes = [
    { id: 'slate', color: '#64748b' },
    { id: 'blue', color: '#3b82f6' },
    { id: 'indigo', color: '#6366f1' },
    { id: 'emerald', color: '#10b981' },
    { id: 'rose', color: '#f43f5e' },
    { id: 'amber', color: '#f59e0b' }
  ];

  const fonts = [
    { id: 'sans', label: 'Sans' },
    { id: 'serif', label: 'Serif' },
    { id: 'mono', label: 'Mono' }
  ];

  function print() {
    window.print();
  }
</script>

<div class="flex flex-col h-full bg-slate-100 dark:bg-slate-900/50">
  <!-- Toolbar -->
  <div class="flex flex-wrap items-center justify-between p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 gap-4">
      <div class="flex items-center gap-4">
          <!-- Template Selector -->
          <div class="flex items-center gap-2">
             <Layout size={16} class="text-slate-400" />
             <select class="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 cursor-pointer" bind:value={$resumeStore.meta.template}>
                 <option value="seoul">Seoul</option>
                 <option value="tokyo">Tokyo</option>
                 <option value="newYork">New York</option>
             </select>
          </div>

          <!-- Theme Selector -->
          <div class="flex items-center gap-2">
             <Palette size={16} class="text-slate-400" />
             <div class="flex gap-1">
                 {#each themes as t}
                    <button
                        class="w-4 h-4 rounded-full border border-slate-200 dark:border-slate-700 transition-transform hover:scale-125 {$resumeStore.meta.theme === t.id ? 'ring-2 ring-offset-1 ring-slate-400' : ''}"
                        style="background-color: {t.color}"
                        on:click={() => $resumeStore.meta.theme = t.id}
                        aria-label={t.id}
                    ></button>
                 {/each}
             </div>
          </div>

          <!-- Font Selector -->
          <div class="flex items-center gap-2 border-l border-slate-200 dark:border-slate-700 pl-4">
             <Type size={16} class="text-slate-400" />
             <select class="bg-transparent text-sm font-medium text-slate-700 dark:text-slate-300 border-none focus:ring-0 cursor-pointer" bind:value={$resumeStore.meta.font}>
                 {#each fonts as f}
                    <option value={f.id}>{f.label}</option>
                 {/each}
             </select>
          </div>
      </div>

      <div class="flex items-center gap-2">
         <button class="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 md:hidden" on:click={() => fitToScreen = !fitToScreen} title={dict.preview.fitWidth}>
             {#if fitToScreen}
                <Maximize size={20} />
             {:else}
                <Minimize size={20} />
             {/if}
         </button>
         <button on:click={onExportJson} class="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white" title={dict.actions.exportJson}>
             <FileJson size={20} />
         </button>
         <button on:click={onReset} class="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-400" title={dict.actions.reset}>
             <RotateCcw size={20} />
         </button>
         <div class="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-1"></div>
         <button on:click={onSave} class="min-h-[44px] min-w-[44px] flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors">
             <Save size={16} />
             <span class="hidden sm:inline">{dict.actions.save}</span>
         </button>
         <button on:click={print} class="min-h-[44px] min-w-[44px] flex items-center gap-2 px-3 py-1.5 text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-sm transition-colors">
             <Download size={16} />
             <span class="hidden sm:inline">{dict.actions.downloadPdf}</span>
         </button>
      </div>
  </div>

  <!-- Preview Area -->
  <div class="flex-1 overflow-auto p-8 flex justify-center bg-slate-100 dark:bg-black/20 print:p-0 print:bg-white print:overflow-visible {fitToScreen ? 'overflow-x-hidden' : ''}" bind:clientWidth={containerWidth}>
     <div
        class="a4-page bg-white text-slate-900 shadow-xl print:shadow-none print:w-full print:h-auto print:m-0 transition-transform duration-200 origin-top"
        style="transform: scale({scale})"
        data-theme={$resumeStore.meta.theme}
        data-font={$resumeStore.meta.font}
     >
        <svelte:component this={templates[$resumeStore.meta.template]} resume={$resumeStore} />
     </div>
  </div>
</div>

<style>
    .a4-page {
        width: 210mm;
        min-height: 297mm;
        padding: 0;
        margin: 0 auto;
        position: relative;
    }

    @media print {
        .a4-page {
            width: 100%;
            height: 100%;
            zoom: 1; /* Check if needed */
        }
        :global(body) {
            background: white;
        }
        :global(nav), :global(header), :global(footer), :global(.no-print) {
            display: none !important;
        }
    }

    /* Font Styles */
    div[data-font="sans"] { font-family: ui-sans-serif, system-ui, sans-serif; }
    div[data-font="serif"] { font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif; }
    div[data-font="mono"] { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; }

    /* Theme Styles Variables */
    div[data-theme="slate"] { --accent: #64748b; --accent-light: #f1f5f9; }
    div[data-theme="blue"] { --accent: #3b82f6; --accent-light: #eff6ff; }
    div[data-theme="indigo"] { --accent: #6366f1; --accent-light: #eef2ff; }
    div[data-theme="emerald"] { --accent: #10b981; --accent-light: #ecfdf5; }
    div[data-theme="rose"] { --accent: #f43f5e; --accent-light: #fff1f2; }
    div[data-theme="amber"] { --accent: #f59e0b; --accent-light: #fffbeb; }
</style>
