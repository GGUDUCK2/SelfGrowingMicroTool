<script lang="ts">
  import { timeStore, cityTimes } from '$lib/utils/time-forge/store';
  import CitySearch from './CitySearch.svelte';
  import TimeCard from './TimeCard.svelte';
  import TimeSlider from './TimeSlider.svelte';
  import TeamManager from './TeamManager.svelte';
  import { RotateCcw, Copy, Share2, Calendar } from 'lucide-svelte';
  import { addMinutes, format } from 'date-fns';
  import { createEventDispatcher } from 'svelte';

  // --- State ---
  let showToast = false;
  let toastMessage = '';

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

  async function copyLink() {
    // Generate a simple permalink using query params?
    // Or just a base64 encoded state object.
    const state = {
        cities: $timeStore.selectedCities.map(c => c.id),
        home: $timeStore.homeCityId,
        time: $timeStore.referenceTime.toISOString()
    };
    const blob = btoa(JSON.stringify(state));
    const url = `${window.location.origin}${window.location.pathname}?state=${blob}`;

    await navigator.clipboard.writeText(url);
    showToastMessage('Link copied to clipboard!');
  }

  function showToastMessage(msg: string) {
    toastMessage = msg;
    showToast = true;
    setTimeout(() => showToast = false, 3000);
  }

  // TODO: Implement meeting ICS export
  function exportIcs() {
    // Basic implementation placeholder
    showToastMessage('Calendar export coming soon!');
  }

</script>

<div class="space-y-8 relative">

  <!-- Toolbar -->
  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
    <CitySearch on:add={handleAddCity} />

    <div class="flex items-center space-x-2">
       <button
        type="button"
        class="p-2 text-slate-400 hover:text-indigo-400 bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600"
        title="Share Configuration"
        on:click={copyLink}
      >
        <Share2 class="w-5 h-5" />
      </button>

       <!-- <button
        type="button"
        class="p-2 text-slate-400 hover:text-indigo-400 bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600"
        title="Export to Calendar"
        on:click={exportIcs}
      >
        <Calendar class="w-5 h-5" />
      </button> -->

      <button
        type="button"
        class="p-2 text-slate-400 hover:text-indigo-400 bg-slate-700/50 rounded-lg transition-colors border border-transparent hover:border-slate-600"
        title="Reset All"
        on:click={reset}
      >
        <RotateCcw class="w-5 h-5" />
      </button>
    </div>
  </div>

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
    <div class="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl border border-indigo-500/50 flex items-center space-x-3 animate-in slide-in-from-bottom-5">
        <div class="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></div>
        <span>{toastMessage}</span>
    </div>
  {/if}

</div>
