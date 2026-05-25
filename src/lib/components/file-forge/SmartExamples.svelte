<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { FileText, Image, File } from '@lucide/svelte';
  import type { dictionaries } from '$lib/dictionaries';

  type FileForgeDict = typeof dictionaries.en.tools.fileForge;

  export let dict: FileForgeDict;

  const dispatch = createEventDispatcher();

  function loadText() {
    const content = "Hello World! This is a sample text file for analysis.\nCheck the hex view and entropy.";
    const file = new File([content], "sample.txt", { type: "text/plain" });
    dispatch('file', file);
  }

  function loadImage() {
    // 1x1 Transparent GIF
    const base64 = "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    const file = new File([byteArray], "sample_1x1.gif", { type: "image/gif" });
    dispatch('file', file);
  }

  function loadPdf() {
      // Minimal PDF Header
      const content = "%PDF-1.4\n%\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/Resources <<\n/Font <<\n/F1 4 0 R\n>>\n>>\n/MediaBox [0 0 612 792]\n/Contents 5 0 R\n>>\nendobj\n4 0 obj\n<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n>>\nendobj\n5 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 24 Tf\n100 100 Td\n(Hello World) Tj\nET\nendstream\nendobj\nxref\n0 6\n0000000000 65535 f\n0000000010 00000 n\n0000000060 00000 n\n0000000117 00000 n\n0000000224 00000 n\n0000000312 00000 n\ntrailer\n<<\n/Size 6\n/Root 1 0 R\n>>\nstartxref\n406\n%%EOF";
      const file = new File([content], "minimal.pdf", { type: "application/pdf" });
      dispatch('file', file);
  }
</script>

<div class="flex flex-wrap gap-2 justify-center mt-4 border-t border-dashed border-slate-200 dark:border-slate-800 pt-4">
    <span class="text-xs text-slate-400 w-full text-center mb-1">{dict?.smartExamples?.title || 'Try a Sample:'}</span>
    <button
        on:click={loadText}
        class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm"
    >
        <FileText size={14} />
        {dict?.smartExamples?.text || 'Text'}
    </button>
    <button
        on:click={loadImage}
        class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-purple-300 dark:hover:border-purple-700 hover:text-purple-600 dark:hover:text-purple-400 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm"
    >
        <Image size={14} />
        {dict?.smartExamples?.image || 'Image'}
    </button>
    <button
        on:click={loadPdf}
        class="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-red-300 dark:hover:border-red-700 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 transition-all shadow-sm"
    >
        <File size={14} />
        {dict?.smartExamples?.pdf || 'PDF'}
    </button>
</div>
