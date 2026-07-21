<script lang="ts">
  export let name = 'Gallery';

  let images = [
      'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1513151241139-65f1df68ef71?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1542831371-29b0f74f9713?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1501785888041-af3ef285b470?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80',
      'https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?ixlib=rb-1.2.1&auto=format&fit=crop&w=300&q=80'
  ];

  let layout: 'grid' | 'masonry' = 'grid';
  let selected: number | null = null;
</script>

<div class="h-full w-full flex flex-col bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm p-4">
  <div class="flex justify-between items-center mb-4">
      <h3 class="font-bold text-sm">{name}</h3>
      <div class="flex gap-2">
          <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded {layout === 'grid' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-400'} min-h-[44px] min-w-[44px]" on:click={() => layout = 'grid'} aria-label="Grid View">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
          </button>
          <button class="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded {layout === 'masonry' ? 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' : 'text-slate-400'} min-h-[44px] min-w-[44px]" on:click={() => layout = 'masonry'} aria-label="Masonry View">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3h7v7H3z"/><path d="M14 3h7v13h-7z"/><path d="M14 21h7v-1h-7z"/><path d="M3 14h7v7H3z"/></svg>
          </button>
      </div>
  </div>

  <div class="flex-1 overflow-y-auto custom-scrollbar pr-1">
      <div class="grid {layout === 'grid' ? 'grid-cols-2 sm:grid-cols-3' : 'columns-2 gap-3 space-y-3'} gap-3">
          {#each images as img, i (i)}
              <!-- svelte-ignore a11y-click-events-have-key-events -->
              <!-- svelte-ignore a11y-no-static-element-interactions -->
              <div
                  class="relative rounded-lg overflow-hidden group cursor-pointer transition-transform hover:-translate-y-1 shadow-sm hover:shadow-lg {layout === 'masonry' ? 'mb-3 break-inside-avoid' : 'aspect-square'}"
                  on:click={() => selected = selected === i ? null : i}
              >
                  <img
                      src={img}
                      alt="Gallery Item"
                      class="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      loading="lazy"
                  />
                  <div class="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <div class="bg-white/20 backdrop-blur p-2 rounded-full text-white transform scale-50 group-hover:scale-100 transition-transform">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                      </div>
                  </div>
                  {#if selected === i}
                      <div class="absolute inset-0 border-4 border-indigo-500 pointer-events-none rounded-lg animate-pulse"></div>
                  {/if}
              </div>
          {/each}
          {#each Array(3) as _}
              <div class="bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse aspect-square flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-slate-300 dark:text-slate-600"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
              </div>
          {/each}
      </div>
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
