<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { POPULAR_CITIES, type City } from '$lib/utils/time-forge/cities';
  import { Search, MapPin, Plus } from '@lucide/svelte';

  const dispatch = createEventDispatcher<{
    add: City;
  }>();

  let query = '';
  let isOpen = false;
  let inputElement: HTMLInputElement;

  $: filteredCities = query
    ? POPULAR_CITIES.filter(c =>
        c.name.toLowerCase().includes(query.toLowerCase()) ||
        c.country.toLowerCase().includes(query.toLowerCase())
      )
    : POPULAR_CITIES;

  function handleSelect(city: City) {
    dispatch('add', city);
    query = '';
    isOpen = false;
  }

  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') {
        isOpen = false;
        inputElement.blur();
    }
  }

  // Click outside to close
  function clickOutside(node: HTMLElement) {
    const handleClick = (event: MouseEvent) => {
      if (!node.contains(event.target as Node)) {
        isOpen = false;
      }
    };
    document.addEventListener('click', handleClick, true);
    return {
      destroy() {
        document.removeEventListener('click', handleClick, true);
      }
    };
  }
</script>

<div class="relative w-full max-w-md" use:clickOutside>
  <div class="relative">
    <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
      <Search class="h-5 w-5 text-slate-400" />
    </div>
    <input
      bind:this={inputElement}
      type="text"
      bind:value={query}
      on:focus={() => isOpen = true}
      on:keydown={handleKeydown}
      placeholder="Add a city..."
      class="block w-full pl-10 pr-3 py-2 border border-slate-600 rounded-lg leading-5 bg-slate-700 text-slate-100 placeholder-slate-400 focus:outline-none focus:bg-slate-900 focus:border-indigo-500 transition duration-150 ease-in-out sm:text-sm"
      aria-label="Search city"
      role="combobox"
      aria-expanded={isOpen}
      aria-controls="city-list"
    />
  </div>

  {#if isOpen && filteredCities.length > 0}
    <ul
      id="city-list"
      class="absolute z-50 mt-1 w-full bg-slate-800 shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm border border-slate-700"
      role="listbox"
    >
      {#each filteredCities as city (city.id)}
        <!-- svelte-ignore a11y-click-events-have-key-events -->
        <!-- svelte-ignore a11y-role-has-required-aria-props -->
        <li
          class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-slate-700 group transition-colors"
          role="option"
          on:click={() => handleSelect(city)}
        >
          <div class="flex items-center">
            <span class="text-xl mr-3">{city.flag}</span>
            <span class="font-normal block truncate text-slate-200 group-hover:text-white">
              {city.name}
            </span>
            <span class="ml-2 text-slate-500 truncate text-xs group-hover:text-slate-400">
              {city.country}
            </span>
          </div>
          <div class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-500 opacity-0 group-hover:opacity-100">
            <Plus class="h-5 w-5" />
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</div>
