<script lang="ts">
    import { onMount } from 'svelte';
    import { getDictionary } from '$lib/dictionaries';
    import { fade, slide } from 'svelte/transition';
    import { Plus, Download, Copy, Trash2, Save, Share2, Users, Star, Calendar as CalendarIcon, ArrowLeft, ArrowRight, RotateCcw } from 'lucide-svelte';
    import { db, type TimeZoneLocation, type TeamGroup } from '$lib/db/chrono-shift';
    import { TimeEngine } from '$lib/utils/chrono-shift/time-engine';
    import LocationCard from './LocationCard.svelte';
    import Timeline from './Timeline.svelte';
    import FAQSection from '$lib/components/FAQSection.svelte';
    import GuideSection from '$lib/components/GuideSection.svelte';
    import { liveQuery } from 'dexie';
    import { format, addDays, addMinutes } from 'date-fns';
    import { nanoid } from 'nanoid';

    export let data;
    $: dict = getDictionary(data.lang);

    // Safety check for dictionary entry
    $: t = dict?.tools?.chronoShift || {
        title: "Chrono Shift",
        description: "Time Zone Architect",
        home: "My Time",
        excellent: "Excellent",
        good: "Good",
        poor: "Poor",
        meetingTime: "Meeting Time",
        copied: "Copied!",
        overlap: "Overlap Score",
        addLocation: "Add Location",
        searchPlaceholder: "Search...",
        goldenHour: "Golden Hour",
        share: "Share",
        copyInvite: "Copy Invite",
        downloadIcs: "Download .ics",
        savedGroups: "Saved Groups",
        loadGroup: "Load",
        delete: "Delete",
        noGroups: "No groups saved.",
        teams: {
            title: "Team Presets",
            save: "Save Team",
            namePlaceholder: "Team Name",
            saved: "Team saved!"
        },
        guide: {
            title: "Guide",
            intro: "Guide content loading...",
            featuresTitle: "Features",
            f1: "", f2: "", f3: "",
            tipsTitle: "Pro Tips",
            tip1: "", tip2: "", tip3: ""
        },
        faqTitle: "FAQ",
        q1: "", a1: "", q2: "", a2: "", q3: "", a3: ""
    };

    // State
    let selectedDate = new Date(); // This acts as the "Master Time"
    let locations: TimeZoneLocation[] = [];
    let searchQuery = '';
    let showTeamModal = false;
    let teamName = '';
    let savedTeams = liveQuery(() => db.teams.toArray());

    // Default to local time zone on mount
    onMount(async () => {
        const localZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

        // Try to load from URL params
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('state');
        if (encoded) {
            try {
                const decoded = JSON.parse(decodeURIComponent(escape(atob(encoded))));
                if (Array.isArray(decoded)) {
                    locations = decoded;
                    return;
                }
            } catch (e) {
                console.error("Failed to parse state", e);
            }
        }

        // Default start
        if (locations.length === 0) {
            locations = [{
                id: nanoid(),
                zoneName: localZone,
                customLabel: t.home
            }];
        }
    });

    // Computed
    $: allZones = TimeEngine.getAvailableTimeZones();
    $: filteredZones = searchQuery
        ? allZones.filter(z => z.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
        : [];

    $: overlapScore = TimeEngine.calculateOverlapScore(locations.map(l => l.zoneName), selectedDate);

    $: overlapColor = overlapScore >= 80 ? 'text-green-500' : overlapScore >= 50 ? 'text-yellow-500' : 'text-red-500';
    $: overlapLabel = overlapScore >= 80 ? t.excellent : overlapScore >= 50 ? t.good : t.poor;

    $: faqItems = [
        { q: t.q1, a: t.a1 },
        { q: t.q2, a: t.a2 },
        { q: t.q3, a: t.a3 }
    ].filter(i => i.q && i.a);

    // Methods
    function addLocation(zone: string) {
        if (locations.some(l => l.zoneName === zone)) return;
        locations = [...locations, {
            id: nanoid(),
            zoneName: zone,
            customLabel: zone.split('/').pop()?.replace('_', ' ')
        }];
        searchQuery = '';
    }

    function removeLocation(id: string) {
        locations = locations.filter(l => l.id !== id);
    }

    function handleDateChange(d: Date) {
        selectedDate = d;
    }

    function shiftDay(days: number) {
        selectedDate = addDays(selectedDate, days);
    }

    function setNow() {
        selectedDate = new Date();
    }

    function findGoldenHour() {
        // Simple algorithm: check next 24 hours for best overlap
        let bestScore = -1;
        let bestTime = selectedDate;

        // Check every hour for the next 24h
        const start = new Date(selectedDate);
        start.setMinutes(0, 0, 0); // round to hour

        for(let i=0; i<24; i++) {
            const check = addMinutes(start, i * 60);
            const score = TimeEngine.calculateOverlapScore(locations.map(l => l.zoneName), check);
            if (score > bestScore) {
                bestScore = score;
                bestTime = check;
            }
        }
        selectedDate = bestTime;
    }

    async function saveTeam() {
        if (!teamName) return;
        await db.teams.add({
            name: teamName,
            locations: locations,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        teamName = '';
        showTeamModal = false;
        alert(t.teams.saved);
    }

    async function loadTeam(team: TeamGroup) {
        locations = team.locations;
        showTeamModal = false;
    }

    async function deleteTeam(id: number) {
        await db.teams.delete(id);
    }

    function copyInvite() {
        const times = locations.map(l => {
            const slot = TimeEngine.getSlotDetails(l.zoneName, selectedDate);
            return `${l.customLabel || l.zoneName}: ${slot.formattedTime} (${slot.formattedDate})`;
        }).join('\n');

        const text = `${t.meetingTime}\n\n${times}\n\nGenerated with Chrono Shift`;
        navigator.clipboard.writeText(text);
        alert(t.copied);
    }

    function shareLink() {
        const state = btoa(unescape(encodeURIComponent(JSON.stringify(locations))));
        const url = `${window.location.origin}${window.location.pathname}?state=${state}`;
        navigator.clipboard.writeText(url);
        alert(t.copied);
    }

    // JSON-LD Schema
    $: softwareSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": t.title,
        "description": t.description,
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Any",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD"
        },
        "featureList": [
            "Time Zone Visualization",
            "Overlap Calculation",
            "Golden Hour Finder",
            "Team Presets",
            "ICS Export"
        ]
    };

    $: breadcrumbSchema = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [{
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://web-factory.vercel.app/${data.lang}`
      },{
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://web-factory.vercel.app/${data.lang}#tools`
      },{
        "@type": "ListItem",
        "position": 3,
        "name": "Chrono Shift",
        "item": `https://web-factory.vercel.app/${data.lang}/tools/chrono-shift`
      }]
    };

    // ics generation (simplified)
    function downloadIcs() {
        const formatICSDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const start = formatICSDate(selectedDate);
        const end = formatICSDate(addMinutes(selectedDate, 60)); // 1 hour default

        const content = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'PRODID:-//MicroFactory//ChronoShift//EN',
            'BEGIN:VEVENT',
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:Meeting (Chrono Shift)`,
            `DESCRIPTION:Scheduled via Chrono Shift`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'meeting.ics';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
</script>

<svelte:head>
    <title>{t.title} - MicroFactory</title>
    <meta name="description" content={t.description} />
    <meta name="keywords" content="time zone converter, world clock, meeting planner, overlap scheduler, time zone map, global meeting, team scheduler, golden hour, dst calculator, international meeting" />

    <!-- Open Graph -->
    <meta property="og:title" content={t.title} />
    <meta property="og:description" content={t.description} />
    <meta property="og:type" content="website" />
    <meta property="og:url" content="https://web-factory.vercel.app/{data.lang}/tools/chrono-shift" />

    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={t.title} />
    <meta name="twitter:description" content={t.description} />

    {@html `<script type="application/ld+json">${JSON.stringify(softwareSchema)}</script>`}
    {@html `<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`}
</svelte:head>

<div class="max-w-6xl mx-auto space-y-8 pb-20 px-4 sm:px-6">
    <!-- Header -->
    <div class="text-center space-y-4 pt-8">
        <h1 class="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            {t.title}
        </h1>
        <p class="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            {t.description}
        </p>
    </div>

    <!-- Controls & Viz -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <!-- Toolbar -->
        <div class="p-4 border-b border-slate-200 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between bg-slate-50 dark:bg-slate-800/50">
            <div class="flex items-center gap-4">
                <div class="flex items-center bg-white dark:bg-slate-900 rounded-lg border border-slate-300 dark:border-slate-600 p-1">
                    <button class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" on:click={() => shiftDay(-1)} aria-label="Previous Day">
                        <ArrowLeft size={18} />
                    </button>
                    <div class="px-4 font-mono font-medium min-w-[140px] text-center">
                        {format(selectedDate, 'yyyy-MM-dd')}
                    </div>
                    <button class="min-h-[44px] min-w-[44px] flex items-center justify-center p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md" on:click={() => shiftDay(1)} aria-label="Next Day">
                        <ArrowRight size={18} />
                    </button>
                </div>
                <button class="btn-secondary text-sm flex items-center gap-2" on:click={setNow}>
                    <RotateCcw size={14} /> Now
                </button>
            </div>

            <div class="flex items-center gap-4">
                <div class="flex flex-col items-end">
                    <span class="text-xs text-slate-500 uppercase font-semibold tracking-wider">{t.overlap}</span>
                    <div class="flex items-center gap-2">
                        <span class="text-2xl font-bold {overlapColor}">{overlapScore}%</span>
                        <span class="text-sm font-medium text-slate-600 dark:text-slate-400">({overlapLabel})</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- Interactive Timeline -->
        <div class="p-6 bg-slate-100 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
             <Timeline value={selectedDate} onChange={handleDateChange} />
             <div class="mt-2 flex justify-between text-xs text-slate-500">
                 <span>00:00</span>
                 <span>12:00</span>
                 <span>23:59</span>
             </div>
        </div>

        <!-- Locations Grid -->
        <div class="p-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {#each locations as loc (loc.id)}
                <div transition:slide|local>
                    <LocationCard
                        location={loc}
                        utcDate={selectedDate}
                        onRemove={() => removeLocation(loc.id)}
                        isHome={false}
                    />
                </div>
            {/each}

            <!-- Add New Card -->
            <div class="relative group min-h-[120px] rounded-xl border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center p-4 hover:border-indigo-500 transition-colors">
                <div class="text-center w-full">
                    <div class="mb-3 mx-auto w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 group-hover:text-indigo-500 transition-colors">
                        <Plus size={24} />
                    </div>
                    <p class="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">{t.addLocation}</p>

                    <div class="relative w-full max-w-[200px] mx-auto">
                        <input
                            type="text"
                            bind:value={searchQuery}
                            placeholder={t.searchPlaceholder}
                            class="w-full text-sm rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-800 focus:ring-indigo-500 focus:border-indigo-500 py-1"
                        />
                        {#if searchQuery && filteredZones.length > 0}
                            <div class="absolute bottom-full left-0 right-0 mb-1 bg-white dark:bg-slate-800 rounded-md shadow-xl border border-slate-200 dark:border-slate-700 max-h-48 overflow-y-auto z-50">
                                {#each filteredZones as zone}
                                    <button
                                        class="w-full text-left px-3 py-2 text-xs hover:bg-indigo-50 dark:hover:bg-indigo-900/30 truncate"
                                        on:click={() => addLocation(zone)}
                                    >
                                        {zone}
                                    </button>
                                {/each}
                            </div>
                        {/if}
                    </div>
                </div>
            </div>
        </div>

        <!-- Action Bar -->
        <div class="p-4 bg-slate-50 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-3 justify-between">
            <div class="flex gap-2">
                 <button class="btn-secondary text-sm flex items-center gap-2" on:click={() => showTeamModal = !showTeamModal}>
                    <Users size={16} /> {t.teams.title}
                </button>
                <button class="btn-secondary text-sm flex items-center gap-2" on:click={findGoldenHour}>
                    <Star size={16} class="text-yellow-500" /> {t.goldenHour}
                </button>
            </div>

            <div class="flex gap-2">
                 <button class="btn-secondary text-sm flex items-center gap-2" on:click={shareLink}>
                    <Share2 size={16} /> {t.share}
                </button>
                <button class="btn-secondary text-sm flex items-center gap-2" on:click={copyInvite}>
                    <Copy size={16} /> {t.copyInvite}
                </button>
                 <button class="btn-primary text-sm flex items-center gap-2" on:click={downloadIcs}>
                    <Download size={16} /> {t.downloadIcs}
                </button>
            </div>
        </div>
    </div>

    <!-- Team Modal -->
    {#if showTeamModal}
        <div class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" transition:fade>
            <div class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
                <h3 class="text-xl font-bold mb-4 dark:text-white">{t.teams.title}</h3>

                <div class="mb-6">
                    <label for="team-name" class="block text-sm font-medium mb-1 dark:text-slate-300">{t.teams.save}</label>
                    <div class="flex gap-2">
                        <input
                            id="team-name"
                            type="text"
                            bind:value={teamName}
                            placeholder={t.teams.namePlaceholder}
                            class="flex-1 rounded-md border-slate-300 dark:border-slate-600 dark:bg-slate-700"
                        />
                        <button class="btn-primary" on:click={saveTeam} disabled={!teamName}>
                            <Save size={18} />
                        </button>
                    </div>
                </div>

                <div class="border-t border-slate-200 dark:border-slate-700 pt-4">
                    <h4 class="text-sm font-semibold mb-2 dark:text-slate-400">{t.savedGroups}</h4>
                    {#if $savedTeams && $savedTeams.length > 0}
                        <div class="space-y-2 max-h-48 overflow-y-auto">
                            {#each $savedTeams as team}
                                <div class="flex items-center justify-between p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg group">
                                    <span class="font-medium text-sm dark:text-slate-200">{team.name}</span>
                                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button class="p-1 hover:text-indigo-500" on:click={() => loadTeam(team)} title={t.loadGroup}>
                                            <RotateCcw size={14} />
                                        </button>
                                        <button class="p-1 hover:text-red-500" on:click={() => deleteTeam(team.id!)} title={t.delete}>
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            {/each}
                        </div>
                    {:else}
                        <p class="text-sm text-slate-500 italic">{t.noGroups}</p>
                    {/if}
                </div>

                <div class="mt-6 text-right">
                    <button class="text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300" on:click={() => showTeamModal = false}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Guide Section -->
    <GuideSection
        title={t.guide.title}
        intro={t.guide.intro}
        featuresTitle={t.guide.featuresTitle}
        f1={t.guide.f1}
        f2={t.guide.f2}
        f3={t.guide.f3}
        tipsTitle={t.guide.tipsTitle}
        tip1={t.guide.tip1}
        tip2={t.guide.tip2}
        tip3={t.guide.tip3}
    />

    <FAQSection title={t.faqTitle} items={faqItems} />
</div>

<style>
    .btn-primary {
        @apply min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
    }
    .btn-secondary {
        @apply min-h-[44px] min-w-[44px] inline-flex items-center justify-center px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors;
    }
</style>
