<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
    import Head from '$lib/components/Head.svelte';
    import { getDictionary } from '$lib/dictionaries';
    import { page } from '$app/stores';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import FAQSection from '$lib/components/FAQSection.svelte';

    import { onDestroy } from 'svelte';
    import { generateDemographics } from '$lib/components/demographics-forge/data';
    import PyramidChart from '$lib/components/demographics-forge/PyramidChart.svelte';
    import MetricsPanel from '$lib/components/demographics-forge/MetricsPanel.svelte';
    import ControlPanel from '$lib/components/demographics-forge/ControlPanel.svelte';
    import HistorySidebar from '$lib/components/demographics-forge/HistorySidebar.svelte';
    import { saveToHistory } from '$lib/db/workspace';
    import { max } from 'd3-array';

    $: lang = $page.params.lang;
    $: dict = getDictionary(lang);
    $: t = { ...((dict as any)?.tools?.demographicsForge || {}), lang };


    // State
    let year = 2024;
    let region = 'world';
    let compareRegion = 'none';
    let isPlaying = false;
    let playInterval: ReturnType<typeof setInterval> | undefined;

    // Derived Data
    $: snapshot = generateDemographics(region, year);
    $: compareSnapshot = compareRegion !== 'none' ? generateDemographics(compareRegion, year) : null;

    // Stable axis max calculations to prevent chart jumping
    // We calculate the maximum possible percentage across the ENTIRE time range for the selected region(s)
    let maxPercent = 10; // Default fallback

    $: {
        // Calculate max over the range 1950-2100 to keep the axis completely stable
        let localMax = 0;
        for (let y = 1950; y <= 2100; y += 10) { // step by 10 for performance
            const s = generateDemographics(region, y);
            const maxVal = max(s.data, d => Math.max(d.malePercent, d.femalePercent)) || 0;
            if (maxVal > localMax) localMax = maxVal;

            if (compareRegion !== 'none') {
                 const cs = generateDemographics(compareRegion, y);
                 const cMaxVal = max(cs.data, d => Math.max(d.malePercent, d.femalePercent)) || 0;
                 if (cMaxVal > localMax) localMax = cMaxVal;
            }
        }
        maxPercent = Math.ceil(localMax); // round up to nearest int

        // Ensure minimum 10% for layout stability if things are weird
        if (maxPercent < 10) maxPercent = 10;
    }

    // Animation Loop
    $: {
        if (isPlaying) {
            if (!playInterval) {
                playInterval = setInterval(() => {
                    if (year < 2100) {
                        year += 1;
                    } else {
                        isPlaying = false;
                    }
                }, 100); // 10 years per second
            }
        } else {
            if (playInterval) {
                clearInterval(playInterval);
                playInterval = undefined;
            }
        }
    }

    onDestroy(() => {
        if (playInterval) {
            clearInterval(playInterval);
        }
    });

    // History handling
    async function saveSnapshot() {
        const input = { year, region, compareRegion };
        const result = { totalPopulation: snapshot.totalPopulation }; // Keep result lightweight
        await saveToHistory('demographics-forge', input, result);
    }

    function restoreSnapshot(input: any) {
        year = input.year;
        region = input.region;
        compareRegion = input.compareRegion;
        isPlaying = false;
    }

    // Dynamic FAQ logic for SEO
    $: faqItems = [
        { q: t?.q1, a: t?.a1 },
        { q: t?.q2, a: t?.a2 },
        { q: t?.q3, a: t?.a3 }
    ];

    $: schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": "https://selfgrowingmicrotool.com/" + lang + "/tools/demographics-forge",
        "isAccessibleForFree": true,
        "name": t.title,
        "description": t.description,
        "applicationCategory": "EducationalApplication",
        "applicationSubCategory": "Data Visualization Tool",
        "operatingSystem": "Any"
    };


</script>

<Head
    title={t.title}
    description={t.description}
    keywords="population pyramid, demographic transition, global demographics, median age, dependency ratio, visualization"
/>


<svelte:head>
  <link rel="canonical" href={"https://selfgrowingmicrotool.com/" + lang + "/tools/demographics-forge"} />
  <link rel="alternate" hreflang="en" href="https://selfgrowingmicrotool.com/en/tools/demographics-forge" />
  <link rel="alternate" hreflang="ko" href="https://selfgrowingmicrotool.com/ko/tools/demographics-forge" />
  <link rel="alternate" hreflang="x-default" href="https://selfgrowingmicrotool.com/en/tools/demographics-forge" />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(schema)}</scr` + `ipt>`}
</svelte:head>



<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
    <!-- Header -->
    <div class="mb-8">
        <h1 class="text-3xl font-bold tracking-tight text-primary mb-2">{t.title}</h1>
        <p class="text-lg text-muted-foreground">{t.description}</p>
    </div>

    <!-- Main Workspace -->
    <div class="flex flex-col lg:flex-row gap-6 mb-12">

        <!-- Left: Visualization & Controls -->
        <div class="flex-1 flex flex-col gap-6 min-w-0">

            <ControlPanel
                bind:year
                bind:region
                bind:compareRegion
                bind:isPlaying
                {t}
            />

            <!-- Chart Area -->
            <div class="bg-surface border border-border/50 rounded-xl p-4 sm:p-6 shadow-sm min-h-[400px] flex flex-col">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-lg font-semibold">{snapshot.year} {lang === 'ko' ? '인구 피라미드' : 'Population Pyramid'}</h2>
                    <button class="min-h-[44px] min-w-[44px] text-sm text-primary hover:underline min-h-[44px] min-w-[44px]"
                        on:click={saveSnapshot}
                    >
                        {t.saveSnapshot}
                    </button>
                </div>

                <div class="flex-1 w-full flex items-center justify-center">
                    <PyramidChart
                        data={snapshot.data}
                        compareData={compareSnapshot?.data || null}
                        {maxPercent}
                        {lang}
                    />
                </div>
            </div>

            <MetricsPanel {snapshot} {compareSnapshot} {t} />

        </div>

        <!-- Right: History Sidebar -->
        <div class="w-full lg:w-80 shrink-0 h-[400px] lg:h-auto">
            <HistorySidebar
                toolId="demographics-forge"
                {t}
                onRestore={restoreSnapshot}
            />
        </div>
    </div>

    <!-- Documentation & SEO Section -->
    <div class="mt-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div class="lg:col-span-2 space-y-12">
            <GuideSection
                title={t.guide.title}
                intro={t.guide.intro}
                featuresTitle={t.guide.featuresTitle}
                features={[t.guide.f1, t.guide.f2, t.guide.f3]}
                tipsTitle={t.guide.tipsTitle}
                tips={[t.guide.tip1, t.guide.tip2, t.guide.tip3]}
            />

            <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={faqItems} />
        </div>
    </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="demographics-forge" currentCategory="data" />
  </div>
</div>
