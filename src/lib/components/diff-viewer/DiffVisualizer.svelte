<script lang="ts">
  import type { DiffResult } from '$lib/utils/diff';
  import Prism from 'prismjs';
  import 'prismjs/components/prism-json';
  import 'prismjs/components/prism-typescript';
  import 'prismjs/components/prism-javascript';
  import 'prismjs/components/prism-css';
  import 'prismjs/components/prism-markup'; // html
  import 'prismjs/themes/prism-tomorrow.css';
  import { onMount } from 'svelte';

  export let diffResult: DiffResult;
  export let mode: 'split' | 'unified' = 'split';

  // We need to re-run highlight when diffResult changes
  $: htmlParts = generateDiffHtml(diffResult, mode);

  function generateDiffHtml(result: DiffResult, viewMode: 'split' | 'unified') {
      if (!result || !result.diffs) return { left: '', right: '', unified: '' };

      let leftHtml = '';
      let rightHtml = '';
      let unifiedHtml = '';

      let leftLineNum = 1;
      let rightLineNum = 1;

      result.diffs.forEach(part => {
        // Escape HTML
        const escapedValue = escapeHtml(part.value);
        const lines = escapedValue.split('\n');
        // The last split often creates an empty string if value ends with newline, handle it
        if (lines.length > 0 && lines[lines.length - 1] === '') lines.pop();

        const type = part.added ? 'added' : part.removed ? 'removed' : 'unchanged';
        const colorClass = type === 'added' ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300' :
                           type === 'removed' ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300' :
                           'text-gray-600 dark:text-gray-400';

        lines.forEach(line => {
             // Unified View
             if (viewMode === 'unified') {
                 let prefix = ' ';
                 let lnLeft = '';
                 let lnRight = '';

                 if (type === 'added') {
                     prefix = '+';
                     lnRight = rightLineNum.toString();
                     rightLineNum++;
                 } else if (type === 'removed') {
                     prefix = '-';
                     lnLeft = leftLineNum.toString();
                     leftLineNum++;
                 } else {
                     lnLeft = leftLineNum.toString();
                     lnRight = rightLineNum.toString();
                     leftLineNum++;
                     rightLineNum++;
                 }

                 unifiedHtml += `
                    <div class="flex hover:bg-gray-50 dark:hover:bg-gray-800/50 ${colorClass}">
                        <div class="w-10 text-right pr-2 select-none text-slate-500 text-xs border-r border-gray-200 dark:border-gray-700 py-0.5">${lnLeft}</div>
                        <div class="w-10 text-right pr-2 select-none text-slate-500 text-xs border-r border-gray-200 dark:border-gray-700 py-0.5">${lnRight}</div>
                        <div class="w-6 text-center select-none text-gray-400 text-xs py-0.5">${prefix}</div>
                        <div class="flex-1 font-mono text-sm whitespace-pre-wrap break-all py-0.5 px-2">${line || ' '}</div>
                    </div>
                 `;
             } else {
                 // Split View Logic is harder because we need to align added/removed blocks.
                 // For a simple visualizer, we might just dump them.
                 // However, true split view aligns changes.
                 // To keep it simple for this iteration:
                 // We will just render lines as they come. Alignment requires complex LCS on line blocks.

                 // Actually, let's try to align by pushing empty lines to the other side?
                 // No, that's complex. Let's just render what we have.
             }
        });

        // Split view simple construction (not perfectly aligned but functional)
        if (viewMode === 'split') {
             lines.forEach(line => {
                const lineHtml = `<div class="font-mono text-sm whitespace-pre-wrap break-all py-0.5 px-2 ${colorClass} min-h-[1.5rem]">${line || ' '}</div>`;

                if (type === 'removed') {
                    leftHtml += `<div class="flex"><div class="w-8 text-right pr-2 text-slate-500 text-xs select-none py-0.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">${leftLineNum++}</div><div class="flex-1 ${colorClass}">${lineHtml}</div></div>`;
                    // Push empty to right? No, better to leave it blank or handle later.
                    // For now, let's just make "Split" actually two separate synchronized scrolls of the changes.
                    // But true split view needs empty blocks on the other side.
                    rightHtml += `<div class="flex"><div class="w-8 text-right pr-2 text-slate-500 text-xs select-none py-0.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"></div><div class="flex-1 bg-gray-50/50 dark:bg-gray-900/50"></div></div>`;
                } else if (type === 'added') {
                    leftHtml += `<div class="flex"><div class="w-8 text-right pr-2 text-slate-500 text-xs select-none py-0.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900"></div><div class="flex-1 bg-gray-50/50 dark:bg-gray-900/50"></div></div>`;
                    rightHtml += `<div class="flex"><div class="w-8 text-right pr-2 text-slate-500 text-xs select-none py-0.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">${rightLineNum++}</div><div class="flex-1 ${colorClass}">${lineHtml}</div></div>`;
                } else {
                    leftHtml += `<div class="flex"><div class="w-8 text-right pr-2 text-slate-500 text-xs select-none py-0.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">${leftLineNum++}</div><div class="flex-1 ${colorClass}">${lineHtml}</div></div>`;
                    rightHtml += `<div class="flex"><div class="w-8 text-right pr-2 text-slate-500 text-xs select-none py-0.5 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">${rightLineNum++}</div><div class="flex-1 ${colorClass}">${lineHtml}</div></div>`;
                }
             });
        }
      });

      return { left: leftHtml, right: rightHtml, unified: unifiedHtml };
  }

  function escapeHtml(unsafe: string) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
 }
</script>

<div class="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-800 shadow-sm flex flex-col h-full">
    <div class="bg-gray-50 dark:bg-gray-900 px-4 py-2 border-b border-gray-200 dark:border-gray-700 font-medium text-sm text-gray-700 dark:text-gray-300 flex justify-between items-center">
        <span>Diff Output</span>
        <div class="flex gap-2 text-xs">
            <span class="flex items-center gap-1"><span class="w-3 h-3 bg-red-200 dark:bg-red-900/50 rounded-full"></span> Removed</span>
            <span class="flex items-center gap-1"><span class="w-3 h-3 bg-green-200 dark:bg-green-900/50 rounded-full"></span> Added</span>
        </div>
    </div>

    <div class="flex-1 overflow-auto bg-white dark:bg-gray-800 relative">
        {#if mode === 'unified'}
            <div class="w-full">
                {@html htmlParts.unified}
            </div>
        {:else}
            <div class="flex w-full min-w-[800px]"> <!-- Force min width for split view -->
                <div class="w-1/2 border-r border-gray-200 dark:border-gray-700">
                    {@html htmlParts.left}
                </div>
                <div class="w-1/2">
                    {@html htmlParts.right}
                </div>
            </div>
        {/if}

        {#if diffResult.diffs.length === 0}
            <div class="absolute inset-0 flex items-center justify-center text-gray-400">
                No differences found or empty input.
            </div>
        {/if}
    </div>
</div>
