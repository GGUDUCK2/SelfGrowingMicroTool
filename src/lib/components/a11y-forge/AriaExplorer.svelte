<script lang="ts">
  import { ariaRoles } from '$lib/utils/a11y-forge';
  import Search from '@lucide/svelte/icons/search';
import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
import Copy from '@lucide/svelte/icons/copy';
import Tag from '@lucide/svelte/icons/tag';
import Info from '@lucide/svelte/icons/info';

  export let dict: Record<string, any>;

  $: t = dict?.tools?.a11yForge?.aria || {};

  let searchQuery = '';
  let selectedRole: typeof ariaRoles[0] | null = null;
  let copied = false;

  $: filteredRoles = ariaRoles.filter(r =>
    r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: codeSnippet = selectedRole ?
    `<div role="${selectedRole.role}"${selectedRole.required.map(attr => `\n  ${attr}="..."`).join('')}>\n  <!-- Content -->\n</div>` : '';

  async function copyCode() {
    if (!codeSnippet) return;
    try {
      await navigator.clipboard.writeText(codeSnippet);
      copied = true;
      setTimeout(() => copied = false, 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  }

</script>

<div class="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

  <!-- Search -->
  <div class="relative">
    <Search size={18} class="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
    <input
      type="text"
      bind:value={searchQuery}
      placeholder={t.searchPlaceholder || "Search ARIA roles..."}
      class="w-full pl-11 pr-4 py-3 min-h-[44px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all text-slate-800 dark:text-slate-200 placeholder-slate-400"
    />
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

    <!-- Roles List -->
    <div class="lg:col-span-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden h-[500px] flex flex-col">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h3 class="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Tag size={16} /> WAI-ARIA Roles
        </h3>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {#if filteredRoles.length === 0}
          <div class="text-center p-4 text-sm text-slate-500">{t.noRolesFound || 'No roles found.'}</div>
        {/if}
        {#each filteredRoles as role}
          <button
            on:click={() => selectedRole = role}
            class="w-full text-left px-4 py-3 min-h-[44px] rounded-lg text-sm transition-colors {selectedRole?.role === role.role ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 font-medium' : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'}"
          >
            <div class="font-mono">{role.role}</div>
            <div class="text-xs text-slate-400 mt-1">{role.category}</div>
          </button>
        {/each}
      </div>
    </div>

    <!-- Role Details -->
    <div class="lg:col-span-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden h-[500px] flex flex-col">
      {#if selectedRole}
        <div class="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-start">
          <div>
            <div class="flex items-center gap-3 mb-2">
              <h2 class="text-2xl font-bold text-slate-900 dark:text-white font-mono">{selectedRole.role}</h2>
              <span class="px-2.5 py-1 text-xs font-medium bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-full">{selectedRole.category}</span>
            </div>
            <p class="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{selectedRole.description}</p>
          </div>
        </div>

        <div class="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">

          {#if selectedRole.required.length > 0}
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Info size={16} class="text-rose-500"/> {t.requiredAttributes || 'Required Attributes'}
              </h4>
              <div class="flex flex-wrap gap-2">
                {#each selectedRole.required as attr}
                  <span class="px-3 py-1.5 text-xs font-mono bg-rose-50 text-rose-700 dark:bg-rose-900/20 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50 rounded-md">
                    {attr}
                  </span>
                {/each}
              </div>
            </div>
          {/if}

          {#if selectedRole.attributes.length > 0}
            <div class="space-y-3">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                <Info size={16} class="text-indigo-500"/> {t.attributes || 'Supported Attributes'}
              </h4>
              <div class="flex flex-wrap gap-2">
                {#each selectedRole.attributes as attr}
                  <span class="px-3 py-1.5 text-xs font-mono bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md">
                    {attr}
                  </span>
                {/each}
              </div>
            </div>
          {/if}

          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{t.codeSnippet || 'HTML Snippet'}</h4>
              <button
                on:click={copyCode}
                class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium rounded-md transition-colors {copied ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700'}"
              >
                {#if copied}
                  <CheckCircle2 size={14} /> {t.copied || 'Copied!'}
                {:else}
                  <Copy size={14} /> {t.copyCode || 'Copy'}
                {/if}
              </button>
            </div>
            <div class="relative group">
              <pre class="p-4 bg-slate-900 text-slate-50 rounded-xl overflow-x-auto text-sm font-mono leading-relaxed custom-scrollbar border border-slate-700"><code>{codeSnippet}</code></pre>
            </div>
          </div>

        </div>
      {:else}
        <div class="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4 p-8 text-center">
          <Tag size={48} class="opacity-20" />
          <p>{t.selectRole || 'Select a role from the list to view its details and copy HTML snippets.'}</p>
        </div>
      {/if}
    </div>

  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-300 dark:bg-slate-600;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    @apply bg-slate-400 dark:bg-slate-500;
  }
</style>
