<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FileSearch, Activity, AlertTriangle, ScanEye, FileArchive, FileText, Binary } from 'lucide-svelte';
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
    offset: string;
    hex: string;
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
      risk = calculateRiskScore(file, magicInfo, entropy, riskArchiveData);

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
                            {#each archiveInfo.files.slice(0, 5) as f}
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
    <div class="bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 font-mono text-xs shadow-lg">
      <div class="bg-slate-950/50 px-4 py-3 border-b border-slate-800 text-slate-400 flex justify-between items-center">
        <span class="font-bold flex items-center gap-2"><Binary size={14}/> {dict?.inspector?.hexView || 'Hex Viewer'}</span>
        <span class="bg-slate-800 px-2 py-0.5 rounded text-[10px]">First 512 Bytes</span>
      </div>
      <div class="p-4 overflow-x-auto text-slate-300 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
        {#each hexLines as line (line.offset)}
          <div class="flex hover:bg-white/5 rounded px-1 transition-colors">
            <span class="text-slate-500 w-12 select-none shrink-0 border-r border-slate-800 mr-3">{line.offset}</span>
            <span class="text-cyan-400 w-96 mr-4 min-w-[300px] shrink-0 tracking-wider">{line.hex}</span>
            <span class="text-amber-400 opacity-80 border-l border-slate-800 pl-4 min-w-[150px] shrink-0 tracking-widest">{line.ascii}</span>
          </div>
        {/each}
      </div>
    </div>
  {/if}
</div>
