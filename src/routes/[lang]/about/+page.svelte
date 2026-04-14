<script lang="ts">
  import { page } from "$app/stores";
  $: lang = $page.params.lang || "en";
</script>

<svelte:head>
  <title>About Us | MicroFactory</title>
</svelte:head>

<div class="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
  <h1>About MicroFactory</h1>
  <p>MicroFactory is a comprehensive suite of powerful, client-side web tools designed for developers, designers, and everyday users. Our goal is to provide fast, reliable, and privacy-focused utilities without the bloat.</p>

  <h2>Our Mission</h2>
  <p>We believe in the power of the open web. By leveraging modern browser APIs, we bring desktop-class tools straight to your browser—offline capable, highly accessible, and totally free.</p>
</div>
