<script lang="ts">
  import type { SvgoConfig } from '$lib/utils/svg-forge/optimizer';

  export let config: SvgoConfig;
  export let t: any;

  // Grouped configuration options based on SVGO plugins
  const configGroups = [
    {
      title: t.config.groups.cleanup,
      keys: ['cleanupAttrs', 'cleanupEnableBackground', 'cleanupIds', 'cleanupNumericValues']
    },
    {
      title: t.config.groups.remove,
      keys: ['removeDoctype', 'removeXMLProcInst', 'removeComments', 'removeMetadata', 'removeTitle', 'removeDesc', 'removeUselessDefs', 'removeHiddenElems', 'removeEmptyText', 'removeEmptyAttrs', 'removeEmptyContainers']
    },
    {
      title: t.config.groups.styles,
      keys: ['mergeStyles', 'inlineStyles', 'minifyStyles', 'removeStyleElement', 'convertColors']
    },
    {
      title: t.config.groups.optimization,
      keys: ['convertShapeToPath', 'convertEllipseToCircle', 'mergePaths', 'convertPathData', 'convertTransform', 'collapseGroups', 'moveElemsAttrsToGroup', 'moveGroupAttrsToElems', 'sortAttrs', 'sortDefsChildren']
    },
    {
      title: t.config.groups.dimensions,
      keys: ['removeViewBox', 'removeDimensions']
    }
  ];

  function togglePlugin(key: keyof SvgoConfig['plugins']) {
    config.plugins[key] = !config.plugins[key];
    config = { ...config }; // trigger reactivity
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden h-full flex flex-col">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
    <h2 class="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
      {t.config.title}
    </h2>
  </div>

  <div class="p-4 flex-grow overflow-y-auto space-y-6">
    <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-100 dark:border-slate-700">
      <span class="text-sm font-medium text-slate-700 dark:text-slate-300">{t.config.multipass}</span>
      <label class="relative inline-flex items-center cursor-pointer min-h-[44px] min-w-[44px]">
        <input type="checkbox" class="sr-only peer" checked={config.multipass} onchange={() => { config.multipass = !config.multipass; config = {...config} }}>
        <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[12px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
      </label>
    </div>

    {#each configGroups as group}
      <div class="space-y-3">
        <h3 class="text-xs font-bold text-slate-400 uppercase tracking-wider">{group.title}</h3>
        <div class="space-y-2">
          {#each group.keys as key}
            <label class="flex items-center justify-between cursor-pointer group min-h-[44px]">
              <span class="text-sm text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200 transition-colors">
                {t.config.plugins[key] || key}
              </span>
              <div class="relative inline-flex items-center">
                <input type="checkbox" class="sr-only peer" checked={config.plugins[key as keyof SvgoConfig['plugins']]} onchange={() => togglePlugin(key as keyof SvgoConfig['plugins'])}>
                <div class="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-500"></div>
              </div>
            </label>
          {/each}
        </div>
      </div>
    {/each}
  </div>
</div>