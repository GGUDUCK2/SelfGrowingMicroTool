<script lang="ts">
    import { scaleLinear, scaleBand } from 'd3-scale';
    import { format } from 'd3-format';
    import { max } from 'd3-array';
    import type { AgeGroup } from './data';
    import { tweened } from 'svelte/motion';
    import { cubicOut } from 'svelte/easing';

    export let data: AgeGroup[] = [];
    export let compareData: AgeGroup[] | null = null;
    export let maxPercent = 0; // Pre-calculated max percent to keep axes stable
    export let lang: string = 'en';

    const margin = { top: 20, right: 20, bottom: 30, left: 60 };
    let width = 600;
    const height = 400;

    $: innerWidth = width - margin.left - margin.right;
    $: innerHeight = height - margin.top - margin.bottom;

    // Use absolute values for axes, max is ~15% for extreme young populations
    $: safeMaxPercent = maxPercent || max(data, d => Math.max(d.malePercent, d.femalePercent)) || 10;

    // Scales
    $: xScale = scaleLinear()
        .domain([0, safeMaxPercent])
        .range([0, innerWidth / 2 - 10]);

    $: yScale = scaleBand()
        .domain(data.map(d => d.age))
        .range([innerHeight, 0])
        .padding(0.1);

    const formatPercent = format(".1f");

    // Animation stores
    const animData = tweened(data, { duration: 300, easing: cubicOut });
    const animCompare = tweened(compareData || [], { duration: 300, easing: cubicOut });

    $: animData.set(data);
    $: if (compareData) {
        // Ensure compareData has same length and structure
        if (compareData.length === data.length) {
            animCompare.set(compareData);
        } else {
             // Fill with zeros if shape mismatch (should not happen with our generator)
             animCompare.set(data.map(d => ({...d, malePercent: 0, femalePercent: 0})));
        }
    } else {
        animCompare.set([]);
    }

</script>

<div class="w-full relative touch-pan-y" bind:clientWidth={width}>
    <!-- SVG Chart -->
    <svg width="100%" {height} viewBox="0 0 {width} {height}" preserveAspectRatio="xMidYMid meet">
        <g transform="translate({margin.left}, {margin.top})">

            <!-- Axis lines -->
            <line x1="{innerWidth / 2}" y1="0" x2="{innerWidth / 2}" y2="{innerHeight}" stroke="currentColor" class="opacity-20" />
            <line x1="0" y1="{innerHeight}" x2="{innerWidth}" y2="{innerHeight}" stroke="currentColor" class="opacity-20" />

            <!-- X-Axis Labels (Ticks) -->
            {#each [0, 2, 4, 6, 8, 10, 12, 14] as tick}
                {#if tick <= safeMaxPercent}
                    <!-- Left (Male) -->
                    <text x="{innerWidth / 2 - xScale(tick)}" y="{innerHeight + 20}" text-anchor="middle" class="text-[10px] fill-current opacity-60">
                        {tick}%
                    </text>
                    <!-- Right (Female) -->
                    <text x="{innerWidth / 2 + xScale(tick)}" y="{innerHeight + 20}" text-anchor="middle" class="text-[10px] fill-current opacity-60">
                        {tick}%
                    </text>
                {/if}
            {/each}

            <!-- Y-Axis Labels (Age Groups) -->
            {#each data as group}
                <text x="-10" y="{(yScale(group.age) || 0) + yScale.bandwidth() / 2}" dy="0.32em" text-anchor="end" class="text-[10px] sm:text-xs fill-current opacity-70">
                    {group.age}
                </text>
            {/each}

            <!-- Main Data Bars -->
            {#each $animData as d}
                <!-- Male (Left) -->
                <rect
                    x="{innerWidth / 2 - xScale(d.malePercent)}"
                    y="{yScale(d.age)}"
                    width="{xScale(d.malePercent)}"
                    height="{yScale.bandwidth()}"
                    class="fill-blue-500 hover:fill-blue-400 transition-colors"
                />

                <!-- Female (Right) -->
                <rect
                    x="{innerWidth / 2}"
                    y="{yScale(d.age)}"
                    width="{xScale(d.femalePercent)}"
                    height="{yScale.bandwidth()}"
                    class="fill-pink-500 hover:fill-pink-400 transition-colors"
                />
            {/each}

            <!-- Compare Data Overlays (Stroked) -->
            {#if compareData && $animCompare.length > 0}
                {#each $animCompare as c, i}
                    <!-- Compare Male -->
                    <rect
                        x="{innerWidth / 2 - xScale(c.malePercent)}"
                        y="{yScale(c.age)}"
                        width="{xScale(c.malePercent)}"
                        height="{yScale.bandwidth()}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="opacity-50"
                        stroke-dasharray="2,2"
                    />

                    <!-- Compare Female -->
                    <rect
                        x="{innerWidth / 2}"
                        y="{yScale(c.age)}"
                        width="{xScale(c.femalePercent)}"
                        height="{yScale.bandwidth()}"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="1.5"
                        class="opacity-50"
                        stroke-dasharray="2,2"
                    />
                {/each}
            {/if}

        </g>
    </svg>

    <!-- Legend -->
    <div class="absolute top-2 right-4 flex flex-col gap-1 items-end pointer-events-none">
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-blue-500 rounded-sm"></span>
            <span class="text-xs opacity-70 font-medium">{lang === 'ko' ? '남성' : 'Male'}</span>
        </div>
        <div class="flex items-center gap-2">
            <span class="w-3 h-3 bg-pink-500 rounded-sm"></span>
            <span class="text-xs opacity-70 font-medium">{lang === 'ko' ? '여성' : 'Female'}</span>
        </div>
        {#if compareData}
            <div class="flex items-center gap-2 mt-1">
                <span class="w-3 h-3 border border-current opacity-50 border-dashed rounded-sm"></span>
                <span class="text-xs opacity-70 font-medium">{lang === 'ko' ? '비교 대상' : 'Comparison'}</span>
            </div>
        {/if}
    </div>
</div>

<style>
    /* Ensure tooltips or interactivity can be layered later */
    rect {
        cursor: pointer;
    }
</style>
