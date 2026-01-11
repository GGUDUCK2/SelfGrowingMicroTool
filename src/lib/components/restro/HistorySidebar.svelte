<script lang="ts">
  import { Clock, Star, Trash2, ArrowRight, Folder, FolderOpen, ChevronRight, ChevronDown } from 'lucide-svelte';
  import type { RestroRequest } from '$lib/db/restro';
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db/restro';
  import type { RestroDictionary } from '$lib/types/restro';

  export let onLoadRequest: (req: RestroRequest) => void;
  export let dict: RestroDictionary;

  let activeTab = 'history'; // history, saved
  let expandedFolders: Record<string, boolean> = { 'Default': true };

  let history$ = liveQuery(() => db.history.orderBy('timestamp').reverse().toArray());
  let saved$ = liveQuery(() => db.collections.orderBy('timestamp').reverse().toArray());

  $: folders = $saved$ ? groupRequestsByFolder($saved$) : {};
  $: sortedFolderNames = Object.keys(folders).sort();

  function groupRequestsByFolder(requests: RestroRequest[]) {
    const groups: Record<string, RestroRequest[]> = {};
    requests.forEach(req => {
      const f = req.folder || 'Default';
      if (!groups[f]) groups[f] = [];
      groups[f].push(req);
    });
    return groups;
  }

  function toggleFolder(name: string) {
    expandedFolders[name] = !expandedFolders[name];
  }

  function formatDate(ts: number) {
    return new Date(ts).toLocaleString(undefined, {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  async function deleteHistory(id: number) {
    if (id) await db.history.delete(id);
  }

  async function deleteSaved(id: number) {
    if (id) await db.collections.delete(id);
  }

  function getMethodColor(method: string) {
    switch (method) {
        case 'GET': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30';
        case 'POST': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30';
        case 'PUT': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30';
        case 'DELETE': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/30';
        default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800';
    }
  }
</script>

<div class="flex flex-col h-full bg-slate-50 dark:bg-slate-800/50 border-r border-slate-200 dark:border-slate-700 w-full md:w-80">
  <div class="flex border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
    <button
      class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 {activeTab === 'history' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
      on:click={() => activeTab = 'history'}
    >
      <Clock class="w-4 h-4" /> {dict.history}
    </button>
    <button
      class="flex-1 px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center justify-center gap-2 {activeTab === 'saved' ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
      on:click={() => activeTab = 'saved'}
    >
      <Star class="w-4 h-4" /> {dict.collections}
    </button>
  </div>

  <div class="flex-1 overflow-y-auto custom-scrollbar">
    {#if activeTab === 'history'}
      {#if $history$}
        <div class="divide-y divide-slate-100 dark:divide-slate-700/50">
          {#each $history$ as req (req.id)}
            <div class="group relative w-full text-left hover:bg-white dark:hover:bg-slate-700/50 transition-colors p-3 cursor-pointer outline-none focus:bg-white dark:focus:bg-slate-700/50">
                <!-- Clickable area wrapper -->
                <button class="absolute inset-0 w-full h-full cursor-pointer z-0" on:click={() => onLoadRequest(req)} aria-label="Load request"></button>

                <div class="relative z-10 pointer-events-none">
                    <div class="flex items-center justify-between mb-1">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-bold {getMethodColor(req.method)}">{req.method}</span>
                        <span class="text-[10px] text-slate-400">{formatDate(req.timestamp)}</span>
                    </div>
                    <div class="text-xs font-mono text-slate-700 dark:text-slate-300 truncate mb-1" title={req.url}>
                        {req.url}
                    </div>
                    {#if req.status}
                        <div class="flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full {req.status < 400 ? 'bg-green-500' : 'bg-red-500'}"></div>
                            <span class="text-[10px] text-slate-500 dark:text-slate-400">{req.status} • {req.time}ms</span>
                        </div>
                    {/if}
                </div>

              <button
                 class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 rounded shadow-sm z-20 pointer-events-auto"
                 on:click|stopPropagation={() => deleteHistory(req.id!)}
                 aria-label="Delete history item"
              >
                <Trash2 class="w-3.5 h-3.5" />
              </button>
            </div>
          {/each}
          {#if $history$.length === 0}
            <div class="p-8 text-center text-slate-400 text-sm">No history yet.</div>
          {/if}
        </div>
      {/if}
    {:else}
       {#if $saved$}
        <div class="pb-2">
            {#each sortedFolderNames as folderName}
                <div class="border-b border-slate-100 dark:border-slate-800">
                    <button
                        class="w-full flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        on:click={() => toggleFolder(folderName)}
                    >
                        {#if expandedFolders[folderName]}
                            <ChevronDown class="w-4 h-4 text-slate-400" />
                            <FolderOpen class="w-4 h-4 text-indigo-500" />
                        {:else}
                            <ChevronRight class="w-4 h-4 text-slate-400" />
                            <Folder class="w-4 h-4 text-slate-400" />
                        {/if}
                        <span>{folderName}</span>
                        <span class="ml-auto text-xs text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full">{folders[folderName].length}</span>
                    </button>

                    {#if expandedFolders[folderName]}
                        <div class="pl-0 divide-y divide-slate-100 dark:divide-slate-800/50 bg-slate-50/50 dark:bg-slate-900/20">
                            {#each folders[folderName] as req (req.id)}
                                <div class="group relative w-full text-left hover:bg-white dark:hover:bg-slate-700/50 transition-colors p-3 pl-8 cursor-pointer outline-none border-l-2 border-transparent hover:border-indigo-500">
                                    <button class="absolute inset-0 w-full h-full cursor-pointer z-0" on:click={() => onLoadRequest(req)} aria-label="Load request"></button>

                                    <div class="relative z-10 pointer-events-none">
                                        <div class="font-medium text-sm text-slate-800 dark:text-slate-200 mb-1">{req.name || 'Untitled'}</div>
                                        <div class="flex items-center gap-2">
                                            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold {getMethodColor(req.method)}">{req.method}</span>
                                            <div class="text-[10px] font-mono text-slate-500 dark:text-slate-400 truncate max-w-[120px]">{req.url}</div>
                                        </div>
                                    </div>

                                    <button
                                        class="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity bg-white/80 dark:bg-slate-800/80 rounded shadow-sm z-20 pointer-events-auto"
                                        on:click|stopPropagation={() => deleteSaved(req.id!)}
                                        aria-label="Delete saved item"
                                    >
                                        <Trash2 class="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            {/each}
                        </div>
                    {/if}
                </div>
            {/each}

           {#if $saved$.length === 0}
            <div class="p-8 text-center text-slate-400 text-sm">No saved requests.</div>
          {/if}
        </div>
       {/if}
    {/if}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    @apply bg-slate-200 dark:bg-slate-700 rounded;
  }
</style>
