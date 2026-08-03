<script lang="ts">
  import AdPlaceholder from "$lib/components/AdPlaceholder.svelte";
  import Head from '$lib/components/Head.svelte';
  import { page } from "$app/stores";
  $: lang = $page.params.lang || "en";
</script>

<Head title="Contact Us" description="Contact MicroFactory" />


<svelte:head>
  <title>Contact Us | MicroFactory</title>
  <meta name="description" content="Get in touch with the MicroFactory team. We welcome your feedback, feature requests, and bug reports." />
  {@html '<script type="application/ld+json">' + JSON.stringify({"@context":"https://schema.org","@type":"WebPage","@id":$page.url.origin + "/" + lang + "/contact","name":"Contact Us","description":"Get in touch with the MicroFactory team"}) + '</script>'}
</svelte:head>

<div class="max-w-4xl mx-auto py-16 px-4 sm:px-6 lg:px-8 prose prose-slate dark:prose-invert">
  <h1>Contact Us</h1>
  <p>We genuinely love hearing from our community! Whether you have an innovative feature request, have discovered a frustrating bug, require assistance with a specific tool, or simply want to say hi, your feedback is incredibly invaluable to us and directly shapes the future of MicroFactory.</p>

  <h2>Get in Touch with the Development Team</h2>
  <p>If you encounter a technical issue or have a concrete suggestion for improvement, the absolute best and most efficient way to reach out is through our official open-source GitHub repository. We actively monitor issues, feature requests, and pull requests daily to ensure our tools remain top-tier, reliable, and up-to-date with the latest web standards.</p>

  <div class="mt-8 p-6 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
    <h3 class="mt-0">GitHub Issues and Feature Tracking</h3>
    <p>Please do not hesitate to open a detailed issue on our <a href="https://github.com/microfactory/issues" target="_blank" rel="noopener noreferrer" class="text-indigo-600 dark:text-indigo-400 font-medium min-h-[44px] min-w-[44px] inline-flex items-center">GitHub repository</a>.</p>
    <ul>
      <li><strong>Bug Reports:</strong> When reporting a bug, please strive to provide a comprehensive description of the issue. Include explicit steps to reproduce the bug, the expected behavior versus the actual behavior, and any relevant system information (such as your specific browser version and operating system). This greatly accelerates our debugging process.</li>
      <li><strong>Feature Requests:</strong> If you have an exciting idea for a brand new tool or a substantial improvement to an existing one, please let us know! Be as detailed as possible about the specific use case, the problem it solves, and your expected behavior or workflow.</li>
    </ul>
  </div>

  <h2>Other Business Inquiries</h2>
  <p>For official business inquiries, potential partnerships, sponsorship opportunities, or other sensitive communications that may not be well-suited for a public GitHub issue, please reach out to our core team directly. You can connect with us via our official direct messaging channels on various professional social platforms. We strive to respond to all serious business inquiries within 2-3 business days.</p>
</div>


<AdPlaceholder />
