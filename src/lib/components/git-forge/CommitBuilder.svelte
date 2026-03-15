<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { CommitMessage } from '$lib/utils/git-forge/types';
  import { generateCommit } from '$lib/utils/git-forge/commits';
  import type { GitForgeDictionary } from './types';
  import { Copy, Save, AlertTriangle, MessageSquare, Wand2, CheckCircle2, AlertCircle, Share2 } from 'lucide-svelte';
  import { onMount } from 'svelte';

  export let dictionary: GitForgeDictionary;

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

  function share() {
      const url = new URL(window.location.href);
      // Construct a safe, shareable URL state using a hash or search params
      url.hash = `state=${encodeURIComponent(JSON.stringify(data))}`;
      navigator.clipboard.writeText(url.toString());
      // Re-using the copy toast mechanism for simplicity, but customized message can be sent
      dispatch('copy');
  }

  onMount(() => {
      // Look for shared state in the URL hash
      try {
          if (window.location.hash.startsWith('#state=')) {
              const stateStr = window.location.hash.replace('#state=', '');
              const parsed = JSON.parse(decodeURIComponent(stateStr));
              if (parsed && typeof parsed === 'object') {
                  data = { ...data, ...parsed };
              }
              // Clean up hash to not pollute the URL bar while editing
              window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
      } catch (e) {
          console.error("Failed to parse shared state from hash", e);
      }
  });

  // Feature: Commit Validator
  $: descLength = data.description.length;
  $: descWarning = descLength > 50 ? 'Description > 50 chars' : null;
  $: bodyWarning = data.body.split('\n').some(line => line.length > 72) ? 'Body lines > 72 chars' : null;

  function loadExample(type: 'feat' | 'fix' | 'breaking') {
      if (type === 'feat') {
          data = { type: 'feat', scope: 'auth', description: 'add JWT based login', body: 'Implemented login using JSON Web Tokens.\n\nRequires updated environment variables.', footer: 'Closes #42', isBreaking: false };
      } else if (type === 'fix') {
          data = { type: 'fix', scope: 'ui', description: 'resolve header overlap on mobile', body: '', footer: '', isBreaking: false };
      } else {
          data = { type: 'feat', scope: 'api', description: 'restructure user endpoint response', body: '', footer: '', isBreaking: true };
      }
  }

  function handleKeydown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
          e.preventDefault();
          save();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
          e.preventDefault();
          copy();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
          e.preventDefault();
          data = { type: 'feat', scope: '', description: '', body: '', footer: '', isBreaking: false };
      }
  }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
    <!-- Form -->
    <div class="space-y-4 overflow-y-auto pr-2">
        <!-- Smart Examples -->
        <div class="flex gap-2 pb-2 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
            <button on:click={() => loadExample('feat')} class="min-h-[44px] flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/60 transition-colors whitespace-nowrap">
                <Wand2 size={14} /> Example: Feature
            </button>
            <button on:click={() => loadExample('fix')} class="min-h-[44px] flex items-center gap-2 px-3 py-1.5 text-xs font-medium rounded-lg bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300 hover:bg-orange-200 dark:hover:bg-orange-900/60 transition-colors whitespace-nowrap">
                <Wand2 size={14} /> Example: Fix
            </button>
        </div>

        <div class="grid grid-cols-2 gap-4">
            <div>
                <label for="commit-type" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.type}</label>
                <select id="commit-type" bind:value={data.type} class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500">
                    {#each types as t}
                        <option value={t}>{dictionary.commit.types[t] || t}</option>
                    {/each}
                </select>
            </div>
            <div>
                <label for="commit-scope" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.scope}</label>
                <input id="commit-scope" type="text" bind:value={data.scope} class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="auth, api, ui..." />
            </div>
        </div>

        <div>
            <div class="flex justify-between mb-1">
                <label for="commit-desc" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dictionary.commit.description}</label>
                <span class="text-xs {descWarning ? 'text-red-500 font-bold' : 'text-slate-400'}">{descLength}/50</span>
            </div>
            <input id="commit-desc" type="text" bind:value={data.description} class="min-h-[44px] w-full rounded-lg {descWarning ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-800 text-sm focus:ring-2" placeholder="add login functionality" />
        </div>

        <div>
            <div class="flex justify-between mb-1">
                <label for="commit-body" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{dictionary.commit.body}</label>
                {#if bodyWarning}
                    <span class="text-xs text-red-500 font-bold" transition:slide|local>{bodyWarning}</span>
                {/if}
            </div>
            <textarea id="commit-body" bind:value={data.body} rows="4" class="min-h-[44px] w-full rounded-lg {bodyWarning ? 'border-red-400 focus:ring-red-500' : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500'} bg-white dark:bg-slate-800 text-sm focus:ring-2" placeholder="Detailed explanation..."></textarea>
        </div>

        <div>
            <label for="commit-footer" class="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{dictionary.commit.footer}</label>
            <textarea id="commit-footer" bind:value={data.footer} rows="2" class="min-h-[44px] w-full rounded-lg border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm focus:ring-2 focus:ring-indigo-500" placeholder="Closes #123"></textarea>
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
        <!-- Validation Banner -->
        {#if descWarning || bodyWarning}
            <div class="bg-red-500/10 border-b border-red-500/20 p-2 flex items-center justify-center gap-2 text-red-400 text-xs font-medium">
                <AlertCircle size={14} />
                Convention Warning: {descWarning || ''} {descWarning && bodyWarning ? ' | ' : ''} {bodyWarning || ''}
            </div>
        {:else if data.description}
            <div class="bg-emerald-500/10 border-b border-emerald-500/20 p-2 flex items-center justify-center gap-2 text-emerald-400 text-xs font-medium">
                <CheckCircle2 size={14} />
                Follows Conventional Commits standard
            </div>
        {/if}
        <div class="bg-slate-800 p-3 flex items-center justify-between border-b border-slate-700">
            <span class="text-xs font-mono text-slate-400">git commit -m "..."</span>
            <div class="flex gap-2">
                <button on:click={share} class="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title={dictionary.commit.share} aria-label={dictionary.commit.share}>
                    <Share2 size={16} />
                </button>
                <button on:click={save} class="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title="Save" aria-label="Save">
                    <Save size={16} />
                </button>
                <button on:click={copy} class="min-h-[44px] min-w-[44px] flex items-center justify-center hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors" title={dictionary.commit.copy} aria-label={dictionary.commit.copy}>
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
