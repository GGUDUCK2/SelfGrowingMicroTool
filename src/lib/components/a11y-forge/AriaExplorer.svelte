<script lang="ts">
  import { ariaRoles } from '$lib/utils/a11y-forge';
  import Search from '@lucide/svelte/icons/search';
import CheckCircle2 from '@lucide/svelte/icons/check-circle-2';
import Copy from '@lucide/svelte/icons/copy';
import Download from '@lucide/svelte/icons/download';
import Tag from '@lucide/svelte/icons/tag';
import Info from '@lucide/svelte/icons/info';
import History from '@lucide/svelte/icons/history';
import Eye from '@lucide/svelte/icons/eye';
import { db } from '$lib/db';
import { onMount } from 'svelte';

  export let dict: Record<string, any>;

  $: t = dict?.tools?.a11yForge?.aria || {};

  let searchQuery = '';
  let selectedRole: typeof ariaRoles[0] | null = null;
  let copied = false;
  let recentRoles: any[] = [];

  onMount(() => {
    loadRecentRoles();
  });

  async function loadRecentRoles() {
    try {
      const items = await db.a11yForgeHistory
        .where('type').equals('aria')
        .reverse()
        .limit(10)
        .toArray();
      // Filter out duplicates by role name
      const uniqueRoles = new Map();
      items.forEach(item => {
        if (!uniqueRoles.has(item.role)) {
          uniqueRoles.set(item.role, item);
        }
      });
      recentRoles = Array.from(uniqueRoles.values());
    } catch (e) {
      console.error(e);
    }
  }

  async function saveRoleView(roleStr: string) {
    if (!roleStr) return;
    try {
      await db.a11yForgeHistory.add({
        type: 'aria',
        role: roleStr,
        timestamp: Date.now()
      });

      await loadRecentRoles();

      const count = await db.a11yForgeHistory.where('type').equals('aria').count();
      if (count > 100) {
        const oldest = await db.a11yForgeHistory
          .where('type').equals('aria')
          .limit(count - 100)
          .toArray();
        if(oldest.length > 0) {
             const toDelete = oldest.map(i => i.id!);
             await db.a11yForgeHistory.bulkDelete(toDelete);
             await loadRecentRoles();
        }
      }
    } catch (e) {
      console.error(e);
    }
  }

  $: {
    if (selectedRole) {
      saveRoleView(selectedRole.role);
    }
  }

  function getElementForRole(role: string) {
    // Map ARIA roles to native or typical div representation for interactive preview
    const nativeMap: Record<string, string> = {
      'button': 'button',
      'checkbox': 'input type="checkbox"',
      'link': 'a href="//" on:click|preventDefault',
      'textbox': 'input type="text"',
      'slider': 'input type="range"',
      'progressbar': 'progress value="50" max="100"',
      'switch': 'input type="checkbox" role="switch"'
    };
    if (nativeMap[role]) {
      return nativeMap[role];
    }
    return 'div';
  }


  $: filteredRoles = ariaRoles.filter(r =>
    r.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  $: codeSnippet = selectedRole ?
    `<div role="${selectedRole.role}"${selectedRole.required.map(attr => `\n  ${attr}="..."`).join('')}>\n  <!-- Content -->\n</div>` : '';


  async function downloadCode() {
    if (!codeSnippet) return;
    const blob = new Blob([codeSnippet], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aria-${selectedRole?.role || 'role'}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

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
    <div class="lg:col-span-1 flex flex-col gap-6 h-[774px]">
      <div class="border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden flex-1 flex flex-col">
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

    <!-- Recent Roles List -->
    <div class="lg:col-span-1 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden h-[250px] flex flex-col mt-6">
      <div class="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
        <h3 class="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <History size={16} /> {t.recentRoles || 'Recent Roles'}
        </h3>
      </div>
      <div class="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
        {#if recentRoles.length === 0}
          <div class="text-center p-4 text-sm text-slate-500">{t.noRecentRoles || 'No recent roles.'}</div>
        {/if}
        {#each recentRoles as item}
          {@const roleObj = ariaRoles.find(r => r.role === item.role)}
          {#if roleObj}
            <button
              on:click={() => selectedRole = roleObj}
              class="w-full text-left px-4 py-2 min-h-[44px] rounded-lg text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div class="font-mono text-slate-700 dark:text-slate-300">{item.role}</div>
            </button>
          {/if}
        {/each}
      </div>
    </div>

    </div>

    <!-- Role Details -->
    <div class="lg:col-span-2 border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-900 overflow-hidden h-[774px] flex flex-col">
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


          <!-- Interactive Preview -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
              <Eye size={16} class="text-emerald-500"/> {t.interactivePreview || 'Interactive Preview'}
            </h4>
            <div class="p-6 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center min-h-[120px]">
              {#if getElementForRole(selectedRole.role) === 'button'}
                <button class="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors focus:ring-4 focus:ring-indigo-500/30 outline-none" role={selectedRole.role}>
                  Interactive Button
                </button>
              {:else if getElementForRole(selectedRole.role) === 'input type="checkbox"'}
                <label class="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" class="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" role={selectedRole.role} />
                  <span class="text-slate-700 dark:text-slate-300 font-medium">Interactive Checkbox</span>
                </label>
              {:else if getElementForRole(selectedRole.role) === 'a href="//" on:click|preventDefault'}
                <a href="//" on:click|preventDefault class="text-indigo-600 dark:text-indigo-400 hover:underline font-medium focus:ring-2 focus:ring-indigo-500 outline-none rounded" role={selectedRole.role}>Interactive Link</a>
              {:else if getElementForRole(selectedRole.role) === 'input type="text"'}
                <input type="text" placeholder="Type here..." class="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none text-slate-900 dark:text-white" role={selectedRole.role} />
              {:else if getElementForRole(selectedRole.role) === 'input type="range"'}
                <input type="range" class="w-full max-w-xs accent-indigo-600" role={selectedRole.role} />
              {:else if getElementForRole(selectedRole.role) === 'progress value="50" max="100"'}
                <progress value="50" max="100" class="w-full max-w-xs" role={selectedRole.role}></progress>
              {:else if getElementForRole(selectedRole.role) === 'input type="checkbox" role="switch"'}
                <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" class="sr-only peer" role="switch">
                  <div class="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 dark:peer-focus:ring-indigo-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  <span class="ml-3 text-sm font-medium text-slate-900 dark:text-slate-300">Toggle Switch</span>
                </label>
              {:else}
                <div class="px-6 py-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 border-dashed rounded-lg text-slate-500 dark:text-slate-400 font-mono text-sm text-center" role={selectedRole.role} tabindex="-1">
                  &lt;div role="{selectedRole.role}"&gt;<br/>Generic Container<br/>&lt;/div&gt;
                </div>
              {/if}
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-2 flex items-center gap-1.5"><Info size={14}/> Try interacting with this element using your keyboard (Tab, Space, Enter) or screen reader to understand its default behavior.</p>
          </div>


          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-semibold text-slate-900 dark:text-white uppercase tracking-wider">{t.codeSnippet || 'HTML Snippet'}</h4>
              <button
                on:click={downloadCode}
                class="flex items-center gap-1.5 px-3 py-1.5 min-h-[44px] min-w-[44px] text-xs font-medium rounded-md transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
              >
                <Download size={14} /> Download
              </button>
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
    background-color: #cbd5e1;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #475569;
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #64748b;
  }
</style>
