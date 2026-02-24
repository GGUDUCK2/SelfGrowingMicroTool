<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { FileSearch, Calculator, Activity, AlertTriangle, ShieldCheck, ShieldAlert, Binary, ScanEye } from 'lucide-svelte';
  import { detectFileType } from '$lib/utils/file-forge/signatures';
  import { calculateEntropy, calculateEntropyMap, calculateRiskScore } from '$lib/utils/file-forge/analysis';
  import { extractMetadata, type FileMetadata } from '$lib/utils/file-forge/metadata';
  import { dictionaries } from '$lib/dictionaries';

  export let file: File | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let restoredData: any = null; // View-only mode

  const dispatch = createEventDispatcher();

  interface HexLine {
    offset: string;
    hex: string;
    ascii: string;
  }

  let buffer: ArrayBuffer | null = null;
  let hexLines: HexLine[] = [];
  let entropy = 0;
  let entropyMap: number[] = [];
  let risk: { score: number, factors: string[] } = { score: 0, factors: [] };
  let magicInfo = { type: 'Unknown', category: 'unknown', description: 'Unknown File Type', matches: false };
  let metadata: FileMetadata | null = null;
  let loading = true;
  let canvas: HTMLCanvasElement;

  async function analyze() {
    if (restoredData) {
      if (restoredData.magic) magicInfo = restoredData.magic;
      if (restoredData.entropy) entropy = restoredData.entropy;
      if (restoredData.entropyMap) entropyMap = restoredData.entropyMap;
      if (restoredData.risk) risk = restoredData.risk;
      if (restoredData.metadata) metadata = restoredData.metadata;
      if (restoredData.hexPreview) {
         hexLines = parseHexPreview(restoredData.hexPreview);
      }
      loading = false;
      return;
    }

    if (!file) return;

    loading = true;
    try {
      // 1. Read first 512 bytes for Hex View
      const chunk = file.slice(0, 512);
      buffer = await chunk.arrayBuffer();
      const view = new Uint8Array(buffer);

      // 2. Hex View Generation
      const newHexLines: HexLine[] = [];
      for (let i = 0; i < view.length; i += 16) {
        const slice = view.slice(i, i + 16);
        const hex = Array.from(slice)
          .map(b => b.toString(16).padStart(2, '0').toUpperCase())
          .join(' ');
        const ascii = Array.from(slice)
          .map(b => (b >= 32 && b <= 126 ? String.fromCharCode(b) : '.'))
          .join('');
        newHexLines.push({
          offset: i.toString(16).padStart(4, '0').toUpperCase(),
          hex,
          ascii
        });
      }
      hexLines = newHexLines;

      // 3. Magic Number Detection
      magicInfo = detectFileType(buffer);

      // 4. Entropy & Risk
      // We read a larger chunk for accurate initial entropy, or rely on map
      entropy = calculateEntropy(view); // Quick entropy on header

      // Calculate full map (async)
      entropyMap = await calculateEntropyMap(file, 100);

      // Use average of map for global entropy if available, else header
      if (entropyMap.length > 0) {
          entropy = entropyMap.reduce((a, b) => a + b, 0) / entropyMap.length;
      }

      risk = calculateRiskScore(file, magicInfo, entropy);

      // 5. Deep Metadata
      metadata = await extractMetadata(file);

      // Emit data for report
      dispatch('analysisComplete', {
          magic: magicInfo,
          entropy,
          entropyMap,
          risk,
          metadata,
          hexPreview: hexLines.map(l => `${l.offset}  ${l.hex}  ${l.ascii}`).join('\n')
      });

    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function parseHexPreview(preview: string): HexLine[] {
    try {
      return preview.split('\n').filter(l => l.trim()).map(line => {
        const parts = line.split('  '); // Assuming double space separator
        return {
          offset: parts[0] || '',
          hex: parts[1] || '',
          ascii: parts[2] || ''
        };
      });
    } catch {
      return [];
    }
  }

  $: if (file || restoredData) {
      analyze();
  }

  // Draw Entropy Map
  $: if (entropyMap.length > 0 && canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
          const w = canvas.width;
          const h = canvas.height;
          const barWidth = w / entropyMap.length;
          ctx.clearRect(0, 0, w, h);

          entropyMap.forEach((val, i) => {
              // Color: Blue (Low) -> Red (High)
              // Hue: 240 (Blue) -> 0 (Red)
              const hue = (1 - (val / 8)) * 240;
              ctx.fillStyle = `hsl(${hue}, 80%, 50%)`;
              const barHeight = (val / 8) * h;
              ctx.fillRect(i * barWidth, h - barHeight, barWidth + 1, barHeight);
          });
      }
  }
</script>

<div class="space-y-6">
  {#if loading}
    <div class="flex items-center justify-center p-12 text-slate-400">
      <Activity class="animate-pulse mr-2" /> {dict?.inspector?.analyzing || 'Analyzing...'}
    </div>
  {:else}
    <!-- Risk & DNA -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
      <!-- Risk Score -->
      <div class="md:col-span-1 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 relative overflow-hidden">
          <div class="absolute top-0 right-0 p-4 opacity-10">
              {#if risk.score < 30}
                  <ShieldCheck size={64} class="text-emerald-500" />
              {:else if risk.score < 70}
                  <ShieldAlert size={64} class="text-amber-500" />
              {:else}
                  <AlertTriangle size={64} class="text-red-500" />
              {/if}
          </div>
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">Risk Score</h4>
          <div class="flex items-baseline gap-2">
              <span class="text-3xl font-bold {risk.score < 30 ? 'text-emerald-500' : risk.score < 70 ? 'text-amber-500' : 'text-red-500'}">
                  {risk.score}
              </span>
              <span class="text-xs text-slate-400">/ 100</span>
          </div>
          <p class="text-xs mt-2 text-slate-600 dark:text-slate-300">
              {#if risk.factors.length > 0}
                  {risk.factors[0]}
              {:else}
                  File appears safe and consistent.
              {/if}
          </p>
      </div>

      <!-- Entropy Map -->
      <div class="md:col-span-2 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <div class="flex justify-between items-center mb-2">
              <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide flex items-center gap-2">
                  <Binary size={14} /> Entropy Distribution
              </h4>
              <span class="text-xs font-mono text-slate-400">{entropy.toFixed(3)} / 8.0</span>
          </div>
          <div class="relative h-16 w-full bg-slate-100 dark:bg-slate-900 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
              <canvas bind:this={canvas} width={400} height={64} class="w-full h-full object-cover"></canvas>
          </div>
          <div class="flex justify-between text-[10px] text-slate-400 mt-1 px-1">
              <span>Start</span>
              <span>Visualizing Data Density (Red = High/Encrypted)</span>
              <span>End</span>
          </div>
      </div>
    </div>

    <!-- Insights -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-800">
        <h4 class="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-1 flex items-center gap-2">
          <FileSearch size={14} /> {dict?.inspector?.detectedType || 'Detected Type'}
        </h4>
        <div class="text-lg font-mono font-bold text-indigo-900 dark:text-indigo-100 break-words">
          {magicInfo.description}
        </div>
        <div class="text-xs mt-2 flex items-center gap-2">
          {#if magicInfo.matches}
             {#if file && file.type === magicInfo.type}
                <span class="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                   Match confirmed
                </span>
             {:else}
                <span class="text-amber-600 dark:text-amber-400 font-medium flex items-center gap-1">
                   <AlertTriangle size={12} /> Extension mismatch ({file?.type || 'No Type'})
                </span>
             {/if}
          {:else}
             <span class="text-slate-500">No signature match found</span>
          {/if}
        </div>
      </div>

      <!-- Deep Metadata -->
      <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
          <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex items-center gap-2">
              <ScanEye size={14} /> Deep Scan Metadata
          </h4>
          {#if metadata}
              <div class="space-y-1 text-xs">
                  {#if metadata.pageCount}
                      <div class="flex justify-between">
                          <span class="text-slate-500">Page Count:</span>
                          <span class="font-mono text-slate-700 dark:text-slate-300">{metadata.pageCount}</span>
                      </div>
                  {/if}
                  {#if metadata.fileCount}
                      <div class="flex justify-between">
                          <span class="text-slate-500">Files inside:</span>
                          <span class="font-mono text-slate-700 dark:text-slate-300">{metadata.fileCount}</span>
                      </div>
                  {/if}
                  {#if metadata.dimensions}
                      <div class="flex justify-between">
                          <span class="text-slate-500">Dimensions:</span>
                          <span class="font-mono text-slate-700 dark:text-slate-300">{metadata.dimensions.width} x {metadata.dimensions.height}</span>
                      </div>
                  {/if}
                  {#if !metadata.pageCount && !metadata.fileCount && !metadata.dimensions}
                      <span class="text-slate-400 italic">No specific metadata found for this format.</span>
                  {/if}
              </div>
          {:else}
              <span class="text-slate-400 text-xs italic">Metadata unavailable.</span>
          {/if}
      </div>
    </div>

    <!-- Hex View -->
    <div class="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 font-mono text-xs">
      <div class="bg-slate-800 px-4 py-2 border-b border-slate-700 text-slate-400 flex justify-between">
        <span>{dict?.inspector?.hexView || 'Hex Viewer (First 512 Bytes)'}</span>
        <span>Offset: 0x0000</span>
      </div>
      <div class="p-4 overflow-x-auto text-slate-300">
        {#each hexLines as line (line.offset)}
          <div class="flex hover:bg-slate-800/50 rounded px-1">
            <span class="text-slate-500 w-16 select-none shrink-0">{line.offset}</span>
            <span class="text-cyan-400 w-96 mr-4 min-w-[300px] shrink-0">{line.hex}</span>
            <span class="text-amber-400 opacity-80 border-l border-slate-700 pl-4 min-w-[150px] shrink-0">{line.ascii}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
