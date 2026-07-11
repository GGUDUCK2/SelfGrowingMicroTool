<script lang="ts">
    import { page } from '$app/stores';
    import Head from '$lib/components/Head.svelte';
    import FAQSection from '$lib/components/FAQSection.svelte';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import { getDictionary } from '$lib/dictionaries';
    import { workspace } from '$lib/db/workspace';

    import LoremConfig from '$lib/components/lorem-forge/LoremConfig.svelte';
    import LoremPreview from '$lib/components/lorem-forge/LoremPreview.svelte';
    import { LoremGenerator, type DictionaryType, type TargetType, type FormatType } from '$lib/utils/lorem-forge/generator';
    import { onMount } from 'svelte';

    $: lang = $page.params.lang || 'en';
    $: dict = getDictionary(lang);
    $: d = dict?.tools?.loremForge;

    // State
    let dictionary: DictionaryType = 'standard';
    let targetType: TargetType = 'paragraphs';
    let count: number = 5;
    let format: FormatType = 'plain';
    let startWithLorem: boolean = true;
    let generatedText: string = "";

    const generator = new LoremGenerator();

    function handleGenerate() {
        generatedText = generator.generate({
            dictionary,
            targetType,
            count,
            format,
            startWithLorem
        });
    }

    function handleReset() {
        dictionary = 'standard';
        targetType = 'paragraphs';
        count = 5;
        format = 'plain';
        startWithLorem = true;
        generatedText = "";
    }

    async function handleSaveHistory() {
        if (!generatedText) return;

        await workspace.history.add({
            toolId: 'lorem-forge',
            action: 'generate',
            details: JSON.stringify({ dictionary, targetType, count, format }),
            input: { dictionary, targetType, count, format },
            result: { preview: generatedText.substring(0, 100) + '...' },
            timestamp: Date.now(),
            starred: false
        });
    }

    onMount(() => {
        handleGenerate(); // Auto generate on load
    });

    $: schema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": `https://selfgrowingmicrotool.com/${lang}/tools/lorem-forge`,
        "name": d?.title || "Lorem Forge",
        "description": d?.description || "Professional Dummy Text Generator",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };
</script>

<Head
    title={d?.title || "Lorem Forge - Professional Dummy Text Generator"}
    description={d?.description || "Generate dummy text with custom dictionaries."}
    url={`https://selfgrowingmicrotool.com/${lang}/tools/lorem-forge`}
/>

<svelte:head>
  {@html `<script type="application/ld+json">${JSON.stringify(schema)}</scr` + `ipt>`}
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <!-- Header -->
    <div class="text-center max-w-3xl mx-auto space-y-4">
        <h1 class="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white tracking-tight">
            {d?.title || "Lorem Forge"}
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400">
            {d?.description || "Generate dummy text"}
        </p>
    </div>

    <!-- Main Tool Interface -->
    <div class="grid lg:grid-cols-12 gap-8 items-start">
        <!-- Configuration Panel -->
        <div class="lg:col-span-5 xl:col-span-4 sticky top-6">
            <LoremConfig
                dict={d}
                bind:dictionary
                bind:targetType
                bind:count
                bind:format
                bind:startWithLorem
                onGenerate={handleGenerate}
                onReset={handleReset}
            />
        </div>

        <!-- Preview Panel -->
        <div class="lg:col-span-7 xl:col-span-8 min-h-[500px] flex flex-col">
            <LoremPreview
                text={generatedText}
                dict={d}
                onSave={handleSaveHistory}
                onGenerate={handleGenerate}
            />
        </div>
    </div>

    <AdPlaceholder />

    <!-- Documentation & Guide -->
    {#if d?.guideTitle}
        <GuideSection
            title={d.guideTitle}
            subtitle={d.guideSubtitle}
            features={d?.guideFeatures || []}
        />
    {/if}

    <AdPlaceholder />

    <!-- FAQ -->
    {#if d?.faqTitle}
        <FAQSection
            title={d.faqTitle}
            items={d?.faqs || []}
        />
    {/if}

    <!-- Related Tools -->
    <div class="mt-16 pt-8 border-t border-slate-200 dark:border-slate-800">
        <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="lorem-forge" currentCategory="design" />
    </div>
</div>
