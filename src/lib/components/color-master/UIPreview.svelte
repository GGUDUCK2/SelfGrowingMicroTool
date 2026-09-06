<script lang="ts">

  import { colord } from 'colord';
  import { getReadability } from './color-utils';
  import type { ColorMasterDictionary } from '$lib/types/color-master';

  export let primaryColor: string;
  export let t: ColorMasterDictionary;

  // Derived state for component colors
  $: primary = colord(primaryColor);
  $: primaryLight = primary.lighten(0.1).toHex();
  $: primaryDark = primary.darken(0.1).toHex();
  $: onPrimary = primary.isLight() ? '#000000' : '#ffffff';
  $: onPrimarySoft = primary.isLight() ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.7)';

  // Contrast checks
  $: btnContrast = getReadability(onPrimary, primaryColor);
</script>

<div class="bg-slate-100 dark:bg-slate-900 rounded-2xl p-8 shadow-inner border border-slate-200 dark:border-slate-700">
  <div class="flex items-center justify-between mb-6">
    <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">
      {t.uiPreview.title}
    </h3>
    <div class="flex space-x-2">
      <div class="px-2 py-1 rounded text-xs font-bold {btnContrast.level === 'Fail' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}">
        Contrast: {btnContrast.contrast.toFixed(2)} ({btnContrast.level})
      </div>
    </div>
  </div>

  <div class="grid md:grid-cols-2 gap-8">
    <!-- Buttons & Inputs -->
    <div class="space-y-6">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
        <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.uiPreview.buttons}</h4>
        <div class="flex flex-wrap gap-4">
          <button
            class="px-4 py-2 rounded-lg font-medium shadow-sm transition-all hover:-translate-y-0.5"
            style="background-color: {primaryColor}; color: {onPrimary}"
          >
            {t.uiPreview.primaryButton}
          </button>
          <button
            class="px-4 py-2 rounded-lg font-medium border-2 bg-transparent hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
            style="border-color: {primaryColor}; color: {primaryColor}"
          >
            {t.uiPreview.secondaryButton}
          </button>
        </div>
      </div>

      <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 space-y-4">
         <h4 class="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.uiPreview.inputs}</h4>
         <div class="relative">
            <input
              type="text"
              class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:outline-none transition-all dark:bg-slate-900 dark:text-white"
              style="border-color: {primaryLight}; --tw-ring-color: {primaryColor}"
              placeholder="Focus me..."
            />
         </div>
      </div>
    </div>

    <!-- Cards & Alerts -->
    <div class="space-y-6">
       <!-- Card -->
       <div class="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-lg border-t-4" style="border-top-color: {primaryColor}">
          <div class="flex items-center gap-4 mb-4">
             <div class="w-10 h-10 rounded-full flex items-center justify-center" style="background-color: {primaryLight}33; color: {primaryColor}">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
             </div>
             <div>
                <h4 class="font-bold text-slate-900 dark:text-white">Card Title</h4>
                <p class="text-xs text-slate-500">Subtitle</p>
             </div>
          </div>
          <p class="text-slate-600 dark:text-slate-300 text-sm mb-4">
             This is a card component using your primary color for accents and highlights.
          </p>
          <button class="text-sm font-semibold hover:underline bg-transparent border-0 p-0 cursor-pointer" style="color: {primaryColor}">Learn more &rarr;</button>
       </div>

       <!-- Alert -->
       <div class="p-4 rounded-lg flex items-start gap-3" style="background-color: {primaryColor}1A; color: {primaryDark}">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={primaryColor} stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
          <div>
             <h5 class="font-bold text-sm" style="color: {primaryColor}">System Alert</h5>
             <p class="text-sm opacity-90">This alert box uses a transparent version of your color.</p>
          </div>
       </div>
    </div>
  </div>
</div>
