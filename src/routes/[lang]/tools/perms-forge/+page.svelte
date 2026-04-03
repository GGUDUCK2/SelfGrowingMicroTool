<script lang="ts">
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
    import { Check, Shield, Save } from 'lucide-svelte';

    $: lang = $page.params.lang || 'en';
    $: dict = getDictionary(lang).tools.permsForge;
    $: common = getDictionary(lang).common;

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
            triggerToast(dictionary.copied || 'Saved!'); // Reusing copied/saved msg
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
        "isAccessibleForFree": true,
        "name": dictionary.title,
        "description": dictionary.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "Linux, Unix, macOS",
        "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD" }
    };
</script>
<Head
  title={dictionary.title}
  description={dictionary.description}
  keywords="chmod calculator, linux permissions, rwxr-xr-x, 755, 777, chmod generator, symbolic to octal"
/>


<svelte:head>
                        {@html '<script type="application/ld+json">' + JSON.stringify(softwareSchema) + '</script>'}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "${dictionary.q1}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dictionary.a1}"
        }
      },
      {
        "@type": "Question",
        "name": "${dictionary.q2}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dictionary.a2}"
        }
      },
      {
        "@type": "Question",
        "name": "${dictionary.q3}",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "${dictionary.a3}"
        }
      }
    ]
  }
  </script>`}

</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-black font-sans text-slate-900 dark:text-white pb-20 transition-colors duration-300">

    <!-- Hero Header -->
    <header class="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div class="flex items-center space-x-3">
                <a href="/{lang}" aria-label={common.back} class="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                </a>
                <div class="flex items-center space-x-2">
                    <div class="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Shield size={20} />
                    </div>
                    <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">
                        {dictionary.title}
                    </h1>
                </div>
            </div>
            <div class="flex items-center gap-2">
                <button
                    on:click={handleSave}
                    class="flex items-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium text-sm hover:opacity-90 transition-opacity min-h-[44px]"
                >
                    <Save size={16} />
                    <span class="hidden sm:inline">Save</span>
                </button>
            </div>
        </div>
    </header>

    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

            <!-- Main Workspace (8 cols) -->
            <div class="lg:col-span-8 space-y-8">

                <!-- Visualization & Inputs -->
                <div class="space-y-6">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <!-- Grid Editor -->
                        <div in:fade={{ duration: 300, delay: 100 }}>
                            <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{dictionary.grid}</div>
                            <PermissionGrid {permission} onUpdate={handleUpdate} />
                        </div>

                        <!-- Numeric/Text Representations -->
                        <div class="space-y-6" in:fade={{ duration: 300, delay: 200 }}>
                            <div>
                                <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{dictionary.presets}</div>
                                <Presets {permission} onUpdate={handleUpdate} />
                            </div>
                            <Representation {permission} onUpdate={handleUpdate} />
                        </div>
                    </div>
                </div>

                <!-- Command Generator -->
                <div in:fade={{ duration: 300, delay: 300 }}>
                    <div class="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">{dictionary.command}</div>
                    <CommandBuilder {permission} />
                </div>

                <!-- Guide & FAQ -->
                <div class="mt-16 border-t border-slate-200 dark:border-slate-800 pt-8">
                    <GuideSection
                        title={dictionary.guide.title}
                        intro={dictionary.guide.intro}
                        featuresTitle={dictionary.guide.featuresTitle}
                        f1={dictionary.guide.f1}
                        f2={dictionary.guide.f2}
                        f3={dictionary.guide.f3}
                        tipsTitle={dictionary.guide.tipsTitle}
                        tip1={dictionary.guide.tip1}
                        tip2={dictionary.guide.tip2}
                        tip3={dictionary.guide.tip3}
                    />
                    <div class="mt-8">
                        <FAQSection
                            title={dictionary.faqTitle}
                            items={[
                                { q: dictionary.q1, a: dictionary.a1 },
                                { q: dictionary.q2, a: dictionary.a2 },
                                { q: dictionary.q3, a: dictionary.a3 }
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
