<script lang="ts">
  export let title: string;
  export let description: string;
  export let image: string = 'https://selfgrowingmicrotool.com/og/default.png';
  export let url: string = 'https://selfgrowingmicrotool.com';
  export let keywords: string | undefined = undefined;
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
</svelte:head>
