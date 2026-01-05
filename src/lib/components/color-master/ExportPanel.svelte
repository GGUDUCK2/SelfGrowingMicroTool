<script lang="ts">
  import { colord } from 'colord';
  import type { ColorData } from './color-utils';

  export let palette: ColorData[] = [];
  export let baseColor: string;
  export let t: any;

  let copiedMode = '';

  function generateCSS() {
    return `:root {
  --color-primary: ${baseColor};
${palette.map((c, i) => `  --color-harmony-${i + 1}: ${c.hex};`).join('\n')}
}`;
  }

  function generateTailwind() {
    return `// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${baseColor}',
        ${palette.map((c, i) => `'harmony-${i + 1}': '${c.hex}',`).join('\n        ')}
      }
    }
  }
}`;
  }

  function generateSCSS() {
    return `$color-primary: ${baseColor};
${palette.map((c, i) => `$color-harmony-${i + 1}: ${c.hex};`).join('\n')}`;
  }

  function generateJSON() {
    return JSON.stringify({
      primary: baseColor,
      harmonies: palette.map(c => c.hex)
    }, null, 2);
  }

  function generateUrl() {
    return window.location.href;
  }

  function copyCode(generator: () => string, mode: string) {
    const code = generator();
    navigator.clipboard.writeText(code);
    copiedMode = mode;
    setTimeout(() => copiedMode = '', 2000);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
  <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.export}</h3>

  <div class="grid grid-cols-2 md:grid-cols-5 gap-4">
    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateCSS, 'CSS')}
    >
      <span class="font-bold text-slate-700 dark:text-slate-200">CSS</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'CSS' ? t.copied : 'Variables'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateTailwind, 'Tailwind')}
    >
      <span class="font-bold text-sky-500">Tailwind</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'Tailwind' ? t.copied : 'Config'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateSCSS, 'SCSS')}
    >
      <span class="font-bold text-pink-500">SCSS</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'SCSS' ? t.copied : 'Variables'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateJSON, 'JSON')}
    >
      <span class="font-bold text-amber-500">JSON</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'JSON' ? t.copied : 'Object'}</span>
    </button>

    <button
      class="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors focus:ring-2 focus:ring-indigo-500 focus:outline-none"
      on:click={() => copyCode(generateUrl, 'URL')}
    >
      <span class="font-bold text-indigo-500">URL</span>
      <span class="text-xs text-slate-500 mt-1">{copiedMode === 'URL' ? t.copied : 'Share Link'}</span>
    </button>
  </div>
</div>
