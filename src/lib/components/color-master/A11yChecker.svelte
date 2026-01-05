<script lang="ts">
  import { getReadability } from './color-utils';

  export let color = '#000000'; // The selected color
  export let t: any; // Dictionary

  // We check the selected color against White and Black backgrounds
  $: onWhite = getReadability(color, '#ffffff');
  $: onBlack = getReadability(color, '#000000');

  // We also check White and Black text ON the selected color
  $: whiteOnColor = getReadability('#ffffff', color);
  $: blackOnColor = getReadability('#000000', color);
</script>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
  <!-- Check Text ON Backgrounds -->
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
    <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.asTextColor}</h3>

    <div class="space-y-4">
      <!-- On White -->
      <div class="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white">
        <div class="flex-1">
          <p style="color: {color}" class="text-lg font-bold truncate">{t.textSample}</p>
          <p class="text-xs text-slate-400 mt-1">on #FFFFFF</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold {onWhite.level === 'Fail' ? 'text-red-500' : 'text-green-500'}">
            {onWhite.contrast.toFixed(2)}
          </div>
          <div class="flex gap-1 justify-end mt-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold {onWhite.level !== 'Fail' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">AA: {onWhite.level}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold {onWhite.largeLevel !== 'Fail' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">Lg: {onWhite.largeLevel}</span>
          </div>
        </div>
      </div>

      <!-- On Black -->
      <div class="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-black">
        <div class="flex-1">
          <p style="color: {color}" class="text-lg font-bold truncate">{t.textSample}</p>
          <p class="text-xs text-slate-500 mt-1">on #000000</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold {onBlack.level === 'Fail' ? 'text-red-500' : 'text-green-500'}">
            {onBlack.contrast.toFixed(2)}
          </div>
          <div class="flex gap-1 justify-end mt-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold {onBlack.level !== 'Fail' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">AA: {onBlack.level}</span>
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold {onBlack.largeLevel !== 'Fail' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}">Lg: {onBlack.largeLevel}</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Check Background for Standard Text -->
  <div class="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-lg border border-slate-200 dark:border-slate-700">
    <h3 class="text-lg font-semibold mb-4 text-slate-900 dark:text-white">{t.asBackground}</h3>

    <div class="space-y-4">
      <!-- White Text -->
      <div class="flex items-center justify-between p-4 rounded-xl border border-black/10 transition-colors duration-300" style="background-color: {color}">
        <div class="flex-1">
          <p class="text-lg font-bold text-white truncate">{t.whiteText}</p>
          <p class="text-xs text-white/70 mt-1">{t.onSelection}</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-white drop-shadow-md">
            {whiteOnColor.contrast.toFixed(2)}
          </div>
          <div class="flex gap-1 justify-end mt-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-white/20 text-white backdrop-blur-sm">AA: {whiteOnColor.level}</span>
          </div>
        </div>
      </div>

      <!-- Black Text -->
      <div class="flex items-center justify-between p-4 rounded-xl border border-black/10 transition-colors duration-300" style="background-color: {color}">
        <div class="flex-1">
          <p class="text-lg font-bold text-black truncate">{t.blackText}</p>
          <p class="text-xs text-black/60 mt-1">{t.onSelection}</p>
        </div>
        <div class="text-right">
          <div class="text-2xl font-bold text-black drop-shadow-md">
            {blackOnColor.contrast.toFixed(2)}
          </div>
          <div class="flex gap-1 justify-end mt-1">
            <span class="px-1.5 py-0.5 rounded text-[10px] font-bold bg-black/10 text-black backdrop-blur-sm">AA: {blackOnColor.level}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
