<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import { dictionaries } from '$lib/dictionaries';
  import { fade, scale } from 'svelte/transition';
  import {
    Type, LayoutDashboard, BarChart3, Table, FormInput,
    LogIn, Video, Image as ImageIcon, DollarSign, Users,
    Quote, MapPin, Kanban, Rss, Calendar, UserCircle
  } from '@lucide/svelte';

  export let isOpen = false;
  export let areaId: string | null = null;
  export let dict: typeof dictionaries.en.tools.gridMaster = dictionaries.en.tools.gridMaster;

  let name = '';
  let tag = 'div';
  let contentType = 'none';
  let color = 'indigo';

  $: if (isOpen && areaId) {
      const area = $gridStore.areas.find(a => a.id === areaId);
      if (area) {
          name = area.name;
          tag = area.tag || 'div';
          contentType = area.contentType || 'none';
          color = area.color;
      }
  }

  function save() {
      if (areaId) {
          gridStore.updateArea(areaId, { name, tag, contentType, color });
      }
      isOpen = false;
  }

  function close() {
      isOpen = false;
  }

  const colors = [
      'slate', 'gray', 'zinc', 'neutral', 'stone',
      'red', 'orange', 'amber', 'yellow', 'lime', 'green',
      'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo',
      'violet', 'purple', 'fuchsia', 'pink', 'rose'
  ];

  const tags = ['div', 'header', 'footer', 'main', 'nav', 'section', 'aside', 'article'];
  const contentTypes = [
      { val: 'none', icon: Type, label: 'None' },
      { val: 'hero', icon: LayoutDashboard, label: 'Hero' },
      { val: 'chart', icon: BarChart3, label: 'Chart' },
      { val: 'table', icon: Table, label: 'Table' },
      { val: 'kanban', icon: Kanban, label: 'Kanban' },
      { val: 'feed', icon: Rss, label: 'Feed' },
      { val: 'gallery', icon: ImageIcon, label: 'Gallery' },
      { val: 'video', icon: Video, label: 'Video' },
      { val: 'calendar', icon: Calendar, label: 'Calendar' },
      { val: 'profile', icon: UserCircle, label: 'Profile' },
      { val: 'form', icon: FormInput, label: 'Form' },
      { val: 'login', icon: LogIn, label: 'Login' },
      { val: 'pricing', icon: DollarSign, label: 'Pricing' },
      { val: 'team', icon: Users, label: 'Team' },
      { val: 'testimonial', icon: Quote, label: 'Quote' },
      { val: 'map', icon: MapPin, label: 'Map' }
  ];

</script>

{#if isOpen}
  <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade={{ duration: 200 }}>
      <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]" transition:scale={{ duration: 200, start: 0.95 }}>
          <div class="p-4 border-b dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
              <h3 class="font-bold text-lg">{dict.settings}</h3>
              <button on:click={close} class="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full" aria-label="Close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto custom-scrollbar">
              <!-- Name -->
              <div>
                  <label class="block text-sm font-medium mb-1 opacity-70" for="area-name">{dict.areaName}</label>
                  <input id="area-name" type="text" bind:value={name} class="w-full p-2 rounded border dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none" />
              </div>

              <!-- Semantic Tag -->
              <div>
                  <label class="block text-sm font-medium mb-1 opacity-70" for="area-tag">{dict.semanticTag}</label>
                  <select id="area-tag" bind:value={tag} class="w-full p-2 rounded border dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-indigo-500 outline-none">
                      {#each tags as t (t)}
                          <option value={t}>{t}</option>
                      {/each}
                  </select>
                  <p class="text-xs opacity-50 mt-1">{dict.tagHelp?.[tag] || ''}</p>
              </div>

              <!-- Content Type (Visual Grid) -->
              <div>
                  <span class="block text-sm font-medium mb-2 opacity-70">{dict.contentType}</span>
                  <div class="grid grid-cols-4 gap-2">
                      {#each contentTypes as t (t.val)}
                          <button
                            class="flex flex-col items-center justify-center p-2 rounded border transition-all text-center gap-1 aspect-square
                            {contentType === t.val
                                ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                                : 'border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-slate-500'}"
                            on:click={() => contentType = t.val}
                            type="button"
                          >
                              <svelte:component this={t.icon} size={20} />
                              <span class="text-[9px] font-medium leading-tight">{dict.contentTypes?.[t.val] || t.label}</span>
                          </button>
                      {/each}
                  </div>
              </div>

              <!-- Color -->
              <div role="group" aria-labelledby="color-label">
                  <span id="color-label" class="block text-sm font-medium mb-1 opacity-70">{dict.color}</span>
                  <div class="flex flex-wrap gap-2">
                      {#each colors as c (c)}
                          <button
                              class="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110 {color === c ? 'border-black dark:border-white ring-2 ring-offset-2 ring-indigo-500' : 'border-transparent'}"
                              class:bg-slate-500={c==='slate'}
                              class:bg-gray-500={c==='gray'}
                              class:bg-zinc-500={c==='zinc'}
                              class:bg-neutral-500={c==='neutral'}
                              class:bg-stone-500={c==='stone'}
                              class:bg-red-500={c==='red'}
                              class:bg-orange-500={c==='orange'}
                              class:bg-amber-500={c==='amber'}
                              class:bg-yellow-500={c==='yellow'}
                              class:bg-lime-500={c==='lime'}
                              class:bg-green-500={c==='green'}
                              class:bg-emerald-500={c==='emerald'}
                              class:bg-teal-500={c==='teal'}
                              class:bg-cyan-500={c==='cyan'}
                              class:bg-sky-500={c==='sky'}
                              class:bg-blue-500={c==='blue'}
                              class:bg-indigo-500={c==='indigo'}
                              class:bg-violet-500={c==='violet'}
                              class:bg-purple-500={c==='purple'}
                              class:bg-fuchsia-500={c==='fuchsia'}
                              class:bg-pink-500={c==='pink'}
                              class:bg-rose-500={c==='rose'}
                              on:click={() => color = c}
                              title={c}
                              aria-label={`Select color ${c}`}
                          ></button>
                      {/each}
                  </div>
              </div>
          </div>

          <div class="p-4 border-t dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 flex justify-end gap-2 shrink-0">
              <button on:click={close} class="px-4 py-2 rounded hover:bg-slate-200 dark:hover:bg-slate-700 text-sm font-medium">Cancel</button>
              <button on:click={save} class="px-4 py-2 rounded bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium">Save Changes</button>
          </div>
      </div>
  </div>
{/if}

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: transparent;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }
  :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #334155;
  }
</style>
