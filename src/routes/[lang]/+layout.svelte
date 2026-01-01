<script lang="ts">
  import { page } from "$app/stores";

  // 현재 언어 가져오기
  $: lang = $page.params.lang || "en";

  // 파생된 상태 (Derived state) 예시
  $: isKorean = lang === "ko";
</script>

<div
  class="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans antialiased"
>
  <header
    class="sticky top-0 z-50 w-full border-b border-gray-200 bg-white/80 backdrop-blur-xl"
  >
    <div
      class="container mx-auto px-3 sm:px-4 h-14 sm:h-16 flex items-center justify-between gap-2"
    >
      <a
        href="/{lang}"
        class="flex items-center gap-2 font-bold text-lg sm:text-xl tracking-tight text-gray-900 hover:opacity-80 transition-opacity flex-shrink-0"
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
            class="lucide lucide-zap sm:w-5 sm:h-5"
            ><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg
          >
        </div>
        <span class="hidden xs:inline">MicroFactory</span>
        <span class="xs:hidden">MF</span>
      </a>

      <nav class="flex items-center gap-2 sm:gap-4 md:gap-6 flex-shrink-0">
        <a
          href="/{lang}/tools"
          class="text-xs sm:text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors hidden sm:block"
          >Tools</a
        >
        <a
          href="/{lang}/pwa"
          class="text-xs sm:text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
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
        <div class="h-4 w-px bg-gray-200"></div>
        <div class="flex items-center gap-1 sm:gap-2">
          <a
            href="/en{$page.url.pathname.replace(/^\/(en|ko)/, '')}"
            class:text-indigo-600={lang === "en"}
            class="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-1"
            >EN</a
          >
          <span class="text-gray-300">/</span>
          <a
            href="/ko{$page.url.pathname.replace(/^\/(en|ko)/, '')}"
            class:text-indigo-600={lang === "ko"}
            class="text-xs sm:text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors px-1"
            >KO</a
          >
        </div>
      </nav>
    </div>
  </header>

  <main class="flex-1 container mx-auto px-4 py-8 md:py-12">
    <slot />
  </main>

  <footer class="border-t border-gray-200 bg-white py-12">
    <div class="container mx-auto px-4 text-center text-gray-500 text-sm">
      <p>
        &copy; {new Date().getFullYear()} Self-Growing Micro Tools. All rights reserved.
      </p>
    </div>
  </footer>
</div>
