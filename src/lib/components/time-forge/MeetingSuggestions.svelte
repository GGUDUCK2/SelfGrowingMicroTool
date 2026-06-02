<script lang="ts">
  import { timeStore } from '$lib/utils/time-forge/store';
  import { findBestMeetingSlots, type MeetingSlot } from '$lib/utils/time-forge/meeting-scheduler';
  import { format } from 'date-fns';
  import { CalendarCheck, ArrowRight } from '@lucide/svelte';
  import { createEventDispatcher } from 'svelte';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';

  const dispatch = createEventDispatcher<{ jump: Date }>();

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.timeForge;

  // Use minScore 0.1 to ensure we always show something, even if it's "Hard"
  $: suggestions = findBestMeetingSlots($timeStore.selectedCities, new Date(), 5, 0.1).slice(0, 3);

  function jumpTo(date: Date) {
      timeStore.setReferenceTime(date);
      // Also enable meeting mode for context
      if (!$timeStore.isMeetingMode) {
          timeStore.toggleMeetingMode();
      }
      dispatch('jump', date);
  }
</script>

{#if suggestions.length > 0}
<div class="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4 mb-8 animate-in fade-in zoom-in-95 duration-500">
    <div class="flex items-center space-x-2 mb-3">
        <CalendarCheck class="w-4 h-4 text-emerald-400" />
        <h3 class="text-sm font-semibold text-slate-300">{t.suggestions.title}</h3>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {#each suggestions as slot}
            <button class="min-h-[44px] min-w-[44px] flex flex-col items-start p-3 rounded-lg bg-slate-700/40 hover:bg-slate-700 border border-transparent hover:border-emerald-500/30 transition-all group text-left"
                on:click={() => jumpTo(slot.start)}
            >
                <div class="flex items-center justify-between w-full mb-1">
                    <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">{slot.label}</span>
                    <span class="text-[10px] text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{t.suggestions.score}: {Math.round(slot.score * 100)}%</span>
                </div>
                <div class="text-sm font-medium text-slate-200">
                    {format(slot.start, 'EEE, MMM d')}
                </div>
                <div class="flex items-center justify-between w-full mt-1">
                    <span class="text-lg font-bold text-white tracking-tight">{format(slot.start, 'HH:mm')}</span>
                    <ArrowRight class="w-3 h-3 text-slate-500 group-hover:translate-x-1 transition-transform" />
                </div>
            </button>
        {/each}
    </div>
</div>
{/if}
