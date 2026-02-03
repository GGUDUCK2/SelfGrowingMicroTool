import type { GridArea } from './types';

function escapeHtml(text: string) {
    return text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
}

export function getSemanticTag(area: GridArea) {
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

export function getPlaceholderContent(area: GridArea): string {
    const name = area.name;
    const tag = getSemanticTag(area);
    const n = name.toLowerCase();
    const type = area.contentType || 'none';

    // Regex-based placeholders
    if (/^cell-\d+$/.test(n)) return `
       <div class="w-full h-full flex items-center justify-center opacity-30 text-xl font-bold border-2 border-dashed border-current rounded-lg">
           ${n.split('-')[1]}
       </div>
    `;

    if (/^img-\d+$/.test(n) || /^image-\d+$/.test(n)) return `
       <div class="w-full h-full bg-current opacity-10 flex items-center justify-center rounded-lg overflow-hidden relative">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="opacity-30"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
       </div>
    `;

    if (n.includes('event')) return `
       <div class="p-3 h-full flex flex-col justify-center bg-current opacity-10 rounded-lg border-l-4 border-current">
           <div class="text-[10px] font-bold opacity-60 uppercase mb-1">Timestamp</div>
           <h4 class="font-bold text-xs mb-1">Event Title</h4>
           <p class="text-[10px] opacity-70 line-clamp-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
       </div>
    `;

    if (n.includes('dot')) return `
       <div class="w-4 h-4 rounded-full bg-current mx-auto shadow-sm ring-4 ring-white dark:ring-slate-900"></div>
    `;

    // Content Types
    if (type === 'calendar' || n.includes('calendar')) return `
        <div class="h-full flex flex-col p-2 gap-1 overflow-hidden">
            <div class="flex justify-between items-center mb-1">
                <span class="text-[10px] font-bold uppercase opacity-60">August</span>
                <div class="flex gap-1"><div class="w-2 h-2 rounded-full bg-current opacity-30"></div><div class="w-2 h-2 rounded-full bg-current opacity-30"></div></div>
            </div>
            <div class="grid grid-cols-7 gap-1 h-full content-start">
                ${Array(7).fill(0).map(() => `<div class="text-[8px] text-center opacity-40">D</div>`).join('')}
                ${Array(14).fill(0).map((_, i) => `<div class="aspect-square rounded-sm ${i === 8 ? 'bg-current opacity-60 text-white font-bold' : 'bg-current opacity-10'} flex items-center justify-center text-[8px]">${i + 1}</div>`).join('')}
            </div>
        </div>
    `;

    if (type === 'kanban' || n.includes('kanban') || n.includes('board')) return `
        <div class="h-full flex gap-2 p-2 overflow-hidden items-start">
            <div class="flex-1 flex flex-col gap-2 min-w-[40px]">
                <div class="text-[8px] font-bold uppercase opacity-50">To Do</div>
                <div class="bg-current opacity-10 rounded p-1 h-8"></div>
                <div class="bg-current opacity-10 rounded p-1 h-12"></div>
            </div>
            <div class="flex-1 flex flex-col gap-2 min-w-[40px]">
                <div class="text-[8px] font-bold uppercase opacity-50">Doing</div>
                <div class="bg-current opacity-20 rounded p-1 h-10 border border-current"></div>
            </div>
            <div class="flex-1 flex flex-col gap-2 min-w-[40px]">
                <div class="text-[8px] font-bold uppercase opacity-50">Done</div>
                <div class="bg-current opacity-10 rounded p-1 h-8"></div>
            </div>
        </div>
    `;

    if (type === 'feed' || n.includes('feed') || n.includes('posts')) return `
        <div class="h-full flex flex-col gap-3 p-2 overflow-hidden">
            ${Array(3).fill(0).map(() => `
                <div class="flex gap-2">
                    <div class="w-6 h-6 rounded-full bg-current opacity-20 shrink-0"></div>
                    <div class="flex-1 flex flex-col gap-1">
                        <div class="h-2 w-1/3 bg-current opacity-40 rounded"></div>
                        <div class="h-2 w-full bg-current opacity-10 rounded"></div>
                        <div class="h-2 w-3/4 bg-current opacity-10 rounded"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    if (type === 'profile') return `
        <div class="h-full flex flex-col items-center justify-center p-4 text-center">
            <div class="w-12 h-12 rounded-full bg-current opacity-20 mb-2 border-2 border-current"></div>
            <div class="text-xs font-bold">User Name</div>
            <div class="text-[10px] opacity-60 mb-2">@username</div>
            <div class="flex gap-2 text-[8px] opacity-80 justify-center">
                <div class="bg-current opacity-10 px-2 py-1 rounded">Posts</div>
                <div class="bg-current opacity-10 px-2 py-1 rounded">Followers</div>
            </div>
        </div>
    `;

    if (type === 'settings' || n.includes('settings') || n.includes('config')) return `
        <div class="h-full flex flex-col p-3 gap-2 overflow-hidden">
            <div class="text-[10px] font-bold uppercase opacity-60 mb-1">Settings</div>
            <div class="flex justify-between items-center border-b border-current border-opacity-10 pb-1">
                <div class="h-1.5 w-1/2 bg-current opacity-20 rounded"></div>
                <div class="w-5 h-2.5 rounded-full bg-current opacity-30 relative"><div class="absolute right-0.5 top-0.5 w-1.5 h-1.5 rounded-full bg-white"></div></div>
            </div>
            <div class="flex justify-between items-center border-b border-current border-opacity-10 pb-1">
                <div class="h-1.5 w-1/3 bg-current opacity-20 rounded"></div>
                <div class="w-5 h-2.5 rounded-full bg-current opacity-10 relative"><div class="absolute left-0.5 top-0.5 w-1.5 h-1.5 rounded-full bg-white"></div></div>
            </div>
            <div class="flex justify-between items-center">
                <div class="h-1.5 w-2/3 bg-current opacity-20 rounded"></div>
            </div>
        </div>
    `;

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
       <div class="w-full h-full flex items-center justify-center bg-black/80 text-white relative group overflow-hidden rounded-lg">
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

    // Semantic Tags
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

    // Default
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
