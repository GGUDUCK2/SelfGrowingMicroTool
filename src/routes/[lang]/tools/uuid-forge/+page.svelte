<script lang="ts">
    import { page } from '$app/stores';
import Head from '$lib/components/Head.svelte';
    import { v1, v4, v7 } from 'uuid';
    import { db } from '$lib/db';
    import { workspace, type ToolHistoryItem } from '$lib/db/workspace';
    import { onMount } from 'svelte';
    import { Copy, Download, RefreshCw, Trash2, History, Check, Settings2, Share2, Search, Code, Database, Table } from '@lucide/svelte';
    import RelatedTools from '$lib/components/RelatedTools.svelte';
    import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import FAQSection from '$lib/components/FAQSection.svelte';

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

            metaDescription: "Generate UUIDv1, UUIDv4, and UUIDv7 instantly. Features bulk generation, custom formatting, and local history. Perfect for developers.",
            presetsTitle: "Smart Presets",
            presetDb: "Standard DB Key",
            presetLegacy: "Legacy Windows GUID",
            presetRaw: "Raw Hex String",
            shortcutGen: "Generate",
            shortcutCopy: "Copy All",
            shortcutClear: "Clear Output",
            share: "Share",
            tabGenerate: "Generate",
            tabAnalyze: "Analyze",
            analyzePlaceholder: "Paste UUIDs here to analyze...",
            analyzeButton: "Analyze UUIDs",
            analyzeResults: "Analysis Results",
            valid: "Valid",
            invalid: "Invalid",
            versionDetails: "Version Details",
            variantDetails: "Variant Details",
            timestampExtracted: "Extracted Timestamp",
            exportAs: "Export As",
            exportJson: "JSON Array",
            exportSql: "SQL Inserts",
            exportCsv: "CSV",
            tableName: "Table Name (for SQL)",
            columnName: "Column Name (for SQL/CSV)",
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

            metaDescription: "UUIDv1, UUIDv4 및 UUIDv7을 즉시 생성하세요. 대량 생성, 사용자 지정 포맷팅 및 로컬 히스토리 기능을 제공합니다. 개발자에게 완벽한 도구입니다.",
            presetsTitle: "스마트 프리셋",
            presetDb: "표준 DB 키",
            presetLegacy: "레거시 Windows GUID",
            presetRaw: "순수 16진수 문자열",
            shortcutGen: "생성하기",
            shortcutCopy: "모두 복사",
            shortcutClear: "결과 지우기",
            share: "공유",
            tabGenerate: "생성",
            tabAnalyze: "분석",
            analyzePlaceholder: "분석할 UUID를 여기에 붙여넣으세요...",
            analyzeButton: "UUID 분석",
            analyzeResults: "분석 결과",
            valid: "유효함",
            invalid: "유효하지 않음",
            versionDetails: "버전 세부 정보",
            variantDetails: "변형 세부 정보",
            timestampExtracted: "추출된 타임스탬프",
            exportAs: "내보내기 포맷",
            exportJson: "JSON 배열",
            exportSql: "SQL Insert",
            exportCsv: "CSV",
            tableName: "테이블 이름 (SQL용)",
            columnName: "컬럼 이름 (SQL/CSV용)",
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
    let history: ToolHistoryItem[] = [];
    let historyLoading = true;

    let activeTab: 'generate' | 'analyze' = 'generate';
    let analyzeInput = '';
        interface AnalyzeResult {
        original: string;
        isValid: boolean;
        version: string;
        variant: string;
        timestamp: string | null;
    }
    let analyzeResults: AnalyzeResult[] = [];
    let exportFormat: 'txt' | 'json' | 'sql' | 'csv' = 'txt';
    let sqlTableName = 'users';
    let sqlColumnName = 'id';

    const analyzeUuids = () => {
        const uuids = analyzeInput.split(/\s+/).filter(u => u.trim() !== '');
        analyzeResults = uuids.map(u => {
            const clean = u.replace(/[{}]/g, ''); // Remove braces if any
            const isValidLength = clean.length === 36 || clean.length === 32;
            const uuidRegex = /^[0-9a-f]{8}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{4}-?[0-9a-f]{12}$/i;
            const isValid = uuidRegex.test(clean);

            let version = 'Unknown';
            let variant = 'Unknown';
            let timestamp = null;

            if (isValid) {
                const parts = clean.includes('-') ? clean.split('-') : [clean.substring(0,8), clean.substring(8,12), clean.substring(12,16), clean.substring(16,20), clean.substring(20,32)];
                const v = parts[2].charAt(0);
                version = 'v' + v;

                const varChar = parseInt(parts[3].charAt(0), 16);
                if (varChar >= 8 && varChar <= 11) variant = 'RFC 4122';
                else if (varChar >= 12 && varChar <= 13) variant = 'Microsoft';
                else if (varChar >= 14) variant = 'Reserved';
                else variant = 'NCS';

                if (version === 'v1') {
                    // Very basic v1 timestamp extraction (not highly robust but gives an idea)
                    const timeLow = parts[0];
                    const timeMid = parts[1];
                    const timeHiAndVersion = parts[2];
                    const timeHi = timeHiAndVersion.substring(1);

                    const timeTicks = BigInt('0x' + timeHi + timeMid + timeLow);
                    // 100-nanosecond intervals since Oct 15, 1582
                    const epochOffset = BigInt('122192928000000000');
                    if (timeTicks >= epochOffset) {
                        const unixTimeMs = Number((timeTicks - epochOffset) / 10000n);
                        timestamp = new Date(unixTimeMs).toLocaleString();
                    }
                } else if (version === 'v7') {
                    // v7 timestamp extraction
                    const unixTsMs = parseInt(parts[0] + parts[1], 16);
                    timestamp = new Date(unixTsMs).toLocaleString();
                }
            }

            return {
                original: u,
                isValid,
                version,
                variant,
                timestamp
            };
        });
    };

    const downloadAdvanced = () => {
        if (!generatedUuids.length) return;

        let content = '';
        let extension = 'txt';
        let mimeType = 'text/plain';

        if (exportFormat === 'txt') {
            content = generatedUuids.join('\n');
        } else if (exportFormat === 'json') {
            content = JSON.stringify(generatedUuids, null, 2);
            extension = 'json';
            mimeType = 'application/json';
        } else if (exportFormat === 'csv') {
            content = `${sqlColumnName}\n` + generatedUuids.join('\n');
            extension = 'csv';
            mimeType = 'text/csv';
        } else if (exportFormat === 'sql') {
            const values = generatedUuids.map(u => `('${u}')`).join(',\n');
            content = `INSERT INTO ${sqlTableName} (${sqlColumnName}) VALUES\n${values};`;
            extension = 'sql';
            mimeType = 'application/sql';
        }

        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `uuid-forge-${version}-${Date.now()}.${extension}`;
        a.click();
        URL.revokeObjectURL(url);
    };


    // Load History
    const loadHistory = async () => {
        try {
            const rawHistory = await workspace.history
                .where('toolId')
                .equals('uuid-forge')
                .toArray();
            history = rawHistory.sort((a, b) => b.timestamp - a.timestamp);
        } catch (e) {
            console.error(e);
        } finally {
            historyLoading = false;
        }
    };

    onMount(() => {
        window.addEventListener('keydown', handleKeydown);
        return () => window.removeEventListener('keydown', handleKeydown);
    });


    const handleKeydown = (e: KeyboardEvent) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            generate();
        } else if ((e.ctrlKey || e.metaKey) && (e.key === 's' || e.key === 'S')) {
            e.preventDefault();
            copyAll();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            generatedUuids = [];
            rawUuids = [];
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


    const applyPreset = (presetType: 'db' | 'legacy' | 'raw') => {
        if (presetType === 'db') {
            version = 'v7';
            quantity = 5;
            isUppercase = false;
            includeBraces = false;
            removeHyphens = false;
        } else if (presetType === 'legacy') {
            version = 'v4';
            quantity = 3;
            isUppercase = true;
            includeBraces = true;
            removeHyphens = false;
        } else if (presetType === 'raw') {
            version = 'v4';
            quantity = 10;
            isUppercase = false;
            includeBraces = false;
            removeHyphens = true;
        }
        generate();
    };

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
            await workspace.history.add({
                toolId: 'uuid-forge',
                name: `${version.toUpperCase()} x${quantity}`,
                data: { raw: rawBatch, options: { isUppercase, includeBraces, removeHyphens } },
                timestamp: Date.now()
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


    const shareTxt = async () => {
        if (!generatedUuids.length) return;
        const text = generatedUuids.join('\n');
        if (navigator.share) {
            try {
                await navigator.share({
                    title: 'UUID Forge Results',
                    text: text
                });
            } catch (e) {
                console.error('Error sharing', e);
            }
        } else {
            await copyAll();
        }
    };


    const clearHistory = async () => {
        try {
            const items = await workspace.history.where('toolId').equals('uuid-forge').toArray();
            const keys = items.map(i => i.id).filter(id => id !== undefined) as number[];
            await workspace.history.bulkDelete(keys);
            history = [];
        } catch (e) {
            console.error(e);
        }
    };

    const loadHistoryItem = (item: ToolHistoryItem) => {
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
            await workspace.history.delete(id);
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
        },
        "featureList": [
            "UUID v1, v4, v7 Generation",
            "Bulk UUID Generator",
            "Custom Formatting (Braces, Hyphens, Uppercase)",
            "Local History & Presets",
            "UUID Analyzer & Validation",
            "Unix Timestamp Extraction (v1 & v7)",
            "Advanced Export (JSON, SQL, CSV)"
        ]
    };
</script>


<svelte:head>
    <!-- Twitter Card -->
    <link rel="canonical" href="https://microfactory.app/{lang}/tools/uuid-forge" />
    <link rel="alternate" hreflang="en" href="https://microfactory.app/en/tools/uuid-forge" />
    <link rel="alternate" hreflang="ko" href="https://microfactory.app/ko/tools/uuid-forge" />
    <link rel="alternate" hreflang="x-default" href="https://microfactory.app/en/tools/uuid-forge" />

    <!-- eslint-disable-next-line svelte/no-at-html-tags -->
    {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(jsonLd)}</scr` + `ipt>`}
</svelte:head>

<Head
  title={t.metaTitle || "UUID Forge - Online Generator"}
  description={t.metaDescription || "Generate bulk UUIDs (v1, v4, v7) instantly"}
  url={$page.url.origin + "/" + lang + "/tools/uuid-forge"}
  keywords="uuid, generator, guid, developer"
/>

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

    <!-- Tabs -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div class="flex space-x-1 bg-slate-200/50 dark:bg-slate-800/50 p-1 rounded-xl w-fit">
            <button
                class="px-6 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'generate' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                on:click={() => activeTab = 'generate'}
            >
                <RefreshCw size={16} class="inline-block mr-2" />
                {t.tabGenerate}
            </button>
            <button
                class="px-6 py-2.5 rounded-lg text-sm font-medium transition-all {activeTab === 'analyze' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                on:click={() => activeTab = 'analyze'}
            >
                <Search size={16} class="inline-block mr-2" />
                {t.tabAnalyze}
            </button>
        </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {#if activeTab === 'generate'}
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
                        <select id="version-select" aria-label={t.version} bind:value={version} class="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200 transition-colors">
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
                            <input type="number" aria-label={t.quantity} bind:value={quantity} min="1" max="1000" class="w-20 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-center focus:ring-2 focus:ring-indigo-500" />
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


                <!-- Smart Examples Card -->
                <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 class="text-lg font-semibold mb-4 text-slate-800 dark:text-slate-200">
                        {t.presetsTitle}
                    </h2>
                    <div class="flex flex-col gap-2">
                        <button on:click={() => applyPreset('db')} class="text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
                            <div class="font-medium">{t.presetDb}</div>
                            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">v7, 5 items</div>
                        </button>
                        <button on:click={() => applyPreset('legacy')} class="text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
                            <div class="font-medium">{t.presetLegacy}</div>
                            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">v4, Uppercase, Braces</div>
                        </button>
                        <button on:click={() => applyPreset('raw')} class="text-left px-4 py-3 rounded-xl bg-slate-50 hover:bg-indigo-50 dark:bg-slate-900/50 dark:hover:bg-indigo-900/30 text-slate-700 dark:text-slate-300 transition-colors border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800">
                            <div class="font-medium">{t.presetRaw}</div>
                            <div class="text-xs text-slate-500 dark:text-slate-400 mt-1">v4, No Hyphens, 10 items</div>
                        </button>
                    </div>
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
                                        <div class="text-xs text-slate-500 dark:text-slate-400">{new Date(item.timestamp).toLocaleString()}</div>
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

                    <button on:click={shareTxt} class="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl font-medium transition-colors">
                        <Share2 size={18} /> {t.share}
                    </button>
                    <button on:click={downloadAdvanced}
 class="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-200 rounded-xl font-medium transition-colors">
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


                <!-- Advanced Export Options -->
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-end">
                    <div class="flex-1 min-w-[150px]">
                        <label for="export-format" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{t.exportAs}</label>
                        <select id="export-format" aria-label={t.exportAs} bind:value={exportFormat} class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-colors">
                            <option value="txt">.txt (Raw)</option>
                            <option value="json">.json ({t.exportJson})</option>
                            <option value="csv">.csv ({t.exportCsv})</option>
                            <option value="sql">.sql ({t.exportSql})</option>
                        </select>
                    </div>
                    {#if exportFormat === 'sql' || exportFormat === 'csv'}
                        {#if exportFormat === 'sql'}
                        <div class="flex-1 min-w-[150px]">
                            <label for="sql-table" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{t.tableName}</label>
                            <input id="sql-table" type="text" bind:value={sqlTableName} class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-colors" />
                        </div>
                        {/if}
                        <div class="flex-1 min-w-[150px]">
                            <label for="sql-col" class="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1.5">{t.columnName}</label>
                            <input id="sql-col" type="text" bind:value={sqlColumnName} class="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 dark:text-slate-200 transition-colors" />
                        </div>
                    {/if}
                </div>


                <!-- Keyboard Shortcuts Help -->
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex flex-wrap gap-4 text-xs text-slate-500 dark:text-slate-400 justify-center">
                    <div class="flex items-center gap-1.5"><kbd class="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md font-sans">⌘/Ctrl + Enter</kbd> {t.shortcutGen}</div>
                    <div class="flex items-center gap-1.5"><kbd class="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md font-sans">⌘/Ctrl + S</kbd> {t.shortcutCopy}</div>
                    <div class="flex items-center gap-1.5"><kbd class="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-md font-sans">Esc</kbd> {t.shortcutClear}</div>
                </div>
            </div>

        </div>

        {/if}


        {#if activeTab === 'analyze'}
        <div class="space-y-6">
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <textarea
                    bind:value={analyzeInput}
                    class="w-full h-48 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-xl p-4 font-mono text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:text-slate-200 transition-colors custom-scrollbar whitespace-pre-wrap break-all"
                    placeholder={t.analyzePlaceholder}
                    aria-label={t.analyzePlaceholder}
                ></textarea>
                <div class="mt-4 flex justify-end">
                    <button on:click={analyzeUuids} class="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.98]">
                        <Search size={18} />
                        {t.analyzeButton}
                    </button>
                </div>
            </div>

            {#if analyzeResults.length > 0}
            <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                <div class="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h2 class="text-lg font-semibold text-slate-800 dark:text-slate-200">
                        {t.analyzeResults}
                    </h2>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm text-left">
                        <thead class="text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 uppercase border-b border-slate-200 dark:border-slate-700">
                            <tr>
                                <th class="px-6 py-4">UUID</th>
                                <th class="px-6 py-4">Status</th>
                                <th class="px-6 py-4">Version</th>
                                <th class="px-6 py-4">Variant</th>
                                <th class="px-6 py-4">Extracted Time</th>
                            </tr>
                        </thead>
                        <tbody>
                            {#each analyzeResults as res (res.original)}
                            <tr class="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td class="px-6 py-4 font-mono text-slate-700 dark:text-slate-300">{res.original}</td>
                                <td class="px-6 py-4">
                                    {#if res.isValid}
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                            {t.valid}
                                        </span>
                                    {:else}
                                        <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
                                            {t.invalid}
                                        </span>
                                    {/if}
                                </td>
                                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{res.version}</td>
                                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{res.variant}</td>
                                <td class="px-6 py-4 text-slate-600 dark:text-slate-400">{res.timestamp || '-'}</td>
                            </tr>
                            {/each}
                        </tbody>
                    </table>
                </div>
            </div>
            {/if}
        </div>
        {/if}


        <!-- Documentation & SEO -->
        <div class="mt-16 space-y-12">
            <GuideSection
                title={t.guideTitle}
                intro={t.guideIntro}
                featuresTitle={t.featuresTitle}
                f1={t.f1}
                f2={t.f2}
                f3={t.f3}
                tipsTitle={t.proTipsTitle}
                tip1={t.pt1}
                tip2={t.pt2}
                tip3={t.pt3}
            />

            <AdPlaceholder />

            <FAQSection
                title={t.faqTitle}
                items={[
                    { q: t.q1, a: t.a1 },
                    { q: t.q2, a: t.a2 },
                    { q: t.q3, a: t.a3 }
                ]}
            />
        </div>

        <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="uuid-forge" currentCategory="dev" />
    </div>
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
