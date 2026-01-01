<script lang="ts">
    import { getDictionary } from "$lib/dictionaries";
    import { onMount } from "svelte";
    import { fly } from "svelte/transition";

    export let data;

    type Language = "en" | "ko";

    $: lang = data.lang as Language;
    $: dict = getDictionary(lang);

    let deferredPrompt: any = null;
    let isInstalled = false;
    let isIOS = false;
    let showInstallButton = false;

    onMount(() => {
        // Check if on iOS
        isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);

        // Check if already installed
        if (window.matchMedia("(display-mode: standalone)").matches) {
            isInstalled = true;
            return;
        }

        // Listen for the beforeinstallprompt event
        window.addEventListener("beforeinstallprompt", (e) => {
            e.preventDefault();
            deferredPrompt = e;
            showInstallButton = true;
        });

        // Check if installed via app installed event
        window.addEventListener("appinstalled", () => {
            isInstalled = true;
            showInstallButton = false;
            deferredPrompt = null;
        });
    });

    async function handleInstall() {
        if (!deferredPrompt) return;

        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;

        if (outcome === "accepted") {
            isInstalled = true;
        }

        deferredPrompt = null;
        showInstallButton = false;
    }
</script>

<svelte:head>
    <title>{dict.pwa.title}</title>
    <meta name="description" content={dict.pwa.description} />
</svelte:head>

<div class="max-w-2xl mx-auto py-12 space-y-12">
    <!-- Header -->
    <section class="text-center space-y-4" in:fly={{ y: 20, duration: 600 }}>
        <div
            class="inline-flex p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xl shadow-indigo-500/30 mb-4"
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="lucide lucide-download"
            >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" x2="12" y1="15" y2="3" />
            </svg>
        </div>
        <h1 class="text-4xl font-bold text-gray-900">{dict.pwa.title}</h1>
        <p class="text-gray-500 text-lg leading-relaxed">
            {dict.pwa.description}
        </p>
    </section>

    <!-- Install Section -->
    <section
        class="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 space-y-6"
        in:fly={{ y: 20, duration: 600, delay: 200 }}
    >
        {#if isInstalled}
            <!-- Already Installed -->
            <div class="text-center space-y-4">
                <div
                    class="inline-flex p-3 rounded-full bg-green-100 text-green-600"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="32"
                        height="32"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-check-circle"
                    >
                        <circle cx="12" cy="12" r="10" />
                        <path d="m9 12 2 2 4-4" />
                    </svg>
                </div>
                <p class="text-lg font-medium text-gray-900">
                    {dict.pwa.installedMessage}
                </p>
            </div>
        {:else if isIOS}
            <!-- iOS Instructions -->
            <div class="space-y-4">
                <h2 class="text-xl font-semibold text-gray-900">
                    {dict.pwa.iosInstructions}
                </h2>
                <div class="space-y-3">
                    <div
                        class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                        <div
                            class="p-2 bg-indigo-100 rounded-lg text-indigo-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-share"
                            >
                                <path
                                    d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"
                                />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" x2="12" y1="2" y2="15" />
                            </svg>
                        </div>
                        <p class="text-gray-700">{dict.pwa.iosStep1}</p>
                    </div>
                    <div
                        class="flex items-center gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                        <div
                            class="p-2 bg-indigo-100 rounded-lg text-indigo-600"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                stroke-width="2"
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                class="lucide lucide-plus-square"
                            >
                                <rect
                                    width="18"
                                    height="18"
                                    x="3"
                                    y="3"
                                    rx="2"
                                />
                                <path d="M8 12h8" />
                                <path d="M12 8v8" />
                            </svg>
                        </div>
                        <p class="text-gray-700">{dict.pwa.iosStep2}</p>
                    </div>
                </div>
            </div>
        {:else}
            <!-- Android / Desktop Install -->
            <div class="text-center space-y-6">
                <h2 class="text-xl font-semibold text-gray-900">
                    {dict.pwa.androidInstructions}
                </h2>
                {#if showInstallButton}
                    <button
                        on:click={handleInstall}
                        class="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            stroke-width="2"
                            stroke-linecap="round"
                            stroke-linejoin="round"
                            class="lucide lucide-download"
                        >
                            <path
                                d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
                            />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" x2="12" y1="15" y2="3" />
                        </svg>
                        {dict.pwa.installButton}
                    </button>
                {:else}
                    <p class="text-gray-500">
                        {lang === "ko"
                            ? "브라우저 주소창의 설치 버튼을 사용하세요."
                            : "Use the install button in your browser address bar."}
                    </p>
                {/if}
            </div>
        {/if}
    </section>

    <!-- Benefits Section -->
    <section class="space-y-6" in:fly={{ y: 20, duration: 600, delay: 400 }}>
        <h2 class="text-2xl font-bold text-gray-900 text-center">
            {dict.pwa.benefits}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
                class="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
                <div class="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-smartphone"
                    >
                        <rect
                            width="14"
                            height="20"
                            x="5"
                            y="2"
                            rx="2"
                            ry="2"
                        />
                        <path d="M12 18h.01" />
                    </svg>
                </div>
                <p class="text-gray-700 font-medium">{dict.pwa.benefit1}</p>
            </div>
            <div
                class="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
                <div class="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-wifi-off"
                    >
                        <line x1="1" x2="23" y1="1" y2="23" />
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                        <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                        <line x1="12" x2="12.01" y1="20" y2="20" />
                    </svg>
                </div>
                <p class="text-gray-700 font-medium">{dict.pwa.benefit2}</p>
            </div>
            <div
                class="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
                <div class="p-2 bg-amber-50 rounded-lg text-amber-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-zap"
                    >
                        <polygon
                            points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
                        />
                    </svg>
                </div>
                <p class="text-gray-700 font-medium">{dict.pwa.benefit3}</p>
            </div>
            <div
                class="flex items-center gap-4 p-5 bg-white rounded-xl border border-gray-100 shadow-sm"
            >
                <div class="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="lucide lucide-layout-grid"
                    >
                        <rect width="7" height="7" x="3" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="3" rx="1" />
                        <rect width="7" height="7" x="14" y="14" rx="1" />
                        <rect width="7" height="7" x="3" y="14" rx="1" />
                    </svg>
                </div>
                <p class="text-gray-700 font-medium">{dict.pwa.benefit4}</p>
            </div>
        </div>
    </section>
</div>
