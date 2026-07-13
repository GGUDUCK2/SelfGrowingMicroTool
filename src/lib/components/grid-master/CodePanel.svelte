<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import {
    generateCSS,
    generateTailwind,
    generateTailwindConfig,
    generateHTML,
    generateReact,
    generateVue,
    generateSvelte
  } from '$lib/utils/grid-master/codegen';
  import { openInStackBlitz, downloadSVG, downloadProjectZip, downloadPNG } from '$lib/utils/grid-master/export';
  import { Copy, Check, Code, FileCode, Download, Zap, FileType, Boxes, Box, Image, Package, Camera, FileJson } from '@lucide/svelte';
  import type { GridMasterDictionary } from '$lib/utils/grid-master/types';

  export let dict: GridMasterDictionary;
  export let theme = 'standard';

  let activeTab: 'tailwind' | 'config' | 'css' | 'html' | 'react' | 'vue' | 'svelte' = 'tailwind';
  let copied = false;

  $: code = (() => {
      switch (activeTab) {
          case 'tailwind': return generateTailwind($gridStore);
          case 'config': return generateTailwindConfig($gridStore);
          case 'css': return generateCSS($gridStore);
          case 'html': return generateHTML($gridStore);
          case 'react': return generateReact($gridStore);
          case 'vue': return generateVue($gridStore);
          case 'svelte': return generateSvelte($gridStore);
          default: return '';
      }
  })();

  function copyCode() {
      navigator.clipboard.writeText(code);
      copied = true;
      setTimeout(() => copied = false, 2000);
  }

  function downloadHTML() {
      const html = generateHTML($gridStore, theme);
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'grid-master-layout.html';
      a.click();
      URL.revokeObjectURL(url);
  }
</script>

<div class="bg-slate-900 rounded-xl overflow-hidden shadow-lg border border-slate-800 flex flex-col h-full">
  <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between px-4 py-3 bg-slate-950 border-b border-slate-800 gap-3">
      <div class="flex flex-wrap gap-2" role="tablist" aria-label="Code Output Format">
          <button
            role="tab"
            aria-selected={activeTab === 'tailwind'}
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'tailwind' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} min-h-[44px] min-w-[44px] justify-center"
            on:click={() => activeTab = 'tailwind'}
          >
             <Code size={14} />
             {dict.tailwind}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'config'}
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'config' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} min-h-[44px] min-w-[44px] justify-center"
            on:click={() => activeTab = 'config'}
          >
             <FileJson size={14} />
             Config
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'css'}
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'css' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} min-h-[44px] min-w-[44px] justify-center"
            on:click={() => activeTab = 'css'}
          >
             <FileCode size={14} />
             {dict.css}
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'react'}
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'react' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} min-h-[44px] min-w-[44px] justify-center"
            on:click={() => activeTab = 'react'}
          >
             <Boxes size={14} />
             React
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'vue'}
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'vue' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} min-h-[44px] min-w-[44px] justify-center"
            on:click={() => activeTab = 'vue'}
          >
             <Box size={14} />
             Vue
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'svelte'}
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'svelte' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} min-h-[44px] min-w-[44px] justify-center"
            on:click={() => activeTab = 'svelte'}
          >
             <Box size={14} />
             Svelte
          </button>
          <button
            role="tab"
            aria-selected={activeTab === 'html'}
            class="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 {activeTab === 'html' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'} min-h-[44px] min-w-[44px] justify-center"
            on:click={() => activeTab = 'html'}
          >
             <FileType size={14} />
             {dict.html || 'HTML'}
          </button>
      </div>

      <div class="flex items-center gap-2 ml-auto">
          <button
            class="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-amber-400 hover:bg-amber-900/20 hover:text-amber-300 min-h-[44px] min-w-[44px] justify-center"
            on:click={() => openInStackBlitz(generateHTML($gridStore))}
            aria-label="Open in StackBlitz"
            title="Open in StackBlitz"
          >
             <Zap size={14} />
             <span class="hidden sm:inline">StackBlitz</span>
          </button>
          <button
            class="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:bg-slate-800 hover:text-white min-h-[44px] min-w-[44px] justify-center"
            on:click={() => downloadPNG($gridStore, theme)}
            aria-label={dict.downloadPng || 'Download PNG'}
            title="Export Grid Image (PNG)"
          >
             <Camera size={14} />
             <span class="hidden sm:inline">PNG</span>
          </button>
          <button
            class="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:bg-slate-800 hover:text-white min-h-[44px] min-w-[44px] justify-center"
            on:click={() => downloadSVG($gridStore, theme)}
            aria-label={dict.downloadSvg || 'Download SVG'}
            title="Export Grid as SVG"
          >
             <Image size={14} />
             <span class="hidden sm:inline">SVG</span>
          </button>
          <button
            class="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-slate-400 hover:bg-slate-800 hover:text-white min-h-[44px] min-w-[44px] justify-center"
            on:click={downloadHTML}
            aria-label={dict.downloadHtml || 'Download HTML'}
            title="Download Single HTML File"
          >
             <Download size={14} />
             <span class="hidden sm:inline">HTML</span>
          </button>
          <button
            class="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors bg-indigo-600/10 text-indigo-400 hover:bg-indigo-600 hover:text-white min-h-[44px] min-w-[44px] justify-center"
            on:click={() => downloadProjectZip($gridStore)}
            aria-label={dict.exportProject || 'Export Project'}
            title="Download Project ZIP"
          >
             <Package size={14} />
             <span class="hidden sm:inline">ZIP</span>
          </button>
          <button
            class="text-xs font-medium flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors {copied ? 'bg-green-500/20 text-green-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'} min-h-[44px] min-w-[44px] justify-center"
            on:click={copyCode}
            aria-label={dict.copy}
          >
             {#if copied}
                 <Check size={14} />
                 {dict.copied}
             {:else}
                 <Copy size={14} />
                 {['react', 'vue', 'svelte'].includes(activeTab) ? 'Copy Component' : dict.copy}
             {/if}
          </button>
      </div>
  </div>

  <div class="flex-1 overflow-auto p-4 relative group custom-scrollbar">
      <pre class="font-mono text-sm text-blue-300 whitespace-pre-wrap break-all">{code}</pre>
  </div>
</div>

<style>
  /* Custom scrollbar for code panel */
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: #475569;
  }
</style>
