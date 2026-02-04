<script lang="ts">
  import type { LoadedFont, VariableAxis } from '$lib/utils/type-forge/types';
  import { onMount, onDestroy } from 'svelte';

  export let font: LoadedFont;
  export let axes: VariableAxis[];
  export let dict: any;

  let text = '';
  let fontSize = 64;
  let lineHeight = 1.2;
  let letterSpacing = 0;
  let align: 'left' | 'center' | 'right' = 'left';
  let styleElement: HTMLStyleElement;

  $: fontStyle = `
    font-family: '${font.meta.family}', sans-serif;
    font-variation-settings: ${axes.map(a => `"${a.tag}" ${a.current}`).join(', ')};
    font-size: ${fontSize}px;
    line-height: ${lineHeight};
    letter-spacing: ${letterSpacing}px;
    text-align: ${align};
  `;

  // Inject font face via JS to avoid Svelte/PostCSS build errors with dynamic values
  $: updateFontFace(font);

  function updateFontFace(f: LoadedFont) {
      if (typeof document === 'undefined') return;

      if (!styleElement) {
          styleElement = document.createElement('style');
          document.head.appendChild(styleElement);
      }

      styleElement.textContent = `
        @font-face {
          font-family: '${f.meta.family}';
          src: url('${f.url}');
        }
      `;
  }

  onDestroy(() => {
      if (typeof document !== 'undefined' && styleElement) {
          if (document.head.contains(styleElement)) {
              document.head.removeChild(styleElement);
          }
      }
  });
</script>

<div class="space-y-6">
  <!-- Controls -->
  <div class="bg-white dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-6 items-center">
      <div class="flex-1 min-w-[200px] flex flex-col gap-2">
          <label for="font-size" class="text-xs font-medium text-slate-500 dark:text-slate-400">{dict.preview.size} ({fontSize}px)</label>
          <input id="font-size" type="range" min="12" max="200" bind:value={fontSize} class="w-full accent-indigo-600">
      </div>
      <div class="flex-1 min-w-[150px] flex flex-col gap-2">
          <label for="line-height" class="text-xs font-medium text-slate-500 dark:text-slate-400">{dict.preview.lineHeight} ({lineHeight})</label>
          <input id="line-height" type="range" min="0.8" max="3" step="0.1" bind:value={lineHeight} class="w-full accent-indigo-600">
      </div>
      <div class="flex-1 min-w-[150px] flex flex-col gap-2">
          <label for="letter-spacing" class="text-xs font-medium text-slate-500 dark:text-slate-400">{dict.preview.letterSpacing} ({letterSpacing}px)</label>
          <input id="letter-spacing" type="range" min="-10" max="50" bind:value={letterSpacing} class="w-full accent-indigo-600">
      </div>

      <div class="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
          <button class="p-2 rounded hover:bg-white dark:hover:bg-slate-600 transition-colors {align === 'left' ? 'text-indigo-600 bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}" on:click={() => align = 'left'} aria-label="Align Left">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="17" x2="3" y1="18" y2="18"/><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/></svg>
          </button>
          <button class="p-2 rounded hover:bg-white dark:hover:bg-slate-600 transition-colors {align === 'center' ? 'text-indigo-600 bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}" on:click={() => align = 'center'} aria-label="Align Center">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="17" x2="7" y1="12" y2="12"/><line x1="19" x2="5" y1="18" y2="18"/></svg>
          </button>
          <button class="p-2 rounded hover:bg-white dark:hover:bg-slate-600 transition-colors {align === 'right' ? 'text-indigo-600 bg-white dark:bg-slate-600 shadow-sm' : 'text-slate-500'}" on:click={() => align = 'right'} aria-label="Align Right">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="21" x2="3" y1="6" y2="6"/><line x1="21" x2="3" y1="12" y2="12"/><line x1="21" x2="7" y1="18" y2="18"/></svg>
          </button>
      </div>

      <select
          class="bg-slate-100 dark:bg-slate-700 border-none rounded-lg text-sm px-3 py-2 text-slate-700 dark:text-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none"
          on:change={(e) => text = e.currentTarget.value}
          aria-label="Pangram Selector"
      >
          <option value="">{dict.preview.placeholder}</option>
          <option value={dict.preview.quickBrownFox}>{dict.preview.quickBrownFox}</option>
          <option value="Sphinx of black quartz, judge my vow">Sphinx of black quartz, judge my vow</option>
          <option value="Pack my box with five dozen liquor jugs">Pack my box with five dozen liquor jugs</option>
          <option value="키스의 고유조건은 입술끼리 만나야 하고 특별한 기술은 필요치 않다">Korean Pangram 1</option>
      </select>
  </div>

  <!-- Canvas -->
  <div class="relative min-h-[400px] p-8 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-black overflow-hidden flex flex-col justify-center">
      <div
          contenteditable="true"
          bind:textContent={text}
          class="w-full h-full outline-none break-words whitespace-pre-wrap empty:before:content-[attr(placeholder)] empty:before:text-slate-300 dark:empty:before:text-slate-600"
          style={fontStyle}
          placeholder={dict.preview.placeholder}
          spellcheck="false"
      ></div>
  </div>
</div>
