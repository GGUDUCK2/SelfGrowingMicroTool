<script lang="ts">
  import type { FlexContainerProps, FlexItemProps } from './types';
  import { Copy, Check } from '@lucide/svelte';
  import { fade } from 'svelte/transition';

  export let dict: any;
  export let containerProps: FlexContainerProps;
  export let items: FlexItemProps[];

  let copiedState: 'css' | 'tailwind' | null = null;
  let copyTimeout: ReturnType<typeof setTimeout>;

  $: cssCode = generateCSS(containerProps, items);
  $: tailwindCode = generateTailwind(containerProps, items);

  function generateCSS(container: FlexContainerProps, children: FlexItemProps[]) {
    let css = `.flex-container {\n`;
    css += `  display: flex;\n`;
    if (container.flexDirection !== 'row') css += `  flex-direction: ${container.flexDirection};\n`;
    if (container.flexWrap !== 'nowrap') css += `  flex-wrap: ${container.flexWrap};\n`;
    if (container.justifyContent !== 'flex-start') css += `  justify-content: ${container.justifyContent};\n`;
    if (container.alignItems !== 'stretch') css += `  align-items: ${container.alignItems};\n`;
    if (container.alignContent !== 'stretch') css += `  align-content: ${container.alignContent};\n`;
    if (container.gap && container.gap !== '0' && container.gap !== '0px') css += `  gap: ${container.gap};\n`;
    css += `}\n`;

    let hasItemStyles = false;
    let itemsCss = '';
    children.forEach((item, index) => {
      let itemRules = '';
      if (item.order !== '0') itemRules += `  order: ${item.order};\n`;
      if (item.flexGrow !== '0' || item.flexShrink !== '1' || item.flexBasis !== 'auto') {
        itemRules += `  flex: ${item.flexGrow} ${item.flexShrink} ${item.flexBasis};\n`;
      }
      if (item.alignSelf !== 'auto') itemRules += `  align-self: ${item.alignSelf};\n`;
      if (item.width !== 'auto' && item.width !== '') itemRules += `  width: ${item.width};\n`;
      if (item.height !== 'auto' && item.height !== '') itemRules += `  height: ${item.height};\n`;

      if (itemRules) {
        hasItemStyles = true;
        itemsCss += `\n.flex-item-${index + 1} {\n${itemRules}}\n`;
      }
    });

    return css + itemsCss;
  }

  function generateTailwind(container: FlexContainerProps, children: FlexItemProps[]) {
    let classes = ['flex'];

    // Direction
    if (container.flexDirection === 'row-reverse') classes.push('flex-row-reverse');
    else if (container.flexDirection === 'column') classes.push('flex-col');
    else if (container.flexDirection === 'column-reverse') classes.push('flex-col-reverse');

    // Wrap
    if (container.flexWrap === 'wrap') classes.push('flex-wrap');
    else if (container.flexWrap === 'wrap-reverse') classes.push('flex-wrap-reverse');

    // Justify
    if (container.justifyContent === 'flex-end') classes.push('justify-end');
    else if (container.justifyContent === 'center') classes.push('justify-center');
    else if (container.justifyContent === 'space-between') classes.push('justify-between');
    else if (container.justifyContent === 'space-around') classes.push('justify-around');
    else if (container.justifyContent === 'space-evenly') classes.push('justify-evenly');

    // Align Items
    if (container.alignItems === 'flex-start') classes.push('items-start');
    else if (container.alignItems === 'flex-end') classes.push('items-end');
    else if (container.alignItems === 'center') classes.push('items-center');
    else if (container.alignItems === 'baseline') classes.push('items-baseline');

    // Align Content
    if (container.alignContent === 'flex-start') classes.push('content-start');
    else if (container.alignContent === 'flex-end') classes.push('content-end');
    else if (container.alignContent === 'center') classes.push('content-center');
    else if (container.alignContent === 'space-between') classes.push('content-between');
    else if (container.alignContent === 'space-around') classes.push('content-around');

    // Gap (approximation for arbitrary value, standard classes preferred but we output inline style or arbitrary class in modern TW)
    if (container.gap && container.gap !== '0' && container.gap !== '0px') {
        classes.push(`gap-[${container.gap}]`);
    }

    let twCode = `<div class="${classes.join(' ')}">\n`;

    children.forEach((item, index) => {
      let itemClasses = [];
      if (item.order !== '0') itemClasses.push(`order-[${item.order}]`);

      // Flex
      let flexValue = `${item.flexGrow} ${item.flexShrink} ${item.flexBasis}`;
      if (flexValue === '1 1 0%') itemClasses.push('flex-1');
      else if (flexValue === '1 1 auto') itemClasses.push('flex-auto');
      else if (flexValue === '0 1 auto') itemClasses.push('flex-initial');
      else if (flexValue === 'none' || flexValue === '0 0 auto') itemClasses.push('flex-none');
      else if (flexValue !== '0 1 auto') itemClasses.push(`flex-[${flexValue.replace(/ /g, '_')}]`);

      if (item.alignSelf !== 'auto') {
        if (item.alignSelf === 'flex-start') itemClasses.push('self-start');
        else if (item.alignSelf === 'flex-end') itemClasses.push('self-end');
        else if (item.alignSelf === 'center') itemClasses.push('self-center');
        else if (item.alignSelf === 'baseline') itemClasses.push('self-baseline');
        else if (item.alignSelf === 'stretch') itemClasses.push('self-stretch');
      }

      if (item.width && item.width !== 'auto') itemClasses.push(`w-[${item.width}]`);
      if (item.height && item.height !== 'auto') itemClasses.push(`h-[${item.height}]`);

      twCode += `  <div${itemClasses.length > 0 ? ` class="${itemClasses.join(' ')}"` : ''}>Item ${index + 1}</div>\n`;
    });

    twCode += `</div>`;
    return twCode;
  }

  async function copyToClipboard(text: string, type: 'css' | 'tailwind') {
    try {
      await navigator.clipboard.writeText(text);
      copiedState = type;
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
        copiedState = null;
      }, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 h-full">
  <!-- CSS Output -->
  <div class="flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
    <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">CSS</span>
      <button
        on:click={() => copyToClipboard(cssCode, 'css')}
        class="flex items-center gap-2 px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-colors {copiedState === 'css' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
      >
        {#if copiedState === 'css'}
          <Check size={16} />
          Copied
        {:else}
          <Copy size={16} />
          {dict.copyCss}
        {/if}
      </button>
    </div>
    <div class="p-4 overflow-auto flex-1 font-mono text-sm text-slate-300">
      <pre class="whitespace-pre-wrap">{cssCode}</pre>
    </div>
  </div>

  <!-- Tailwind Output -->
  <div class="flex flex-col bg-slate-900 rounded-xl overflow-hidden border border-slate-800 shadow-lg relative">
    <div class="flex items-center justify-between px-4 py-2 border-b border-slate-800 bg-slate-900/50">
      <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">Tailwind (HTML)</span>
      <button
        on:click={() => copyToClipboard(tailwindCode, 'tailwind')}
        class="flex items-center gap-2 px-3 py-1.5 min-h-[44px] min-w-[44px] rounded-lg text-sm font-medium transition-colors {copiedState === 'tailwind' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}"
      >
        {#if copiedState === 'tailwind'}
          <Check size={16} />
          Copied
        {:else}
          <Copy size={16} />
          {dict.copyTailwind}
        {/if}
      </button>
    </div>
    <div class="p-4 overflow-auto flex-1 font-mono text-sm text-slate-300">
      <pre class="whitespace-pre-wrap">{tailwindCode}</pre>
    </div>
  </div>
</div>
