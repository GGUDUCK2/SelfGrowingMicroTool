<script lang="ts">
  export let name = 'Chart';

  let type: 'bar' | 'line' | 'pie' = 'bar';
  let data = [65, 40, 75, 50, 90, 30, 80];

  function randomize() {
    data = data.map(() => Math.floor(Math.random() * 100));
  }
</script>

<div class="h-full w-full flex flex-col bg-white dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
  <div class="flex justify-between items-center mb-4 z-10 relative">
    <div class="flex flex-col">
       <h4 class="text-xs font-bold uppercase tracking-wider opacity-60">{name}</h4>
       <span class="text-2xl font-black tabular-nums tracking-tight">
          {data.reduce((a, b) => a + b, 0).toLocaleString()}
       </span>
    </div>
    <div class="flex gap-1">
        <button
          class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 {type === 'bar' ? 'text-indigo-500' : 'opacity-40'} min-h-[44px] min-w-[44px]"
          on:click={() => type = 'bar'}
          aria-label="Bar Chart"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="16"/></svg>
        </button>
        <button
          class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 {type === 'line' ? 'text-indigo-500' : 'opacity-40'} min-h-[44px] min-w-[44px]"
          on:click={() => type = 'line'}
          aria-label="Line Chart"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
        </button>
        <button
          class="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 opacity-40 hover:text-indigo-500 min-h-[44px] min-w-[44px]"
          on:click={randomize}
          aria-label="Refresh Data"
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21h5v-5"/></svg>
        </button>
    </div>
  </div>

  <div class="flex-1 w-full flex items-end justify-between gap-1 z-10 relative">
      {#if type === 'bar'}
          {#each data as val, i (i)}
              <div
                class="w-full bg-indigo-500 rounded-t-sm hover:bg-indigo-400 transition-all cursor-pointer relative group/bar"
                style="height: {val}%"
              >
                  <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] px-1.5 py-0.5 rounded opacity-0 group-hover/bar:opacity-100 transition-opacity whitespace-nowrap z-20">
                      {val}
                  </div>
              </div>
          {/each}
      {:else if type === 'line'}
          <svg class="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
             <polyline
                points={data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - d}`).join(' ')}
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                class="text-indigo-500"
                stroke-linecap="round"
                stroke-linejoin="round"
             />
             <polygon
                points={`0,100 ${data.map((d, i) => `${(i / (data.length - 1)) * 100},${100 - d}`).join(' ')} 100,100`}
                fill="currentColor"
                class="text-indigo-500/10"
             />
             {#each data as d, i (i)}
                 <circle
                   cx={(i / (data.length - 1)) * 100}
                   cy={100 - d}
                   r="3"
                   class="fill-white stroke-indigo-500 stroke-2 hover:r-4 transition-all cursor-pointer"
                 />
             {/each}
          </svg>
      {/if}
  </div>

  <!-- Decorative Grid Lines -->
  <div class="absolute inset-0 pointer-events-none opacity-5">
      <div class="w-full h-full" style="background-image: linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px); background-size: 20px 20px;"></div>
  </div>
</div>
