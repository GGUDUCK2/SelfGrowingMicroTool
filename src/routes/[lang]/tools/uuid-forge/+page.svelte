<script lang="ts">
    import RelatedTools from "$lib/components/RelatedTools.svelte";
    import { page } from '$app/stores';
    import { v1, v4, v7 } from 'uuid';
    import { db } from '$lib/db';
    import { onMount } from 'svelte';
    import { Copy, Download, RefreshCw, Trash2, History, Check, Settings2 } from '@lucide/svelte';

    $: lang = $page.params.lang as 'en' | 'ko';

    const dict = {
        en: {
            title: "UUID Forge",
            description: "The definitive tool for generating, formatting, and analyzing Universally Unique Identifiers (UUIDs) with pro-grade precision.",
            version: "UUID Version",
            quantity: "Quantity",
            options: "Formatting Options",
            uppercase: "Uppercase",
            braces: "Include Braces { }",
            noHyphens: "Remove Hyphens",
            generate: "Generate UUIDs",
            clear: "Clear All",
            copy: "Copy",
            copied: "Copied!",
            download: "Download .txt",
            history: "History",
            clearHistory: "Clear History",
            emptyHistory: "No history yet",
            v1: "Version 1 (Time-based)",
            v4: "Version 4 (Random - Default)",
            v7: "Version 7 (Time-ordered)",
            guideTitle: "UUID Forge Guide",
            guideIntro: "UUID Forge is a professional-grade tool designed for developers needing reliable, compliant, and bulk UUID generation.",
            featuresTitle: "Core Features",
            f1: "Support for multiple UUID versions including v1, v4 (standard), and the new v7 (time-ordered).",
            f2: "Bulk generate up to 1000 UUIDs instantly with various formatting options.",
            f3: "Persistent local history ensures your recently generated batches are always accessible.",
            proTipsTitle: "Advanced Pro Tips",
            pt1: "Use UUIDv7 for Database Primary Keys: Unlike UUIDv4, UUIDv7 embeds a Unix timestamp in its first 48 bits, making it time-ordered. This significantly improves database insert performance and index locality (B-Tree friendly) while maintaining uniqueness. It is the recommended choice for modern applications.",
            pt2: "Bulk Generation for Seed Data: Need a massive amount of unique identifiers for your test data or seeders? Set the quantity slider to 1000 and instantly generate a fresh batch. You can easily download these as a .txt file and parse them in your scripts.",
            pt3: "Consistent Formatting: Some legacy systems or specific databases (like SQL Server or certain ORMs) require UUIDs to be wrapped in braces (e.g., {123e4567-e89b-12d3-a456-426614174000}) or stored as raw hexadecimal strings without hyphens. Use the formatting toggles to instantly conform to your target system's requirements without writing custom normalization code.",
            faqTitle: "Frequently Asked Questions",
            q1: "What is the difference between UUID v4 and v7?",
            a1: "UUID v4 is entirely random, making it great for general use. UUID v7 includes a Unix timestamp, meaning they are sortable by creation time, which is highly beneficial for database indexing and performance.",
            q2: "Are the generated UUIDs secure?",
            a2: "Yes, UUID Forge uses the industry-standard `uuid` library, which relies on cryptographically secure random number generators for v4 and v7.",
            q3: "Can I generate UUIDs offline?",
            a3: "Yes, this tool runs entirely in your browser. No data is sent to any server.",
            metaTitle: "UUID Forge - Bulk UUID Generator & Formatter",
            metaDescription: "Generate UUIDv1, UUIDv4, and UUIDv7 instantly. Features bulk generation, custom formatting, and local history. Perfect for developers."
        },
        ko: {
            title: "UUID 포지 (UUID Forge)",
            description: "전문가 수준의 정밀도로 범용 고유 식별자(UUID)를 생성, 포맷팅 및 분석하기 위한 완벽한 도구입니다.",
            version: "UUID 버전",
            quantity: "생성 수량",
            options: "포맷 옵션",
            uppercase: "대문자로 표시",
            braces: "중괄호 { } 포함",
            noHyphens: "하이픈(-) 제거",
            generate: "UUID 생성",
            clear: "모두 지우기",
            copy: "복사",
            copied: "복사됨!",
            download: "다운로드 (.txt)",
            history: "히스토리",
            clearHistory: "히스토리 지우기",
            emptyHistory: "히스토리가 없습니다",
            v1: "버전 1 (시간 기반)",
            v4: "버전 4 (무작위 - 기본)",
            v7: "버전 7 (시간 순 정렬)",
            guideTitle: "UUID 포지 가이드",
            guideIntro: "UUID 포지는 신뢰할 수 있고 규정을 준수하며 대량의 UUID 생성이 필요한 개발자를 위해 설계된 전문가용 도구입니다.",
            featuresTitle: "핵심 기능",
            f1: "v1, v4(표준) 및 새로운 v7(시간 순 정렬)을 포함한 다양한 UUID 버전을 지원합니다.",
            f2: "다양한 포맷 옵션과 함께 최대 1000개의 UUID를 즉시 대량 생성합니다.",
            f3: "영구적인 로컬 히스토리를 통해 최근 생성된 배치를 항상 확인할 수 있습니다.",
            proTipsTitle: "고급 프로 팁",
            pt1: "데이터베이스 기본 키로 UUIDv7 사용: UUIDv4와 달리 UUIDv7은 처음 48비트에 Unix 타임스탬프를 포함하므로 시간 순서대로 정렬됩니다. 이는 고유성을 유지하면서 데이터베이스 삽입 성능과 인덱스 지역성(B-Tree 친화적)을 크게 향상시킵니다. 최신 애플리케이션에 권장되는 선택입니다.",
            pt2: "시드 데이터 대량 생성: 테스트 데이터나 시더를 위해 엄청난 양의 고유 식별자가 필요하신가요? 수량 슬라이더를 1000으로 설정하고 즉시 새 배치를 생성하세요. 이를 .txt 파일로 쉽게 다운로드하여 스크립트에서 파싱할 수 있습니다.",
            pt3: "일관된 포맷팅: 일부 레거시 시스템이나 특정 데이터베이스(SQL Server 또는 특정 ORM 등)는 UUID를 중괄호로 묶거나({123e4567-e89b-12d3-a456-426614174000}) 하이픈 없는 순수 16진수 문자열로 저장해야 합니다. 포맷 토글을 사용하여 사용자 정의 정규화 코드를 작성하지 않고도 대상 시스템의 요구 사항을 즉시 준수할 수 있습니다.",
            faqTitle: "자주 묻는 질문",
            q1: "UUID v4와 v7의 차이점은 무엇인가요?",
            a1: "UUID v4는 완전히 무작위이므로 일반적인 용도에 적합합니다. UUID v7에는 Unix 타임스탬프가 포함되어 있어 생성 시간별로 정렬할 수 있으며, 이는 데이터베이스 인덱싱 및 성능에 매우 유용합니다.",
            q2: "생성된 UUID는 안전한가요?",
            a2: "예, UUID 포지는 v4 및 v7에 대해 암호학적으로 안전한 난수 생성기를 사용하는 업계 표준 `uuid` 라이브러리를 사용합니다.",
            q3: "오프라인에서 UUID를 생성할 수 있나요?",
            a3: "예, 이 도구는 브라우저에서 완전히 실행됩니다. 어떤 데이터도 서버로 전송되지 않습니다.",
            metaTitle: "UUID 포지 - 대량 UUID 생성기 및 포맷터",
            metaDescription: "UUIDv1, UUIDv4 및 UUIDv7을 즉시 생성하세요. 대량 생성, 사용자 지정 포맷팅 및 로컬 히스토리 기능을 제공합니다. 개발자에게 완벽한 도구입니다."
        }
    };

    $: t = dict[lang] || dict['en'];

    let version: 'v1' | 'v4' | 'v7' = 'v4';
    let quantity = 5;
    let isUppercase = false;
    let includeBraces = false;
    let removeHyphens = false;
    let generatedUuids: string[] = [];
    let rawUuids: string[] = [];
    let isCopied = false;
    let history: any[] = [];
    let historyLoading = true;

    // Load History
    const loadHistory = async () => {
        try {
            const rawHistory = await db.toolWorkspace
                .where('toolId')
                .equals('uuid-forge')
                .toArray();
            history = rawHistory.sort((a, b) => b.lastModified - a.lastModified);
        } catch (e) {
            console.error(e);
        } finally {
            historyLoading = false;
        }
    };

    onMount(() => {
        generate();
        loadHistory();
    });

    $: {
        generatedUuids = rawUuids.map(u => {
            let res = u;
            if (isUppercase) res = res.toUpperCase();
            if (removeHyphens) res = res.replace(/-/g, '');
            if (includeBraces) res = `{${res}}`;
            return res;
        });
    }

    const generate = async () => {
        if (quantity > 1000) quantity = 1000;
        if (quantity < 1) quantity = 1;
        let rawBatch: string[] = [];
        for (let i = 0; i < quantity; i++) {
            let u = '';
            if (version === 'v1') u = v1();
            else if (version === 'v4') u = v4();
            else if (version === 'v7') u = v7();

            rawBatch.push(u);
        }
        rawUuids = rawBatch;

        try {
            await db.toolWorkspace.add({
                toolId: 'uuid-forge',
                name: `${version.toUpperCase()} x${quantity}`,
                data: { raw: rawBatch, options: { isUppercase, includeBraces, removeHyphens } },
                lastModified: Date.now()
            });
            await loadHistory();
        } catch (e) {
            console.error(e);
        }
    };

    const copyAll = async () => {
        if (!generatedUuids.length) return;
        await navigator.clipboard.writeText(generatedUuids.join('\n'));
        isCopied = true;
        setTimeout(() => (isCopied = false), 2000);
    };

    const downloadTxt = () => {
        if (!generatedUuids.length) return;
        const blob = new Blob([generatedUuids.join('\n')], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uuid-forge-${version}-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const clearHistory = async () => {
        try {
            const items = await db.toolWorkspace.where('toolId').equals('uuid-forge').toArray();
            const keys = items.map(i => i.id).filter(id => id !== undefined) as number[];
            await db.toolWorkspace.bulkDelete(keys);
            history = [];
        } catch (e) {
            console.error(e);
        }
    };

    const loadHistoryItem = (item: any) => {
        if(item && item.data && item.data.raw) {
            rawUuids = item.data.raw;
            if (item.data.options) {
                isUppercase = item.data.options.isUppercase;
                includeBraces = item.data.options.includeBraces;
                removeHyphens = item.data.options.removeHyphens;
            }
        } else if (item && item.data && item.data.uuids) {
            // Fallback for older entries without 'raw'
            rawUuids = item.data.uuids;
        }
    };

    const deleteHistoryItem = async (id: number) => {
        try {
            await db.toolWorkspace.delete(id);
            await loadHistory();
        } catch (e) {
            console.error(e);
        }
    };

    $: jsonLd = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": t.title,
        "description": t.description,
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        }
    };
</script>

<svelte:head>
    <title>{t.metaTitle}</title>
    <meta name="description" content="{t.metaDescription}" />
    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `<script type="application/ld+json">${JSON.stringify(jsonLd)}</script>`}
</svelte:head>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 pb-20">
    <!-- Header -->
    <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
            <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-4">
                {t.title}
            </h1>
            <p class="mt-2 text-lg text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
                {t.description}
            </p>
        </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <!-- Left Col: Controls -->
            <div class="lg:col-span-1 space-y-6">
                <!-- Settings Card -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 class="text-lg font-semibold flex items-center gap-2 mb-6 text-slate-800 dark:text-slate-200">
                        <Settings2 size={20} class="text-indigo-500" />
                        {t.options}
                    </h2>

                    <!-- Version Selection -->
                    <div class="space-y-3 mb-6">
                        <label for="version-select" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.version}</label>
                        <select id="version-select" bind:value={version} class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200 transition-colors">
                            <option value="v4">{t.v4}</option>
                            <option value="v1">{t.v1}</option>
                            <option value="v7">{t.v7}</option>
                        </select>
                    </div>

                    <!-- Quantity -->
                    <div class="space-y-3 mb-6">
                        <label for="quantity-input" class="block text-sm font-medium text-slate-700 dark:text-slate-300">{t.quantity} ({quantity})</label>
                        <div class="flex items-center gap-4">
                            <input id="quantity-input" type="range" bind:value={quantity} min="1" max="1000" class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                            <input type="number" bind:value={quantity} min="1" max="1000" class="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500" />
                        </div>
                    </div>

                    <!-- Toggles -->
                    <div class="space-y-4 mb-8">
                        <label class="flex items-center gap-3 cursor-pointer group">
                            <div class="relative">
                                <input type="checkbox" bind:checked={isUppercase} class="sr-only" />
                                <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer transition-colors {isUppercase ? 'bg-indigo-600 dark:bg-indigo-500' : ''}"></div>
                                <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform {isUppercase ? 'translate-x-5' : ''}"></div>
                            </div>
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t.uppercase}</span>
                        </label>

                        <label class="flex items-center gap-3 cursor-pointer group">
                            <div class="relative">
                                <input type="checkbox" bind:checked={includeBraces} class="sr-only" />
                                <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer transition-colors {includeBraces ? 'bg-indigo-600 dark:bg-indigo-500' : ''}"></div>
                                <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform {includeBraces ? 'translate-x-5' : ''}"></div>
                            </div>
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t.braces}</span>
                        </label>

                        <label class="flex items-center gap-3 cursor-pointer group">
                            <div class="relative">
                                <input type="checkbox" bind:checked={removeHyphens} class="sr-only" />
                                <div class="w-11 h-6 bg-slate-200 dark:bg-slate-700 rounded-full peer transition-colors {removeHyphens ? 'bg-indigo-600 dark:bg-indigo-500' : ''}"></div>
                                <div class="absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform {removeHyphens ? 'translate-x-5' : ''}"></div>
                            </div>
                            <span class="text-sm font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white transition-colors">{t.noHyphens}</span>
                        </label>
                    </div>

                    <button on:click={generate} class="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                        <RefreshCw size={20} />
                        {t.generate}
                    </button>
                </div>

                <!-- History Card -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex flex-col max-h-[500px]">
                    <div class="flex justify-between items-center mb-4">
                        <h2 class="text-lg font-semibold flex items-center gap-2 text-slate-800 dark:text-slate-200">
                            <History size={20} class="text-indigo-500" />
                            {t.history}
                        </h2>
                        {#if history.length > 0}
                            <button on:click={clearHistory} class="text-sm text-red-500 hover:text-red-600 dark:hover:text-red-400 font-medium transition-colors flex items-center gap-1">
                                <Trash2 size={14} />
                                <span class="hidden sm:inline">{t.clearHistory}</span>
                            </button>
                        {/if}
                    </div>

                    <div class="flex-1 overflow-y-auto pr-2 space-y-2 min-h-0">
                        {#if historyLoading}
                             <div class="animate-pulse space-y-3">
                                <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                                <div class="h-10 bg-slate-200 dark:bg-slate-700 rounded w-full"></div>
                             </div>
                        {:else if history.length === 0}
                            <div class="text-center py-8 text-slate-500 dark:text-slate-400 text-sm">
                                {t.emptyHistory}
                            </div>
                        {:else}
                            {#each history as item (item.id)}
                                <div class="group flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 dark:bg-slate-900/50 dark:hover:bg-slate-700/50 rounded-xl transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-600 cursor-pointer" on:click={() => loadHistoryItem(item)} on:keydown={(e) => e.key === 'Enter' && loadHistoryItem(item)} role="button" tabindex="0">
                                    <div>
                                        <div class="text-sm font-medium text-slate-800 dark:text-slate-200">{item.name}</div>
                                        <div class="text-xs text-slate-500 dark:text-slate-400">{new Date(item.lastModified).toLocaleString()}</div>
                                    </div>
                                    <button on:click|stopPropagation={() => deleteHistoryItem(item.id)} class="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-2">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            {/each}
                        {/if}
                    </div>
                </div>
            </div>

            <!-- Right Col: Output -->
            <div class="lg:col-span-2 space-y-6 flex flex-col h-full">
                <!-- Action Bar -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-4 flex flex-wrap gap-3">
                    <button on:click={copyAll} class="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-medium transition-all {isCopied ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 ring-2 ring-emerald-500/50' : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200'}">
                        {#if isCopied}
                            <Check size={18} /> {t.copied}
                        {:else}
                            <Copy size={18} /> {t.copy}
                        {/if}
                    </button>
                    <button on:click={downloadTxt} class="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl font-medium transition-colors">
                        <Download size={18} /> {t.download}
                    </button>
                    <button on:click={() => { generatedUuids = []; }} class="flex-none flex items-center justify-center gap-2 py-3 px-4 text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 dark:hover:text-red-400 rounded-xl font-medium transition-colors" aria-label={t.clear} title={t.clear}>
                        <Trash2 size={18} />
                    </button>
                </div>

                <!-- Textarea -->
                <div class="flex-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden relative min-h-[400px]">
                    <div class="absolute inset-0 p-4">
                        <textarea
                            readonly
                            value={generatedUuids.join('\n')}
                            class="w-full h-full resize-none bg-transparent font-mono text-sm sm:text-base leading-relaxed text-slate-800 dark:text-slate-300 focus:outline-none custom-scrollbar whitespace-pre-wrap break-all"
                            placeholder="Generated UUIDs will appear here..."
                        ></textarea>
                    </div>
                    <!-- Stats overlay -->
                    <div class="absolute bottom-4 right-4 bg-slate-900/80 dark:bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-lg shadow-lg font-medium">
                        {generatedUuids.length} / 1000
                    </div>
                </div>
            </div>
        </div>

        <!-- Documentation & SEO -->
        <div class="mt-16 bg-white dark:bg-slate-800 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div class="p-8 md:p-12">
                <div class="max-w-4xl mx-auto space-y-12">
                    <section>
                        <h2 class="text-3xl font-bold text-slate-900 dark:text-white mb-6">{t.guideTitle}</h2>
                        <p class="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8">{t.guideIntro}</p>

                        <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">{t.featuresTitle}</h3>
                        <ul class="space-y-4">
                            <li class="flex gap-4">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">1</div>
                                <p class="text-slate-600 dark:text-slate-400 pt-1">{t.f1}</p>
                            </li>
                            <li class="flex gap-4">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">2</div>
                                <p class="text-slate-600 dark:text-slate-400 pt-1">{t.f2}</p>
                            </li>
                            <li class="flex gap-4">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400">3</div>
                                <p class="text-slate-600 dark:text-slate-400 pt-1">{t.f3}</p>
                            </li>
                        </ul>
                    </section>


                    <section class="border-t border-slate-200 dark:border-slate-700 pt-12">
                        <h3 class="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-4">{t.proTipsTitle}</h3>
                        <ul class="space-y-4">
                            <li class="flex gap-4">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">💡</div>
                                <p class="text-slate-600 dark:text-slate-400 pt-1">{t.pt1}</p>
                            </li>
                            <li class="flex gap-4">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">💡</div>
                                <p class="text-slate-600 dark:text-slate-400 pt-1">{t.pt2}</p>
                            </li>
                            <li class="flex gap-4">
                                <div class="flex-shrink-0 w-8 h-8 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400">💡</div>
                                <p class="text-slate-600 dark:text-slate-400 pt-1">{t.pt3}</p>
                            </li>
                        </ul>
                    </section>

                    <section class="border-t border-slate-200 dark:border-slate-700 pt-12">
                        <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-8">{t.faqTitle}</h2>
                        <div class="space-y-6">
                            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6">
                                <h4 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.q1}</h4>
                                <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{t.a1}</p>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6">
                                <h4 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.q2}</h4>
                                <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{t.a2}</p>
                            </div>
                            <div class="bg-slate-50 dark:bg-slate-900/50 rounded-2xl p-6">
                                <h4 class="text-lg font-semibold text-slate-900 dark:text-white mb-3">{t.q3}</h4>
                                <p class="text-slate-600 dark:text-slate-400 leading-relaxed">{t.a3}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    </div>
</div>

<div class="mt-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="uuid-forge" currentCategory="development" />
</div>

<style>
    /* Custom Scrollbar for Textarea */
    .custom-scrollbar::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #cbd5e1;
        border-radius: 4px;
    }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #475569;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #94a3b8;
    }
    :global(.dark) .custom-scrollbar::-webkit-scrollbar-thumb:hover {
        background: #64748b;
    }
</style>
