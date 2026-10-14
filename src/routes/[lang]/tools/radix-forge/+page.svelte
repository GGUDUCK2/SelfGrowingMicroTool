<script lang="ts">
  import GuideSection from '$lib/components/GuideSection.svelte';
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { Copy, Trash2, Settings, History, Calculator } from '@lucide/svelte';
  import { ToolWorkspace } from '$lib/db/workspace';
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = ((dict as any)?.tools?.radixForge || {});

  $: faqItems = [
    { q: t.q1, a: t.a1 },
    { q: t.q2, a: t.a2 },
    { q: t.q3, a: t.a3 }
  ];

  type Mode = 'unsigned' | 'signed' | 'ieee754';
  type BitSize = 8 | 16 | 32 | 64;

  let mode: Mode = 'unsigned';
  let bitSize: BitSize = 32;
  let customRadix = 36;

  let decimalInput = '';
  let hexInput = '';
  let binaryInput = '';
  let octalInput = '';
  let customInput = '';

  let isUpdating = false;
  let errorMsg = '';

  let workspace: ToolWorkspace;
  let historyItems: any[] = [];

  onMount(() => {
    if (browser) {
      workspace = new ToolWorkspace('radix-forge');
      loadHistory();
    }
  });

  async function loadHistory() {
    if (workspace) {
      historyItems = await workspace.loadHistory();
    }
  }

  async function saveToHistory(val: string, base: number) {
    if (!workspace || !val || errorMsg) return;

    // Throttle saves by checking if the last one was identical
    if (historyItems.length > 0) {
      const last = historyItems[0];
      if (last.data.value === val && last.data.base === base && last.data.mode === mode) return;
    }

    await workspace.saveToHistory({
      value: val,
      base,
      mode,
      bitSize
    });
    await loadHistory();
  }

  function clearAll() {
    decimalInput = '';
    hexInput = '';
    binaryInput = '';
    octalInput = '';
    customInput = '';
    errorMsg = '';
  }

  // --- Core Conversion Logic ---

  function clampToBits(value: bigint, bits: number): bigint {
    const max = (1n << BigInt(bits)) - 1n;
    return value & max;
  }

  function getSignedValue(value: bigint, bits: number): bigint {
    const max = 1n << BigInt(bits);
    const half = max >> 1n;
    let clamped = value & (max - 1n);
    if (clamped >= half) {
      return clamped - max;
    }
    return clamped;
  }

  function floatToIEEE754(value: number, isDouble: boolean): bigint {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    if (isDouble) {
      view.setFloat64(0, value, false);
      return view.getBigUint64(0, false);
    } else {
      view.setFloat32(0, value, false);
      return BigInt(view.getUint32(0, false));
    }
  }

  function ieee754ToFloat(value: bigint, isDouble: boolean): number {
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    if (isDouble) {
      view.setBigUint64(0, value, false);
      return view.getFloat64(0, false);
    } else {
      view.setUint32(0, Number(value & 0xFFFFFFFFn), false);
      return view.getFloat32(0, false);
    }
  }

  // Parses string based on current mode and radix
  function parseValue(val: string, radix: number): bigint | number | null {
    val = val.trim();
    if (!val) return null;

    try {
      if (mode === 'unsigned') {
        // Strip prefixes just in case
        val = val.replace(/^(0x|0b|0o)/i, '');
        // BigInt parsing for custom radix requires writing a manual parser since BigInt doesn't support radix arg natively
        let result = 0n;
        const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, radix);
        const regex = new RegExp(`^[${validChars}]+$`, 'i');
        if (!regex.test(val)) throw new Error('Invalid character');

        for (let i = 0; i < val.length; i++) {
          const char = val[i].toLowerCase();
          const charVal = BigInt('0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(char));
          result = result * BigInt(radix) + charVal;
        }
        return result;
      } else if (mode === 'signed') {
        // Only makes sense to parse signed from decimal natively, or binary/hex if we assume 2's complement input.
        // For simplicity, we treat Decimal as the source of truth for "negative" sign,
        // and others as the raw bit pattern.
        if (radix === 10) {
           return BigInt(val);
        } else {
          // Parse as unsigned, then interpret as signed later if needed.
          let result = 0n;
          const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, radix);
          const regex = new RegExp(`^[${validChars}]+$`, 'i');
          if (!regex.test(val)) throw new Error('Invalid character');

          for (let i = 0; i < val.length; i++) {
            const char = val[i].toLowerCase();
            const charVal = BigInt('0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(char));
            result = result * BigInt(radix) + charVal;
          }
          return result;
        }
      } else if (mode === 'ieee754') {
        if (radix === 10) {
          return Number(val);
        } else {
           let result = 0n;
           const validChars = '0123456789abcdefghijklmnopqrstuvwxyz'.slice(0, radix);
           const regex = new RegExp(`^[${validChars}]+$`, 'i');
           if (!regex.test(val)) throw new Error('Invalid character');

           for (let i = 0; i < val.length; i++) {
             const char = val[i].toLowerCase();
             const charVal = BigInt('0123456789abcdefghijklmnopqrstuvwxyz'.indexOf(char));
             result = result * BigInt(radix) + charVal;
           }
           return result; // returning BigInt bit pattern
        }
      }
    } catch (e) {
      return null;
    }
    return null;
  }

  function formatBigInt(value: bigint, radix: number, padding: number = 0): string {
    let str = value.toString(radix);
    if (padding > 0) {
      str = str.padStart(padding, '0');
    }
    return str;
  }

  function handleInput(sourceVal: string, sourceRadix: number) {
    if (isUpdating) return;
    isUpdating = true;
    errorMsg = '';

    try {
      if (!sourceVal.trim()) {
        clearAll();
        isUpdating = false;
        return;
      }

      const parsed = parseValue(sourceVal, sourceRadix);
      if (parsed === null) {
        throw new Error('Invalid input');
      }

      if (mode === 'unsigned') {
        const val = parsed as bigint;
        if (val < 0n) throw new Error('Unsigned cannot be negative');
        if (sourceRadix !== 10) decimalInput = val.toString(10);
        if (sourceRadix !== 16) hexInput = val.toString(16).toUpperCase();
        if (sourceRadix !== 2) binaryInput = val.toString(2);
        if (sourceRadix !== 8) octalInput = val.toString(8);
        if (sourceRadix !== customRadix) customInput = val.toString(customRadix).toUpperCase();
      } else if (mode === 'signed') {
        let val = parsed as bigint;
        let bits = BigInt(bitSize);
        let min = -(1n << (bits - 1n));
        let max = (1n << (bits - 1n)) - 1n;

        if (sourceRadix === 10) {
          if (val < min || val > max) throw new Error(`Value out of bounds for ${bitSize}-bit signed integer`);
          const bitPattern = clampToBits(val, bitSize);
          hexInput = formatBigInt(bitPattern, 16, bitSize / 4).toUpperCase();
          binaryInput = formatBigInt(bitPattern, 2, bitSize);
          octalInput = formatBigInt(bitPattern, 8);
          customInput = formatBigInt(bitPattern, customRadix).toUpperCase();
        } else {
          // Input is bit pattern
          let bitPattern = clampToBits(val, bitSize);
          const signedVal = getSignedValue(bitPattern, bitSize);
          decimalInput = signedVal.toString(10);
          if (sourceRadix !== 16) hexInput = formatBigInt(bitPattern, 16, bitSize / 4).toUpperCase();
          if (sourceRadix !== 2) binaryInput = formatBigInt(bitPattern, 2, bitSize);
          if (sourceRadix !== 8) octalInput = formatBigInt(bitPattern, 8);
          if (sourceRadix !== customRadix) customInput = formatBigInt(bitPattern, customRadix).toUpperCase();
        }
      } else if (mode === 'ieee754') {
        let isDouble = bitSize === 64;

        if (sourceRadix === 10) {
          const val = parsed as number;
          if (isNaN(val)) throw new Error('Invalid number');
          const bitPattern = floatToIEEE754(val, isDouble);
          hexInput = formatBigInt(bitPattern, 16, bitSize / 4).toUpperCase();
          binaryInput = formatBigInt(bitPattern, 2, bitSize);
          octalInput = formatBigInt(bitPattern, 8);
          customInput = formatBigInt(bitPattern, customRadix).toUpperCase();
        } else {
          // Input is bit pattern
          const bitPattern = clampToBits(parsed as bigint, bitSize);
          const floatVal = ieee754ToFloat(bitPattern, isDouble);
          decimalInput = floatVal.toString();
          if (sourceRadix !== 16) hexInput = formatBigInt(bitPattern, 16, bitSize / 4).toUpperCase();
          if (sourceRadix !== 2) binaryInput = formatBigInt(bitPattern, 2, bitSize);
          if (sourceRadix !== 8) octalInput = formatBigInt(bitPattern, 8);
          if (sourceRadix !== customRadix) customInput = formatBigInt(bitPattern, customRadix).toUpperCase();
        }
      }

      // Debounce saving history
      setTimeout(() => saveToHistory(sourceVal, sourceRadix), 1000);

    } catch (err: any) {
      errorMsg = err.message || 'Invalid input';
    } finally {
      isUpdating = false;
    }
  }

  // React to mode or settings changes
  $: {
    if (mode || bitSize || customRadix) {
      // Re-trigger from decimal if available, else clear
      if (decimalInput && !isUpdating) {
         handleInput(decimalInput, 10);
      }
    }
  }

  async function handleCopy(text: string) {
    if (!text || !browser) return;
    try {
      await navigator.clipboard.writeText(text);
      // Optional: small toast or icon change
    } catch (e) {
      console.error('Failed to copy', e);
    }
  }

  async function deleteHistoryItem(id: string) {
    if (workspace) {
      await workspace.deleteHistoryItem(id);
      await loadHistory();
    }
  }

</script>

<Head
  title={t.title}
  description={t.description}
  canonicalUrl={`https://www.webtips.dev/${lang}/tools/radix-forge`}
/>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
  <!-- Header -->
  <div class="text-center">
    <h1 class="text-3xl font-extrabold text-gray-900 dark:text-white flex items-center justify-center gap-3">
      <Calculator class="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
      {t.title}
    </h1>
    <p class="mt-2 text-lg text-gray-600 dark:text-gray-400">{t.description}</p>
  </div>

  <main class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <div class="lg:col-span-2 space-y-6">

      <!-- Settings Panel -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        <div class="flex items-center gap-2 mb-4">
          <Settings class="w-5 h-5 text-gray-500 dark:text-gray-400" />
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white">{t.settings}</h2>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Mode Selection -->
          <div>
            <label id="mode-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Mode</label>
            <div class="flex flex-wrap gap-2" role="group" aria-labelledby="mode-label">
              {#each [
                { id: 'unsigned', label: t.unsigned },
                { id: 'signed', label: t.signed },
                { id: 'ieee754', label: t.ieee754 }
              ] as m}
                <button
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-colors min-h-[44px] min-w-[44px] {mode === m.id ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'}"
                  on:click={() => { mode = m.id as Mode; }}
                >
                  {m.label}
                </button>
              {/each}
            </div>
          </div>

          <!-- Bit Size Selection (Disabled for Unsigned arbitrary precision) -->
          <div>
            <label id="bits-label" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{t.bitSize}</label>
            <div class="flex flex-wrap gap-2" role="group" aria-labelledby="mode-label">
              {#each [8, 16, 32, 64] as b}
                <button
                  disabled={mode === 'unsigned' || (mode === 'ieee754' && (b === 8 || b === 16))}
                  class="px-4 py-2 text-sm font-medium rounded-lg transition-colors min-h-[44px] min-w-[44px] {bitSize === b ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'} disabled:opacity-50 disabled:cursor-not-allowed"
                  on:click={() => { bitSize = b as BitSize; }}
                >
                  {b}-{t.bits}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </div>

      <!-- Inputs Panel -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-4">

        {#if errorMsg}
          <div class="p-3 bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-lg text-sm">
            {errorMsg}
          </div>
        {/if}

        <!-- Decimal -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="dec-in" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.decimal}</label>
            <button class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 min-h-[44px] min-w-[44px]" on:click={() => handleCopy(decimalInput)} title={t.copy}>
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            id="dec-in" bind:value={decimalInput}
            on:input={() => handleInput(decimalInput, 10)}
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white font-mono break-all"
            placeholder="0"
          />
        </div>

        <!-- Hexadecimal -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="hex-in" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.hex}</label>
            <button class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 min-h-[44px] min-w-[44px]" on:click={() => handleCopy(hexInput)} title={t.copy}>
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            id="hex-in" bind:value={hexInput}
            on:input={() => handleInput(hexInput, 16)}
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white font-mono break-all"
            placeholder="0"
          />
        </div>

        <!-- Binary -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="bin-in" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.binary}</label>
            <button class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 min-h-[44px] min-w-[44px]" on:click={() => handleCopy(binaryInput)} title={t.copy}>
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <textarea
            id="bin-in" bind:value={binaryInput}
            on:input={() => handleInput(binaryInput, 2)}
            rows="2"
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white font-mono break-all whitespace-pre-wrap"
            placeholder="0"
          ></textarea>
        </div>

        <!-- Octal -->
        <div>
          <div class="flex justify-between items-center mb-1">
            <label for="oct-in" class="block text-sm font-medium text-gray-700 dark:text-gray-300">{t.octal}</label>
            <button class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 min-h-[44px] min-w-[44px]" on:click={() => handleCopy(octalInput)} title={t.copy}>
              <Copy class="w-4 h-4" />
            </button>
          </div>
          <input
            type="text"
            id="oct-in" bind:value={octalInput}
            on:input={() => handleInput(octalInput, 8)}
            class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white font-mono break-all"
            placeholder="0"
          />
        </div>

        <!-- Custom Base -->
        <div class="flex gap-4 items-start">
          <div class="w-1/3">
            <label for="base-in" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{t.customBase}</label>
            <input
              type="number"
              min="2"
              max="36"
              id="base-in" bind:value={customRadix}
              on:input={() => {
                if(customRadix >= 2 && customRadix <= 36 && decimalInput && !isUpdating) {
                   handleInput(decimalInput, 10);
                }
              }}
              class="w-full px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 dark:text-white"
            />
          </div>
          <div class="w-2/3">
            <label for="custom-in" class="sr-only">Custom Input</label>
            <div class="flex justify-end mb-1">
               <button class="text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 min-h-[44px] min-w-[44px]" on:click={() => handleCopy(customInput)} title={t.copy}>
                <Copy class="w-4 h-4" />
              </button>
            </div>
            <input
              type="text"
              id="custom-in" bind:value={customInput}
              on:input={() => handleInput(customInput, customRadix)}
              class="w-full px-4 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 dark:text-white font-mono break-all"
              placeholder="0"
            />
          </div>
        </div>

        <div class="flex justify-end pt-4">
          <button
            on:click={clearAll}
            class="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg transition-colors font-medium min-h-[44px]"
          >
            <Trash2 class="w-4 h-4" />
            {t.clear}
          </button>
        </div>

      </div>
    </div>

    <div class="lg:col-span-1 space-y-6">
      <!-- Workspace/History -->
      <div class="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 flex flex-col h-full max-h-[800px]">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <History class="w-5 h-5 text-gray-500 dark:text-gray-400" />
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">Recent Conversions</h2>
          </div>
          {#if historyItems.length > 0}
            <button
              on:click={async () => { if(workspace) { await workspace.clearHistory(); await loadHistory(); } }}
              class="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Clear
            </button>
          {/if}
        </div>

        <div class="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
          {#if historyItems.length === 0}
            <div class="text-center py-8 text-gray-500 dark:text-gray-400 text-sm">
              No recent conversions.
            </div>
          {:else}
            {#each historyItems as item (item.id)}
              <div class="p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-100 dark:border-gray-700/50 group relative">
                <div class="flex justify-between items-start mb-1">
                  <span class="text-xs font-medium text-indigo-600 dark:text-indigo-400 uppercase">
                    {item.data.mode} {item.data.mode !== 'unsigned' ? `(${item.data.bitSize}b)` : ''}
                  </span>
                  <button
                    on:click={() => deleteHistoryItem(item.id!)}
                    class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity min-h-[32px] min-w-[32px] flex items-center justify-center -mt-1 -mr-1"
                  >
                    <Trash2 class="w-3.5 h-3.5" />
                  </button>
                </div>
                <div
                  class="font-mono text-sm text-gray-900 dark:text-gray-100 break-all cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400"
                  on:click={() => {
                    mode = item.data.mode;
                    bitSize = item.data.bitSize;
                    handleInput(item.data.value, item.data.base);
                  }}
                  on:keydown={(e) => e.key === 'Enter' && handleInput(item.data.value, item.data.base)}
                  role="button"
                  tabindex="0"
                >
                  <span class="text-xs text-gray-500 dark:text-gray-500 mr-1">Base {item.data.base}:</span>
                  {item.data.value.length > 50 ? item.data.value.substring(0, 50) + '...' : item.data.value}
                </div>
                <div class="text-[10px] text-gray-400 mt-2">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </div>
            {/each}
          {/if}
        </div>
      </div>
    </div>
  </main>

  <!-- Guide Section -->
  <GuideSection
    title={t.guide.title}
    intro={t.guide.intro}
    featuresTitle={t.guide.featuresTitle}
    features={[t.guide.f1, t.guide.f2, t.guide.f3, t.guide.f4]}
    tipsTitle={t.guide.tipsTitle}
    tips={[t.guide.tip1, t.guide.tip2, t.guide.tip3]}
  />

  <AdPlaceholder />

  <!-- FAQ Section with Schema -->
  <FAQSection
    title={t.faqTitle}
    items={faqItems}
  />

  <RelatedTools
    tools={[
      { id: 'math-forge', title: (dict as any).tools?.mathForge?.title || 'Math Forge', description: (dict as any).tools?.mathForge?.description || 'Advanced math.', href: `/${lang}/tools/math-forge` },
      { id: 'cipher-lab', title: (dict as any).tools?.cipherLab?.title || 'Cipher Lab', description: (dict as any).tools?.cipherLab?.description || 'Cryptography.', href: `/${lang}/tools/cipher-lab` }
    ]}
  />
</div>

{@html '<scr' + 'ipt type="application/ld+json">' + JSON.stringify({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": t.title,
  "description": t.description,
  "applicationCategory": "DeveloperApplication",
  "operatingSystem": "Any",
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD"
  }
}) + '</scr' + 'ipt>'}
