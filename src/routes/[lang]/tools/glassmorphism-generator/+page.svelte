<script lang="ts">
  import { onMount } from "svelte";
  import { fade, fly } from "svelte/transition";
  import { dictionaries } from "$lib/dictionaries";
  import { page } from "$app/stores";
  import { goto } from "$app/navigation";
  import { debounce } from "$lib/utils";
  import FAQSection from "$lib/components/FAQSection.svelte";

  export let data;
  $: lang = (data.lang as "en" | "ko") || "en";
  $: dict =
    dictionaries[lang]?.tools?.glassmorphism ||
    dictionaries.en.tools.glassmorphism;

  // State
  let blur = 16;
  let transparency = 0.6;
  let color = "#ffffff";
  let outline = 1;
  let radius = 16;
  let isLoaded = false;
  let copied = false;

  // Load data from URL
  onMount(() => {
    const params = $page.url.searchParams;
    if (params.has("blur")) blur = Number(params.get("blur"));
    if (params.has("transparency"))
      transparency = Number(params.get("transparency"));
    if (params.has("color")) color = params.get("color") || "#ffffff";
    if (params.has("outline")) outline = Number(params.get("outline"));
    if (params.has("radius")) radius = Number(params.get("radius"));
    isLoaded = true;
  });

  // Sync state to URL (Debounced)
  const syncState = debounce(async () => {
    if (!isLoaded) return;
    const url = new URL($page.url);
    url.searchParams.set("blur", String(blur));
    url.searchParams.set("transparency", String(transparency));
    url.searchParams.set("color", color);
    url.searchParams.set("outline", String(outline));
    url.searchParams.set("radius", String(radius));

    await goto(url, { replaceState: true, noScroll: true, keepFocus: true });
  }, 500);

  $: {
    if (isLoaded) {
      // Trigger sync when any value changes
      blur;
      transparency;
      color;
      outline;
      radius;
      syncState();
    }
  }

  // Derived CSS
  $: rgbaColor = hexToRgba(color, transparency);
  $: cssCode = `background: ${rgbaColor};
backdrop-filter: blur(${blur}px);
-webkit-backdrop-filter: blur(${blur}px);
border-radius: ${radius}px;
border: ${outline}px solid rgba(255, 255, 255, 0.3);
box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);`;

  function hexToRgba(hex: string, alpha: number) {
    let r = 0,
      g = 0,
      b = 0;
    if (hex.length === 4) {
      r = parseInt("0x" + hex[1] + hex[1]);
      g = parseInt("0x" + hex[2] + hex[2]);
      b = parseInt("0x" + hex[3] + hex[3]);
    } else if (hex.length === 7) {
      r = parseInt("0x" + hex[1] + hex[2]);
      g = parseInt("0x" + hex[3] + hex[4]);
      b = parseInt("0x" + hex[5] + hex[6]);
    }
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(cssCode);
      copied = true;
      setTimeout(() => (copied = false), 2000);
    } catch (err) {
      console.error("Failed to copy!", err);
    }
  }

  // FAQ Data
  $: faqItems = [
    { q: dict.q1, a: dict.a1 },
    { q: dict.q2, a: dict.a2 },
    { q: dict.q3, a: dict.a3 },
  ];
</script>

<svelte:head>
  <title>{dict.title} - MicroFactory</title>
  <meta name="description" content={dict.description} />
  <script type="application/ld+json">
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "${dict.title}",
      "description": "${dict.description}",
      "applicationCategory": "DesignApplication",
      "operatingSystem": "Web",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }
  </script>
</svelte:head>

<div class="max-w-6xl mx-auto py-12 space-y-12 px-4">
  <div class="text-center space-y-4">
    <h1 class="text-4xl font-bold text-gray-900">
      {dict.title}
    </h1>
    <p class="text-gray-500 max-w-2xl mx-auto">
      {dict.description}
    </p>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
    <!-- Controls -->
    <div
      class="lg:col-span-1 bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-gray-100 h-fit space-y-6"
    >
      <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="lucide lucide-sliders-horizontal text-indigo-600"
        >
          <line x1="21" x2="14" y1="4" y2="4" />
          <line x1="10" x2="3" y1="4" y2="4" />
          <line x1="21" x2="12" y1="12" y2="12" />
          <line x1="8" x2="3" y1="12" y2="12" />
          <line x1="21" x2="16" y1="20" y2="20" />
          <line x1="12" x2="3" y1="20" y2="20" />
          <line x1="14" y1="2" y2="6" />
          <line x1="8" y1="10" y2="14" />
          <line x1="16" y1="18" y2="22" />
        </svg>
        {dict.config}
      </h2>

      <div class="space-y-6">
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.blur} ({blur}px)
            <input
              type="range"
              min="0"
              max="40"
              step="1"
              bind:value={blur}
              class="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.transparency} ({Math.round(transparency * 100)}%)
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              bind:value={transparency}
              class="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.color}
            <div class="flex gap-2 mt-2">
              <input
                type="color"
                bind:value={color}
                class="h-10 w-12 p-0 border-0 rounded cursor-pointer"
              />
              <input
                type="text"
                bind:value={color}
                class="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none uppercase"
              />
            </div>
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.outline} ({outline}px)
            <input
              type="range"
              min="0"
              max="10"
              step="1"
              bind:value={outline}
              class="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </label>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">
            {dict.radius} ({radius}px)
            <input
              type="range"
              min="0"
              max="100"
              step="1"
              bind:value={radius}
              class="w-full mt-2 accent-indigo-600 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>

    <!-- Preview & Code -->
    <div class="lg:col-span-2 space-y-8">
      <!-- Preview Area -->
      <div
        class="relative w-full h-96 rounded-2xl overflow-hidden flex items-center justify-center shadow-inner border border-gray-200"
        role="img"
        aria-label="Glassmorphism preview area"
      >
        <!-- Colorful Background -->
        <div
          class="absolute inset-0 z-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500"
        >
          <!-- Abstract shapes -->
          <div
            class="absolute top-10 left-10 w-32 h-32 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"
          ></div>
          <div
            class="absolute top-10 right-10 w-32 h-32 bg-green-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"
          ></div>
          <div
            class="absolute -bottom-8 left-20 w-32 h-32 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"
          ></div>
        </div>

        <!-- Glass Card -->
        <div
          class="z-10 w-64 h-40 flex items-center justify-center text-white/90 font-medium"
          style={cssCode}
        >
          <span class="drop-shadow-md text-lg">{dict.preview}</span>
        </div>
      </div>

      <!-- CSS Code Output -->
      <div class="bg-slate-900 rounded-2xl p-6 shadow-lg relative group">
        <h3 class="text-slate-400 text-xs font-semibold uppercase mb-4">
          {dict.cssCode}
        </h3>
        <pre
          class="text-green-400 font-mono text-sm overflow-x-auto whitespace-pre-wrap">{cssCode}</pre>

        <button
          on:click={copyToClipboard}
          class="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 backdrop-blur-sm"
        >
          {#if copied}
            <span in:fly={{ y: 5 }} class="text-green-400">{dict.copied}</span>
          {:else}
            <span in:fade>{dict.copy}</span>
          {/if}
        </button>
      </div>

      <!-- FAQ Section -->
      <FAQSection title={dict.faqTitle} items={faqItems} />
    </div>
  </div>
</div>

<style>
  .animate-blob {
    animation: blob 7s infinite;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  @keyframes blob {
    0% {
      transform: translate(0px, 0px) scale(1);
    }
    33% {
      transform: translate(30px, -50px) scale(1.1);
    }
    66% {
      transform: translate(-20px, 20px) scale(0.9);
    }
    100% {
      transform: translate(0px, 0px) scale(1);
    }
  }
</style>
