<script lang="ts">
  import AdPlaceholder from '$lib/components/AdPlaceholder.svelte';
  import RelatedTools from '$lib/components/RelatedTools.svelte';
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import { Shield, KeyRound, Copy, RotateCw, Download, Share2 } from '@lucide/svelte';
  import { onMount } from 'svelte';
  import { db } from '$lib/db';

  import { generatePassword, generatePassphrase, generatePronounceable, getStrength, type PasswordConfig, type PassphraseConfig, type PronounceableConfig } from '$lib/utils/password-forge/generator';
  import GeneratorConfig from '$lib/components/password-forge/GeneratorConfig.svelte';
  import PassphraseConfigComponent from '$lib/components/password-forge/PassphraseConfig.svelte';
  import PronounceableConfigComponent from '$lib/components/password-forge/PronounceableConfig.svelte';
  import PasswordAnalyzer from '$lib/components/password-forge/PasswordAnalyzer.svelte';
  import StrengthMeter from '$lib/components/password-forge/StrengthMeter.svelte';
  import HistoryPanel from '$lib/components/password-forge/HistoryPanel.svelte';
  import SmartExamples from '$lib/components/password-forge/SmartExamples.svelte';
  import FormattedPassword from '$lib/components/password-forge/FormattedPassword.svelte';
  import BulkGenerateModal from '$lib/components/password-forge/BulkGenerateModal.svelte';

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = {
      ...((dict as any)?.tools?.passwordForge || {}),
      modePronounceable: ((dict as any)?.tools?.passwordForge?.modePronounceable) || 'Pronounceable',
      modeAnalyzer: ((dict as any)?.tools?.passwordForge?.modeAnalyzer) || 'Analyzer',
      analyzer: ((dict as any)?.tools?.passwordForge?.analyzer) || {}
  };

  let mode: 'password' | 'passphrase' | 'pronounceable' | 'analyzer' = 'password';
  let password = '';
  let entropy = 0;
  let copied = false;
  let copyTimeout: ReturnType<typeof setTimeout>;
  let showPhonetics = false;
  let showBulkModal = false;

  let pwdConfig: PasswordConfig = {
      length: 16,
      uppercase: true,
      lowercase: true,
      numbers: true,
      symbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false
  };

  let phraseConfig: PassphraseConfig = {
      words: 4,
      separator: '-',
      capitalize: 'first',
      includeNumber: true
  };

  let pronounceConfig: PronounceableConfig = {
      length: 12,
      includeNumber: true,
      includeSymbol: false
  };

  function applyPasswordConfig(c: PasswordConfig) {
      mode = 'password';
      pwdConfig = { ...c };
      generate();
  }

  function applyPassphraseConfig(c: PassphraseConfig) {
      mode = 'passphrase';
      phraseConfig = { ...c };
      generate();
  }

  function handleBulkGenerate(count: number): string {
      let csv = 'Password,Entropy,Strength\n';
      for (let i = 0; i < count; i++) {
          let pwd = '';
          let ent = 0;
          if (mode === 'password') {
              const res = generatePassword(pwdConfig);
              pwd = res.password;
              ent = (res as any).entropy;
          } else if (mode === 'passphrase') {
              const res = generatePassphrase(phraseConfig);
              pwd = (res as any).passphrase;
              ent = (res as any).entropy;
          } else if (mode === 'pronounceable') {
              const res = generatePronounceable(pronounceConfig);
              pwd = res.password;
              ent = (res as any).entropy;
          } else {
              // Analyzer mode, fallback to standard password
              const res = generatePassword(pwdConfig);
              pwd = res.password;
              ent = (res as any).entropy;
          }
          const strength = getStrength(ent).label;
          // Escape quotes for CSV
          const safePwd = pwd.replace(/"/g, '""');
          csv += `"${safePwd}",${ent},"${strength}"\n`;
      }
      return csv;
  }

  onMount(() => {
      generate();
  });

  function handleKeydown(e: KeyboardEvent) {
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
    if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
      // Only copy the password if there is no text selected on the page
      if (!window.getSelection()?.toString()) {
        e.preventDefault();
        copyToClipboard();
      }
    } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      copyToClipboard();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      generate();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      password = '';
      entropy = 0;
    } else if (e.key === 'Escape') {
      e.preventDefault();
      mode = 'password';
      pwdConfig = {
        length: 16,
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
        excludeSimilar: false,
        excludeAmbiguous: false
      };
      generate();
    }
  }

  function generate() {
      if (mode === 'analyzer') return;
      let result;
      if (mode === 'password') {
          // ensure at least one option is checked
          if (!pwdConfig.uppercase && !pwdConfig.lowercase && !pwdConfig.numbers && !pwdConfig.symbols) {
              pwdConfig.lowercase = true;
          }
          result = generatePassword(pwdConfig);
      } else if (mode === 'pronounceable') {
          result = generatePronounceable(pronounceConfig);
      } else {
          result = generatePassphrase(phraseConfig);
      }
      password = result.password;
      entropy = result.entropy;

      saveToHistory(password, entropy);
  }

  function handleUseGenerated() {
      mode = 'password';
      pwdConfig = {
          length: 16,
          uppercase: true,
          lowercase: true,
          numbers: true,
          symbols: true,
          excludeSimilar: false,
          excludeAmbiguous: false
      };
      generate();
  }

  async function saveToHistory(pwd: string, ent: number) {
      if (!pwd) return;

      const count = await db.passwordForgeHistory.count();
      if (count >= 100) {
          const oldestUnstarred = await db.passwordForgeHistory
              .filter(entry => !entry.starred)
              .sortBy('createdAt');

          if (oldestUnstarred && oldestUnstarred.length > 0 && oldestUnstarred[0].id) {
              await db.passwordForgeHistory.delete(oldestUnstarred[0].id);
          }
      }

      const strengthLabel = getStrength(ent).label;
      await db.passwordForgeHistory.add({
          password: pwd,
          mode: mode as 'password' | 'passphrase' | 'pronounceable',
          length: pwd.length,
          entropy: ent,
          strength: strengthLabel,
          createdAt: new Date(),
          starred: 0
      });
  }

  async function copyToClipboard() {
      await navigator.clipboard.writeText(password);
      copied = true;
      clearTimeout(copyTimeout);
      copyTimeout = setTimeout(() => {
          copied = false;
      }, 2000);
  }

  function downloadPassword() {
      if (!password) return;
      const blob = new Blob([password], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'password.txt';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }

  async function sharePassword() {
      if (!password) return;
      if (navigator.share) {
          try {
              await navigator.share({
                  title: t.title,
                  text: password
              });
          } catch {
              // Fallback to copy if share fails (e.g., user cancels)
          }
      } else {
          // Fallback to copy
          copyToClipboard();
      }
  }

  const natoPhoneticMap: Record<string, string> = {
    A: 'Alpha', B: 'Bravo', C: 'Charlie', D: 'Delta', E: 'Echo', F: 'Foxtrot',
    G: 'Golf', H: 'Hotel', I: 'India', J: 'Juliett', K: 'Kilo', L: 'Lima',
    M: 'Mike', N: 'November', O: 'Oscar', P: 'Papa', Q: 'Quebec', R: 'Romeo',
    S: 'Sierra', T: 'Tango', U: 'Uniform', V: 'Victor', W: 'Whiskey', X: 'X-ray',
    Y: 'Yankee', Z: 'Zulu',
    '0': 'Zero', '1': 'One', '2': 'Two', '3': 'Three', '4': 'Four',
    '5': 'Five', '6': 'Six', '7': 'Seven', '8': 'Eight', '9': 'Nine'
  };

  function getPhonetic(char: string): string {
    const upper = char.toUpperCase();
    if (natoPhoneticMap[upper]) {
      return natoPhoneticMap[upper];
    }
    if (char === ' ') return '(Space)';
    return char; // Return the symbol itself
  }

  $: faqItems = [
      { q: t?.faq?.q1 || t?.q1 || '', a: t?.faq?.a1 || t?.a1 || '' },
      { q: t?.faq?.q2 || t?.q2 || '', a: t?.faq?.a2 || t?.a2 || '' },
      { q: t?.faq?.q3 || t?.q3 || '', a: t?.faq?.a3 || t?.a3 || '' }
  ];

  $: softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
        "@id": $page.url.origin + "/" + lang + "/tools/password-forge",
        "isAccessibleForFree": true,
    "name": t.title,
    "description": t.description,
    "applicationCategory": "SecurityApplication",
    "operatingSystem": "Web, iOS, Android, Windows, macOS, Linux",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
        "Cryptographically Secure Password Generation",
        "xkcd-style Passphrase Generation",
        "Password Strength Estimation",
        "Local History Management",
        "Password Recipe Export/Import",
        "Structural Template Passphrases",
        "Smart Expiry Detection"
    ]
  };



  $: breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": `https://microtools.app/${lang === 'en' ? '' : lang + '/'}`
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": `https://microtools.app/${lang === 'en' ? '' : lang + '/'}tools`
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": t.title,
        "item": `https://microtools.app/${lang === 'en' ? '' : lang + '/'}tools/password-forge`
      }
    ]
  };
</script>

<Head
  title={t.title}
  description={t.description}
/>

<svelte:head>
  <link rel="canonical" href={$page.url.origin + "/" + lang + "/tools/password-forge"} />
  <link rel="alternate" hreflang="en" href={$page.url.origin + "/en/tools/password-forge"} />
  <link rel="alternate" hreflang="ko" href={$page.url.origin + "/ko/tools/password-forge"} />
  <link rel="alternate" hreflang="x-default" href={$page.url.origin + "/en/tools/password-forge"} />
  <!-- eslint-disable svelte/no-at-html-tags -->
  <!-- eslint-disable @typescript-eslint/no-unused-expressions -->
  {@html `<script type="application/ld+json">` + JSON.stringify(softwareSchema) + `${'</scr' + 'ipt>'}`}

  {@html `<script type="application/ld+json">` + JSON.stringify(breadcrumbSchema) + `${'</scr' + 'ipt>'}`}
  <!-- eslint-enable @typescript-eslint/no-unused-expressions -->
  <!-- eslint-enable svelte/no-at-html-tags -->
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<BulkGenerateModal
    show={showBulkModal}
    dictionary={t}
    onClose={() => showBulkModal = false}
    onGenerate={handleBulkGenerate}
/>

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans text-slate-900 dark:text-white transition-colors duration-300">
  <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      <div class="flex items-center gap-4">
        <div class="p-3 bg-indigo-500 rounded-2xl text-white shadow-lg shadow-indigo-500/30">
          <KeyRound size={28} />
        </div>
        <div>
          <h1 class="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
            {t.title}
          </h1>
          <p class="mt-1 text-slate-600 dark:text-slate-400 max-w-2xl">{t.description}</p>
        </div>
      </div>
    </div>
  </div>

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Column: Generator -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Display Area -->
        {#if mode !== 'analyzer'}
            <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                <div class="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
                    <div class="relative flex-grow">
                        <FormattedPassword {password} ariaLabel={t.generatedPassword} />
                    </div>
                    <div class="flex gap-2">
                        <button
                            on:click={generate}
                            class="flex-1 md:flex-none p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center gap-2"
                            title={t.regenerate}
                            aria-label={t.regenerate}
                        >
                            <RotateCw size={24} />
                        </button>
                        <button
                            on:click={downloadPassword}
                            class="flex-1 md:flex-none p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center gap-2"
                            title={t.download}
                            aria-label={t.download}
                        >
                            <Download size={24} />
                        </button>
                        <button
                            on:click={sharePassword}
                            class="flex-1 md:flex-none p-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center gap-2"
                            title={t.share}
                            aria-label={t.share}
                        >
                            <Share2 size={24} />
                        </button>
                        <button
                            on:click={copyToClipboard}
                            class="flex-1 md:flex-none p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 relative overflow-hidden"
                            title={t.copy}
                            aria-label={t.copy}
                        >
                            {#if copied}
                                <span class="absolute inset-0 bg-green-500 flex items-center justify-center text-white font-bold transition-transform transform scale-100">
                                    {(dict as any)?.common?.copied || ""}
                                </span>
                            {:else}
                                <Copy size={24} />
                            {/if}
                        </button>
                    </div>
                </div>

                <!-- Extra Actions (Phonetic Aid & Bulk Generate) -->
                <div class="flex justify-between items-center mb-4 relative z-10">
                    <button
                        class="text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                        on:click={() => showBulkModal = true}
                        title={t.bulkGenerate || 'Bulk Generate'}
                    >
                        <Shield size={16} />
                        <span class="hidden sm:inline">{t.bulkGenerate || 'Bulk Generate'}</span>
                    </button>

                    <button
                        class="text-sm font-medium flex items-center gap-2 px-3 py-2 rounded-lg transition-colors min-h-[44px] min-w-[44px] {showPhonetics ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}"
                        on:click={() => showPhonetics = !showPhonetics}
                        aria-pressed={showPhonetics}
                    >
                        <Shield size={16} />
                        {t.phoneticToggle || 'Phonetic Aid'}
                    </button>
                </div>

                {#if showPhonetics}
                    <div class="mb-6 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-700 overflow-x-auto relative z-10">
                        <div class="flex flex-wrap gap-2">
                            {#each password.split('') as char, i (i)}
                                <div class="flex flex-col items-center justify-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 min-w-[48px]">
                                    <span class="text-xs text-slate-500 dark:text-slate-400 font-mono mb-1">{char}</span>
                                    <span class="text-sm font-semibold text-slate-800 dark:text-slate-100 {/[A-Z]/.test(char) ? 'text-emerald-600 dark:text-emerald-400' : ''}">{getPhonetic(char)}</span>
                                </div>
                            {/each}
                        </div>
                    </div>
                {/if}

                <StrengthMeter {entropy} dictionary={t} />
            </div>

            <SmartExamples dictionary={t} onApplyPassword={applyPasswordConfig} onApplyPassphrase={applyPassphraseConfig} />
        {/if}

        <!-- Configuration Area -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <!-- Tabs -->
            <div class="flex p-1 mb-8 bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-x-auto">
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] min-w-[44px] {mode === 'password' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                    on:click={() => { mode = 'password'; generate(); }}
                >
                    {t.modePassword}
                </button>
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] min-w-[44px] {mode === 'passphrase' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                    on:click={() => { mode = 'passphrase'; generate(); }}
                >
                    {t.modePassphrase}
                </button>
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] min-w-[44px] {mode === 'pronounceable' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                    on:click={() => { mode = 'pronounceable'; generate(); }}
                >
                    {t.modePronounceable || 'Pronounceable'}
                </button>
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] min-w-[44px] {mode === 'analyzer' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                    on:click={() => { mode = 'analyzer'; }}
                >
                    {t.modeAnalyzer || 'Analyzer'}
                </button>
            </div>

            {#if mode === 'password'}
                <GeneratorConfig bind:config={pwdConfig} dictionary={t} onGenerate={generate} />
            {:else if mode === 'passphrase'}
                <PassphraseConfigComponent bind:config={phraseConfig} dictionary={t} onGenerate={generate} />
            {:else if mode === 'pronounceable'}
                <PronounceableConfigComponent bind:config={pronounceConfig} dictionary={t} onGenerate={generate} />
            {:else if mode === 'analyzer'}
                <PasswordAnalyzer dictionary={t} onUseGenerated={handleUseGenerated} />
            {/if}
        </div>

        <!-- Documentation Area -->
        <GuideSection
            title={t.guide.title}
            intro={t.guide.intro}
            featuresTitle={t.guide.featuresTitle}
            f1={t.guide.f1}
            f2={t.guide.f2}
            f3={t.guide.f3}
            tipsTitle={t.guide.tipsTitle}
            tip1={t.guide.tip1}
            tip2={t.guide.tip2}
            tip3={t.guide.tip3}
        />

        <div class="mt-8">
            <AdPlaceholder />
  <FAQSection title={t.faqTitle} items={faqItems} />
        </div>
      </div>

      <!-- Right Column: History -->
      <div class="lg:col-span-4">
        <div class="sticky top-24">
            <HistoryPanel dictionary={t} />
        </div>
      </div>

    </div>
  </div>


  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
    <RelatedTools lang={lang as 'en' | 'ko'} currentSlug="password-forge" currentCategory="util" />
  </div>
</div>
