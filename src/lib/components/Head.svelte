<script lang="ts">
  import { page } from '$app/stores';

  export let title: string = "";
  export let description: string = "";
  export let image: string = 'https://selfgrowingmicrotool.com/og/default.png';
  export let url: string = 'https://selfgrowingmicrotool.com';
  export let keywords: string | undefined = undefined;

  $: lang = $page.params.lang || 'en';

  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `${$page.url.origin}/${lang}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `${$page.url.origin}/${lang}/tools`
      }
    ].concat(
      $page.url.pathname.includes('/tools/') && !$page.url.pathname.endsWith('/tools')
      ? [{
        "@type": "ListItem",
        "position": 3,
        "name": title,
        "item": $page.url.origin + $page.url.pathname
      }]
      : []
    )
  };
</script>




<svelte:head>
  <title>{title} | MicroFactory</title>
  <meta name="description" content={description} />
  {#if keywords}
    <meta name="keywords" content={keywords} />
  {/if}

  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={image} />
  <meta property="og:url" content={url} />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content={title} />
  <meta name="twitter:description" content={description} />
  <meta name="twitter:image" content={image} />

  {@html `<scr` + `ipt type="application/ld+json">${JSON.stringify(breadcrumbSchema).replace(/</g, '\\u003c')}</scr` + `ipt>`}
</svelte:head>
