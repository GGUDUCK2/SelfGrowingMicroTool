<script lang="ts">
  import { getDictionary } from "$lib/dictionaries";
  import registry from "$lib/registry.json";
  import { fade, fly } from "svelte/transition";

  export let data;

  type Language = "en" | "ko";

  $: lang = data.lang as Language;
  $: dict = getDictionary(lang);
  $: tools = registry;
</script>

<svelte:head>
  <title>{dict.home.title}</title>
  <meta name="description" content={dict.home.description} />
</svelte:head>

<div class="space-y-12">
  <section class="text-center py-20 space-y-6">
    <h1
      in:fly={{ y: 20, duration: 800 }}
      class="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900"
    >
      <span
        class="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600"
      >
        {dict.home.title}
      </span>
    </h1>
    <p
      in:fly={{ y: 20, duration: 800, delay: 200 }}
      class="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed"
    >
      {dict.home.description}
    </p>
  </section>

  <section class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
    {#each tools as tool, i}
      <a
        href="/{lang}/tools/{tool.slug}"
        in:fly={{ y: 20, duration: 800, delay: 400 + i * 100 }}
        class="group relative bg-white rounded-2xl p-8 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 border border-gray-100 overflow-hidden"
      >
        <div
          class="absolute inset-0 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        ></div>

        <div class="relative z-10">
          <div
            class="mb-6 inline-flex p-3 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors duration-300"
          >
            {#if tool.slug === "pomodoro-timer"}
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
                class="lucide lucide-timer"
                ><line x1="10" x2="14" y1="2" y2="2" /><line
                  x1="12"
                  x2="15"
                  y1="14"
                  y2="11"
                /><circle cx="12" cy="14" r="8" /></svg
              >
            {:else if tool.slug === "compound-interest-calculator"}
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
                class="lucide lucide-trending-up"
                ><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline
                  points="17 6 23 6 23 12"
                /></svg
              >
            {:else}
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
                class="lucide lucide-wrench"
                ><path
                  d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
                /></svg
              >
            {/if}
          </div>

          <h2
            class="text-2xl font-bold text-gray-900 mb-3 ml-1 group-hover:text-indigo-600 transition-colors"
          >
            {tool.title[lang]}
          </h2>
          <p
            class="text-gray-500 leading-relaxed group-hover:text-gray-600 transition-colors"
          >
            {tool.description[lang]}
          </p>
        </div>
      </a>
    {/each}
  </section>
</div>
