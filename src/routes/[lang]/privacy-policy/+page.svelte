<script lang="ts">
  import { page } from "$app/stores";
  $: lang = $page.params.lang || "en";
</script>

<svelte:head>
  <title>Privacy Policy | MicroFactory</title>
  <meta name="robots" content="noindex" />
</svelte:head>

<div class="max-w-3xl mx-auto py-16 px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
  <h1>Privacy Policy</h1>
  <p>Last updated: {new Date().toLocaleDateString()}</p>
  <p>Your privacy is important to us. MicroFactory ("us", "we", or "our") operates the website.</p>
  <h2>Information Collection and Use</h2>
  <p>Most of our tools run entirely in your browser using local APIs. We do not collect or store your personal data on our servers unless explicitly stated otherwise.</p>
  <h2>Log Data & Analytics</h2>
  <p>We may collect information that your browser sends whenever you visit our Service ("Log Data"). We may also use third-party services like Google Analytics that collect, monitor and analyze this type of information in order to increase our Service's functionality.</p>
  <h2>Contact Us</h2>
  <p>If you have any questions about this Privacy Policy, please contact us.</p>
</div>
