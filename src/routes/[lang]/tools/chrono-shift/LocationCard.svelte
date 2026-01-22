<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import type { TimeSlot } from '$lib/utils/chrono-shift/time-engine';
    import { TimeEngine } from '$lib/utils/chrono-shift/time-engine';
    import { X, Clock, Sun, Moon, Sunrise, Sunset } from 'lucide-svelte';
    import type { TimeZoneLocation } from '$lib/db/chrono-shift';

    export let location: TimeZoneLocation;
    export let utcDate: Date;
    export let onRemove: () => void;
    export let isHome: boolean = false;

    $: slot = TimeEngine.getSlotDetails(location.zoneName, utcDate);

    // Calculate offset string
    $: offsetHours = Math.floor(slot.utcOffset / 60);
    $: offsetMins = Math.abs(slot.utcOffset % 60);
    $: offsetString = `GMT${offsetHours >= 0 ? '+' : ''}${offsetHours}${offsetMins > 0 ? ':' + offsetMins.toString().padStart(2, '0') : ''}`;

    // Get color based on time
    $: getBgColor = (dn: string) => {
        switch(dn) {
            case 'day': return 'bg-sky-100 dark:bg-sky-900/30 border-sky-200 dark:border-sky-800';
            case 'night': return 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700';
            case 'sunrise': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
            case 'sunset': return 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800';
            default: return 'bg-slate-100';
        }
    };
</script>

<div class="relative group p-4 rounded-xl border transition-all duration-300 {getBgColor(slot.dayNight)} {slot.isBusinessHour ? 'ring-1 ring-green-500/50' : ''}">
    <div class="flex items-center justify-between">
        <div class="flex items-center gap-3">
            <div class="p-2 rounded-full bg-white/50 dark:bg-black/20 text-slate-700 dark:text-slate-300">
                {#if slot.dayNight === 'day'}
                    <Sun size={20} />
                {:else if slot.dayNight === 'night'}
                    <Moon size={20} />
                {:else if slot.dayNight === 'sunrise'}
                    <Sunrise size={20} />
                {:else}
                    <Sunset size={20} />
                {/if}
            </div>
            <div>
                <h3 class="font-bold text-lg text-slate-900 dark:text-white leading-tight">
                    {location.customLabel || location.city || location.zoneName.split('/').pop()?.replace('_', ' ')}
                </h3>
                <div class="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {offsetString} • {location.zoneName}
                </div>
            </div>
        </div>

        <div class="text-right">
            <div class="text-2xl font-bold font-mono tracking-tight text-slate-800 dark:text-slate-100">
                {slot.formattedTime}
            </div>
            <div class="text-xs text-slate-500 dark:text-slate-400">
                {slot.formattedDate}
            </div>
        </div>
    </div>

    <!-- Business Hours Indicator -->
    {#if slot.isBusinessHour}
        <div class="absolute top-2 right-2 flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
    {/if}

    {#if !isHome}
        <button
            on:click={onRemove}
            class="absolute -top-3 -right-3 h-8 w-8 flex items-center justify-center bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors focus:outline-none focus:ring-2 focus:ring-red-400 z-10"
            aria-label="Remove location"
        >
            <X size={16} />
        </button>
    {/if}
</div>
