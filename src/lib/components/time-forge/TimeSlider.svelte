<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { addMinutes, format, startOfDay, addDays, differenceInMinutes, startOfHour } from 'date-fns';
  import { meetingSlots, timeStore } from '$lib/utils/time-forge/store';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  export let value: Date; // The current reference time

  const dispatch = createEventDispatcher<{
    change: Date;
  }>();

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.timeForge;

  $: isMeetingMode = $timeStore.isMeetingMode;
  $: currentDayStart = startOfDay(value);
  $: minutesFromStart = differenceInMinutes(value, currentDayStart);

  $: visibleSlots = $meetingSlots.filter(slot => {
    const startDiff = differenceInMinutes(slot.start, currentDayStart);
    return startDiff >= 0 && startDiff < 1440;
  });

  function handleInput(e: Event) {
    const target = e.target as HTMLInputElement;
    const val = parseInt(target.value, 10);
    if (isNaN(val)) return;

    const newDate = addMinutes(currentDayStart, val);
    dispatch('change', newDate);
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowRight') {
      dispatch('change', addMinutes(value, 15));
    } else if (e.key === 'ArrowLeft') {
      dispatch('change', addMinutes(value, -15));
    } else if (e.key === 'ArrowUp') {
       dispatch('change', addDays(value, 1));
    } else if (e.key === 'ArrowDown') {
       dispatch('change', addDays(value, -1));
    }
  }

  function shiftDay(days: number) {
    dispatch('change', addDays(value, days));
  }

  function resetToNow() {
    dispatch('change', new Date());
  }

  function snapToNextSlot() {
      const nextSlot = $meetingSlots.find(s => s.start > value);
      if (nextSlot) {
          dispatch('change', nextSlot.start);
      }
  }

  const ticks = [0, 6, 12, 18, 24];
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm transition-all duration-300 {isMeetingMode ? 'ring-2 ring-emerald-500/50' : ''}">
  <div class="flex items-center justify-between mb-6">
    <button style="min-height: 44px; min-width: 44px;"
      type="button"
      class="text-xs font-medium text-slate-400 hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
      on:click={() => shiftDay(-1)}
    >
      &larr; {t.shortcuts.prevDay}
    </button>

    <div class="flex flex-col items-center">
      <span class="text-lg font-bold text-slate-200 tracking-tight">
        {format(value, 'MMMM d, yyyy')}
      </span>
      <div class="flex items-center space-x-3 mt-1">
        <button style="min-height: 44px; min-width: 44px;"
            type="button"
            class="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
            on:click={resetToNow}
        >
            {t.shortcuts.reset}
        </button>
        {#if isMeetingMode}
             <span class="text-slate-600">•</span>
             <button style="min-height: 44px; min-width: 44px;"
                type="button"
                class="text-xs text-emerald-400 hover:text-emerald-300 font-medium flex items-center"
                on:click={snapToNextSlot}
            >
                {t.shortcuts.nextSlot} &rarr;
            </button>
        {/if}
      </div>
    </div>

    <button style="min-height: 44px; min-width: 44px;"
      type="button"
      class="text-xs font-medium text-slate-400 hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
      on:click={() => shiftDay(1)}
    >
      {t.shortcuts.nextDay} &rarr;
    </button>
  </div>

  <div class="relative h-14 flex items-center select-none">
    <div class="absolute w-full h-4 rounded-full overflow-hidden bg-slate-700 shadow-inner">
        <div class="absolute left-[25%] w-[12.5%] h-full bg-yellow-500/10 border-r border-slate-600/30"></div>
        <div class="absolute left-[37.5%] w-[33.3%] h-full bg-indigo-500/10 border-r border-slate-600/30"></div>
        <div class="absolute left-[70.8%] w-[20.8%] h-full bg-orange-500/10"></div>

        {#if isMeetingMode}
            {#each visibleSlots as slot}
                {@const startPct = (differenceInMinutes(slot.start, currentDayStart) / 1440) * 100}
                {@const widthPct = (30 / 1440) * 100}
                <div
                    class="absolute h-full bg-emerald-500/60 z-10 cursor-pointer hover:bg-emerald-400 transition-colors"
                    style="left: {startPct}%; width: {widthPct}%"
                    title="{t.meetingMode.good}: {format(slot.start, 'HH:mm')}"
                    role="button"
                    tabindex="0"
                    on:click|stopPropagation={() => dispatch('change', slot.start)}
                    on:keydown|stopPropagation={(e) => e.key === 'Enter' && dispatch('change', slot.start)}
                ></div>
            {/each}
        {/if}
    </div>

    <input
      type="range"
      min="0"
      max="1439"
      step="15"
      value={minutesFromStart}
      on:input={handleInput}
      class="absolute w-full h-4 opacity-0 cursor-pointer z-30"
      aria-label="Time Slider"
    />

    <div
      class="absolute h-10 w-1.5 bg-indigo-500 rounded-full pointer-events-none z-20 transition-all duration-75 shadow-[0_0_15px_rgba(99,102,241,0.6)]"
      style="left: {(minutesFromStart / 1440) * 100}%"
    >
        <div class="absolute -top-9 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-xl whitespace-nowrap after:content-[''] after:absolute after:top-full after:left-1/2 after:-translate-x-1/2 after:border-4 after:border-transparent after:border-t-indigo-600">
            {format(value, 'HH:mm')}
        </div>
    </div>

    <div class="absolute top-8 w-full flex justify-between px-1 text-[10px] text-slate-500 font-mono pointer-events-none select-none">
        {#each ticks as tick}
            <span class="relative -translate-x-1/2 left-0">{tick === 24 ? '00' : tick}:00</span>
        {/each}
    </div>
  </div>
</div>
