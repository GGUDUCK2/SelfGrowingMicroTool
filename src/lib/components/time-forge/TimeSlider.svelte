<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { addMinutes, format, startOfHour, startOfDay, addDays, getHours } from 'date-fns';

  export let value: Date; // The current reference time

  const dispatch = createEventDispatcher<{
    change: Date;
  }>();

  let sliderValue = 0; // 0 to 1440 (minutes in a day) * 3 (covering +/- 24h range for flexibility?)
  // Actually, let's keep it simple: slider represents offset from "Start of Today" (in local time? or UTC?)
  // Let's make the slider represent a 48 hour window centered on "Now".

  // Better approach: Infinite slider is hard.
  // Let's use a standard range: 0 to 24 hours relative to the *displayed date*.
  // And buttons to jump +/- 1 day.

  // Let's try a different approach: The slider represents the 24 hours of the *current reference day*.
  // value is the full Date object.

  $: currentDayStart = startOfDay(value);
  $: minutesFromStart = (value.getTime() - currentDayStart.getTime()) / (1000 * 60);

  function handleInput(e: Event) {
    const val = parseInt((e.target as HTMLInputElement).value);
    const newDate = addMinutes(currentDayStart, val);
    dispatch('change', newDate);
  }

  function shiftDay(days: number) {
    dispatch('change', addDays(value, days));
  }

  function resetToNow() {
    dispatch('change', new Date());
  }

  // Format for the ticks
  const ticks = [0, 6, 12, 18, 24];
</script>

<div class="w-full bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm">
  <div class="flex items-center justify-between mb-4">
    <button
      type="button"
      class="text-xs font-medium text-slate-400 hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
      on:click={() => shiftDay(-1)}
    >
      &larr; Prev Day
    </button>

    <div class="flex flex-col items-center">
      <span class="text-sm font-medium text-slate-300">
        {format(value, 'MMMM d, yyyy')}
      </span>
      <button
        type="button"
        class="text-xs text-indigo-400 hover:text-indigo-300 mt-1"
        on:click={resetToNow}
      >
        Reset to Now
      </button>
    </div>

    <button
      type="button"
      class="text-xs font-medium text-slate-400 hover:text-indigo-400 px-3 py-1.5 rounded-lg hover:bg-slate-700 transition-colors"
      on:click={() => shiftDay(1)}
    >
      Next Day &rarr;
    </button>
  </div>

  <div class="relative h-12 flex items-center">
    <!-- Track Background with Day/Night gradient approximation -->
    <div class="absolute w-full h-3 rounded-full overflow-hidden bg-slate-700">
        <!-- Morning 6-9 -->
        <div class="absolute left-[25%] width-[12.5%] h-full bg-yellow-500/20"></div>
        <!-- Day 9-17 -->
        <div class="absolute left-[37.5%] width-[33.3%] h-full bg-indigo-500/20"></div>
        <!-- Evening 17-22 -->
        <div class="absolute left-[70.8%] width-[20.8%] h-full bg-orange-500/20"></div>
    </div>

    <input
      type="range"
      min="0"
      max="1439"
      step="15"
      value={minutesFromStart}
      on:input={handleInput}
      class="absolute w-full h-3 opacity-0 cursor-pointer z-20"
      aria-label="Time Slider"
    />

    <!-- Custom Thumb -->
    <div
      class="absolute h-8 w-1 bg-indigo-500 rounded-full pointer-events-none z-10 transition-all duration-75 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
      style="left: {(minutesFromStart / 1440) * 100}%"
    >
        <div class="absolute -top-8 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded shadow-lg whitespace-nowrap">
            {format(value, 'HH:mm')}
        </div>
    </div>

    <!-- Ticks -->
    <div class="absolute top-6 w-full flex justify-between px-1 text-[10px] text-slate-500 font-mono pointer-events-none select-none">
        {#each ticks as tick}
            <span class="relative -translate-x-1/2 left-0">{tick === 24 ? '00' : tick}:00</span>
        {/each}
    </div>
  </div>
</div>

<style>
  /* Custom Range Input Styling for Webkit/Mozilla if needed,
     but we are using a transparent input on top of a custom div structure */
</style>
