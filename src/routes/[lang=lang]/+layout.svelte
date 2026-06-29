<script lang="ts">
  import { page } from "$app/stores";
  import AdPlaceholder from "$lib/components/AdPlaceholder.svelte";

  // 현재 언어 가져오기
  $: lang = $page.params.lang || "en";
</script>

<div
  class="min-h-screen flex flex-col bg-gray-50 dark:bg-slate-900 text-gray-900 dark:text-slate-100 font-sans antialiased transition-colors"
>
  <header
    class="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl transition-colors"
  >
    <div
      class="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2"
    >
      <!-- svelte-ignore svelte/no-navigation-without-resolve -->
      <a
        href="/{lang}"
        class="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight text-gray-900 dark:text-white hover:opacity-80 transition-opacity flex-shrink-0 min-h-[44px] min-w-[44px]"
      >
        <div
          class="size-7 sm:size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="lucide lucide-zap w-5 h-5 sm:w-6 sm:h-6"
            ><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg
          >
        </div>
        <span class="hidden xs:inline">MicroFactory</span>
        <span class="xs:hidden">MF</span>
      </a>

      <nav class="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
        <a
          href="/{lang}/tools"
          class="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors hidden sm:flex items-center justify-center min-h-[44px] min-w-[44px]"
          >Tools</a
        >
        <a
          href="/{lang}/pwa"
          class="text-xs sm:text-sm font-medium text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center justify-center gap-1 min-h-[44px] min-w-[44px]"
          title={lang === "ko" ? "앱 설치" : "Install App"}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
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
          <span class="hidden sm:inline"
            >{lang === "ko" ? "설치" : "Install"}</span
          >
        </a>
        <div class="h-4 w-px bg-gray-200 dark:bg-slate-700"></div>
        <div class="flex items-center gap-1 sm:gap-2">
          <a
            href="/en{$page.url.pathname.replace(/^\/(en|ko)/, '')}"
            class:text-indigo-600={lang === "en"}
            class:dark:text-indigo-400={lang === "en"}
            class="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors px-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >EN</a
          >
          <span class="text-gray-300 dark:text-slate-600">/</span>
          <a
            href="/ko{$page.url.pathname.replace(/^\/(en|ko)/, '')}"
            class:text-indigo-600={lang === "ko"}
            class:dark:text-indigo-400={lang === "ko"}
            class="text-xs sm:text-sm font-medium text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors px-1 min-h-[44px] min-w-[44px] flex items-center justify-center"
            >KO</a
          >
        </div>
      </nav>
    </div>
  </header>

  <main class="flex-1 container mx-auto px-4 py-8 md:py-12">
    <slot />

    <!-- Global AdSense Placeholder -->
    <AdPlaceholder />
  </main>

  <footer class="border-t border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 transition-colors">
    <div class="container mx-auto px-4">
      <div class="flex justify-center flex-wrap gap-2 sm:gap-6 mb-8 text-sm">
        <a href="/{lang}/about" class="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2">About</a>
        <a href="/{lang}/privacy-policy" class="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2">Privacy Policy</a>
        <a href="/{lang}/terms-of-service" class="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2">Terms of Service</a>
        <a href="/{lang}/contact" class="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center px-2">Contact</a>
      </div>
      <div class="text-center text-gray-500 dark:text-slate-400 text-sm">
        <p>
          &copy; {new Date().getFullYear()} Self-Growing Micro Tools. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</div>
