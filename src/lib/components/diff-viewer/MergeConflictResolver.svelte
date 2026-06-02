<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { Check, X, Split, GitMerge } from '@lucide/svelte';

  export let content: string;
  export let translations: any;

  const dispatch = createEventDispatcher();

  interface ConflictBlock {
    id: number;
    type: 'conflict' | 'text';
    content?: string; // for normal text
    header?: string;
    original?: string;
    separator?: string;
    modified?: string;
    footer?: string;
    resolved?: 'original' | 'modified' | 'both' | null;
  }

  let blocks: ConflictBlock[] = [];
  let resolvedContent = '';

  $: if (content) {
      parseBlocks(content);
  }

  function parseBlocks(text: string) {
      const conflictRegex = /(<<<<<<< (?:.*?)\n[\s\S]*?=======\n[\s\S]*?>>>>>>> (?:.*?))/g;
      const parts = text.split(conflictRegex);
      const matches = text.match(conflictRegex);

      const newBlocks: ConflictBlock[] = [];
      let matchIndex = 0;

      parts.forEach((part, index) => {
          if (part === undefined) return; // Should not happen usually

          // Determine if this part is a conflict block (by checking if it matches the current match)
          if (matches && matches[matchIndex] === part) {
              // It's a conflict block, parse internal structure
              const internalRegex = /<<<<<<< (.*?)\n([\s\S]*?)=======\n([\s\S]*?)>>>>>>> (.*?)/;
              const m = part.match(internalRegex);
              if (m) {
                  newBlocks.push({
                      id: index,
                      type: 'conflict',
                      header: m[1],
                      original: m[2],
                      modified: m[3],
                      footer: m[4],
                      resolved: null
                  });
              } else {
                   // Fallback if internal parsing fails (should match if outer did)
                   newBlocks.push({ id: index, type: 'text', content: part });
              }
              matchIndex++;
          } else {
               // It's normal text
               if (part.length > 0) {
                   newBlocks.push({ id: index, type: 'text', content: part });
               }
          }
      });
      blocks = newBlocks;
  }

  function resolveBlock(id: number, decision: 'original' | 'modified' | 'both') {
      blocks = blocks.map(b => b.id === id ? { ...b, resolved: decision } : b);
      checkCompletion();
  }

  function checkCompletion() {
      // If all conflicts are resolved, we can enable "Apply"
  }

  function getResolvedText() {
      return blocks.map(b => {
          if (b.type === 'text') return b.content;
          if (b.resolved === 'original') return b.original;
          if (b.resolved === 'modified') return b.modified;
          if (b.resolved === 'both') return (b.original || '') + (b.modified || '');
          return ''; // Should not happen if strictly checked
      }).join('');
  }

  function handleApply() {
      const result = getResolvedText();
      dispatch('apply', { text: result });
  }

  function getUnresolvedCount() {
      return blocks.filter(b => b.type === 'conflict' && !b.resolved).length;
  }
</script>

<div class="flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
    <div class="p-4 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center shadow-sm z-10">
        <div>
             <h3 class="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <GitMerge class="w-5 h-5 text-orange-500" />
                {translations?.resolveConflict || 'Interactive Resolver'}
            </h3>
            <p class="text-xs text-gray-500 mt-1">
                {getUnresolvedCount()} {translations?.conflictsRemaining || 'conflicts remaining'}
            </p>
        </div>
        <div class="flex gap-2">
             <button class="btn-secondary text-xs min-h-[44px]" on:click={() => dispatch('cancel')}>{translations?.cancel || 'Cancel'}</button>
             <button
                class="btn-primary text-xs disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                disabled={getUnresolvedCount() > 0}
                on:click={handleApply}
            >
                {translations?.applyResolution || 'Apply Resolution'}
            </button>
        </div>
    </div>

    <div class="flex-1 overflow-y-auto p-4 space-y-4">
        {#each blocks as block (block.id)}
            {#if block.type === 'text'}
                <div class="font-mono text-sm whitespace-pre-wrap text-gray-600 dark:text-gray-400 p-2 bg-white dark:bg-gray-800 rounded border border-transparent">
                    {block.content}
                </div>
            {:else}
                <div class="border-2 rounded-lg overflow-hidden transition-all {block.resolved ? 'border-green-500/50' : 'border-orange-500'}">
                    <div class="bg-orange-100 dark:bg-orange-900/30 p-2 text-xs font-mono text-orange-800 dark:text-orange-200 border-b border-orange-200 dark:border-orange-800/50 flex justify-between min-h-[44px] items-center">
                         <span>{translations?.conflictBlock || 'Conflict Block'}</span>
                         {#if block.resolved}
                            <span class="flex items-center gap-1 text-green-600 dark:text-green-400 font-bold">
                                <Check class="w-3 h-3" /> {translations?.resolved || 'Resolved'} ({block.resolved})
                            </span>
                         {:else}
                            <span class="font-bold">{translations?.unresolved || 'Unresolved'}</span>
                         {/if}
                    </div>

                    <div class="grid grid-cols-2 divide-x divide-gray-200 dark:divide-gray-700">
                        <!-- Original (Left) -->
                        <div class="flex flex-col">
                            <div class="p-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 font-mono text-center min-h-[44px] flex items-center justify-center">
                                {translations?.headCurrent || 'HEAD (Current)'}
                            </div>
                            <div class="p-2 font-mono text-xs bg-white dark:bg-gray-900 min-h-[60px] whitespace-pre-wrap flex-1 overflow-x-auto">
                                {block.original}
                            </div>
                            <button
                                class="p-2 min-h-[44px] text-xs font-medium text-center hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors border-t border-gray-200 dark:border-gray-700
                                {block.resolved === 'original' ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'text-gray-600 dark:text-gray-400'}"
                                on:click={() => resolveBlock(block.id, 'original')}
                            >
                                {translations?.acceptCurrent || 'Accept Current'}
                            </button>
                        </div>

                        <!-- Modified (Right) -->
                        <div class="flex flex-col">
                            <div class="p-1.5 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 text-[10px] text-gray-500 font-mono text-center min-h-[44px] flex items-center justify-center">
                                {translations?.incoming || 'Incoming'}
                            </div>
                            <div class="p-2 font-mono text-xs bg-white dark:bg-gray-900 min-h-[60px] whitespace-pre-wrap flex-1 overflow-x-auto">
                                {block.modified}
                            </div>
                            <button
                                class="p-2 min-h-[44px] text-xs font-medium text-center hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors border-t border-gray-200 dark:border-gray-700
                                {block.resolved === 'modified' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'text-gray-600 dark:text-gray-400'}"
                                on:click={() => resolveBlock(block.id, 'modified')}
                            >
                                {translations?.acceptIncoming || 'Accept Incoming'}
                            </button>
                        </div>
                    </div>

                    <button
                        class="w-full p-2 min-h-[44px] text-xs font-medium text-center border-t border-gray-200 dark:border-gray-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors
                        {block.resolved === 'both' ? 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}"
                        on:click={() => resolveBlock(block.id, 'both')}
                    >
                        {translations?.keepBoth || 'Keep Both (Current then Incoming)'}
                    </button>
                </div>
            {/if}
        {/each}

        {#if blocks.length === 0}
            <div class="text-center py-12 text-gray-500 min-h-[44px]">
                {translations?.noConflictMarkers || 'No conflict markers found.'}
            </div>
        {/if}
    </div>
</div>

<style>
    .btn-primary {
        @apply px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-medium transition-colors shadow-sm;
    }
    .btn-secondary {
        @apply px-3 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 rounded font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700;
    }
</style>
