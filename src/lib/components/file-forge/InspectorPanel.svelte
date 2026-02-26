<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FileSearch, Activity, AlertTriangle, ScanEye, FileArchive, FileText, Binary, Edit2, Save, RotateCcw, Download } from 'lucide-svelte';
  import { detectFileType } from '$lib/utils/file-forge/signatures';
  import { calculateEntropy, calculateEntropyMap } from '$lib/utils/file-forge/analysis';
  import { calculateRiskScore, type RiskAnalysis } from '$lib/utils/file-forge/risk';
  import { analyzeArchive, type ArchiveAnalysis } from '$lib/utils/file-forge/archive';
  import { analyzePdf, type PdfMetadata } from '$lib/utils/file-forge/pdf';
  import { extractMetadata, type FileMetadata } from '$lib/utils/file-forge/metadata';

  import EntropyMap from './EntropyMap.svelte';
  import RiskPanel from './RiskPanel.svelte';

  export let file: File | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dict: Record<string, any>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let restoredData: any = null; // View-only mode

  const dispatch = createEventDispatcher();

  interface HexLine {
    offsetDisplay: string;
    bytes: { val: number; offset: number; modified: boolean }[];
    ascii: string;
  }

  let buffer: ArrayBuffer | null = null;
  let hexLines: HexLine[] = [];
  let entropy = 0;
  let entropyMapData: number[] = [];
  let risk: RiskAnalysis = { score: 0, factors: [], level: 'Safe' };
  let magicInfo = { type: 'Unknown', category: 'unknown', description: 'Unknown File Type', matches: false };
  let metadata: FileMetadata | null = null;

  // Specialized Analysis
  let archiveInfo: ArchiveAnalysis | null = null;
  let pdfInfo: PdfMetadata | null = null;

  let loading = true;
  let editMode = false;
  let hoveredByte: { val: number; offset: number } | null = null;
  // eslint-disable-next-line svelte/prefer-svelte-reactivity
  let modifiedBytes = new Map<number, number>();

  function handleByteHover(byte: { val: number; offset: number }) {
      hoveredByte = byte;
  }

  function handleMouseLeave() {
      hoveredByte = null;
  }

  async function analyze() {
    if (restoredData) {
      if (restoredData.magic) magicInfo = restoredData.magic;
      if (restoredData.entropy) entropy = restoredData.entropy;
      if (restoredData.entropyMap) entropyMapData = restoredData.entropyMap;
      if (restoredData.risk) risk = restoredData.risk;
      if (restoredData.metadata) metadata = restoredData.metadata;
      if (restoredData.archive) archiveInfo = restoredData.archive;
      if (restoredData.pdf) pdfInfo = restoredData.pdf;
      if (restoredData.hexPreview) {
         hexLines = parseHexPreview(restoredData.hexPreview);
      }
      loading = false;
      return;
    }

    if (!file) return;

    loading = true;
    modifiedBytes.clear();
    try {
      // 1. Read first 512 bytes for Hex View
      const chunk = file.slice(0, 512);
      buffer = await chunk.arrayBuffer();
      const view = new Uint8Array(buffer);

      updateHexView();

      // 3. Magic Number Detection
      magicInfo = detectFileType(buffer);

      // 4. Specialized Analyzers
      archiveInfo = null;
      pdfInfo = null;

      if (magicInfo.type.includes('zip') || file.name.endsWith('.zip')) {
          try {
              archiveInfo = await analyzeArchive(file);
          } catch (e) { console.warn('Archive analysis failed', e); }
      }
      if (magicInfo.type === 'application/pdf' || file.name.endsWith('.pdf')) {
          try {
              pdfInfo = await analyzePdf(file);
          } catch (e) { console.warn('PDF analysis failed', e); }
      }

      // 5. Entropy & Risk
      entropy = calculateEntropy(view);
      entropyMapData = await calculateEntropyMap(file, 100);

      if (entropyMapData.length > 0) {
          entropy = entropyMapData.reduce((a, b) => a + b, 0) / entropyMapData.length;
      }

      // Pass archive data to risk calculator if available
      const riskArchiveData = archiveInfo ? { compressionRatio: archiveInfo.compressionRatio, fileCount: archiveInfo.fileCount } : undefined;
      risk = await calculateRiskScore(file, magicInfo, entropy, riskArchiveData);

      // 6. Basic Metadata
      metadata = await extractMetadata(file);

      // Emit data for report
      dispatch('analysisComplete', {
          magic: magicInfo,
          entropy,
          entropyMap: entropyMapData,
          risk,
          metadata,
          archive: archiveInfo,
          pdf: pdfInfo,
          hexPreview: hexLines.map(l => `${l.offsetDisplay}  ${l.bytes.map(b => b.val.toString(16).padStart(2,'0').toUpperCase()).join(' ')}  ${l.ascii}`).join('\n')
      });

    } catch (e) {
      console.error(e);
    } finally {
      loading = false;
    }
  }

  function updateHexView() {
      if (!buffer) return;
      const view = new Uint8Array(buffer);
      const newHexLines: HexLine[] = [];

      for (let i = 0; i < view.length; i += 16) {
        const slice = view.slice(i, i + 16);
        const originalBytes = Array.from(slice);

        const displayBytes = originalBytes.map((b, idx) => {
            const offset = i + idx;
            const modified = modifiedBytes.has(offset);
            const val = modified ? modifiedBytes.get(offset)! : b;
            return { val, offset, modified };
        });

        const ascii = displayBytes
          .map(b => (b.val >= 32 && b.val <= 126 ? String.fromCharCode(b.val) : '.'))
          .join('');

        newHexLines.push({
          offsetDisplay: i.toString(16).padStart(4, '0').toUpperCase(),
          bytes: displayBytes,
          ascii
        });
      }
      hexLines = newHexLines;
  }

  function parseHexPreview(preview: string): HexLine[] {
    try {
      return preview.split('\n').filter(l => l.trim()).map(line => {
        // Simplified parser for restored view - not editable
        const parts = line.split('  ');
        // We reconstruct a simple view
        return {
          offsetDisplay: parts[0] || '',
          bytes: [], // Empty as we don't support editing history logs
          ascii: parts[2] || '',
          rawHex: parts[1] || '' // Store raw for display
        } as unknown as HexLine;
      });
    } catch {
      return [];
    }
  }

  function handleByteClick(byte: { val: number, offset: number }) {
      if (!editMode) return;
      const input = prompt('Enter Hex (00-FF):', byte.val.toString(16).padStart(2, '0').toUpperCase());
      if (input !== null) {
          const parsed = parseInt(input, 16);
          if (!isNaN(parsed) && parsed >= 0 && parsed <= 255) {
              modifiedBytes.set(byte.offset, parsed);
              modifiedBytes = modifiedBytes;
              updateHexView();
          }
      }
  }

  async function downloadPatched() {
    if (!file) return;
    try {
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Apply patches
        modifiedBytes.forEach((byte, offset) => {
            if (offset < uint8Array.length) {
                uint8Array[offset] = byte;
            }
        });

        const blob = new Blob([uint8Array], { type: file.type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `patched-${file.name}`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (e) {
        alert('Failed to patch file: ' + (e instanceof Error ? e.message : e));
    }
  }

  function resetChanges() {
      if (confirm('Discard all changes?')) {
          modifiedBytes.clear();
          modifiedBytes = modifiedBytes;
          updateHexView();
      }
  }

  $: if (file || restoredData) {
      analyze();
  }
</script>

<div class="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
  {#if loading}
    <div class="flex flex-col items-center justify-center p-20 text-slate-400 bg-white/50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
      <Activity class="animate-pulse mb-4 text-indigo-500" size={32} />
      <span class="font-medium animate-pulse">{dict?.inspector?.analyzing || 'Running Deep Scan...'}</span>
    </div>
  {:else}
    <!-- 1. Risk Assessment Panel -->
    <RiskPanel {risk} />

    <!-- 2. Visual Entropy DNA -->
    <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div class="flex justify-between items-center mb-4">
            <div>
                <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide flex items-center gap-2">
                    <Activity size={16} class="text-indigo-500" /> Entropy DNA
                </h4>
                <p class="text-xs text-slate-500 mt-1">Visualizes data randomness. Uniform blocks usually indicate encryption or compression.</p>
            </div>
            <div class="text-right">
                <span class="text-2xl font-mono font-bold text-slate-800 dark:text-slate-100">{entropy.toFixed(3)}</span>
                <span class="text-xs text-slate-400 block">/ 8.000</span>
            </div>
        </div>

        <EntropyMap map={entropyMapData} height={96} />
    </div>

    <!-- 3. Specialized Inspectors -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Magic & Type -->
        <div class="bg-indigo-50 dark:bg-indigo-900/10 p-6 rounded-2xl border border-indigo-100 dark:border-indigo-800/50">
            <h4 class="text-xs font-bold text-indigo-800 dark:text-indigo-300 uppercase tracking-wide mb-3 flex items-center gap-2">
            <FileSearch size={14} /> {dict?.inspector?.detectedType || 'File Signature'}
            </h4>
            <div class="text-xl font-mono font-bold text-indigo-900 dark:text-indigo-100 break-words mb-2">
            {magicInfo.description}
            </div>
            <div class="space-y-2">
                <div class="flex justify-between text-sm border-b border-indigo-200 dark:border-indigo-800/50 pb-2">
                    <span class="text-indigo-600 dark:text-indigo-400">MIME Type</span>
                    <span class="font-mono text-indigo-900 dark:text-indigo-200">{magicInfo.type}</span>
                </div>
                <div class="flex justify-between text-sm pt-1">
                    <span class="text-indigo-600 dark:text-indigo-400">Extension Match</span>
                    {#if magicInfo.matches}
                        <span class="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                            Verified
                        </span>
                    {:else}
                        <span class="text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1">
                            <AlertTriangle size={12} /> Mismatch
                        </span>
                    {/if}
                </div>
            </div>
        </div>

        <!-- Archive / PDF / Metadata -->
        <div class="bg-slate-50 dark:bg-slate-900/50 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <ScanEye size={14} /> Deep Inspection
            </h4>

            <div class="space-y-3 text-sm">
                <!-- Archive Specific -->
                {#if archiveInfo}
                    <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium pb-2 border-b border-slate-200 dark:border-slate-700">
                        <FileArchive size={16} /> Archive Analysis
                    </div>
                    <div class="grid grid-cols-2 gap-2 text-xs">
                        <div class="text-slate-500">File Count</div>
                        <div class="font-mono text-right">{archiveInfo.fileCount}</div>
                        <div class="text-slate-500">Compression Ratio</div>
                        <div class="font-mono text-right">{archiveInfo.compressionRatio.toFixed(1)}:1</div>
                        <div class="text-slate-500">Encrypted</div>
                        <div class="font-mono text-right {archiveInfo.encrypted ? 'text-amber-500 font-bold' : ''}">{archiveInfo.encrypted ? 'YES' : 'NO'}</div>
                    </div>
                    <div class="mt-2">
                        <span class="text-xs text-slate-400 block mb-1">Contents (Top 5):</span>
                        <div class="bg-white dark:bg-slate-800 rounded p-2 text-xs font-mono max-h-24 overflow-y-auto">
                            {#each archiveInfo.files.slice(0, 5) as f (f.name)}
                                <div class="truncate text-slate-600 dark:text-slate-400 border-b border-slate-100 dark:border-slate-700/50 last:border-0 py-0.5">
                                    {f.name} <span class="opacity-50">({(f.size/1024).toFixed(1)} KB)</span>
                                </div>
                            {/each}
                            {#if archiveInfo.fileCount > 5}
                                <div class="text-center text-slate-400 italic pt-1">...and {archiveInfo.fileCount - 5} more</div>
                            {/if}
                        </div>
                    </div>
                <!-- PDF Specific -->
                {:else if pdfInfo}
                    <div class="flex items-center gap-2 text-red-600 dark:text-red-400 font-medium pb-2 border-b border-slate-200 dark:border-slate-700">
                        <FileText size={16} /> PDF Analysis
                    </div>
                    <div class="space-y-2 text-xs">
                        <div class="flex justify-between">
                            <span class="text-slate-500">Pages</span>
                            <span class="font-mono font-bold">{pdfInfo.pageCount}</span>
                        </div>
                        {#if pdfInfo.title}<div class="flex justify-between"><span class="text-slate-500">Title</span><span class="truncate max-w-[150px]">{pdfInfo.title}</span></div>{/if}
                        {#if pdfInfo.author}<div class="flex justify-between"><span class="text-slate-500">Author</span><span class="truncate max-w-[150px]">{pdfInfo.author}</span></div>{/if}
                        {#if pdfInfo.producer}<div class="flex justify-between"><span class="text-slate-500">Producer</span><span class="truncate max-w-[150px]">{pdfInfo.producer}</span></div>{/if}
                        <div class="flex justify-between">
                            <span class="text-slate-500">Encrypted</span>
                            <span class="{pdfInfo.encrypted ? 'text-amber-500 font-bold' : ''}">{pdfInfo.encrypted ? 'YES' : 'NO'}</span>
                        </div>
                    </div>
                <!-- Generic -->
                {:else if metadata}
                    <div class="space-y-2 text-xs">
                        {#if metadata.dimensions}
                            <div class="flex justify-between">
                                <span class="text-slate-500">Dimensions</span>
                                <span class="font-mono">{metadata.dimensions.width} x {metadata.dimensions.height}</span>
                            </div>
                        {/if}
                        <div class="flex justify-between">
                            <span class="text-slate-500">Last Modified</span>
                            <span class="font-mono">{new Date(metadata.lastModified).toLocaleDateString()}</span>
                        </div>
                    </div>
                {:else}
                    <div class="text-center py-4 text-slate-400 italic">No additional metadata found.</div>
                {/if}
            </div>
        </div>
    </div>

    <!-- 4. Hex View -->
    <div class="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 font-mono text-xs shadow-lg transition-all {editMode ? 'ring-2 ring-indigo-500' : ''}">
      <div class="bg-slate-950/50 px-4 py-3 border-b border-slate-800 text-slate-400 flex justify-between items-center flex-wrap gap-2">
        <div class="flex items-center gap-4">
            <span class="font-bold flex items-center gap-2"><Binary size={14}/> {dict?.inspector?.hexView || 'Hex Viewer'}</span>
            <span class="bg-slate-800 px-2 py-0.5 rounded text-[10px]">First 512 Bytes</span>
        </div>
        {#if !restoredData}
            <div class="flex items-center gap-2">
                {#if editMode}
                    <button class="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-[10px] font-bold transition-colors" on:click={downloadPatched}>
                        <Download size={12} /> {dict?.inspector?.downloadPatched || 'Download Patched'}
                    </button>
                    <button class="flex items-center gap-1 bg-slate-700 hover:bg-slate-600 text-white px-3 py-1 rounded text-[10px] font-bold transition-colors" on:click={resetChanges}>
                        <RotateCcw size={12} />
                    </button>
                    <button class="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-[10px] font-bold transition-colors" on:click={() => editMode = false}>
                        <Save size={12} /> {dict?.inspector?.done || 'Done'}
                    </button>
                {:else}
                    <button class="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1 rounded text-[10px] font-bold transition-colors" on:click={() => editMode = true}>
                        <Edit2 size={12} /> {dict?.inspector?.editMode || 'Edit Mode'}
                    </button>
                {/if}
            </div>
        {/if}
      </div>
      <div class="p-4 overflow-x-auto text-slate-300 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {#each hexLines as line (line.offsetDisplay)}
          <div class="flex hover:bg-white/5 rounded px-1 transition-colors group">
            <span class="text-slate-500 w-12 select-none shrink-0 border-r border-slate-800 mr-3">{line.offsetDisplay}</span>

            <!-- Bytes Area -->
            <div class="w-96 mr-4 min-w-[300px] shrink-0 tracking-wider flex flex-wrap">
                {#if line.bytes.length > 0}
                    {#each line.bytes as byte (byte.offset)}
                        <button
                            class="w-6 text-center hover:bg-white/20 rounded {byte.modified ? 'text-yellow-400 font-bold' : 'text-cyan-400'} {editMode ? 'cursor-pointer hover:scale-110' : 'cursor-default'} focus:outline-none focus:bg-white/20 focus:ring-2 focus:ring-indigo-500"
                            on:click={() => handleByteClick(byte)}
                            on:mouseenter={() => handleByteHover(byte)}
                            on:mouseleave={handleMouseLeave}
                            on:focus={() => handleByteHover(byte)}
                            on:blur={handleMouseLeave}
                            tabindex="0"
                            title={editMode ? 'Click to edit' : 'Focus for Magic Lens'}
                        >
                            {byte.val.toString(16).padStart(2, '0').toUpperCase()}
                        </button>
                        <span class="w-2"></span>
                    {/each}
                {:else}
                    <span class="text-cyan-400">{line.rawHex}</span>
                {/if}
            </div>

            <span class="text-amber-400 opacity-80 border-l border-slate-800 pl-4 min-w-[150px] shrink-0 tracking-widest">{line.ascii}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}

  {#if hoveredByte}
    <div class="fixed bottom-8 right-8 z-50 bg-slate-900/90 border border-indigo-500/50 backdrop-blur-md p-4 rounded-xl shadow-2xl text-xs font-mono text-indigo-300 w-64 animate-in fade-in slide-in-from-bottom-2 pointer-events-none">
        <h5 class="font-bold text-white mb-2 flex items-center gap-2 border-b border-white/10 pb-1">
            <ScanEye size={14} /> {dict?.magicLens?.title || 'Magic Lens'}
        </h5>
        <div class="space-y-1.5">
            <div class="flex justify-between">
                <span class="text-slate-400">Offset</span>
                <span class="text-white">0x{hoveredByte.offset.toString(16).toUpperCase()}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Hex</span>
                <span class="text-yellow-400 font-bold">0x{hoveredByte.val.toString(16).padStart(2,'0').toUpperCase()}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Binary</span>
                <span class="text-cyan-400">{hoveredByte.val.toString(2).padStart(8,'0')}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Decimal (U8)</span>
                <span class="text-white">{hoveredByte.val}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Signed (I8)</span>
                <span class="text-white">{hoveredByte.val > 127 ? hoveredByte.val - 256 : hoveredByte.val}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">Octal</span>
                <span class="text-white">{hoveredByte.val.toString(8).padStart(3,'0')}</span>
            </div>
            <div class="flex justify-between">
                <span class="text-slate-400">ASCII</span>
                <span class="text-amber-400 font-bold">
                    {hoveredByte.val >= 32 && hoveredByte.val <= 126 ? String.fromCharCode(hoveredByte.val) : '.'}
                </span>
            </div>
        </div>
    </div>
  {/if}
</div>
