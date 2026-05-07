<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { City } from '$lib/utils/time-forge/cities';
  import { format, getHours } from 'date-fns';
  import { X, Home, Clock, AlertCircle } from 'lucide-svelte';
  import { timeStore } from '$lib/utils/time-forge/store';
  import { getSlotStatus } from '$lib/utils/time-forge/meeting-scheduler';
  import TimelineBar from './TimelineBar.svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  export let city: City;
  export let time: Date;
  export let isHome: boolean = false;

  const dispatch = createEventDispatcher<{
    remove: string;
    setHome: string;
  }>();

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.timeForge;

  $: isMeetingMode = $timeStore.isMeetingMode;

  function getBusinessHourStatus(date: Date) {
    const hours = getHours(date);
    if (hours >= 9 && hours < 17) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (hours >= 17 && hours < 22) return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    if (hours >= 7 && hours < 9) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    return 'bg-indigo-900/20 text-slate-400 border-slate-700/50';
  }

  function getStatusText(date: Date) {
      const status = getSlotStatus(date, city.timezone);
      if (status === 'working') return t.meetingMode.good;
      if (status === 'extended') return t.meetingMode.good; // Simplified for UI
      return t.meetingMode.off;
  }

  $: statusClass = getBusinessHourStatus(time);
  $: formattedTime = format(time, 'HH:mm');
  $: formattedDate = format(time, 'EEE, MMM d');
  $: offset = 'GMT' + format(time, 'xxx');
  $: statusText = getStatusText(time);

</script>

<div class="group relative flex items-center justify-between p-4 bg-slate-800 rounded-xl border border-slate-700 shadow-sm hover:border-slate-600 transition-all duration-200 {isMeetingMode && statusText === t.meetingMode.good ? 'ring-1 ring-emerald-500/50' : ''}">

  <div class="flex items-center space-x-4 min-w-[180px]">
    <span class="text-3xl select-none filter drop-shadow-md">{city.flag}</span>
    <div>
      <div class="flex items-center space-x-2">
        <h3 class="text-lg font-semibold text-slate-100">{city.name}</h3>
        {#if isHome}
          <Home class="w-3 h-3 text-indigo-400" />
        {/if}
      </div>
      <p class="text-xs text-slate-500">{city.country} • {offset}</p>
    </div>
  </div>

  <div class="flex-1 px-6 flex justify-center">
    <div class={`flex flex-col items-center px-6 py-2 rounded-lg border ${statusClass} min-w-[160px] transition-colors duration-300 relative overflow-hidden`}>
      <span class="text-3xl font-mono font-bold tracking-wider relative z-10">{formattedTime}</span>
      <div class="flex items-center space-x-2 relative z-10">
           <span class="text-xs font-medium opacity-80 uppercase tracking-wide">{formattedDate}</span>
           {#if isMeetingMode}
               <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-black/20 font-bold">{statusText}</span>
           {/if}
      </div>

      {#if statusText === t.meetingMode.off}
        <div class="absolute inset-0 bg-slate-950/30 z-0"></div>
      {/if}
    </div>
  </div>

  <div class="flex items-center space-x-2 min-w-[80px] justify-end opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
    {#if !isHome}
      <button class="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-indigo-400 hover:bg-slate-700 rounded-lg transition-colors" type="button"
        title="Set as Home Base"
        aria-label="Set as Home Base"
        on:click={() => dispatch('setHome', city.id)}
      >
        <Home class="w-4 h-4" />
      </button>
      <button class="min-h-[44px] min-w-[44px] p-2 text-slate-500 hover:text-red-400 hover:bg-slate-700 rounded-lg transition-colors" type="button"
        title="Remove City"
        aria-label="Remove City"
        on:click={() => dispatch('remove', city.id)}
      >
        <X class="w-4 h-4" />
      </button>
    {:else}
      <span class="text-xs text-indigo-400 font-medium px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20 select-none">
        Home
      </span>
    {/if}
  </div>

  <div class="absolute bottom-2 left-[180px] right-[100px] hidden md:block opacity-60 hover:opacity-100 transition-opacity">
       <TimelineBar timezone={city.timezone} time={time} />
  </div>
</div>
