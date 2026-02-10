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
       <div class="w-full h-full bg-current opacity-10 flex items-center justify-center rounded-lg overflow-hidden relative group">
           <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="opacity-30 group-hover:scale-110 transition-transform"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
       </div>
    `;

    if (n.includes('event')) return `
       <div class="p-3 h-full flex flex-col justify-center bg-current opacity-10 rounded-lg border-l-4 border-current hover:opacity-20 transition-opacity">
           <div class="text-[10px] font-bold opacity-60 uppercase mb-1">Timestamp</div>
           <h4 class="font-bold text-xs mb-1">Event Title</h4>
           <p class="text-[10px] opacity-70 line-clamp-2">Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
       </div>
    `;

    if (n.includes('dot')) return `
       <div class="w-4 h-4 rounded-full bg-current mx-auto shadow-sm ring-4 ring-white dark:ring-slate-900 animate-pulse"></div>
    `;

    // Content Types
    if (type === 'stats' || n.includes('stat') || n.includes('kpi') || n.includes('metric')) return `
       <div class="h-full flex flex-col p-4 justify-between bg-current opacity-10 rounded-lg">
           <div class="text-xs font-bold uppercase opacity-60 tracking-wider">Total Users</div>
           <div class="flex items-end gap-2">
               <span class="text-3xl font-black leading-none">8,420</span>
               <span class="text-xs font-bold bg-green-500/20 text-green-600 dark:text-green-400 px-1 rounded flex items-center mb-1">
                   ▲ 12%
               </span>
           </div>
           <div class="w-full h-1 bg-current opacity-20 mt-2 rounded-full overflow-hidden">
               <div class="h-full bg-current w-3/4"></div>
           </div>
       </div>
    `;

    if (type === 'ecommerce' || n.includes('product') || n.includes('shop') || n.includes('item')) return `
       <div class="h-full flex flex-col gap-2 p-2 rounded-lg border border-current border-opacity-20 hover:border-opacity-40 transition-all">
           <div class="aspect-video w-full bg-current opacity-20 rounded-md flex items-center justify-center relative overflow-hidden">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-40"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                <div class="absolute top-1 right-1 bg-white dark:bg-black text-[8px] font-bold px-1 rounded shadow">NEW</div>
           </div>
           <div class="flex flex-col flex-1">
               <h4 class="font-bold text-xs leading-tight">Premium Widget</h4>
               <p class="text-[10px] opacity-60 line-clamp-1">High quality component</p>
               <div class="mt-auto flex justify-between items-center pt-1">
                   <span class="font-bold text-sm">$49</span>
                   <button class="bg-current opacity-80 text-white dark:text-black w-6 h-6 flex items-center justify-center rounded-full hover:scale-110 transition-transform">
                       <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                   </button>
               </div>
           </div>
       </div>
    `;

    if (type === 'calendar' || type === 'calendar-widget' || n.includes('calendar')) return `
        <div class="h-full flex flex-col p-3 gap-1 overflow-hidden bg-current opacity-10 rounded-lg">
            <div class="flex justify-between items-center mb-2">
                <span class="text-xs font-bold uppercase opacity-80">October 2024</span>
                <div class="flex gap-1"><div class="w-1.5 h-1.5 rounded-full bg-current opacity-30"></div><div class="w-1.5 h-1.5 rounded-full bg-current opacity-30"></div></div>
            </div>
            <div class="grid grid-cols-7 gap-1 h-full content-start text-center">
                ${['S','M','T','W','T','F','S'].map(d => `<div class="text-[8px] font-bold opacity-40">${d}</div>`).join('')}
                ${Array(31).fill(0).map((_, i) => {
                    const day = i + 1;
                    const isToday = day === 15;
                    const isSelected = day === 22;
                    return `<div class="aspect-square rounded-sm flex items-center justify-center text-[9px] ${isToday ? 'bg-current text-white dark:text-black font-bold' : (isSelected ? 'border border-current' : 'opacity-60')}">${day}</div>`;
                }).join('')}
            </div>
        </div>
    `;

    if (type === 'kanban' || n.includes('kanban') || n.includes('board')) return `
        <div class="h-full flex gap-2 p-2 overflow-hidden items-start">
            <div class="flex-1 flex flex-col gap-2 min-w-[40px] h-full bg-current bg-opacity-5 rounded p-1">
                <div class="text-[8px] font-bold uppercase opacity-50 px-1">To Do</div>
                <div class="bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 shadow-sm rounded p-1.5 h-10 border border-current border-opacity-10"></div>
                <div class="bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 shadow-sm rounded p-1.5 h-14 border border-current border-opacity-10"></div>
            </div>
            <div class="flex-1 flex flex-col gap-2 min-w-[40px] h-full bg-current bg-opacity-5 rounded p-1">
                <div class="text-[8px] font-bold uppercase opacity-50 px-1">Doing</div>
                <div class="bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 shadow-sm rounded p-1.5 h-12 border border-current border-opacity-10"></div>
            </div>
            <div class="flex-1 flex flex-col gap-2 min-w-[40px] h-full bg-current bg-opacity-5 rounded p-1">
                <div class="text-[8px] font-bold uppercase opacity-50 px-1">Done</div>
                <div class="bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 shadow-sm rounded p-1.5 h-8 border border-current border-opacity-10 opacity-50"></div>
            </div>
        </div>
    `;

    if (type === 'feed' || n.includes('feed') || n.includes('posts')) return `
        <div class="h-full flex flex-col gap-3 p-2 overflow-hidden">
            ${Array(3).fill(0).map(() => `
                <div class="flex gap-2 p-2 bg-current bg-opacity-5 rounded-lg">
                    <div class="w-6 h-6 rounded-full bg-current opacity-20 shrink-0"></div>
                    <div class="flex-1 flex flex-col gap-1.5">
                        <div class="h-2 w-1/3 bg-current opacity-40 rounded"></div>
                        <div class="h-2 w-full bg-current opacity-10 rounded"></div>
                        <div class="h-2 w-3/4 bg-current opacity-10 rounded"></div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;

    if (type === 'profile') return `
        <div class="h-full flex flex-col items-center justify-center p-4 text-center bg-current bg-opacity-5 rounded-xl">
            <div class="w-16 h-16 rounded-full bg-current opacity-20 mb-3 border-4 border-white dark:border-slate-800 shadow-sm"></div>
            <div class="text-sm font-bold">User Name</div>
            <div class="text-xs opacity-60 mb-3">@username</div>
            <div class="flex gap-3 text-[9px] opacity-80 justify-center w-full">
                <div class="bg-current opacity-10 px-3 py-1.5 rounded-full flex-1">Posts<br><strong>24</strong></div>
                <div class="bg-current opacity-10 px-3 py-1.5 rounded-full flex-1">Followers<br><strong>1.2k</strong></div>
            </div>
        </div>
    `;

    if (type === 'settings' || n.includes('settings') || n.includes('config')) return `
        <div class="h-full flex flex-col p-3 gap-2 overflow-hidden bg-current bg-opacity-5 rounded-lg">
            <div class="text-[10px] font-bold uppercase opacity-60 mb-1 border-b border-current border-opacity-10 pb-1">Settings</div>
            <div class="flex justify-between items-center py-1">
                <div class="h-1.5 w-1/2 bg-current opacity-20 rounded"></div>
                <div class="w-6 h-3 rounded-full bg-current opacity-30 relative"><div class="absolute right-0.5 top-0.5 w-2 h-2 rounded-full bg-white shadow-sm"></div></div>
            </div>
            <div class="flex justify-between items-center py-1">
                <div class="h-1.5 w-1/3 bg-current opacity-20 rounded"></div>
                <div class="w-6 h-3 rounded-full bg-current opacity-10 relative"><div class="absolute left-0.5 top-0.5 w-2 h-2 rounded-full bg-white shadow-sm"></div></div>
            </div>
            <div class="flex justify-between items-center py-1">
                <div class="h-1.5 w-2/3 bg-current opacity-20 rounded"></div>
            </div>
        </div>
    `;

    if (type === 'chart' || n.includes('chart') || n.includes('graph')) return `
      <div class="h-full flex flex-col p-4 bg-current bg-opacity-5 rounded-xl">
           <div class="flex justify-between items-center mb-4">
               <h4 class="text-xs font-bold uppercase tracking-wider opacity-60">Analytics</h4>
               <div class="px-2 py-0.5 bg-current opacity-10 rounded text-[8px] font-bold">Last 7 Days</div>
           </div>
           <div class="flex-1 flex items-end gap-2 pb-1">
               <div class="w-full bg-current opacity-20 rounded-t-sm hover:opacity-30 transition-opacity" style="height: 30%"></div>
               <div class="w-full bg-current opacity-30 rounded-t-sm hover:opacity-40 transition-opacity" style="height: 50%"></div>
               <div class="w-full bg-current opacity-40 rounded-t-sm hover:opacity-50 transition-opacity" style="height: 75%"></div>
               <div class="w-full bg-current opacity-25 rounded-t-sm hover:opacity-35 transition-opacity" style="height: 45%"></div>
               <div class="w-full bg-current opacity-60 rounded-t-sm hover:opacity-70 transition-opacity relative group" style="height: 90%">
                    <div class="absolute -top-6 left-1/2 -translate-x-1/2 bg-black text-white px-1.5 py-0.5 rounded text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">94%</div>
               </div>
               <div class="w-full bg-current opacity-30 rounded-t-sm hover:opacity-40 transition-opacity" style="height: 60%"></div>
           </div>
      </div>
    `;

    if (type === 'form' || n.includes('form') || n.includes('contact') || n.includes('input')) return `
      <div class="h-full flex flex-col gap-3 p-4 justify-center max-w-sm mx-auto w-full bg-current bg-opacity-5 rounded-xl">
          <h4 class="font-bold text-sm mb-1">${escapeHtml(name)}</h4>
          <div class="space-y-3">
              <div class="flex flex-col gap-1">
                  <div class="h-1.5 w-16 bg-current opacity-30 rounded"></div>
                  <div class="h-8 w-full bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 border border-current border-opacity-20 rounded"></div>
              </div>
              <div class="flex flex-col gap-1">
                  <div class="h-1.5 w-20 bg-current opacity-30 rounded"></div>
                  <div class="h-8 w-full bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 border border-current border-opacity-20 rounded"></div>
              </div>
          </div>
          <div class="h-8 w-full bg-current opacity-80 rounded shadow-sm text-white dark:text-black flex items-center justify-center text-xs font-bold mt-2 hover:opacity-100 transition-opacity">Submit</div>
      </div>
    `;

    if (type === 'video' || n.includes('video') || n.includes('player') || n.includes('media')) return `
       <div class="w-full h-full flex items-center justify-center bg-black text-white relative group overflow-hidden rounded-lg shadow-inner">
           <div class="absolute inset-0 opacity-20 bg-cover bg-center" style="background-image: url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IndoaXRlIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCI+PHBhdGggZD0iTTEyIDJMMiA3bDEwIDUgMTAtNS0xMC01ek0yIDE3bDEwIDUgMTAtNSIvPjxwYXRoIGQ9Ik0yIDEybDEwIDUgMTAtNSIvPjwvc3ZnPg=='); background-repeat: no-repeat; background-position: center; transform: scale(4); opacity: 0.1;"></div>
           <div class="absolute inset-0 flex items-center justify-center">
                <div class="w-14 h-14 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white flex items-center justify-center pl-1 group-hover:scale-110 transition-transform cursor-pointer shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                </div>
           </div>
           <div class="absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-black/80 to-transparent flex items-end px-4 py-2 gap-3">
                <div class="w-3 h-3"><svg xmlns="http://www.w3.org/2000/svg" fill="white" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                <div class="h-1 flex-1 bg-white/30 rounded-full overflow-hidden self-center"><div class="h-full w-1/3 bg-red-500"></div></div>
                <div class="text-[8px] font-mono">03:24</div>
           </div>
       </div>
    `;

    if (type === 'image' || type === 'gallery' || n.includes('card') || n.includes('product') || n.includes('gallery') || n.includes('img') || n.includes('pic')) return `
      <div class="h-full grid grid-cols-2 gap-2 p-2 overflow-hidden content-start">
           ${Array(4).fill(0).map(() => `
               <div class="aspect-square bg-current opacity-10 rounded-lg flex flex-col p-1.5 gap-1.5 border border-current border-opacity-20 hover:border-opacity-50 transition-all group">
                    <div class="flex-1 bg-current opacity-20 rounded-md flex items-center justify-center overflow-hidden">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 group-hover:scale-110 transition-transform"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                    </div>
                    <div class="h-1.5 w-3/4 bg-current opacity-20 rounded-full"></div>
               </div>
           `).join('')}
      </div>`;

    if (type === 'login' || n.includes('login') || n.includes('signin') || n.includes('auth')) return `
       <div class="h-full flex flex-col items-center justify-center p-4">
           <div class="w-full max-w-[240px] flex flex-col gap-3 bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 backdrop-blur-sm p-5 rounded-xl border border-current border-opacity-20 shadow-sm">
                <div class="text-sm font-bold text-center mb-2">Welcome Back</div>
                <div class="space-y-2">
                    <div class="h-8 w-full bg-transparent border border-current border-opacity-30 rounded px-2 text-[10px] flex items-center opacity-60">Email</div>
                    <div class="h-8 w-full bg-transparent border border-current border-opacity-30 rounded px-2 text-[10px] flex items-center opacity-60">Password</div>
                </div>
                <div class="h-8 w-full bg-current opacity-80 rounded text-white dark:text-black text-[10px] font-bold flex items-center justify-center mt-2 hover:opacity-100 transition-opacity cursor-pointer">Sign In</div>
                <div class="text-[8px] text-center opacity-50 underline">Forgot password?</div>
           </div>
       </div>
    `;

    if (type === 'pricing' || n.includes('pricing') || n.includes('plan')) return `
      <div class="h-full flex flex-col items-center p-4 text-center border-2 border-current border-opacity-10 rounded-xl bg-current bg-opacity-5 hover:bg-opacity-10 transition-colors relative overflow-hidden">
           <div class="absolute top-0 right-0 bg-current text-white dark:text-black text-[8px] font-bold px-2 py-0.5 rounded-bl opacity-80">POPULAR</div>
           <h4 class="text-xs font-bold uppercase tracking-wider mb-2 opacity-60">Pro Plan</h4>
           <div class="text-3xl font-black mb-1 leading-none flex items-start justify-center gap-0.5"><span class="text-sm opacity-50 mt-1">$</span>29</div>
           <div class="text-[9px] opacity-50 mb-4">per user / month</div>
           <div class="flex flex-col gap-1.5 w-full opacity-70 text-[10px] mb-4 text-left px-2">
               <div class="flex items-center gap-1.5"><div class="w-1 h-1 rounded-full bg-current"></div><span>Unlimited Projects</span></div>
               <div class="flex items-center gap-1.5"><div class="w-1 h-1 rounded-full bg-current"></div><span>Analytics Dashboard</span></div>
               <div class="flex items-center gap-1.5"><div class="w-1 h-1 rounded-full bg-current"></div><span>24/7 Support</span></div>
           </div>
           <button class="mt-auto w-full py-1.5 bg-current rounded-md text-[10px] font-bold text-white dark:text-black opacity-80 hover:opacity-100 transition-opacity">Select Plan</button>
      </div>
    `;

    if (type === 'team' || n.includes('team') || n.includes('member') || n.includes('profile')) return `
      <div class="h-full flex flex-col items-center justify-center p-3 text-center bg-current bg-opacity-5 rounded-lg border border-current border-opacity-10">
           <div class="w-16 h-16 rounded-full bg-current opacity-20 mb-2 overflow-hidden relative border-2 border-current shadow-sm group">
               <svg class="absolute inset-0 m-auto opacity-50 w-8 h-8 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
           </div>
           <div class="font-bold text-sm">Jane Doe</div>
           <div class="text-[10px] opacity-60 mb-2">Product Designer</div>
           <div class="flex gap-2 opacity-40">
               <div class="w-3 h-3 rounded-full bg-current"></div>
               <div class="w-3 h-3 rounded-full bg-current"></div>
               <div class="w-3 h-3 rounded-full bg-current"></div>
           </div>
      </div>
    `;

    if (type === 'testimonial' || n.includes('testimonial') || n.includes('review')) return `
      <div class="h-full flex flex-col p-4 relative bg-current opacity-10 rounded-xl">
           <span class="text-4xl absolute top-1 left-2 opacity-20 serif font-black">"</span>
           <p class="z-10 relative opacity-80 line-clamp-4 pl-3 pt-2 text-xs italic leading-relaxed">This product completely transformed our workflow. It's incredibly intuitive and saved us hours of development time. Highly recommended!</p>
           <div class="mt-auto flex items-center gap-2 pt-3 pl-3">
               <div class="w-8 h-8 rounded-full bg-current opacity-30"></div>
               <div class="flex flex-col text-[10px] not-italic">
                   <span class="font-bold">John Smith</span>
                   <span class="opacity-50">CEO, TechCorp</span>
               </div>
           </div>
      </div>
    `;

    if (type === 'map' || n.includes('map') || n.includes('location')) return `
      <div class="w-full h-full bg-current opacity-10 relative overflow-hidden group rounded-lg">
           <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle, currentColor 1px, transparent 1px); background-size: 16px 16px;"></div>
           <svg class="absolute inset-0 w-full h-full opacity-10" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0,50 Q25,40 50,50 T100,50" stroke="currentColor" stroke-width="2" fill="none" />
                <path d="M20,0 Q30,50 20,100" stroke="currentColor" stroke-width="2" fill="none" />
           </svg>
           <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-red-500 drop-shadow-md animate-bounce">
               <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>
           </div>
           <div class="absolute bottom-2 right-2 bg-white dark:bg-black px-1.5 py-0.5 rounded text-[8px] font-bold opacity-70">OpenStreet</div>
      </div>
    `;

    if (type === 'hero' || n.includes('hero')) return `
      <div class="flex flex-col items-center justify-center h-full text-center p-6 bg-gradient-to-b from-transparent to-current/5 rounded-xl">
           <div class="inline-block px-2 py-0.5 rounded-full bg-current/10 text-[9px] font-bold mb-3 uppercase tracking-wider text-current/70">New Feature</div>
           <h1 class="text-3xl sm:text-4xl font-extrabold mb-3 leading-tight tracking-tight">Build Faster with<br><span class="opacity-50">Grid Master</span></h1>
           <p class="text-sm opacity-70 max-w-[80%] mb-5 leading-relaxed">The definitive visual builder for modern web layouts. Export production-ready code in seconds.</p>
           <div class="flex gap-2">
               <button class="px-5 py-2 bg-current text-white dark:text-black rounded-lg text-xs font-bold hover:opacity-90 transition-opacity">Get Started</button>
               <button class="px-5 py-2 border border-current/30 rounded-lg text-xs font-bold hover:bg-current/5 transition-colors">Documentation</button>
           </div>
      </div>`;

    if (type === 'code' || n.includes('code') || n.includes('snippet')) return `
      <div class="h-full flex flex-col p-3 bg-slate-900 text-slate-300 rounded-lg font-mono text-[10px] overflow-hidden shadow-inner">
           <div class="flex gap-1.5 mb-2 opacity-50">
               <div class="w-2 h-2 rounded-full bg-red-500"></div>
               <div class="w-2 h-2 rounded-full bg-yellow-500"></div>
               <div class="w-2 h-2 rounded-full bg-green-500"></div>
           </div>
           <div class="opacity-70 leading-relaxed">
               <span class="text-purple-400">const</span> <span class="text-blue-400">grid</span> = {<br>
               &nbsp;&nbsp;rows: [<span class="text-green-400">'1fr'</span>],<br>
               &nbsp;&nbsp;cols: [<span class="text-green-400">'1fr'</span>],<br>
               &nbsp;&nbsp;gap: <span class="text-green-400">'1rem'</span><br>
               };
           </div>
      </div>`;

    if (type === 'timeline' || n.includes('timeline')) return `
      <div class="h-full flex flex-col p-3 relative overflow-hidden">
           <div class="absolute left-4 top-0 bottom-0 w-0.5 bg-current opacity-10"></div>
           ${Array(3).fill(0).map((_, i) => `
               <div class="relative pl-6 mb-3">
                   <div class="absolute left-3 top-1 w-2 h-2 rounded-full bg-current opacity-40 -translate-x-1/2 ring-2 ring-white dark:ring-slate-900"></div>
                   <div class="text-[9px] opacity-50 mb-0.5">10:00 AM</div>
                   <div class="font-bold text-xs mb-0.5">Step ${i+1}</div>
                   <div class="h-1.5 w-full bg-current opacity-10 rounded"></div>
               </div>
           `).join('')}
      </div>`;

    if (type === 'table' || n.includes('table') || n.includes('data') || n.includes('grid') && !n.includes('master')) return `
      <div class="h-full flex flex-col gap-3 p-3 overflow-hidden bg-white dark:bg-black bg-opacity-40 dark:bg-opacity-10 rounded-xl border border-current border-opacity-5">
           <div class="flex justify-between items-center px-1">
               <h4 class="text-xs font-bold uppercase tracking-wider opacity-60">Recent Orders</h4>
               <div class="flex gap-1">
                   <div class="w-16 h-4 rounded bg-current opacity-10"></div>
               </div>
           </div>
           <div class="w-full h-full border border-current border-opacity-10 rounded-lg overflow-hidden">
               <div class="grid grid-cols-4 gap-px bg-current bg-opacity-10 p-px">
                   <div class="bg-white dark:bg-slate-900 p-2 text-[9px] font-bold opacity-60">ID</div>
                   <div class="bg-white dark:bg-slate-900 p-2 text-[9px] font-bold opacity-60 col-span-2">Customer</div>
                   <div class="bg-white dark:bg-slate-900 p-2 text-[9px] font-bold opacity-60 text-right">Amount</div>
                   ${Array(5).fill(0).map(() => `
                       <div class="bg-white dark:bg-slate-900 p-2 flex items-center"><div class="h-1.5 w-6 bg-current opacity-20 rounded"></div></div>
                       <div class="bg-white dark:bg-slate-900 p-2 flex items-center col-span-2"><div class="h-1.5 w-20 bg-current opacity-20 rounded"></div></div>
                       <div class="bg-white dark:bg-slate-900 p-2 flex items-center justify-end"><div class="h-1.5 w-8 bg-current opacity-20 rounded"></div></div>
                   `).join('')}
               </div>
           </div>
      </div>`;

    // Semantic Tags
    if (tag === 'header') return `
      <div class="flex items-center justify-between h-full px-6 bg-white dark:bg-black bg-opacity-50 dark:bg-opacity-20 border-b border-current border-opacity-5">
          <div class="flex items-center gap-2">
               <div class="w-6 h-6 rounded bg-current text-white dark:text-black flex items-center justify-center font-bold text-xs">G</div>
               <h2 class="text-lg font-bold tracking-tight">Grid<span class="opacity-50">Master</span></h2>
          </div>
          <nav class="hidden sm:flex gap-6 text-xs font-bold opacity-60 uppercase tracking-wide">
              <span class="hover:opacity-100 cursor-pointer">Product</span>
              <span class="hover:opacity-100 cursor-pointer">Solutions</span>
              <span class="hover:opacity-100 cursor-pointer">Pricing</span>
          </nav>
          <div class="flex gap-3">
              <div class="w-20 h-8 bg-current opacity-10 rounded-md"></div>
              <div class="w-8 h-8 rounded-full bg-current opacity-10"></div>
          </div>
      </div>`;

    if (tag === 'footer') return `
      <div class="flex flex-col items-center justify-center h-full text-center gap-4 p-4 bg-current bg-opacity-5">
           <div class="flex gap-6 text-xs font-bold opacity-60">
               <span>About</span>
               <span>Careers</span>
               <span>Blog</span>
               <span>Legal</span>
           </div>
           <div class="h-px w-24 bg-current opacity-20"></div>
           <p class="text-[10px] font-medium opacity-40">© 2024 MicroFactory Inc. All rights reserved.</p>
      </div>`;

    if (tag === 'aside') return `
      <nav class="flex flex-col gap-4 h-full p-4 bg-current bg-opacity-5 border-r border-current border-opacity-5">
          <div class="h-8 w-3/4 bg-current opacity-10 rounded mb-2"></div>
          <div class="flex flex-col gap-1 opacity-70">
              <div class="flex items-center gap-2 p-2 rounded hover:bg-current hover:bg-opacity-5 cursor-pointer">
                  <div class="w-4 h-4 rounded bg-current opacity-30"></div>
                  <div class="h-2 w-20 bg-current opacity-40 rounded"></div>
              </div>
              <div class="flex items-center gap-2 p-2 rounded hover:bg-current hover:bg-opacity-5 cursor-pointer bg-current bg-opacity-5">
                  <div class="w-4 h-4 rounded bg-current opacity-60"></div>
                  <div class="h-2 w-24 bg-current opacity-80 rounded"></div>
              </div>
              <div class="flex items-center gap-2 p-2 rounded hover:bg-current hover:bg-opacity-5 cursor-pointer">
                  <div class="w-4 h-4 rounded bg-current opacity-30"></div>
                  <div class="h-2 w-16 bg-current opacity-40 rounded"></div>
              </div>
              <div class="flex items-center gap-2 p-2 rounded hover:bg-current hover:bg-opacity-5 cursor-pointer">
                  <div class="w-4 h-4 rounded bg-current opacity-30"></div>
                  <div class="h-2 w-20 bg-current opacity-40 rounded"></div>
              </div>
          </div>
          <div class="mt-auto p-4 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-xl border border-indigo-500/20 text-xs text-center">
              <div class="font-bold mb-1">Go Pro</div>
              <div class="opacity-60 text-[10px] mb-2">Unlock all features</div>
              <div class="h-6 bg-indigo-500 rounded text-white flex items-center justify-center font-bold">Upgrade</div>
          </div>
      </nav>`;

    // Default
    return `
      <article class="h-full flex flex-col p-4 relative group">
          <div class="absolute inset-0 bg-current opacity-0 group-hover:opacity-[0.02] transition-opacity"></div>
          <h3 class="font-bold text-lg capitalize mb-3 tracking-tight">${escapeHtml(name)}</h3>
          <div class="flex-1 text-sm opacity-70 leading-relaxed overflow-hidden text-ellipsis space-y-2">
              <div class="h-2 w-full bg-current opacity-10 rounded"></div>
              <div class="h-2 w-full bg-current opacity-10 rounded"></div>
              <div class="h-2 w-2/3 bg-current opacity-10 rounded"></div>
              <div class="h-4"></div>
              <div class="h-2 w-full bg-current opacity-10 rounded"></div>
              <div class="h-2 w-5/6 bg-current opacity-10 rounded"></div>
          </div>
      </article>`;
}
