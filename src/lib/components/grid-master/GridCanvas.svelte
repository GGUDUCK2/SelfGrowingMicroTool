<script lang="ts">
  import { gridStore } from '$lib/utils/grid-master/store';
  import { nanoid } from 'nanoid';
  import { fade } from 'svelte/transition';
  import { COLOR_MAP, getRandomColor } from '$lib/utils/grid-master/constants';
  import type { GridArea } from '$lib/utils/grid-master/types';
  import AreaSettingsModal from './AreaSettingsModal.svelte';

  export let previewMode = false;
  export let viewMode: 'desktop' | 'mobile' = 'desktop';
  export let theme = 'standard';
  export let dict: any = {}; // Passed from parent

  let editingAreaId: string | null = null;
  let isSettingsOpen = false;

  function openSettings(id: string) {
      editingAreaId = id;
      isSettingsOpen = true;
  }

  $: isMobileView = viewMode === 'mobile';

  function getThemeStyles(area: GridArea, theme: string) {
      if (theme === 'blueprint') {
          return `
            background-color: #1e3a8a10;
            border: 2px dashed #60a5fa;
            color: #1e3a8a;
          `;
      }
      if (theme === 'wireframe') {
          return `
            background-color: #ffffff;
            border: 2px solid #94a3b8;
            color: #000000;
          `;
      }
      if (theme === 'cyber') {
          return `
            background-color: #000000;
            border: 1px solid #00ff00;
            color: #00ff00;
            box-shadow: 0 0 5px #00ff00;
            text-shadow: 0 0 5px #00ff00;
          `;
      }
      // Standard
      return `
        background-color: ${area.color.startsWith('#') ? area.color : COLOR_MAP[area.color] || '#cbd5e1'};
        border: 1px solid rgba(0,0,0,0.05);
      `;
  }

  function getMobileAreas(areas: GridArea[]) {
     const sorted = [...areas].sort((a, b) => {
        if (a.mobileOrder !== undefined && b.mobileOrder !== undefined) {
             return a.mobileOrder - b.mobileOrder;
        }
        if (a.rowStart !== b.rowStart) return a.rowStart - b.rowStart;
        return a.colStart - b.colStart;
     });
     return sorted.map(a => `"${a.name}"`).join(' ');
  }

  let isSelecting = false;
  let selectionStart = { row: -1, col: -1 };
  let selectionEnd = { row: -1, col: -1 };

  function handleMouseDown(r: number, c: number) {
      if (previewMode) return;
      isSelecting = true;
      selectionStart = { row: r, col: c };
      selectionEnd = { row: r, col: c };
  }

  function handleMouseOver(r: number, c: number) {
      if (isSelecting) {
          selectionEnd = { row: r, col: c };
      }
  }

  function handleMouseUp() {
      if (isSelecting) {
          const rStart = Math.min(selectionStart.row, selectionEnd.row) + 1;
          const rEnd = Math.max(selectionStart.row, selectionEnd.row) + 2;
          const cStart = Math.min(selectionStart.col, selectionEnd.col) + 1;
          const cEnd = Math.max(selectionStart.col, selectionEnd.col) + 2;

          gridStore.addArea({
              id: nanoid(),
              name: `area-${$gridStore.areas.length + 1}`,
              rowStart: rStart,
              rowEnd: rEnd,
              colStart: cStart,
              colEnd: cEnd,
              color: getRandomColor()
          });

          isSelecting = false;
          selectionStart = { row: -1, col: -1 };
          selectionEnd = { row: -1, col: -1 };
      }
  }

  function handleCellKeyDown(e: KeyboardEvent, r: number, c: number) {
      if (previewMode) return;
      let nextR = r;
      let nextC = c;

      if (e.key === 'ArrowUp') nextR = Math.max(0, r - 1);
      else if (e.key === 'ArrowDown') nextR = Math.min($gridStore.rows.length - 1, r + 1);
      else if (e.key === 'ArrowLeft') nextC = Math.max(0, c - 1);
      else if (e.key === 'ArrowRight') nextC = Math.min($gridStore.cols.length - 1, c + 1);
      else return;

      e.preventDefault();
      const el = document.getElementById(`grid-cell-${nextR}-${nextC}`);
      el?.focus();
      // Also update hover state for potential drag start
      handleMouseOver(nextR, nextC);
  }

  function getSelectionStyle(start: typeof selectionStart, end: typeof selectionEnd) {
      if (start.row === -1) return 'display: none;';
      const rStart = Math.min(start.row, end.row) + 1;
      const rEnd = Math.max(start.row, end.row) + 2;
      const cStart = Math.min(start.col, end.col) + 1;
      const cEnd = Math.max(start.col, end.col) + 2;
      return `grid-area: ${rStart} / ${cStart} / ${rEnd} / ${cEnd};`;
  }

  function escapeHtml(text: string) {
      return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
  }

  function getSemanticTag(area: GridArea) {
      if (area.tag) return area.tag;
      const n = area.name.toLowerCase();
      if (n.includes('head')) return 'header';
      if (n.includes('foot')) return 'footer';
      if (n.includes('side') || n.includes('nav') || n.includes('menu')) return 'aside';
      if (n.includes('main') || n.includes('content')) return 'main';
      if (n.includes('sect')) return 'section';
      if (n.includes('art')) return 'article';
      return 'div';
  }

  function getPlaceholderContent(area: GridArea) {
      const name = area.name;
      const tag = getSemanticTag(area);
      const n = name.toLowerCase();
      const type = area.contentType;

      if (type === 'chart' || n.includes('chart') || n.includes('graph')) return `
        <div class="h-full flex flex-col p-3">
             <h4 class="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Analytics</h4>
             <div class="flex-1 flex items-end gap-1 pb-1">
                 <div class="w-full bg-current opacity-20 rounded-t" style="height: 30%"></div>
                 <div class="w-full bg-current opacity-30 rounded-t" style="height: 50%"></div>
                 <div class="w-full bg-current opacity-40 rounded-t" style="height: 75%"></div>
                 <div class="w-full bg-current opacity-25 rounded-t" style="height: 45%"></div>
                 <div class="w-full bg-current opacity-50 rounded-t" style="height: 90%"></div>
             </div>
        </div>
      `;

      if (type === 'form' || n.includes('form') || n.includes('contact') || n.includes('input')) return `
        <div class="h-full flex flex-col gap-2 p-3 justify-center max-w-sm mx-auto w-full">
            <h4 class="font-bold text-sm mb-1">${escapeHtml(name)}</h4>
            <div class="h-8 w-full bg-current opacity-10 border border-current rounded"></div>
            <div class="h-8 w-full bg-current opacity-10 border border-current rounded"></div>
            <div class="h-8 w-1/3 bg-current opacity-20 rounded self-start mt-1"></div>
        </div>
      `;

      if (type === 'video' || n.includes('video') || n.includes('player') || n.includes('media')) return `
         <div class="w-full h-full flex items-center justify-center bg-black/80 text-white relative group overflow-hidden">
             <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center pl-1 group-hover:scale-110 transition-transform cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
             </div>
             <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent flex items-end px-3 py-1 gap-2">
                  <div class="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"><div class="h-full w-1/3 bg-red-500"></div></div>
             </div>
         </div>
      `;

      if (type === 'image' || type === 'gallery' || n.includes('card') || n.includes('product') || n.includes('gallery') || n.includes('img') || n.includes('pic')) return `
        <div class="h-full grid grid-cols-2 gap-2 p-2 overflow-hidden content-start">
             ${Array(4).fill(0).map(() => `
                 <div class="aspect-square bg-current opacity-10 rounded flex flex-col p-1 gap-1 border border-current">
                      <div class="flex-1 bg-current opacity-20 rounded-sm flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                      <div class="h-1.5 w-3/4 bg-current opacity-20 rounded-sm"></div>
                 </div>
             `).join('')}
        </div>`;

      if (type === 'login' || n.includes('login') || n.includes('signin') || n.includes('auth')) return `
         <div class="h-full flex flex-col items-center justify-center p-4">
             <div class="w-full max-w-[200px] flex flex-col gap-2 bg-current opacity-10 p-3 rounded-lg border border-current">
                  <div class="text-xs font-bold text-center mb-1">Welcome Back</div>
                  <div class="h-6 w-full bg-current opacity-20 border border-current rounded px-2 text-[10px] flex items-center opacity-60">Email</div>
                  <div class="h-6 w-full bg-current opacity-20 border border-current rounded px-2 text-[10px] flex items-center opacity-60">Password</div>
                  <div class="h-6 w-full bg-current opacity-80 rounded text-white text-[10px] font-bold flex items-center justify-center mt-1">Sign In</div>
             </div>
         </div>
      `;

      if (type === 'pricing' || n.includes('pricing') || n.includes('plan')) return `
        <div class="h-full flex flex-col items-center p-3 text-center border-2 border-current rounded-lg bg-current opacity-20">
             <h4 class="text-xs font-bold uppercase tracking-wider mb-1 opacity-80">Pro Plan</h4>
             <div class="text-2xl font-black mb-2">$29<span class="text-xs font-normal opacity-60">/mo</span></div>
             <div class="flex flex-col gap-1 w-full opacity-70 text-[10px] mb-3">
                 <div class="bg-current opacity-30 rounded px-2 py-0.5">Feature A</div>
                 <div class="bg-current opacity-30 rounded px-2 py-0.5">Feature B</div>
             </div>
             <button class="mt-auto w-full py-1 bg-current rounded text-[10px] font-bold text-white opacity-80">Select</button>
        </div>
      `;

      if (type === 'team' || n.includes('team') || n.includes('member') || n.includes('profile')) return `
        <div class="h-full flex flex-col items-center justify-center p-2 text-center">
             <div class="w-12 h-12 rounded-full bg-current opacity-20 mb-2 overflow-hidden relative border-2 border-current">
                 <svg class="absolute inset-0 m-auto opacity-50 w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
             </div>
             <div class="font-bold text-xs">Jane Doe</div>
             <div class="text-[10px] opacity-60">Product Designer</div>
        </div>
      `;

      if (type === 'testimonial' || n.includes('testimonial') || n.includes('review')) return `
        <div class="h-full flex flex-col p-3 relative italic text-xs bg-current opacity-10 rounded-lg">
             <span class="text-3xl absolute top-0 left-1 opacity-20 serif">"</span>
             <p class="z-10 relative opacity-80 line-clamp-3 pl-2">This product completely transformed our workflow. Highly recommended!</p>
             <div class="mt-auto flex items-center gap-2 pt-2 pl-2">
                 <div class="w-6 h-6 rounded-full bg-current opacity-30"></div>
                 <div class="flex flex-col text-[10px] not-italic">
                     <span class="font-bold">John Smith</span>
                     <span class="opacity-50">CEO, TechCorp</span>
                 </div>
             </div>
        </div>
      `;

      if (type === 'map' || n.includes('map') || n.includes('location')) return `
        <div class="w-full h-full bg-current opacity-10 relative overflow-hidden group">
             <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 10px 10px;"></div>
             <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 drop-shadow-md">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
             </div>
        </div>
      `;

      if (type === 'hero' || n.includes('hero')) return `
        <div class="flex flex-col items-center justify-center h-full text-center p-4">
             <h1 class="text-2xl sm:text-3xl font-extrabold mb-2">Hero Title</h1>
             <p class="text-sm sm:text-base opacity-80 max-w-[90%]">This is a hero section subtitle highlighting the main value proposition.</p>
             <button class="mt-4 px-4 py-2 bg-black/10 dark:bg-white/20 rounded-lg text-xs sm:text-sm font-bold border border-current">Call to Action</button>
        </div>`;

      if (type === 'table' || n.includes('table') || n.includes('data') || n.includes('grid') && !n.includes('master')) return `
        <div class="h-full flex flex-col gap-2 p-2 overflow-hidden">
             <div class="flex justify-between items-center mb-1">
                 <h4 class="text-xs font-bold uppercase tracking-wider opacity-60">Data Table</h4>
                 <div class="flex gap-1">
                     <div class="w-4 h-4 rounded bg-black/10 dark:bg-white/10"></div>
                     <div class="w-4 h-4 rounded bg-black/10 dark:bg-white/10"></div>
                 </div>
             </div>
             <div class="w-full h-full border border-black/5 dark:border-white/5 rounded overflow-hidden">
                 <div class="grid grid-cols-4 gap-px bg-black/5 dark:bg-white/5 p-px">
                     <div class="bg-white/50 dark:bg-black/20 p-1 text-[10px] font-bold">ID</div>
                     <div class="bg-white/50 dark:bg-black/20 p-1 text-[10px] font-bold col-span-2">Name</div>
                     <div class="bg-white/50 dark:bg-black/20 p-1 text-[10px] font-bold">Status</div>
                     ${Array(5).fill(0).map(() => `
                         <div class="bg-white/30 dark:bg-black/10 p-1 h-4"></div>
                         <div class="bg-white/30 dark:bg-black/10 p-1 h-4 col-span-2"></div>
                         <div class="bg-white/30 dark:bg-black/10 p-1 h-4"></div>
                     `).join('')}
                 </div>
             </div>
        </div>`;

      if (tag === 'header') return `
        <div class="flex items-center justify-between h-full px-4">
            <h2 class="text-xl font-bold tracking-tight">Brand</h2>
            <nav class="hidden sm:flex gap-4 text-sm font-medium opacity-80">
                <span>Home</span>
                <span>About</span>
                <span>Contact</span>
            </nav>
        </div>`;

      if (tag === 'footer') return `
        <div class="flex flex-col items-center justify-center h-full text-center gap-2 p-2">
             <p class="text-sm font-medium">© 2024 Company Name</p>
             <div class="flex gap-2 text-xs opacity-60">
                 <span>Privacy</span> &bull; <span>Terms</span>
             </div>
        </div>`;

      if (tag === 'aside') return `
        <nav class="flex flex-col gap-3 h-full p-2">
            <div class="h-8 w-3/4 bg-black/10 dark:bg-white/10 rounded"></div>
            <div class="h-px bg-black/5 dark:bg-white/5 my-2"></div>
            <div class="flex flex-col gap-2 opacity-70">
                <div class="h-2 w-2/3 bg-current rounded"></div>
                <div class="h-2 w-1/2 bg-current rounded"></div>
                <div class="h-2 w-3/4 bg-current rounded"></div>
                <div class="h-2 w-4/5 bg-current rounded"></div>
            </div>
            <div class="mt-auto p-3 bg-black/5 dark:bg-white/5 rounded text-xs text-center opacity-75">
                Ads / Promo
            </div>
        </nav>`;

      if (n.includes('hero')) return `
        <div class="flex flex-col items-center justify-center h-full text-center p-4">
             <h1 class="text-2xl sm:text-3xl font-extrabold mb-2">Hero Title</h1>
             <p class="text-sm sm:text-base opacity-80 max-w-[90%]">This is a hero section subtitle highlighting the main value proposition.</p>
             <button class="mt-4 px-4 py-2 bg-black/10 dark:bg-white/20 rounded-lg text-xs sm:text-sm font-bold border border-current">Call to Action</button>
        </div>`;

      if (n.includes('login') || n.includes('signin') || n.includes('auth')) return `
         <div class="h-full flex flex-col items-center justify-center p-4">
             <div class="w-full max-w-[200px] flex flex-col gap-2 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-black/5 dark:border-white/5">
                  <div class="text-xs font-bold text-center mb-1">Welcome Back</div>
                  <div class="h-6 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 text-[10px] flex items-center text-slate-400">Email</div>
                  <div class="h-6 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 text-[10px] flex items-center text-slate-400">Password</div>
                  <div class="h-6 w-full bg-indigo-500 rounded text-white text-[10px] font-bold flex items-center justify-center mt-1">Sign In</div>
             </div>
         </div>
      `;

      if (n.includes('video') || n.includes('player') || n.includes('media')) return `
         <div class="w-full h-full flex items-center justify-center bg-black/80 text-white relative group overflow-hidden">
             <div class="absolute inset-0 flex items-center justify-center">
                  <div class="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center pl-1 group-hover:scale-110 transition-transform cursor-pointer">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                  </div>
             </div>
             <div class="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/80 to-transparent flex items-end px-3 py-1 gap-2">
                  <div class="h-1 flex-1 bg-white/30 rounded-full overflow-hidden"><div class="h-full w-1/3 bg-red-500"></div></div>
             </div>
         </div>
      `;

      if (n.includes('table') || n.includes('data') || n.includes('grid') && !n.includes('master')) return `
        <div class="h-full flex flex-col gap-2 p-2 overflow-hidden">
             <div class="flex justify-between items-center mb-1">
                 <h4 class="text-xs font-bold uppercase tracking-wider opacity-60">Data Table</h4>
                 <div class="flex gap-1">
                     <div class="w-4 h-4 rounded bg-black/10 dark:bg-white/10"></div>
                     <div class="w-4 h-4 rounded bg-black/10 dark:bg-white/10"></div>
                 </div>
             </div>
             <div class="w-full h-full border border-black/5 dark:border-white/5 rounded overflow-hidden">
                 <div class="grid grid-cols-4 gap-px bg-black/5 dark:bg-white/5 p-px">
                     <div class="bg-white/50 dark:bg-black/20 p-1 text-[10px] font-bold">ID</div>
                     <div class="bg-white/50 dark:bg-black/20 p-1 text-[10px] font-bold col-span-2">Name</div>
                     <div class="bg-white/50 dark:bg-black/20 p-1 text-[10px] font-bold">Status</div>
                     ${Array(5).fill(0).map(() => `
                         <div class="bg-white/30 dark:bg-black/10 p-1 h-4"></div>
                         <div class="bg-white/30 dark:bg-black/10 p-1 h-4 col-span-2"></div>
                         <div class="bg-white/30 dark:bg-black/10 p-1 h-4"></div>
                     `).join('')}
                 </div>
             </div>
        </div>`;

      if (n.includes('card') || n.includes('product') || n.includes('gallery') || n.includes('img') || n.includes('pic')) return `
        <div class="h-full grid grid-cols-2 gap-2 p-2 overflow-hidden content-start">
             ${Array(4).fill(0).map(() => `
                 <div class="aspect-square bg-white/50 dark:bg-black/20 rounded flex flex-col p-1 gap-1 border border-black/5 dark:border-white/5">
                      <div class="flex-1 bg-black/10 dark:bg-white/10 rounded-sm flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-20"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                      </div>
                      <div class="h-1.5 w-3/4 bg-black/20 dark:bg-white/20 rounded-sm"></div>
                 </div>
             `).join('')}
        </div>`;

      if (n.includes('chart') || n.includes('graph')) return `
        <div class="h-full flex flex-col p-3">
             <h4 class="text-xs font-bold uppercase tracking-wider opacity-60 mb-2">Analytics</h4>
             <div class="flex-1 flex items-end gap-1 pb-1">
                 <div class="w-full bg-black/20 dark:bg-white/20 rounded-t" style="height: 30%"></div>
                 <div class="w-full bg-black/30 dark:bg-white/30 rounded-t" style="height: 50%"></div>
                 <div class="w-full bg-black/40 dark:bg-white/40 rounded-t" style="height: 75%"></div>
                 <div class="w-full bg-black/25 dark:bg-white/25 rounded-t" style="height: 45%"></div>
                 <div class="w-full bg-black/50 dark:bg-white/50 rounded-t" style="height: 90%"></div>
             </div>
        </div>
      `;

      if (n.includes('stat') || n.includes('metric')) return `
        <div class="h-full flex flex-col justify-center p-3 text-center">
             <span class="text-3xl font-black tracking-tighter">8,492</span>
             <span class="text-xs font-bold uppercase tracking-wider opacity-60">Total Users</span>
             <span class="text-[10px] text-green-700 dark:text-green-300 font-medium mt-1">↑ 12.5%</span>
        </div>
      `;

      if (n.includes('form') || n.includes('contact') || n.includes('input')) return `
        <div class="h-full flex flex-col gap-2 p-3 justify-center max-w-sm mx-auto w-full">
            <h4 class="font-bold text-sm mb-1">${escapeHtml(name)}</h4>
            <div class="h-8 w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded"></div>
            <div class="h-8 w-full bg-white/50 dark:bg-black/20 border border-black/10 dark:border-white/10 rounded"></div>
            <div class="h-8 w-1/3 bg-black/20 dark:bg-white/20 rounded self-start mt-1"></div>
        </div>
      `;

      if (n.includes('signup') || n.includes('register')) return `
         <div class="h-full flex flex-col items-center justify-center p-4">
             <div class="w-full max-w-[200px] flex flex-col gap-2 bg-white/50 dark:bg-black/20 p-3 rounded-lg border border-black/5 dark:border-white/5">
                  <div class="text-xs font-bold text-center mb-1">Create Account</div>
                  <div class="h-6 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 text-[10px] flex items-center text-slate-400">Name</div>
                  <div class="h-6 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-2 text-[10px] flex items-center text-slate-400">Email</div>
                  <div class="h-6 w-full bg-indigo-500 rounded text-white text-[10px] font-bold flex items-center justify-center mt-1">Sign Up</div>
             </div>
         </div>
      `;

      if (n.includes('pricing') || n.includes('plan')) return `
        <div class="h-full flex flex-col items-center p-3 text-center border-2 border-indigo-50 dark:border-indigo-900/30 rounded-lg bg-white/40 dark:bg-slate-800/40">
             <h4 class="text-xs font-bold uppercase tracking-wider text-indigo-500 mb-1">Pro Plan</h4>
             <div class="text-2xl font-black mb-2">$29<span class="text-xs font-normal opacity-60">/mo</span></div>
             <div class="flex flex-col gap-1 w-full opacity-70 text-[10px] mb-3">
                 <div class="bg-black/5 dark:bg-white/5 rounded px-2 py-0.5">Feature A</div>
                 <div class="bg-black/5 dark:bg-white/5 rounded px-2 py-0.5">Feature B</div>
             </div>
             <button class="mt-auto w-full py-1 bg-indigo-600 text-white rounded text-[10px] font-bold">Select</button>
        </div>
      `;

      if (n.includes('team') || n.includes('member') || n.includes('profile')) return `
        <div class="h-full flex flex-col items-center justify-center p-2 text-center">
             <div class="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mb-2 overflow-hidden relative border-2 border-white dark:border-slate-600">
                 <svg class="absolute inset-0 m-auto text-slate-400 w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
             </div>
             <div class="font-bold text-xs">Jane Doe</div>
             <div class="text-[10px] opacity-60">Product Designer</div>
        </div>
      `;

      if (n.includes('testimonial') || n.includes('review')) return `
        <div class="h-full flex flex-col p-3 relative italic text-xs bg-white/40 dark:bg-slate-800/40 rounded-lg">
             <span class="text-3xl absolute top-0 left-1 opacity-20 serif">"</span>
             <p class="z-10 relative opacity-80 line-clamp-3 pl-2">This product completely transformed our workflow. Highly recommended!</p>
             <div class="mt-auto flex items-center gap-2 pt-2 pl-2">
                 <div class="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-900/50"></div>
                 <div class="flex flex-col text-[10px] not-italic">
                     <span class="font-bold">John Smith</span>
                     <span class="opacity-50">CEO, TechCorp</span>
                 </div>
             </div>
        </div>
      `;

      if (n.includes('map') || n.includes('location')) return `
        <div class="w-full h-full bg-slate-100 dark:bg-slate-800 relative overflow-hidden group">
             <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle, #94a3b8 1px, transparent 1px); background-size: 10px 10px;"></div>
             <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 drop-shadow-md">
                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
             </div>
        </div>
      `;

      return `
        <article class="h-full flex flex-col p-2">
            <h3 class="font-bold text-lg capitalize mb-2">${escapeHtml(name)}</h3>
            <div class="flex-1 text-sm opacity-80 leading-relaxed overflow-hidden text-ellipsis">
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
                <div class="h-2"></div>
                <p class="hidden sm:block">Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</p>
            </div>
        </article>`;
  }
</script>

<div
  class="relative w-full h-full min-h-[400px] rounded-xl overflow-hidden shadow-inner border touch-none select-none transition-colors duration-300
  {theme === 'cyber' ? 'bg-black border-green-900' : (theme === 'blueprint' ? 'bg-blue-50 border-blue-200' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800')}"
  on:mouseup={handleMouseUp}
  role="presentation"
>
  <!-- View Toggle (Overlay) -->
  <div class="absolute top-4 left-4 z-40 bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700 flex p-1 gap-1">
      <button
          class="px-2 py-1 text-xs font-bold rounded {viewMode === 'desktop' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}"
          on:click={() => viewMode = 'desktop'}
      >
          {dict.desktop || 'Desktop'}
      </button>
      <button
          class="px-2 py-1 text-xs font-bold rounded {viewMode === 'mobile' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'hover:bg-slate-100 dark:hover:bg-slate-700'}"
          on:click={() => { viewMode = 'mobile'; if (!$gridStore.includeMobile) gridStore.toggleMobile(); }}
      >
          {dict.mobile || 'Mobile'}
      </button>
  </div>

  <!-- The Grid Container -->
  <div
    class="absolute inset-4 grid"
    role="grid"
    tabindex="-1"
    style={isMobileView ? `
      grid-template-columns: 1fr;
      grid-template-rows: auto;
      gap: ${$gridStore.gap};
      row-gap: ${$gridStore.rowGap};
      column-gap: ${$gridStore.colGap};
      justify-items: stretch;
      align-items: stretch;
      justify-content: start;
      align-content: start;
      grid-template-areas: ${getMobileAreas($gridStore.areas)};
      overflow-y: auto;
      display: grid;
      align-content: start;
    ` : `
      grid-template-rows: ${$gridStore.rows.join(' ')};
      grid-template-columns: ${$gridStore.cols.join(' ')};
      gap: ${$gridStore.gap};
      row-gap: ${$gridStore.rowGap};
      column-gap: ${$gridStore.colGap};
      justify-items: ${$gridStore.justifyItems};
      align-items: ${$gridStore.alignItems};
      justify-content: ${$gridStore.justifyContent};
      align-content: ${$gridStore.alignContent};
    `}
  >
      <!-- Background Grid Lines/Cells (for interaction) -->
      {#if !previewMode && !isMobileView}
          <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
          {#each $gridStore.rows as _row, r (r)}
              <!-- eslint-disable-next-line @typescript-eslint/no-unused-vars -->
              {#each $gridStore.cols as _col, c (c)}
                  <button
                      id={`grid-cell-${r}-${c}`}
                      role="gridcell"
                      class="border border-dashed transition-colors z-10
                      {theme === 'cyber' ? 'border-green-900/30 hover:bg-green-900/20' :
                       (theme === 'blueprint' ? 'border-blue-200 hover:bg-blue-100' :
                       'border-slate-200 dark:border-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-900/10')}"
                      on:mousedown={() => handleMouseDown(r, c)}
                      on:mouseover={() => handleMouseOver(r, c)}
                      on:focus={() => handleMouseOver(r, c)}
                      on:keydown={(e) => handleCellKeyDown(e, r, c)}
                      aria-label={`Cell ${r+1}, ${c+1}`}
                  ></button>
              {/each}
          {/each}
      {/if}

      <!-- Rendered Areas -->
      {#each $gridStore.areas as area (area.id)}
          {#if previewMode}
              <svelte:element
                this={getSemanticTag(area)}
                class="z-20 p-4 shadow-sm rounded relative overflow-hidden transition-all {theme === 'cyber' ? 'font-mono text-green-400' : 'text-slate-800 dark:text-white'}"
                style="
                  grid-area: {area.name};
                  {getThemeStyles(area, theme)}
                "
                transition:fade
              >
                 <!-- eslint-disable-next-line svelte/no-at-html-tags -->
                 {@html getPlaceholderContent(area)}
              </svelte:element>
          {:else}
              <div
                class="z-20 flex flex-col items-center justify-center font-bold shadow-sm rounded relative group overflow-hidden transition-all {theme === 'cyber' ? 'font-mono' : ''}"
                style="
                  grid-area: {area.name};
                  {getThemeStyles(area, theme)}
                "
                transition:fade
              >
                   <span class="relative z-10 pointer-events-none {theme === 'standard' ? 'mix-blend-multiply dark:mix-blend-normal' : ''}">{area.name}</span>

                   {#if area.tag && area.tag !== 'div'}
                       <span class="absolute bottom-1 left-2 text-[10px] opacity-50 pointer-events-none font-mono {theme === 'standard' ? 'mix-blend-multiply dark:mix-blend-normal' : ''}">&lt;{area.tag}&gt;</span>
                   {/if}

                   <div class="absolute top-1 right-1 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-30">
                       {#if isMobileView}
                           <button
                             class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                             on:click|stopPropagation={() => gridStore.reorderMobile(area.id, 'up')}
                             title={dict.moveUp || "Move Up"}
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m18 15-6-6-6 6"/></svg>
                           </button>
                           <button
                             class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                             on:click|stopPropagation={() => gridStore.reorderMobile(area.id, 'down')}
                             title={dict.moveDown || "Move Down"}
                           >
                              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                           </button>
                       {/if}
                       <button
                         class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm"
                         on:click|stopPropagation={() => openSettings(area.id)}
                         title={dict.settings || "Settings"}
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
                       </button>
                       <button
                         class="p-1 bg-white/80 hover:bg-white rounded-full shadow-sm text-red-500"
                         on:click|stopPropagation={() => gridStore.removeArea(area.id)}
                         aria-label="Remove Area"
                       >
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                       </button>
                   </div>
              </div>
          {/if}
      {/each}

      <!-- Selection Overlay -->
      {#if isSelecting}
          <div
             class="z-30 bg-indigo-500/30 border-2 border-indigo-500 rounded pointer-events-none"
             style={getSelectionStyle(selectionStart, selectionEnd)}
          ></div>
      {/if}
  </div>

  <AreaSettingsModal bind:isOpen={isSettingsOpen} areaId={editingAreaId} {dict} />
</div>
