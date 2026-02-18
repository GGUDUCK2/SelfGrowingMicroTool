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
    import { engine } from '$lib/utils/zen-forge/engine';

    export let data;
    $: dict = getDictionary($page.params.lang);

    let mixer: Mixer;

    function handleLoadMix(e: CustomEvent) {
        mixer.loadMix(e.detail);
    }

    function handleReset() {
        mixer.reset();
    }

    function getCurrentMix() {
        return mixer ? mixer.getMix() : [];
    }

    onDestroy(() => {
        engine.stopAll();
    });
</script>

<Head
    title={dict.tools.zenForge.title}
    description={dict.tools.zenForge.description}
    image="https://micro-factory.vercel.app/og/zen-forge.png"
/>

<div class="min-h-screen bg-slate-900 text-slate-100 font-sans relative overflow-hidden flex flex-col">
    <!-- Visualizer Background -->
    <Visualizer />

    <div class="container mx-auto px-4 py-8 relative z-10 flex-1 flex flex-col">
        <!-- Header -->
        <div class="mb-8 text-center">
            <h1 class="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-pink-300 mb-2 drop-shadow-lg">
                {dict.tools.zenForge.title}
            </h1>
            <p class="text-slate-300 max-w-2xl mx-auto">{dict.tools.zenForge.description}</p>
        </div>

        <!-- Main Workspace -->
        <div class="grid lg:grid-cols-4 gap-6 flex-1">
            <!-- Sidebar -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Master Controls -->
                <MasterControl
                    {dict}
                    on:reset={handleReset}
                />

                <!-- Presets -->
                <PresetManager
                    {dict}
                    getMix={getCurrentMix}
                    on:load={handleLoadMix}
                />

                <!-- Quick Tips or Info -->
                <div class="bg-slate-800/50 p-4 rounded-xl border border-slate-700 text-xs text-slate-400">
                    <p class="mb-2 font-bold text-slate-300">Did you know?</p>
                    <p>{dict.tools.zenForge.guide.tipsTitle}</p>
                    <ul class="list-disc pl-4 space-y-1 mt-2">
                        <li>{dict.tools.zenForge.guide.tip1}</li>
                        <li>{dict.tools.zenForge.guide.tip2}</li>
                    </ul>
                </div>
            </div>

            <!-- Mixer Board -->
            <div class="lg:col-span-3 bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-white/10 p-6 shadow-2xl overflow-y-auto">
                <Mixer
                    bind:this={mixer}
                    {dict}
                />
            </div>
        </div>

        <!-- Guide Section -->
        <div class="mt-16 bg-slate-900/90 backdrop-blur rounded-2xl border border-slate-800 p-8 shadow-xl">
             <GuideSection
                guide={dict.tools.zenForge.guide}
                faqTitle={dict.tools.zenForge.faqTitle}
                faqItems={[
                    { q: dict.tools.zenForge.q1, a: dict.tools.zenForge.a1 },
                    { q: dict.tools.zenForge.q2, a: dict.tools.zenForge.a2 },
                    { q: dict.tools.zenForge.q3, a: dict.tools.zenForge.a3 }
                ]}
            />
        </div>
    </div>
</div>
