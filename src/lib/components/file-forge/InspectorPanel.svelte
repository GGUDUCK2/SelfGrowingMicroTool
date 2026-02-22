<script lang="ts">
  import { FileSearch, Calculator, Activity } from 'lucide-svelte';

  export let file: File;
  export let dict: any;

  let buffer: ArrayBuffer | null = null;
  let hexLines: { offset: string; hex: string; ascii: string }[] = [];
  let entropy = 0;
  let magicType = '';
  let loading = true;

  const signatures: Record<string, string> = {
    '89504E47': 'image/png',
    'FFD8FF': 'image/jpeg',
    '25504446': 'application/pdf',
    '504B0304': 'application/zip',
    '47494638': 'image/gif',
    '52494646': 'audio/wav',
    '1F8B': 'application/gzip',
    '424D': 'image/bmp',
    '66747970': 'video/mp4',
    '57454250': 'image/webp'
  };

  async function analyze() {
    loading = true;
    try {
      // Read first 512 bytes
      const chunk = file.slice(0, 512);
      buffer = await chunk.arrayBuffer();
      const view = new Uint8Array(buffer);

      // Hex View Generation
      hexLines = [];
      for (let i = 0; i < view.length; i += 16) {
        const slice = view.slice(i, i + 16);
        const hex = Array.from(slice)
          .map(b => b.toString(16).padStart(2, '0').toUpperCase())
          .join(' ');
        const ascii = Array.from(slice)
          .map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
          .join('');
        hexLines.push({
          offset: i.toString(16).padStart(4, '0').toUpperCase(),
          hex,
          ascii
        });
      }

      // Magic Number Detection
      const header = Array.from(view.slice(0, 8))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join('');

      magicType = 'Unknown';
      for (const [sig, type] of Object.entries(signatures)) {
        if (header.startsWith(sig)) {
          magicType = type;
          break;
        }
      }

      // Entropy Calculation (on the chunk)
      entropy = calculateEntropy(view);

    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function calculateEntropy(data: Uint8Array): number {
    const frequencies = new Array(256).fill(0);
    for (let i = 0; i < data.length; i++) {
      frequencies[data[i]]++;
    }

    let entropy = 0;
    const len = data.length;
    for (let i = 0; i < 256; i++) {
      if (frequencies[i] > 0) {
        const p = frequencies[i] / len;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  }

  $: if (file) analyze();
</script>

<div class="space-y-6">
  {#if loading}
    <div class="flex items-center justify-center p-12 text-slate-400">
      <Activity class="animate-pulse mr-2" /> {dict?.inspector?.analyzing || 'Analyzing...'}
    </div>
  {:else}
    <!-- Insights -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <h4 class="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-1 flex items-center gap-2">
          <FileSearch size={14} /> {dict?.inspector?.detectedType || 'Detected Type'}
        </h4>
        <div class="text-lg font-mono font-bold text-indigo-900 dark:text-indigo-100">
          {magicType}
        </div>
        <div class="text-xs text-indigo-600 dark:text-indigo-400 mt-1">
          {dict?.inspector?.matchExtension || 'Matches extension'}: {magicType === 'Unknown' ? 'N/A' : (file.type === magicType ? 'Yes' : 'Mismatch')}
        </div>
      </div>

      <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-100 dark:border-emerald-800">
        <h4 class="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide mb-1 flex items-center gap-2">
          <Calculator size={14} /> {dict?.inspector?.entropy || 'Shannon Entropy'}
        </h4>
        <div class="text-lg font-mono font-bold text-emerald-900 dark:text-emerald-100">
          {entropy.toFixed(3)} / 8.0
        </div>
        <div class="text-xs text-emerald-600 dark:text-emerald-400 mt-1">
          {entropy > 7.5 ? (dict?.inspector?.compressed || 'Likely Compressed/Encrypted') : (entropy < 5 ? (dict?.inspector?.text || 'Low Entropy (Text/Simple)') : (dict?.inspector?.moderate || 'Moderate Entropy'))}
        </div>
        <!-- Simple Bar -->
        <div class="w-full h-1.5 bg-emerald-200 dark:bg-emerald-900 rounded-full mt-2 overflow-hidden">
          <div class="h-full bg-emerald-500" style="width: {(entropy / 8) * 100}%"></div>
        </div>
      </div>
    </div>

    <!-- Hex View -->
    <div class="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 font-mono text-xs">
      <div class="bg-slate-800 px-4 py-2 border-b border-slate-700 text-slate-400 flex justify-between">
        <span>{dict?.inspector?.hexView || 'Hex Viewer (First 512 Bytes)'}</span>
        <span>Offset: 0x0000</span>
      </div>
      <div class="p-4 overflow-x-auto text-slate-300">
        {#each hexLines as line}
          <div class="flex hover:bg-slate-800/50 rounded px-1">
            <span class="text-slate-500 w-16 select-none">{line.offset}</span>
            <span class="text-cyan-400 w-96 mr-4 min-w-[300px]">{line.hex}</span>
            <span class="text-amber-400 opacity-80 border-l border-slate-700 pl-4 min-w-[150px]">{line.ascii}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
