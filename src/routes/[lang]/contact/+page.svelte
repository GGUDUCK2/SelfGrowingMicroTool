<script lang="ts">
  import { page } from "$app/stores";
  $: lang = $page.params.lang || "en";
</script>

<svelte:head>
  <title>Contact Us | MicroFactory</title>
</svelte:head>

<div class="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
  <h1>Contact Us</h1>
  <p>We would love to hear from you! Whether you have a feature request, found a bug, or just want to say hi.</p>

  <div class="mt-8">
    <p>Please open an issue on our <a href="https://github.com/microfactory/issues" target="_blank" rel="noopener noreferrer">GitHub repository</a> or send an email to our support team.</p>
  </div>
</div>
