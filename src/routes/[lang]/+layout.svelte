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
    <div class="container mx-auto px-4 h-16 flex items-center justify-between">
      <a
        href="/{lang}"
        class="flex items-center gap-2 font-bold text-xl tracking-tight text-gray-900 hover:opacity-80 transition-opacity"
      >
        <div
          class="size-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20"
        >
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
            class="lucide lucide-zap"
            ><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg
          >
        </div>
        <span>MicroFactory</span>
      </a>

      <nav class="flex items-center gap-6">
        <a
          href="/{lang}/tools"
          class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors"
          >Tools</a
        >
        <a
          href="/{lang}/pwa"
          class="text-sm font-medium text-gray-600 hover:text-indigo-600 transition-colors flex items-center gap-1"
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
          {lang === "ko" ? "설치" : "Install"}
        </a>
        <div class="h-4 w-px bg-gray-200"></div>
        <div class="flex items-center gap-2">
          <a
            href="/en{$page.url.pathname.replace(/^\/(en|ko)/, '')}"
            class:text-indigo-600={lang === "en"}
            class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
            >EN</a
          >
          <span class="text-gray-300">/</span>
          <a
            href="/ko{$page.url.pathname.replace(/^\/(en|ko)/, '')}"
            class:text-indigo-600={lang === "ko"}
            class="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
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
