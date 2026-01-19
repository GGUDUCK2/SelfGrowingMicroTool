<script lang="ts">
  import { timeStore } from '$lib/utils/time-forge/store';
  import TimeForge from '$lib/components/time-forge/TimeForge.svelte';
  import Head from '$lib/components/Head.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import { onMount } from 'svelte';
  import { page } from '$app/stores';

  // Load state from URL if present
  onMount(() => {
    const stateParam = $page.url.searchParams.get('state');
    if (stateParam) {
      try {
        const decoded = JSON.parse(atob(stateParam));
        // We need to fetch full city objects based on IDs.
        // Importing POPULAR_CITIES dynamically to avoid bundling issues if this were server-side only
        import('$lib/utils/time-forge/cities').then(({ POPULAR_CITIES }) => {
             const selectedCities = decoded.cities.map((id: string) => POPULAR_CITIES.find(c => c.id === id)).filter(Boolean);
             if (selectedCities.length > 0) {
                 timeStore.loadState({
                     selectedCities,
                     homeCityId: decoded.home,
                     referenceTime: new Date(decoded.time)
                 });
             }
        });
      } catch (e) {
        console.error('Failed to parse state from URL', e);
      }
    }
  });

  const faqs = [
    {
      question: "How does the Time Slider work?",
      answer: "The slider adjusts the reference time for ALL selected cities simultaneously. It centers around the current day but allows you to shift time forward or backward to visualize availability across timezones."
    },
    {
      question: "Can I save my team's cities?",
      answer: "Yes! Use the 'Save Team' button to persist your current configuration of cities to your local browser storage. You can create multiple groups (e.g., 'Engineering', 'Sales')."
    },
    {
      question: "What do the colored bars indicate?",
      answer: "The colored bars on the time cards indicate the time of day: Yellow for Morning (7-9), Green for Business Hours (9-17), Orange for Evening (17-22), and Blue/Grey for Night."
    },
    {
      question: "Is the data stored on a server?",
      answer: "No. All your data, including saved teams, is stored locally in your browser using IndexedDB. No personal data is ever sent to a server."
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Time Forge",
    "applicationCategory": "ProductivityApplication",
    "operatingSystem": "Web",
    "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
    },
    "description": "Professional world clock and meeting scheduler for distributed teams."
  };

</script>

<Head
  title="Time Forge - World Clock & Meeting Planner"
  description="Visualize timezones, schedule meetings across the globe, and manage distributed teams with Time Forge."
  image="https://microfactory.dev/og/time-forge.png"
/>

<div class="max-w-4xl mx-auto px-4 py-12">

  <div class="mb-10 text-center">
    <h1 class="text-4xl font-extrabold text-white mb-4 tracking-tight">Time Forge</h1>
    <p class="text-lg text-slate-400 max-w-2xl mx-auto">
      Coordinate globally, act locally. The ultimate timezone command center for distributed teams.
    </p>
  </div>

  <div class="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 sm:p-8 shadow-2xl mb-16">
    <TimeForge />
  </div>

  <div class="prose prose-invert max-w-none">
    <h2 class="text-2xl font-bold text-white mb-6">Master Your Global Schedule</h2>
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">Visual Planning</h3>
        <p class="text-slate-400 text-sm">Instantly see day/night cycles and business hour overlaps across unlimited locations.</p>
      </div>
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">Team Workspaces</h3>
        <p class="text-slate-400 text-sm">Save different city groups for different project teams and switch between them instantly.</p>
      </div>
      <div class="bg-slate-800/30 p-6 rounded-xl border border-slate-700/50">
        <h3 class="text-lg font-semibold text-indigo-400 mb-2">Smart Sharing</h3>
        <p class="text-slate-400 text-sm">Generate unique links to share your exact time configuration with colleagues.</p>
      </div>
    </div>

    <FAQSection {faqs} />
  </div>

</div>
