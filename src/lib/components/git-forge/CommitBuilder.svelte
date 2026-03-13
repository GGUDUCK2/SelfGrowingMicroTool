<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CommitMessage } from '$lib/utils/git-forge/types';
  import { generateCommit } from '$lib/utils/git-forge/commits';
  import { Copy, Save, AlertTriangle, MessageSquare } from 'lucide-svelte';

  export let dictionary: any;

  const dispatch = createEventDispatcher();

  let data: CommitMessage = {
      type: 'feat',
      scope: '',
      description: '',
      body: '',
      footer: '',
      isBreaking: false
  };

  const types = ['feat', 'fix', 'docs', 'style', 'refactor', 'perf', 'test', 'build', 'ci', 'chore', 'revert'];

  $: message = generateCommit(data);

  function copy() {
      navigator.clipboard.writeText(message);
      dispatch('copy');
  }

  function save() {
      if (!data.description) return;
      dispatch('save', { type: 'commit', content: message, details: data.type });
  }
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
    <!-- Form -->
    <div class="space-y-4 overflow-y-auto pr-2">
        <div class="grid grid-cols-2 gap-4">
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.type}</label>
                <select bind:value={data.type} class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500">
                    {#each types as t}
                        <option value={t}>{dictionary.commit.types[t] || t}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.scope}</label>
                <input type="text" bind:value={data.scope} class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="auth, api, ui..." />
            </div>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.description}</label>
            <input type="text" bind:value={data.description} class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="add login functionality" />
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.body}</label>
            <textarea bind:value={data.body} rows="4" class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Detailed explanation..."></textarea>
        </div>

        <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.footer}</label>
            <textarea bind:value={data.footer} rows="2" class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Closes #123"></textarea>
        </div>

        <div class="flex items-center gap-2">
            <input type="checkbox" id="breaking" bind:checked={data.isBreaking} class="w-4 h-4 text-red-600 rounded border-gray-300 focus:ring-red-500" />
            <label for="breaking" class="min-h-[44px] cursor-pointer text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <AlertTriangle size={14} class={data.isBreaking ? 'text-red-500' : 'text-slate-400'} />
                {dictionary.commit.breaking}
            </label>
        </div>
    </div>

    <!-- Preview -->
    <div class="flex flex-col h-full bg-slate-900 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
        <div class="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700">
            <span class="text-xs font-mono text-slate-400">git commit -m "..."</span>
            <div class="flex gap-2">
                <button on:click={save} class="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white" title="Save" aria-label="Save">
                    <Save size={16} />
                </button>
                <button on:click={copy} class="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white" title={dictionary.commit.copy} aria-label={dictionary.commit.copy}>
                    <Copy size={16} />
                </button>
            </div>
        </div>
        <div class="flex-1 p-4 overflow-y-auto flex flex-col justify-center">
            <div class="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                <div class="font-mono text-sm text-yellow-400 mb-2 font-bold">{data.type}{data.scope ? `(${data.scope})` : ''}{data.isBreaking ? '!' : ''}: {data.description || '...'}</div>
                {#if data.body}
                    <div class="font-mono text-xs text-slate-300 whitespace-pre-wrap mb-4">{data.body}</div>
                {/if}
                {#if data.isBreaking}
                    <div class="font-mono text-xs text-red-400 font-bold mb-1">BREAKING CHANGE: {data.description}</div>
                {/if}
                {#if data.footer}
                    <div class="font-mono text-xs text-slate-400 whitespace-pre-wrap">{data.footer}</div>
                {/if}
            </div>
        </div>
    </div>
</div>
