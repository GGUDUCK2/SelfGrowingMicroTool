<script lang="ts">
  import { onMount, onDestroy } from 'svelte';
  import type { IconConfig } from '$lib/utils/icon-forge/processor';

  export let file: File | null;
  export let config: IconConfig;
  export let t: any;

  let imgUrl: string = '';

  $: if (file) {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
    imgUrl = URL.createObjectURL(file);
  }

  onDestroy(() => {
    if (imgUrl) URL.revokeObjectURL(imgUrl);
  });

  // Calculate CSS styles for the icon container
  $: containerStyle = `
    background-color: ${config.transparent ? 'transparent' : config.background};
    border-radius: ${config.transparent ? 0 : config.radius}%;
    overflow: hidden;
  `;

  // Image style (padding)
  // Padding in config is %, so we can use padding on container + box-sizing
  // OR just scale the image.
  // Let's use padding on container.
  $: paddingStyle = `padding: ${config.padding}%;`;

</script>

{#if !file}
  <div class="flex items-center justify-center h-64 text-slate-500">
    Upload an image to see previews.
  </div>
{:else}
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6">

    <!-- Browser Tab Preview -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div class="bg-slate-900/50 px-4 py-3 border-b border-slate-700 flex items-center justify-between">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.platforms.browser}</span>
      </div>
      <div class="p-6 bg-[#f1f5f9] dark:bg-[#0f172a]">
        <div class="max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-t-lg shadow-sm border border-b-0 border-slate-200 dark:border-slate-700">
           <div class="flex items-center px-3 py-2 space-x-2">
              <!-- Icon -->
              <div class="w-4 h-4 relative flex-shrink-0" style="{containerStyle}">
                 <img src={imgUrl} class="w-full h-full object-contain" style="{paddingStyle}" alt="Favicon" />
              </div>
              <div class="text-xs text-slate-700 dark:text-slate-300 font-medium truncate w-32">
                 My Awesome Website
              </div>
              <div class="ml-auto text-slate-400">×</div>
           </div>
        </div>
        <div class="bg-white dark:bg-slate-800 h-12 border border-slate-200 dark:border-slate-700 flex items-center px-4 space-x-3 shadow-sm relative z-10">
            <div class="w-4 h-4 text-slate-400">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </div>
            <div class="flex-1 bg-slate-100 dark:bg-slate-900 rounded-md h-7"></div>
        </div>
      </div>
    </div>

    <!-- iPhone Home Screen -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div class="bg-slate-900/50 px-4 py-3 border-b border-slate-700">
        <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.platforms.iphone}</span>
      </div>
      <div class="p-6 flex justify-center bg-gray-900 relative overflow-hidden">
        <!-- Wallpaper Effect -->
        <div class="absolute inset-0 opacity-30 bg-gradient-to-br from-indigo-900 to-purple-900"></div>

        <div class="relative flex flex-col items-center space-y-2">
            <!-- iOS Icon is always rounded square (approx 22% radius), regardless of user input if they add to homescreen -->
            <!-- But here we show what we generate. User can adjust radius to match or we force it? -->
            <!-- Typically Apple Touch Icon is square, iOS rounds it. So we show it Square with the system applying rounding? -->
            <!-- Let's show it as the system would render it (Rounded). -->
            <div class="w-16 h-16 bg-white shadow-lg overflow-hidden relative" style="border-radius: 22%; {config.transparent ? '' : `background-color: ${config.background};`}">
                 <!-- If transparent, we need to handle it. iOS fills black usually. We'll assume bg color. -->
                 <div class="w-full h-full flex items-center justify-center" style="{paddingStyle}">
                    <img src={imgUrl} class="w-full h-full object-contain" alt="App Icon" />
                 </div>
            </div>
            <span class="text-[10px] text-white font-medium drop-shadow-md">My App</span>
        </div>
      </div>
    </div>

    <!-- Google Search -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div class="bg-slate-900/50 px-4 py-3 border-b border-slate-700">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.platforms.search}</span>
        </div>
        <div class="p-6 bg-white">
            <div class="max-w-md">
                <div class="flex items-center space-x-3 mb-1">
                    <div class="w-7 h-7 rounded-full bg-gray-100 border border-gray-200 overflow-hidden flex items-center justify-center p-1">
                         <div class="w-full h-full relative" style="{containerStyle}">
                            <img src={imgUrl} class="w-full h-full object-contain" style="{paddingStyle}" alt="Result" />
                         </div>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-sm text-gray-800 font-medium leading-none">My Awesome Website</span>
                        <span class="text-xs text-gray-500">https://example.com › tools</span>
                    </div>
                </div>
                <div class="text-xl text-[#1a0dab] hover:underline cursor-pointer mb-1">
                    The Definitive Icon Tool
                </div>
                <div class="text-sm text-gray-600">
                    Generate pixel-perfect favicons and PWA assets in seconds. Supported formats include ICO, PNG, and SVG.
                </div>
            </div>
        </div>
      </div>

    <!-- Windows Tile -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        <div class="bg-slate-900/50 px-4 py-3 border-b border-slate-700">
          <span class="text-xs font-medium text-slate-400 uppercase tracking-wider">{t.platforms.windows}</span>
        </div>
        <div class="p-6 bg-[#0078d7] flex items-center justify-center min-h-[160px]">
            <div class="w-24 h-24 flex items-center justify-center" style="{config.transparent ? '' : `background-color: ${config.background};`}">
                 <div class="w-full h-full relative" style="{paddingStyle}">
                     <img src={imgUrl} class="w-full h-full object-contain" alt="Tile" />
                 </div>
            </div>
        </div>
    </div>
  </div>
{/if}
