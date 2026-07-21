<script lang="ts">
  export let name = 'Feed';

  let posts = [
      { id: 1, user: 'Sarah Connor', handle: '@sarahc', time: '2m', content: 'Just deployed the new grid system! 🚀 It looks amazing on mobile.', likes: 24, comments: 5 },
      { id: 2, user: 'John Doe', handle: '@jdoe', time: '15m', content: 'Working on a new SvelteKit project. Any tips for state management?', likes: 12, comments: 8 },
      { id: 3, user: 'Tech Daily', handle: '@techdaily', time: '1h', content: 'Breaking: CSS Grid Level 3 spec draft released. Check out the new features!', likes: 156, comments: 42 }
  ];

  function like(id: number) {
      const p = posts.find(x => x.id === id);
      if (p) {
          p.likes++;
          posts = posts;
      }
  }
</script>

<div class="h-full w-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
  <div class="p-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur z-10">
      <h3 class="font-bold text-sm">{name}</h3>
      <button class="text-indigo-600 dark:text-indigo-400 text-xs font-bold hover:underline min-h-[44px] min-w-[44px]">View All</button>
  </div>

  <div class="flex-1 overflow-y-auto custom-scrollbar">
      {#each posts as post (post.id)}
          <article class="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div class="flex gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 shrink-0 shadow-sm"></div>
                  <div class="flex-1 min-w-0">
                      <div class="flex items-center gap-2 mb-1">
                          <span class="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">{post.user}</span>
                          <span class="text-xs text-slate-500 truncate">{post.handle}</span>
                          <span class="text-xs text-slate-400">· {post.time}</span>
                      </div>
                      <p class="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-3">
                          {post.content}
                      </p>
                      <div class="flex items-center gap-6 text-slate-400 text-xs font-medium">
                          <button class="flex items-center gap-1.5 hover:text-indigo-500 transition-colors group min-h-[44px] min-w-[44px]" aria-label="Comments">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              {post.comments}
                          </button>
                          <button class="flex items-center gap-1.5 hover:text-red-500 transition-colors group min-h-[44px] min-w-[44px]" on:click={() => like(post.id)} aria-label="Like">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:fill-red-500 group-hover:scale-110 transition-transform"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                              {post.likes}
                          </button>
                          <button class="flex items-center gap-1.5 hover:text-green-500 transition-colors group min-h-[44px] min-w-[44px]" aria-label="Share">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:scale-110 transition-transform"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
                          </button>
                          <button class="ml-auto hover:text-slate-600 transition-colors min-h-[44px] min-w-[44px]" aria-label="Options">
                              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
                          </button>
                      </div>
                  </div>
              </div>
          </article>
      {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
</style>
