<script lang="ts">
  import { page } from '$app/stores';
  import { getDictionary } from '$lib/dictionaries';
  import Head from '$lib/components/Head.svelte';
  import FAQSection from '$lib/components/FAQSection.svelte';
  import GuideSection from '$lib/components/GuideSection.svelte';
  import { Shield, KeyRound, Copy, RotateCw, History } from 'lucide-svelte';
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

  $: lang = $page.params.lang || 'en';
  $: dict = getDictionary(lang);
  $: t = {
      ...dict.tools.passwordForge,
      modePronounceable: dict.tools.passwordForge.modePronounceable || 'Pronounceable',
      modeAnalyzer: dict.tools.passwordForge.modeAnalyzer || 'Analyzer',
      analyzer: dict.tools.passwordForge.analyzer || {}
  };

  let mode: 'password' | 'passphrase' | 'pronounceable' | 'analyzer' = 'password';
  let password = '';
  let entropy = 0;
  let copied = false;
  let copyTimeout: ReturnType<typeof setTimeout>;

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
      const strengthLabel = getStrength(ent).label;
      await db.passwordForgeHistory.add({
          password: pwd,
          mode: mode,
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

  $: faqItems = [
      { q: t?.faq?.q1 || t?.q1 || '', a: t?.faq?.a1 || t?.a1 || '' },
      { q: t?.faq?.q2 || t?.q2 || '', a: t?.faq?.a2 || t?.a2 || '' },
      { q: t?.faq?.q3 || t?.q3 || '', a: t?.faq?.a3 || t?.a3 || '' }
  ];
</script>

<Head
  title={t.title}
  description={t.description}
/>

<svelte:head>
  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "${t.title}",
    "description": "${t.description}",
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
        "Local History Management"
    ]
  }
  </script>`}

  {@html `<script type="application/ld+json">
  ${JSON.stringify({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": t?.faq?.q1 || t?.q1 || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.faq?.a1 || t?.a1 || ''
        }
      },
      {
        "@type": "Question",
        "name": t?.faq?.q2 || t?.q2 || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.faq?.a2 || t?.a2 || ''
        }
      },
      {
        "@type": "Question",
        "name": t?.faq?.q3 || t?.q3 || '',
        "acceptedAnswer": {
          "@type": "Answer",
          "text": t?.faq?.a3 || t?.a3 || ''
        }
      }
    ]
  })}
  </script>`}

  {@html `<script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://microtools.app/${lang === 'en' ? '' : lang + '/'}"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "Tools",
        "item": "https://microtools.app/${lang === 'en' ? '' : lang + '/'}tools"
      },
      {
        "@type": "ListItem",
        "position": 3,
        "name": "${t.title}",
        "item": "https://microtools.app/${lang === 'en' ? '' : lang + '/'}tools/password-forge"
      }
    ]
  }
  </script>`}
</svelte:head>

<svelte:window on:keydown={handleKeydown} />

<div class="min-h-screen bg-slate-50 dark:bg-slate-900 pb-20 font-sans text-slate-900 dark:text-white transition-colors duration-300">
  <div class="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">

      <!-- Left Column: Generator -->
      <div class="lg:col-span-8 space-y-8">
        <!-- Display Area -->
        {#if mode !== 'analyzer'}
            <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700 relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>

                <div class="flex flex-col md:flex-row gap-4 mb-6 relative z-10">
                    <div class="relative flex-grow">
                        <input
                            type="text"
                            readonly
                            bind:value={password}
                            class="w-full min-h-[44px] bg-slate-50 dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl py-4 px-6 text-2xl md:text-3xl font-mono text-center md:text-left text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500 dark:focus:border-indigo-400 transition-colors"
                            aria-label={t.generatedPassword}
                        />
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
                            on:click={copyToClipboard}
                            class="flex-1 md:flex-none p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center gap-2 relative overflow-hidden"
                            title={t.copy}
                            aria-label={t.copy}
                        >
                            {#if copied}
                                <span class="absolute inset-0 bg-green-500 flex items-center justify-center text-white font-bold transition-transform transform scale-100">
                                    {dict.common.copied}
                                </span>
                            {:else}
                                <Copy size={24} />
                            {/if}
                        </button>
                    </div>
                </div>

                <StrengthMeter {entropy} dictionary={t} />
            </div>

            <SmartExamples dictionary={t} onApplyPassword={applyPasswordConfig} onApplyPassphrase={applyPassphraseConfig} />
        {/if}

        <!-- Configuration Area -->
        <div class="bg-white dark:bg-slate-800 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-200 dark:border-slate-700">
            <!-- Tabs -->
            <div class="flex p-1 mb-8 bg-slate-100 dark:bg-slate-900/50 rounded-xl overflow-x-auto">
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] {mode === 'password' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                    on:click={() => { mode = 'password'; generate(); }}
                >
                    {t.modePassword}
                </button>
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] {mode === 'passphrase' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                    on:click={() => { mode = 'passphrase'; generate(); }}
                >
                    {t.modePassphrase}
                </button>
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] {mode === 'pronounceable' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
                    on:click={() => { mode = 'pronounceable'; generate(); }}
                >
                    {t.modePronounceable || 'Pronounceable'}
                </button>
                <button
                    class="flex-1 py-3 px-4 rounded-lg font-medium text-sm transition-all whitespace-nowrap min-h-[44px] {mode === 'analyzer' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'}"
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
</div>
