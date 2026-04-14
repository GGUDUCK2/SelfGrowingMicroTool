<script lang="ts">
  import { page } from "$app/stores";
  $: lang = $page.params.lang || "en";
</script>

<svelte:head>
  <title>Terms of Service | MicroFactory</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
  <h1>Terms of Service</h1>
  <p>Last updated: {new Date().toLocaleDateString()}</p>
  <p>Please read these Terms of Service carefully before using our website.</p>
  <h2>Conditions of Use</h2>
  <p>We provide these tools "as is" without warranty of any kind. You agree to use them at your own risk.</p>
  <h2>Intellectual Property</h2>
  <p>The Service and its original content, features, and functionality are and will remain the exclusive property of MicroFactory and its licensors.</p>
  <h2>Links To Other Web Sites</h2>
  <p>Our Service may contain links to third-party web sites or services that are not owned or controlled by MicroFactory.</p>
  <h2>Contact Us</h2>
  <p>If you have any questions about these Terms, please contact us.</p>
</div>
