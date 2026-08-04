<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import Head from '$lib/components/Head.svelte';
    import { page } from '$app/stores';
    import { getDictionary } from '$lib/dictionaries';
    import { Permission } from '$lib/utils/perms-forge/permissions';
    import { saveToHistory } from '$lib/db/workspace';
    import PermissionGrid from '$lib/components/perms-forge/PermissionGrid.svelte';
    import Representation from '$lib/components/perms-forge/Representation.svelte';
    import CommandBuilder from '$lib/components/perms-forge/CommandBuilder.svelte';
    import Presets from '$lib/components/perms-forge/Presets.svelte';
    import HistoryPanel from '$lib/components/perms-forge/HistoryPanel.svelte';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import FAQSection from '$lib/components/FAQSection.svelte';
    import { fade, slide } from 'svelte/transition';
    import { Check, Shield, Save } from '@lucide/svelte';

    $: lang = $page.params.lang || 'en';
    $: dict = (getDictionary(lang) as any)?.tools?.permsForge || {};
    $: common = (getDictionary(lang) as any)?.common || {};

    // Core Logic State
    let permission = new Permission(0o755);

    // Reactivity trigger
    function handleUpdate() {
        permission = permission; // Trigger Svelte reactivity
    }

    // History & Actions
    let showToast = false;
    let toastMessage = '';

    function triggerToast(msg: string) {
        toastMessage = msg;
        showToast = true;
        setTimeout(() => showToast = false, 2000);
    }

    async function handleSave() {
        try {
            await saveToHistory('perms-forge', {
                octal: permission.octal,
                symbolic: permission.symbolic
            }, permission.value); // Store numeric value as result
            triggerToast(dict.copied || 'Saved!'); // Reusing copied/saved msg
        } catch (e) {
            console.error(e);
        }
    }

    function handleRestore(event: CustomEvent) {
        // event.detail is the input object { octal, symbolic }
        // or we can store raw octal in 'input'
        // In handleSave, I stored { octal, symbolic }.
        // Let's support restoring from that.
        const data = event.detail;
        if (data && data.octal) {
            permission.octal = data.octal;
            handleUpdate();
        }
    }

    // Schema
    $: softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/perms-forge",
        "isAccessibleForFree": true,
        "name": dict.title,
        "description": dict.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Linux, Unix, macOS",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };
</script>
<Head
  title={dict.title}
  description={dict.description}
  keywords="chmod calculator, linux permissions, rwxr-xr-x, 755, 777, chmod generator, symbolic to octal"
/>


<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/perms-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/perms-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/perms-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/perms-forge"} />
  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(softwareSchema)}</scr` + `ipt>`}

  {@html `<script type="application/ld+json">

  </scr` + `ipt>`}

</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">

    <!-- Hero Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center p-2 -ml-2 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </a>
                <div class="flex items-center space-x-2">
                    <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Shield size={20} />
                    </div>
                    <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                        {dict.title}
                    </h1>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button
                    on:click={handleSave}
                    class="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity min-h-[44px] min-w-[44px]"
                >
                    <Save size={16} />
                    <span class="hidden sm:inline">Save</span>
                </button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <!-- Main Workspace (8 cols) -->
            <div class="lg:col-span-8 space-y-8">

                <!-- Visualization & Inputs -->
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <!-- Grid Editor -->
                        <div in:fade={{ duration: 300, delay: 100 }}>
                            <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{dict.grid}</div>
                            <PermissionGrid {permission} onUpdate={handleUpdate} />
                        </div>

                        <!-- Numeric/Text Representations -->
                        <div class="space-y-6" in:fade={{ duration: 300, delay: 200 }}>
                            <div>
                                <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{dict.presets}</div>
                                <Presets {permission} onUpdate={handleUpdate} />
                            </div>
                            <Representation {permission} onUpdate={handleUpdate} />
                        </div>
                    </div>
                </div>

                <!-- Command Generator -->
                <div in:fade={{ duration: 300, delay: 300 }}>
                    <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{dict.command}</div>
                    <CommandBuilder {permission} />
                </div>

                <!-- Guide & FAQ -->
                <div class="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <GuideSection
                        title={dict.guide.title}
                        intro={dict.guide.intro}
                        featuresTitle={dict.guide.featuresTitle}
                        f1={dict.guide.f1}
                        f2={dict.guide.f2}
                        f3={dict.guide.f3}
                        tipsTitle={dict.guide.tipsTitle}
                        tip1={dict.guide.tip1}
                        tip2={dict.guide.tip2}
                        tip3={dict.guide.tip3}
                    />
                    <div class="mt-8">
                        <AdPlaceholder />
  <FAQSection
                            title={dict.faqTitle}
                            items={[
                                { q: (dict as any)?.q1, a: (dict as any)?.a1 },
                                { q: (dict as any)?.q2, a: (dict as any)?.a2 },
                                { q: (dict as any)?.q3, a: (dict as any)?.a3 }
                            ]}
                        />
                    </div>
                </div>
            </div>

            <!-- Sidebar (4 cols) -->
            <div class="lg:col-span-4 space-y-6">
                <div class="sticky top-24 h-[calc(100vh-8rem)]">
                    <HistoryPanel on:restore={handleRestore} />
                </div>
            </div>
        </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="perms-forge" currentCategory="dev" />
  </div>
</main>

    <!-- Toast Notification -->
    {#if showToast}
        <div class="fixed bottom-8 left-1/2 -translate-x-1/2 z-50" transition:fade>
            <div class="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-3 rounded-full shadow-lg flex items-center space-x-2 font-medium text-sm">
                <Check size={18} />
                <span>{toastMessage}</span>
            </div>
        </div>
    {/if}
</div>
