<script lang="ts">
    import { onDestroy } from 'svelte';
    import { page } from '$app/stores';
    import { getDictionary } from '$lib/dictionaries';
    import Head from '$lib/components/Head.svelte';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import Mixer from '$lib/components/zen-forge/Mixer.svelte';
    import MasterControl from '$lib/components/zen-forge/MasterControl.svelte';
    import Visualizer from '$lib/components/zen-forge/Visualizer.svelte';
    import PresetManager from '$lib/components/zen-forge/PresetManager.svelte';
    import ZenTimer from '$lib/components/zen-forge/ZenTimer.svelte';
    import BreathingCircle from '$lib/components/zen-forge/BreathingCircle.svelte';
    import { engine } from '$lib/utils/zen-forge/engine';
    import { zenStore } from '$lib/stores/zen-forge';
    import type { ZenForgeDictionary } from '$lib/types/zen-forge';

    export let data;
    $: dict = getDictionary($page.params.lang).tools.zenForge as ZenForgeDictionary;

    function handleBreath(e: CustomEvent) {
        const { phase, duration } = e.detail;
        zenStore.handleBreath(phase, duration);
    }

    function handleKeydown(e: KeyboardEvent) {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        switch(e.code) {
            case 'Space':
                e.preventDefault();
                if (engine.context?.state === 'running') {
                    engine.context.suspend();
                } else {
                    engine.init();
                    engine.context?.resume();
                }
                break;
            case 'KeyM':
                zenStore.setMasterVolume($zenStore.masterVolume === 0 ? 1 : 0);
                break;
            case 'KeyR':
                zenStore.applySmartMix('focus');
                break;
            case 'KeyS':
                // Trigger save in PresetManager? Or just save directly?
                // PresetManager handles the prompt. We can leave it or add a global save.
                if (e.ctrlKey || e.metaKey) {
                    e.preventDefault();
                    const name = prompt(dict.controls.mixName || "Mix Name", `Mix ${new Date().toLocaleTimeString()}`);
                    if (name) zenStore.saveMix(name);
                }
                break;
        }
    }

    onDestroy(() => {
        engine.dispose();
    });
</script>

<svelte:window on:keydown={handleKeydown} />

<Head
    title={dict.title}
    description={dict.description}
    image="https://micro-factory.vercel.app/og/zen-forge.png"
    keywords="ambient, noise, focus, relax, generator, binaural, soundscape, recording, thunder, rain, meditation"
/>

<svelte:head>
    <link rel="canonical" href={`https://micro-factory.vercel.app/${$page.params.lang}/tools/zen-forge`} />
    <link rel="alternate" hreflang="en" href="https://micro-factory.vercel.app/en/tools/zen-forge" />
    <link rel="alternate" hreflang="ko" href="https://micro-factory.vercel.app/ko/tools/zen-forge" />
    <link rel="alternate" hreflang="x-default" href="https://micro-factory.vercel.app/en/tools/zen-forge" />

    {@html `<script type="application/ld+json">${JSON.stringify({
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": dict.title,
        "description": dict.description,
        "applicationCategory": "Productivity",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0"
        },
        "featureList": [
            "Ambient Sound Mixer",
            "Binaural Beats Generator",
            "Focus Timer (Pomodoro)",
            "4-7-8 Breathing Guide",
            "Smart Mix Generator",
            "Pink/White/Brown Noise",
            "Generative Living Atmosphere",
            "Audio Recording (WebM)",
            "Offline Capable (PWA)"
        ]
    })}</script>`}
</svelte:head>

<div class="min-h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden flex flex-col">
    <!-- Visualizer Background -->
    <Visualizer />

    <div class="container mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col">
        <!-- Header -->
        <div class="mb-8 text-center">
            <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-2 drop-shadow-lg">
                {dict.title}
            </h1>
            <p class="text-slate-300 max-w-2xl mx-auto">{dict.description}</p>
        </div>

        <!-- Main Workspace -->
        <div class="grid lg:grid-cols-4 gap-6 flex-1">
            <!-- Sidebar -->
            <div class="lg:col-span-1 space-y-6 flex flex-col">
                <!-- Timer -->
                <ZenTimer {dict} />

                <!-- Breathing Exercise -->
                <div class="bg-slate-800/50 p-6 rounded-3xl border border-slate-700 flex flex-col items-center justify-center min-h-[250px]">
                    <BreathingCircle {dict} on:breath={handleBreath} />
                </div>

                <!-- Master Controls -->
                <MasterControl {dict} />

                <!-- Presets -->
                <PresetManager {dict} />
            </div>

            <!-- Mixer Board -->
            <div class="lg:col-span-3 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl overflow-y-auto">
                <Mixer {dict} />
            </div>
        </div>

        <!-- Guide Section -->
        <div class="mt-16 bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-800 p-8 shadow-xl">
             <GuideSection
                guide={dict.guide}
                faqTitle={dict.faqTitle}
                faqItems={[
                    { q: dict.q1, a: dict.a1 },
                    { q: dict.q2, a: dict.a2 },
                    { q: dict.q3, a: dict.a3 }
                ]}
            />
        </div>
    </div>
</div>
