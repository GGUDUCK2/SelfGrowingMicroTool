<script lang="ts">
  import { timeStore, cityTimes, meetingSlots } from '$lib/utils/time-forge/store';
  import CitySearch from './CitySearch.svelte';
  import TimeCard from './TimeCard.svelte';
  import TimeSlider from './TimeSlider.svelte';
  import TeamManager from './TeamManager.svelte';
  import MeetingSuggestions from './MeetingSuggestions.svelte';
  import ShortcutsModal from './ShortcutsModal.svelte';
  import { RotateCcw, Share2, Users, Briefcase, Calendar, Sparkles, HelpCircle } from '@lucide/svelte';
  import { format } from 'date-fns';
  import { getDictionary } from '$lib/dictionaries';
  import { page } from '$app/stores';
  import { generateICS, downloadICS } from '$lib/utils/time-forge/ics-generator';

  // --- State ---
  let showToast = false;
  let toastMessage = '';
  let toastType: 'success' | 'info' = 'info';
  let showShortcuts = false;

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = dict.tools.timeForge;

  // --- Actions ---

  function handleAddCity(e: CustomEvent) {
    timeStore.addCity(e.detail);
  }

  function handleRemoveCity(e: CustomEvent) {
    timeStore.removeCity(e.detail);
  }

  function handleSetHome(e: CustomEvent) {
    timeStore.setHomeCity(e.detail);
  }

  function handleTimeChange(e: CustomEvent) {
    timeStore.setReferenceTime(e.detail);
  }

  function reset() {
    timeStore.reset();
  }

  function toggleMeetingMode() {
      timeStore.toggleMeetingMode();
  }

  async function copyLink() {
    const state = {
        cities: $timeStore.selectedCities.map(c => c.id),
        home: $timeStore.homeCityId,
        time: $timeStore.referenceTime.toISOString()
    };
    const blob = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?state=${blob}`;

    await navigator.clipboard.writeText(url);
    showToastMessage(t.toasts.linkCopied, 'success');
  }

  function showToastMessage(msg: string, type: 'success' | 'info' = 'info') {
    toastMessage = msg;
    toastType = type;
    showToast = true;
    setTimeout(() => showToast = false, 3000);
  }

  function handleGlobalKeydown(e: KeyboardEvent) {
      // Ignore if user is typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
          return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key === 'm') {
          e.preventDefault();
          toggleMeetingMode();
      }
      if (e.key === '?' && e.shiftKey) {
          e.preventDefault();
          showShortcuts = true;
      }
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
          e.preventDefault();
          reset();
      }
  }

  function findGoldenHour() {
      // Find the absolute best slot in the next 3 days
      // meetingSlots is already sorted by score (best first) due to our fix in meeting-scheduler.ts

      // Temporarily enable meeting mode if off to calculate slots (actually slots calculate even if mode is off? No, derived store checks mode)
      // So we must manually check or enable mode.

      const wasModeOff = !$timeStore.isMeetingMode;
      if (wasModeOff) {
          timeStore.toggleMeetingMode();
      }

      // Wait for store update (next tick) or just calculate manually.
      // Ideally we'd calculate manually here to avoid UI flicker if we want to stay in current mode,
      // but "Meeting Mode" is the context where finding slots makes sense.

      setTimeout(() => {
        const slots = $meetingSlots;
        if (slots.length > 0) {
            const best = slots[0];
            timeStore.setReferenceTime(best.start);
            showToastMessage('Found best time!', 'success');
        } else {
             showToastMessage('No good times found in next 3 days.', 'info');
        }
      }, 50); // Small delay to let store update
  }

  function exportICS() {
      const content = generateICS($timeStore.referenceTime, $timeStore.selectedCities);
      downloadICS(content, 'global-meeting.ics');
      showToastMessage('Calendar invite downloaded!', 'success');
  }

</script>

<svelte:window on:keydown={handleGlobalKeydown} />

<div class="space-y-8 relative">

  <!-- Toolbar -->
  <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
    <CitySearch on:add={handleAddCity} />

    <div class="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">

        <!-- Creative Feature: Golden Hour -->
        <button class="min-h-[44px] min-w-[44px] flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-orange-500/10 hover:from-amber-500/20 hover:to-orange-500/20 text-amber-500 border border-amber-500/30 rounded-lg transition-all"
            on:click={findGoldenHour}
        >
            <Sparkles class="w-4 h-4" />
            <span class="text-sm font-medium">{t.buttons.findBest}</span>
        </button>

        <!-- Creative Feature: ICS Export -->
        <button class="min-h-[44px] min-w-[44px] flex items-center space-x-2 px-3 py-2 bg-slate-700/50 hover:bg-slate-700 text-slate-300 border border-slate-600 rounded-lg transition-all"
            on:click={exportICS}
        >
            <Calendar class="w-4 h-4" />
            <span class="text-sm font-medium">{t.buttons.exportIcs}</span>
        </button>

       <div class="w-px h-6 bg-slate-700 mx-1 hidden sm:block"></div>

      <button
        type="button"
        class={`min-h-[44px] min-w-[44px] flex items-center space-x-2 px-3 py-2 rounded-lg transition-all border ${$timeStore.isMeetingMode ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/50' : 'text-slate-400 hover:text-indigo-400 bg-slate-700/50 border-transparent hover:border-slate-600'}`}
        title={t.shortcuts.meetingMode}
        on:click={toggleMeetingMode}
      >
        <Briefcase class="w-5 h-5" />
        <span class="text-sm font-medium hidden sm:inline">{t.buttons.meetingMode}</span>
      </button>

       <button class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-indigo-400 bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600" type="button"
        title={t.buttons.share}
        aria-label={t.buttons.share}
        on:click={copyLink}
      >
        <Share2 class="w-5 h-5" />
      </button>

      <button class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-indigo-400 bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600" type="button"
        title={t.buttons.reset}
        aria-label={t.buttons.reset}
        on:click={reset}
      >
        <RotateCcw class="w-5 h-5" />
      </button>

      <button class="min-h-[44px] min-w-[44px] p-2 text-slate-400 hover:text-indigo-400 bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600" type="button"
        title="{t.shortcuts.help} (?)"
        aria-label={t.shortcuts.help}
        on:click={() => showShortcuts = true}
      >
        <HelpCircle class="w-5 h-5" />
      </button>
    </div>
  </div>

  {#if $timeStore.isMeetingMode}
    <div class="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl flex items-start space-x-3 animate-in slide-in-from-top-2">
        <Users class="w-5 h-5 text-indigo-400 mt-0.5 shrink-0" />
        <div>
            <h4 class="text-sm font-semibold text-indigo-300">{t.meetingMode.active}</h4>
            <p class="text-xs text-indigo-200/70 mt-1">
                {t.meetingMode.desc}
            </p>
        </div>
    </div>

    <!-- Smart Suggestions -->
    <MeetingSuggestions />
  {/if}

  <!-- Time Slider -->
  <TimeSlider value={$timeStore.referenceTime} on:change={handleTimeChange} />

  <!-- Team Management -->
  <TeamManager />

  <!-- City Grid -->
  <div class="grid grid-cols-1 gap-4">
    {#each $cityTimes as { city, time } (city.id)}
        <div class="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <TimeCard
                {city}
                {time}
                isHome={city.id === $timeStore.homeCityId}
                on:remove={handleRemoveCity}
                on:setHome={handleSetHome}
            />
        </div>
    {/each}
  </div>

  <!-- Empty State -->
  {#if $cityTimes.length === 0}
    <div class="text-center py-20 border-2 border-dashed border-slate-700 rounded-xl">
        <p class="text-slate-500 mb-4">No cities selected.</p>
        <p class="text-sm text-slate-600">Use the search bar above to add locations.</p>
    </div>
  {/if}

  <!-- Toast -->
  {#if showToast}
    <div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border {toastType === 'success' ? 'border-emerald-500/50' : 'border-indigo-500/50'} flex items-center space-x-3 animate-in slide-in-from-bottom-5">
        <div class="w-2 h-2 {toastType === 'success' ? 'bg-emerald-500' : 'bg-indigo-500'} rounded-full animate-pulse"></div>
        <span>{toastMessage}</span>
    </div>
  {/if}

  <ShortcutsModal isOpen={showShortcuts} on:close={() => showShortcuts = false} />

</div>
