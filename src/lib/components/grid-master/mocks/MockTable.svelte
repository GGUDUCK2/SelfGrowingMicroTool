<script lang="ts">
  export let name = 'Data Table';

  let rows = [
      { id: 'INV-001', client: 'Acme Corp', amount: '$1,200.00', status: 'Paid', statusColor: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
      { id: 'INV-002', client: 'Global Tech', amount: '$3,450.00', status: 'Pending', statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
      { id: 'INV-003', client: 'Stark Ind', amount: '$8,900.00', status: 'Paid', statusColor: 'text-green-600 bg-green-50 dark:bg-green-900/30' },
      { id: 'INV-004', client: 'Wayne Ent', amount: '$5,100.00', status: 'Overdue', statusColor: 'text-red-600 bg-red-50 dark:bg-red-900/30' },
      { id: 'INV-005', client: 'Cyberdyne', amount: '$2,200.00', status: 'Pending', statusColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' },
  ];

  function sort(key: string) {
      // Dummy sort for interaction
      rows = [...rows.reverse()];
  }
</script>

<div class="h-full w-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
  <div class="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/30">
      <h3 class="font-bold text-sm text-slate-700 dark:text-slate-200">{name}</h3>
      <div class="flex gap-2">
          <button class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" aria-label="Search">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          </button>
          <button class="p-1.5 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-500 transition-colors" aria-label="Settings">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3c7.2 0 9 1.8 9 9s-1.8 9-9 9-9-1.8-9-9 1.8-9 9-9z"/><circle cx="12" cy="12" r="3"/></svg>
          </button>
      </div>
  </div>

  <div class="flex-1 overflow-auto custom-scrollbar">
      <table class="w-full text-left text-xs">
          <thead class="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-medium sticky top-0 z-10">
              <tr>
                  <th class="px-4 py-3 cursor-pointer hover:text-indigo-600 transition-colors" on:click={() => sort('id')}>Invoice</th>
                  <th class="px-4 py-3 cursor-pointer hover:text-indigo-600 transition-colors" on:click={() => sort('client')}>Client</th>
                  <th class="px-4 py-3 text-right cursor-pointer hover:text-indigo-600 transition-colors" on:click={() => sort('amount')}>Amount</th>
                  <th class="px-4 py-3 text-center cursor-pointer hover:text-indigo-600 transition-colors" on:click={() => sort('status')}>Status</th>
                  <th class="px-4 py-3 w-10"></th>
              </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              {#each rows as row (row.id)}
                  <tr class="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors group cursor-pointer">
                      <td class="px-4 py-3 font-mono text-slate-600 dark:text-slate-400">{row.id}</td>
                      <td class="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">{row.client}</td>
                      <td class="px-4 py-3 text-right tabular-nums text-slate-700 dark:text-slate-300">{row.amount}</td>
                      <td class="px-4 py-3 text-center">
                          <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide {row.statusColor}">{row.status}</span>
                      </td>
                      <td class="px-4 py-3 text-center">
                          <button class="opacity-0 group-hover:opacity-100 p-1 hover:text-indigo-600 transition-all" aria-label="Row Options">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                          </button>
                      </td>
                  </tr>
              {/each}
          </tbody>
      </table>
  </div>

  <div class="p-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex justify-between items-center text-[10px] text-slate-500">
      <span>Showing 1-5 of 24</span>
      <div class="flex gap-1">
          <button class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors">Prev</button>
          <button class="px-2 py-1 rounded border border-slate-200 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 transition-colors">Next</button>
      </div>
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
    height: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
</style>
