<script lang="ts">
  import { db } from '$lib/db';
  import { liveQuery } from 'dexie';
  import type { PasswordForgeHistory } from '$lib/types/password-forge';
  import { Copy, Trash2, Shield, Hash, Star, Download, AlertTriangle } from 'lucide-svelte';

  export let dictionary: Record<string, any>;

  let history = liveQuery(() => db.passwordForgeHistory.orderBy('createdAt').reverse().limit(50).toArray());

  const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

  function isExpired(date: Date) {
      return (Date.now() - date.getTime()) > THIRTY_DAYS_MS;
  }

  async function copyToClipboard(text: string) {
    await navigator.clipboard.writeText(text);
  }

  async function deleteEntry(id: number) {
    await db.passwordForgeHistory.delete(id);
  }

  async function clearHistory() {
    await db.passwordForgeHistory.clear();
  }

  async function toggleStar(item: PasswordForgeHistory) {
    await db.passwordForgeHistory.update(item.id!, { starred: item.starred ? 0 : 1 });
  }

  function formatDate(date: Date) {
      return new Intl.DateTimeFormat('default', { hour: 'numeric', minute: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  function downloadCsv() {
    if (!$history || $history.length === 0) return;

    let csv = 'Password,Mode,Length,Entropy,Strength,Created At,Starred\n';
    $history.forEach(item => {
      // Escape quotes for CSV
      const safePwd = item.password.replace(/"/g, '""');
      const dateStr = item.createdAt.toISOString();
      csv += `"${safePwd}","${item.mode}",${item.length},${item.entropy},"${item.strength}","${dateStr}",${item.starred ? 'Yes' : 'No'}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'password_history.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
  <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
    <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
      <Shield size={18} class="text-indigo-500" />
      {dictionary.history}
    </h2>
    <div class="flex gap-2">
      <button
        on:click={downloadCsv}
        class="text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors flex items-center justify-center min-h-[44px] min-w-[44px]"
        aria-label={dictionary.downloadCsv}
        title={dictionary.downloadCsv}
      >
        <Download size={16} class="mr-1 hidden sm:inline-block" />
        <span class="sr-only sm:not-sr-only">{dictionary.downloadCsv}</span>
      </button>
      <button
        on:click={clearHistory}
        class="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium px-3 py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors min-h-[44px] min-w-[44px]"
        aria-label={dictionary.clearHistory}
        title={dictionary.clearHistory}
      >
        {dictionary.clearHistory}
      </button>
    </div>
  </div>

  <div class="max-h-[600px] overflow-y-auto p-2">
    {#if $history}
      {#if $history.length === 0}
        <div class="p-8 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center">
            <Shield size={32} class="mb-3 opacity-20" />
            <p>{dictionary.noHistory}</p>
        </div>
      {:else}
        <div class="space-y-2">
          {#each $history as item (item.id)}
            <div class="p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/50 dark:hover:bg-slate-700/50 rounded-xl transition-colors group flex items-center justify-between border border-transparent hover:border-slate-200 dark:hover:border-slate-700">
              <div class="min-w-0 flex-1 mr-4">
                <div class="font-mono text-sm text-slate-900 dark:text-slate-100 truncate mb-1 bg-white dark:bg-slate-900 px-2 py-1 rounded inline-block border border-slate-200 dark:border-slate-700">
                    {item.password.substring(0, 16)}{item.password.length > 16 ? '...' : ''}
                </div>
                <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                  <span class="capitalize px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[10px] font-medium">{item.mode}</span>
                  <span>{formatDate(item.createdAt)}</span>
                  {#if isExpired(item.createdAt)}
                    <span class="flex items-center text-amber-600 dark:text-amber-500 bg-amber-50 dark:bg-amber-900/30 px-1.5 py-0.5 rounded text-[10px] font-medium" title={dictionary.rotateSuggested || 'Over 30 days old. Consider rotating.'}>
                        <AlertTriangle size={10} class="mr-1" />
                        {dictionary.expired || 'Old'}
                    </span>
                  {/if}
                </div>
              </div>

              <div class="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  on:click={() => copyToClipboard(item.password)}
                  class="p-2 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title={dictionary.copy}
                  aria-label={dictionary.copy}
                >
                  <Copy size={16} />
                </button>
                <button
                  on:click={() => toggleStar(item)}
                  class="p-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center {item.starred ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900/30' : 'text-slate-400 hover:text-yellow-500 hover:bg-yellow-50 dark:hover:bg-yellow-900/30'}"
                  title={dictionary.star}
                  aria-label={dictionary.star}
                >
                  <Star size={16} fill={item.starred ? "currentColor" : "none"} />
                </button>
                <button
                  on:click={() => deleteEntry(item.id!)}
                  class="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  title={dictionary.delete}
                  aria-label={dictionary.delete}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          {/each}
        </div>
      {/if}
    {/if}
  </div>
</div>
