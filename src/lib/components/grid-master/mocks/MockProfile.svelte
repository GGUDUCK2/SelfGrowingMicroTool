<script lang="ts">
  export let name = 'Profile Card';

  let following = false;
  let stats = [
      { label: 'Projects', value: '142' },
      { label: 'Followers', value: '8.4k' },
      { label: 'Following', value: '1.2k' }
  ];
</script>

<div class="h-full w-full flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm text-center relative overflow-hidden group">
  <!-- Cover Photo -->
  <div class="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80 group-hover:opacity-100 transition-opacity"></div>

  <div class="relative mt-8 mb-4">
      <div class="w-24 h-24 rounded-full border-4 border-white dark:border-slate-900 shadow-lg overflow-hidden relative group/avatar">
          <div class="absolute inset-0 bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-3xl font-bold text-slate-400">JD</div>
          <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
          </div>
      </div>
      <div class="absolute bottom-1 right-1 w-5 h-5 bg-green-500 border-2 border-white dark:border-slate-900 rounded-full" title="Online"></div>
  </div>

  <h3 class="text-lg font-bold text-slate-900 dark:text-white leading-tight">Jane Doe</h3>
  <p class="text-sm text-slate-500 dark:text-slate-400 mb-4">Senior Product Designer</p>

  <div class="flex gap-2 mb-6">
      {#each ['dribbble', 'twitter', 'linkedin'] as social}
          <button class="p-2 rounded-full bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-all" aria-label={social}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><circle cx="12" cy="12" r="10"/></svg>
          </button>
      {/each}
  </div>

  <div class="grid grid-cols-3 divide-x divide-slate-100 dark:divide-slate-800 w-full mb-6">
      {#each stats as stat}
          <div class="flex flex-col items-center px-2 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded transition-colors cursor-pointer py-2">
              <span class="font-bold text-slate-900 dark:text-white">{stat.value}</span>
              <span class="text-[10px] uppercase tracking-wider text-slate-400 font-bold">{stat.label}</span>
          </div>
      {/each}
  </div>

  <div class="flex gap-3 w-full">
      <button
        class="flex-1 py-2 rounded-lg font-bold text-sm transition-all shadow-sm hover:shadow {following ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300' : 'bg-indigo-600 text-white hover:bg-indigo-700'}"
        on:click={() => following = !following}
      >
          {following ? 'Following' : 'Follow'}
      </button>
      <button class="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-500 transition-colors text-slate-500" aria-label="Message">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      </button>
  </div>
</div>
