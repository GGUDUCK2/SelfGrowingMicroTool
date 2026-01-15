<script lang="ts">
  import type { MetaTags } from '$lib/utils/seo';

  export let tags: MetaTags;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  export let dictionary: any;

  // Additional preview platforms
  let activePreview: 'google' | 'facebook' | 'twitter' | 'linkedin' | 'slack' | 'discord' | 'whatsapp' = 'google';
  let isDarkMode = false;

  // Helper to truncate text for previews
  function truncate(text: string, length: number): string {
    if (!text) return '';
    if (text.length <= length) return text;
    return text.slice(0, length) + '...';
  }

  // Fallback if dictionary keys are missing during development
  $: t = (key: string) => dictionary.social[key] || key;
  $: displayTitle = tags.ogTitle || tags.title || 'Page Title';
  $: displayDesc = tags.ogDesc || tags.description || 'Page description will appear here...';
  $: displayUrl = tags.url || 'example.com';
  $: displayDomain = (() => {
      try {
          return new URL(displayUrl).hostname;
      } catch {
          return displayUrl;
      }
  })();
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-slate-100 dark:border-slate-700">
    <div class="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 p-2 flex justify-between items-center">
        <!-- Tabs -->
        <div class="flex gap-1 overflow-x-auto no-scrollbar max-w-[calc(100%-40px)]">
             <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors {activePreview === 'google' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}"
                on:click={() => activePreview = 'google'}
             >
                Google
             </button>
             <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors {activePreview === 'facebook' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}"
                on:click={() => activePreview = 'facebook'}
             >
                Facebook
             </button>
             <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors {activePreview === 'twitter' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}"
                on:click={() => activePreview = 'twitter'}
             >
                Twitter
             </button>
             <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors {activePreview === 'linkedin' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}"
                on:click={() => activePreview = 'linkedin'}
             >
                LinkedIn
             </button>
             <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors {activePreview === 'slack' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}"
                on:click={() => activePreview = 'slack'}
             >
                Slack
             </button>
             <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors {activePreview === 'discord' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}"
                on:click={() => activePreview = 'discord'}
             >
                Discord
             </button>
             <button
                class="px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors {activePreview === 'whatsapp' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}"
                on:click={() => activePreview = 'whatsapp'}
             >
                WhatsApp
             </button>
        </div>

        <!-- Theme Toggle -->
        <button
            on:click={() => isDarkMode = !isDarkMode}
            class="p-1.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 transition-colors"
            aria-label="Toggle Preview Theme"
        >
            {#if isDarkMode}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>
            {:else}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
            {/if}
        </button>
    </div>

    <div class="p-6 {isDarkMode ? 'bg-[#1a1a1a] text-white' : 'bg-white text-black'} transition-colors duration-300 min-h-[300px] flex items-center justify-center">

        <!-- Google -->
        {#if activePreview === 'google'}
            <div class="w-full max-w-[600px] font-sans text-left">
                <div class="flex items-center gap-2 mb-1">
                     <div class="bg-slate-200 rounded-full w-7 h-7 flex items-center justify-center overflow-hidden">
                         <img src={`https://www.google.com/s2/favicons?domain=${displayDomain}`} alt="favicon" class="w-4 h-4" on:error={(e) => e.currentTarget.style.display = 'none'} />
                     </div>
                     <div class="flex flex-col text-sm">
                         <span class="{isDarkMode ? 'text-slate-300' : 'text-[#202124]'}">{displayDomain}</span>
                         <span class="{isDarkMode ? 'text-slate-400' : 'text-[#5f6368]'} text-xs">{displayUrl}</span>
                     </div>
                </div>
                <h3 class="{isDarkMode ? 'text-[#8ab4f8]' : 'text-[#1a0dab]'} text-xl hover:underline cursor-pointer truncate mb-1">{displayTitle}</h3>
                <p class="{isDarkMode ? 'text-slate-300' : 'text-[#4d5156]'} text-sm leading-6">
                    {truncate(displayDesc, 160)}
                </p>
            </div>

        <!-- Facebook -->
        {:else if activePreview === 'facebook'}
            <div class="w-full max-w-[500px] border {isDarkMode ? 'border-gray-700 bg-[#242526]' : 'border-gray-200 bg-white'} rounded-lg overflow-hidden font-sans">
                 {#if tags.ogImage}
                     <div class="aspect-[1.91/1] bg-gray-100 overflow-hidden w-full relative">
                         <img src={tags.ogImage} alt="Preview" class="w-full h-full object-cover" />
                     </div>
                 {/if}
                 <div class="p-3 {isDarkMode ? 'bg-[#242526] text-[#e4e6eb]' : 'bg-[#f0f2f5] text-[#1d2129]'}">
                      <div class="uppercase text-[10px] {isDarkMode ? 'text-[#b0b3b8]' : 'text-[#65676b]'} mb-0.5">{displayDomain}</div>
                      <div class="font-bold text-[16px] leading-5 mb-1 truncate">{displayTitle}</div>
                      <div class="text-sm {isDarkMode ? 'text-[#b0b3b8]' : 'text-[#606770]'} line-clamp-1">{displayDesc}</div>
                 </div>
            </div>

        <!-- Twitter -->
        {:else if activePreview === 'twitter'}
             <div class="w-full max-w-[500px] font-sans">
                {#if tags.twitterCard === 'summary'}
                    <div class="border {isDarkMode ? 'border-gray-700' : 'border-[#cfd9de]'} rounded-xl overflow-hidden flex h-[130px] cursor-pointer hover:bg-opacity-90">
                        {#if tags.ogImage}
                            <div class="w-[130px] h-full bg-gray-100 flex-shrink-0">
                                <img src={tags.ogImage} alt="Preview" class="w-full h-full object-cover" />
                            </div>
                        {/if}
                        <div class="p-3 flex flex-col justify-center flex-1 min-w-0 {isDarkMode ? 'bg-black' : 'bg-white'}">
                             <div class="text-[15px] {isDarkMode ? 'text-[#71767b]' : 'text-[#536471]'} mb-0.5 truncate">{displayDomain}</div>
                             <div class="text-[15px] {isDarkMode ? 'text-[#e7e9ea]' : 'text-[#0f1419]'} font-bold mb-0.5 line-clamp-2">{displayTitle}</div>
                             <div class="text-[15px] {isDarkMode ? 'text-[#71767b]' : 'text-[#536471]'} line-clamp-2">{displayDesc}</div>
                        </div>
                    </div>
                {:else}
                    <div class="border {isDarkMode ? 'border-gray-700' : 'border-[#cfd9de]'} rounded-xl overflow-hidden cursor-pointer hover:bg-opacity-90">
                        {#if tags.ogImage}
                            <div class="aspect-[1.91/1] bg-gray-100 w-full">
                                <img src={tags.ogImage} alt="Preview" class="w-full h-full object-cover" />
                            </div>
                        {/if}
                        <div class="p-3 {isDarkMode ? 'bg-black' : 'bg-white'}">
                            <div class="text-[15px] {isDarkMode ? 'text-[#71767b]' : 'text-[#536471]'} mb-0.5 truncate">{displayDomain}</div>
                            <div class="text-[15px] {isDarkMode ? 'text-[#e7e9ea]' : 'text-[#0f1419]'} mb-0.5 truncate">{displayTitle}</div>
                            <div class="text-[15px] {isDarkMode ? 'text-[#71767b]' : 'text-[#536471]'} line-clamp-2">{displayDesc}</div>
                        </div>
                    </div>
                {/if}
             </div>

        <!-- LinkedIn -->
        {:else if activePreview === 'linkedin'}
            <div class="w-full max-w-[500px] font-sans border {isDarkMode ? 'border-gray-700 bg-[#1d2226]' : 'border-gray-300 bg-white'} rounded-md overflow-hidden cursor-pointer shadow-sm">
                 {#if tags.ogImage}
                     <div class="aspect-[1.91/1] bg-gray-100 w-full">
                         <img src={tags.ogImage} alt="Preview" class="w-full h-full object-cover" />
                     </div>
                 {/if}
                 <div class="p-2 {isDarkMode ? 'bg-[#1d2226]' : 'bg-[#eef3f8]'} border-t {isDarkMode ? 'border-gray-700' : 'border-gray-300'}">
                     <div class="font-semibold text-sm {isDarkMode ? 'text-white' : 'text-[rgba(0,0,0,0.9)]'} truncate mb-0.5">{displayTitle}</div>
                     <div class="text-xs {isDarkMode ? 'text-[rgba(255,255,255,0.6)]' : 'text-[rgba(0,0,0,0.6)]'} truncate">{displayDomain}</div>
                 </div>
            </div>

        <!-- Slack -->
        {:else if activePreview === 'slack'}
             <div class="w-full max-w-[500px] font-sans flex gap-3 pl-3 border-l-4 {isDarkMode ? 'border-[#363636]' : 'border-[#dddddd]'}">
                 <div class="flex-1 min-w-0">
                     <div class="flex items-center gap-1.5 mb-1">
                         <div class="w-4 h-4 rounded bg-gray-300 flex-shrink-0 overflow-hidden">
                             <img src={`https://www.google.com/s2/favicons?domain=${displayDomain}`} alt="" />
                         </div>
                         <span class="font-bold text-sm {isDarkMode ? 'text-[#d1d2d3]' : 'text-[#1d1c1d]'}">{displayDomain}</span>
                     </div>
                     <div class="font-bold text-[15px] {isDarkMode ? 'text-[#1d9bd1]' : 'text-[#1264a3]'} mb-1 cursor-pointer hover:underline truncate">{displayTitle}</div>
                     <div class="text-[15px] {isDarkMode ? 'text-[#d1d2d3]' : 'text-[#1d1c1d]'} mb-2 line-clamp-3">{displayDesc}</div>
                     {#if tags.ogImage}
                         <div class="rounded-lg overflow-hidden border {isDarkMode ? 'border-[#363636]' : 'border-[#dddddd]'} max-w-[360px]">
                             <img src={tags.ogImage} alt="Preview" class="w-full h-auto" />
                         </div>
                     {/if}
                 </div>
             </div>

        <!-- Discord -->
        {:else if activePreview === 'discord'}
            <div class="w-full max-w-[432px] font-sans {isDarkMode ? 'bg-[#2b2d31]' : 'bg-[#f2f3f5]'} rounded p-3 border-l-4 border-[#1e1f22]">
                <div class="text-xs {isDarkMode ? 'text-[#b5bac1]' : 'text-[#5c5e66]'} mb-1">{displayDomain}</div>
                <div class="font-semibold text-base {isDarkMode ? 'text-[#00a8fc]' : 'text-[#0068e0]'} hover:underline cursor-pointer mb-1 break-words">{displayTitle}</div>
                <div class="text-sm {isDarkMode ? 'text-[#dbdee1]' : 'text-[#2e3338]'} mb-3 whitespace-pre-wrap break-words">{truncate(displayDesc, 200)}</div>
                {#if tags.ogImage}
                    <div class="max-w-full rounded-lg overflow-hidden">
                        <img src={tags.ogImage} alt="Preview" class="max-h-[250px] w-auto max-w-full object-contain bg-black" />
                    </div>
                {/if}
            </div>

        <!-- WhatsApp -->
        {:else if activePreview === 'whatsapp'}
             <div class="w-full max-w-[300px] font-sans {isDarkMode ? 'bg-[#002d24]' : 'bg-[#dcf8c6]'} rounded-lg p-2 rounded-tr-none shadow-sm relative">
                  <div class="bg-[#f0f2f5] dark:bg-[#1f2c34] rounded-lg overflow-hidden mb-1">
                       {#if tags.ogImage}
                           <div class="aspect-[1.91/1] w-full bg-gray-200">
                               <img src={tags.ogImage} alt="Preview" class="w-full h-full object-cover" />
                           </div>
                       {/if}
                       <div class="p-2">
                           <div class="font-bold text-sm {isDarkMode ? 'text-[#e9edef]' : 'text-black'} line-clamp-1">{displayTitle}</div>
                           <div class="text-xs {isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]'} line-clamp-2 mt-0.5">{displayDesc}</div>
                           <div class="text-xs {isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]'} mt-0.5 truncate">{displayDomain.toLowerCase()}</div>
                       </div>
                  </div>
                  <div class="text-sm {isDarkMode ? 'text-[#e9edef]' : 'text-black'} px-1 break-all">
                      https://{displayUrl}
                  </div>
                  <div class="text-[10px] text-right mt-1 {isDarkMode ? 'text-[#8696a0]' : 'text-[#667781]'}">12:34 PM</div>
             </div>
        {/if}

    </div>
</div>
