<script lang="ts">
  import { getHours, getMinutes } from 'date-fns';
  import { toZonedTime } from 'date-fns-tz';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  export let timezone: string;
  export let time: Date;

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.timeForge;

  $: zonedTime = toZonedTime(time, timezone);
  $: currentHour = getHours(zonedTime);
  $: currentMinute = getMinutes(zonedTime);
  $: progressPercent = ((currentHour * 60 + currentMinute) / (24 * 60)) * 100;

  // Segments
  $: segments = [
      { start: 0, end: 7, color: 'bg-indigo-950', label: t.timeline.night },
      { start: 7, end: 9, color: 'bg-yellow-500/30', label: t.timeline.morning },
      { start: 9, end: 17, color: 'bg-emerald-500/40', label: t.timeline.work },
      { start: 17, end: 22, color: 'bg-orange-500/30', label: t.timeline.evening },
      { start: 22, end: 24, color: 'bg-indigo-950', label: t.timeline.night }
  ];
</script>

<div class="h-2 w-full bg-slate-800 rounded-full overflow-hidden relative flex mt-3" role="progressbar" aria-label="Day Timeline">
  {#each segments as segment}
      <div
          class="{segment.color} h-full"
          style="width: {((segment.end - segment.start) / 24) * 100}%"
          title="{segment.label} ({segment.start}:00 - {segment.end}:00)"
      ></div>
  {/each}

  <!-- Current Time Marker -->
  <div
      class="absolute top-0 bottom-0 w-0.5 bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)] z-10 transition-all duration-300"
      style="left: {progressPercent}%"
  ></div>
</div>

<div class="flex justify-between text-[10px] text-slate-600 px-0.5 mt-1 font-mono">
    <span>00</span>
    <span>06</span>
    <span>12</span>
    <span>18</span>
    <span>24</span>
</div>
