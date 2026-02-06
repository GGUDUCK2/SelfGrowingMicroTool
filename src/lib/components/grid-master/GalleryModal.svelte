<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { fade, fly } from 'svelte/transition';
  import { gridStore } from '$lib/utils/grid-master/store';
  import { X, Layout, FileText, LayoutDashboard, Image as ImageIcon, Briefcase, Columns } from 'lucide-svelte';
  import type { GridMasterDictionary, GridState } from '$lib/utils/grid-master/types';
  import { generateSmartLayout } from '$lib/utils/grid-master/generators';
  import { templates } from '$lib/utils/grid-master/templates';

  export let dict: GridMasterDictionary;

  const dispatch = createEventDispatcher();

  function close() {
      dispatch('close');
  }

  function handleKeydown(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
  }

  function load(layout: GridState) {
      gridStore.load(layout);
      close();
  }

  function loadSmart(type: 'dashboard' | 'blog' | 'holy-grail' | 'gallery') {
      const layout = generateSmartLayout(type);
      load(layout);
  }

  const galleryItems = [
      {
          id: 'dashboard',
          title: dict.smartLayouts?.dashboard || 'SaaS Dashboard',
          desc: 'Sidebar, Header, Main content, and Widget areas.',
          icon: LayoutDashboard,
          color: 'text-indigo-500',
          bg: 'bg-indigo-50 dark:bg-indigo-900/20',
          action: () => loadSmart('dashboard')
      },
      {
          id: 'holy-grail',
          title: dict.smartLayouts?.holyGrail || 'Holy Grail',
          desc: 'The classic layout: Header, Footer, Main, Nav, Aside.',
          icon: Layout,
          color: 'text-amber-500',
          bg: 'bg-amber-50 dark:bg-amber-900/20',
          action: () => loadSmart('holy-grail')
      },
      {
          id: 'blog',
          title: dict.smartLayouts?.blog || 'Blog Article',
          desc: 'Optimized for reading. Header, Hero, Article, Footer.',
          icon: FileText,
          color: 'text-emerald-500',
          bg: 'bg-emerald-50 dark:bg-emerald-900/20',
          action: () => loadSmart('blog')
      },
      {
          id: 'gallery',
          title: dict.smartLayouts?.gallery || 'Image Gallery',
          desc: 'A responsive grid perfect for portfolios and media.',
          icon: ImageIcon,
          color: 'text-pink-500',
          bg: 'bg-pink-50 dark:bg-pink-900/20',
          action: () => loadSmart('gallery')
      },
      {
          id: 'landing',
          title: 'Landing Page',
          desc: 'Stacked sections: Hero, Features, Testimonials, Footer.',
          icon: Columns,
          color: 'text-blue-500',
          bg: 'bg-blue-50 dark:bg-blue-900/20',
          action: () => {
              // Custom generator for Landing
              loadSmart('blog'); // Fallback for now, or implement custom
          }
      },
      {
          id: 'sidebar-right',
          title: 'Docs Layout',
          desc: 'Main content with a right-side table of contents.',
          icon: Briefcase,
          color: 'text-purple-500',
          bg: 'bg-purple-50 dark:bg-purple-900/20',
          action: () => {
               const t = JSON.parse(JSON.stringify(templates['sidebar-left']));
               // Flip cols
               t.cols = ['1fr', '250px'];
               t.areas = [
                   { ...t.areas[0], colStart: 1, colEnd: 2, name: 'content' },
                   { ...t.areas[1], colStart: 2, colEnd: 3, name: 'toc' }
               ];
               load(t);
          }
      }
  ];
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" transition:fade role="dialog" aria-modal="true" aria-labelledby="gallery-title">
  <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-4xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]" transition:fly={{ y: 20 }}>

      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
          <div>
              <h2 id="gallery-title" class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {dict.templates || 'Layout Gallery'}
              </h2>
              <p class="text-sm text-slate-500 dark:text-slate-400 mt-1">Start with a professional foundation</p>
          </div>
          <button on:click={close} class="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors" aria-label="Close">
              <X size={20} />
          </button>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-y-auto p-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {#each galleryItems as item (item.id)}
                  <button
                    class="group relative flex flex-col text-left p-6 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-500 dark:hover:border-indigo-500 transition-all hover:shadow-md bg-white dark:bg-slate-800/50"
                    on:click={item.action}
                  >
                      <div class="mb-4 p-3 rounded-lg w-fit transition-colors {item.bg} {item.color}">
                          <svelte:component this={item.icon} size={24} />
                      </div>
                      <h3 class="font-bold text-slate-900 dark:text-white mb-1 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{item.title}</h3>
                      <p class="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
                  </button>
              {/each}
          </div>
      </div>
  </div>
</div>
