<script lang="ts">
  export let name = 'Calendar';

  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const month = 'October 2024';

  let selectedDate = 24;

  function getDays() {
      const d = [];
      for (let i = 0; i < 31; i++) d.push({ date: i + 1, events: Math.random() > 0.8 ? 1 : 0 });
      return d;
  }

  let dates = getDays();
</script>

<div class="h-full w-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-4">
  <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-sm text-slate-800 dark:text-slate-200">{month}</h3>
      <div class="flex gap-1">
          <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </button>
          <button class="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-indigo-500 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>
          </button>
      </div>
  </div>

  <div class="grid grid-cols-7 gap-1 text-center mb-2">
      {#each days as day}
          <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{day}</div>
      {/each}
  </div>

  <div class="grid grid-cols-7 gap-1 text-center flex-1 content-start">
      {#each [0,0,0] as empty}
           <div></div>
      {/each}
      {#each dates as d (d.date)}
          <button
            class="aspect-square flex flex-col items-center justify-center rounded-lg text-xs font-medium transition-all relative group
            {selectedDate === d.date ? 'bg-indigo-600 text-white shadow-md scale-105' : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'}"
            on:click={() => selectedDate = d.date}
          >
              {d.date}
              {#if d.events > 0}
                  <div class="w-1 h-1 rounded-full {selectedDate === d.date ? 'bg-white' : 'bg-indigo-500'} mt-0.5"></div>
              {/if}
          </button>
      {/each}
  </div>

  <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
      <div class="flex items-start gap-3 mb-3 group cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
          <div class="w-1 h-10 bg-indigo-500 rounded-full mt-1"></div>
          <div>
              <div class="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-500 transition-colors">Design Review</div>
              <div class="text-[10px] text-slate-500">10:00 AM - 11:30 AM</div>
          </div>
      </div>
      <div class="flex items-start gap-3 group cursor-pointer p-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-lg transition-colors">
          <div class="w-1 h-10 bg-emerald-500 rounded-full mt-1"></div>
          <div>
              <div class="text-xs font-bold text-slate-700 dark:text-slate-200 group-hover:text-emerald-500 transition-colors">Team Sync</div>
              <div class="text-[10px] text-slate-500">2:00 PM - 2:30 PM</div>
          </div>
      </div>
  </div>
</div>
