<script lang="ts">
    import { Play, Pause, SkipForward, SkipBack } from '@lucide/svelte';
    import Button from '$lib/components/Button.svelte';
    import { REGIONS } from './data';

    export let year = 2024;
    export let region = 'world';
    export let compareRegion = 'none';
    export let t: Record<string, any>;
    export let isPlaying = false;

    const minYear = 1950;
    const maxYear = 2100;

    // Keyboard controls
    function handleKeydown(event: KeyboardEvent) {
        // Prevent interfering with inputs if any were added later
        if (event.target && ['INPUT', 'TEXTAREA'].includes((event.target as HTMLElement).tagName)) return;

        if (event.code === 'Space') {
            event.preventDefault();
            isPlaying = !isPlaying;
        } else if (event.code === 'ArrowRight') {
            year = Math.min(year + 1, maxYear);
        } else if (event.code === 'ArrowLeft') {
            year = Math.max(year - 1, minYear);
        }
    }
</script>

<svelte:window on:keydown={handleKeydown} />

<div class="bg-surface rounded-xl border border-border/50 p-4 sm:p-6 shadow-sm">
    <div class="flex flex-col gap-6">

        <!-- Top Row: Selectors -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <!-- Main Region -->
            <div class="flex flex-col gap-1.5">
                <label for="mainRegion" class="text-sm font-medium">{t.primaryRegion}</label>
                <select id="mainRegion" bind:value={region} class="w-full h-11 px-3 py-2 bg-background border border-input rounded-md text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    {#each REGIONS as r}
                        <option value={r.id}>{t.lang === 'ko' ? r.ko : r.name}</option>
                    {/each}
                </select>
            </div>

            <!-- Compare Region -->
            <div class="flex flex-col gap-1.5">
                <label for="compareRegion" class="text-sm font-medium">{t.compareRegion}</label>
                <select id="compareRegion" bind:value={compareRegion} class="w-full h-11 px-3 py-2 bg-background border border-input rounded-md text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                    <option value="none">{t.none}</option>
                    {#each REGIONS as r}
                        <option value={r.id}>{t.lang === 'ko' ? r.ko : r.name}</option>
                    {/each}
                </select>
            </div>
        </div>

        <!-- Middle Row: Timeline -->
        <div class="flex flex-col gap-2">
            <div class="flex justify-between items-center px-1">
                <span class="text-xs text-muted-foreground font-medium">{minYear}</span>
                <span class="text-lg sm:text-2xl font-black tabular-nums tracking-tighter text-primary">{year}</span>
                <span class="text-xs text-muted-foreground font-medium">{maxYear}</span>
            </div>
            <input
                type="range"
                bind:value={year}
                min={minYear}
                max={maxYear}
                class="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer hover:bg-muted-foreground/20 accent-primary"
            />
        </div>

        <!-- Bottom Row: Controls -->
        <div class="flex items-center justify-between gap-4 mt-2">

            <div class="text-xs text-muted-foreground hidden sm:block">
                {t.shortcuts}
            </div>

            <div class="flex items-center gap-2 justify-center flex-1 sm:flex-none">
                <Button variant="secondary" class="h-11 w-11 p-0 rounded-full flex items-center justify-center" on:click={() => year = minYear} aria-label="Go to start">
                    <SkipBack class="h-4 w-4" />
                </Button>

                <Button
                    variant="primary"
                    class="h-12 w-12 sm:h-14 sm:w-14 p-0 rounded-full shadow-md flex items-center justify-center"
                    on:click={() => isPlaying = !isPlaying}
                    aria-label={isPlaying ? "Pause" : "Play"}
                >
                    {#if isPlaying}
                        <Pause class="h-5 w-5 sm:h-6 sm:w-6 fill-current" />
                    {:else}
                        <Play class="h-5 w-5 sm:h-6 sm:w-6 fill-current" style="margin-left: 2px" />
                    {/if}
                </Button>

                <Button variant="secondary" class="h-11 w-11 p-0 rounded-full flex items-center justify-center" on:click={() => year = maxYear} aria-label="Go to end">
                    <SkipForward class="h-4 w-4" />
                </Button>
            </div>

        </div>
    </div>
</div>

<style>
    /* Custom range slider styling for cross-browser consistency */
    input[type=range] {
        -webkit-appearance: none;
        appearance: none;
    }
    input[type=range]::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: currentColor;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
    :global(.dark) input[type=range]::-webkit-slider-thumb {
        border: 2px solid #0f172a;
    }
    input[type=range]::-moz-range-thumb {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: currentColor;
        cursor: pointer;
        border: 2px solid white;
        box-shadow: 0 1px 3px rgba(0,0,0,0.3);
    }
</style>
