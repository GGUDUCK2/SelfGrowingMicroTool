<script lang="ts">
  export let content: string;
  export let t: Record<string, any>;

  function getKeyValuePairs(str: string): Record<string, string> {
      const result: Record<string, string> = {};
      const lines = str.split('\n');
      for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;

          const match = line.match(/^([^=]+)=(.*)$/);
          if (match) {
              const key = match[1].trim();
              let value = match[2].trim();
              // Remove surrounding quotes if present for JSON/YAML
              if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                  value = value.substring(1, value.length - 1);
              }
              result[key] = value;
          }
      }
      return result;
  }

  function exportJSON() {
      const data = getKeyValuePairs(content);
      downloadBlob(JSON.stringify(data, null, 2), 'env.json', 'application/json');
  }

  function exportYAML() {
      const data = getKeyValuePairs(content);
      const yaml = Object.entries(data).map(([k, v]) => {
          // Quote value if it contains spaces or special characters
          const needsQuotes = /[\s:#{}[\]]/g.test(v);
          const safeVal = needsQuotes ? `"${v.replace(/"/g, '\\"')}"` : v;
          return `${k}: ${safeVal}`;
      }).join('\n');
      downloadBlob(yaml, 'env.yaml', 'application/x-yaml');
  }

  function exportDocker() {
      // Docker env file is usually same as .env but ensuring no export keyword, etc.
      // But we just download the pure KV without comments.
      const data = getKeyValuePairs(content);
      const dockerEnv = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('\n');
      downloadBlob(dockerEnv, 'docker.env', 'text/plain');
  }

  function exportK8s() {
      const data = getKeyValuePairs(content);
      let yaml = `apiVersion: v1\nkind: ConfigMap\nmetadata:\n  name: my-configmap\ndata:\n`;
      yaml += Object.entries(data).map(([k, v]) => {
          // k8s configmap values need careful quoting
          return `  ${k}: "${v.replace(/"/g, '\\"')}"`;
      }).join('\n');
      downloadBlob(yaml, 'configmap.yaml', 'application/x-yaml');
  }

  function exportVercel() {
      const data = getKeyValuePairs(content);
      // Vercel CLI format: [{"type": "encrypted", "key": "...", "value": "...", "target": ["production"]}]
      const vercelJSON = Object.entries(data).map(([k, v]) => ({
          type: "plain",
          key: k,
          value: v,
          target: ["development", "preview", "production"]
      }));
      downloadBlob(JSON.stringify(vercelJSON, null, 2), 'vercel.json', 'application/json');
  }

  function exportNetlify() {
      const data = getKeyValuePairs(content);
      // Netlify Toml/JSON format. For simplicity, plain JSON object.
      downloadBlob(JSON.stringify(data, null, 2), 'netlify-env.json', 'application/json');
  }

  function exportTypeScript() {
      const data = getKeyValuePairs(content);
      let ts = `// Auto-generated types for your .env file\n\n`;
      ts += `declare namespace NodeJS {\n`;
      ts += `  export interface ProcessEnv {\n`;
      for (const key of Object.keys(data)) {
          ts += `    ${key}: string;\n`;
      }
      ts += `  }\n`;
      ts += `}\n`;
      downloadBlob(ts, 'env.d.ts', 'application/typescript');
  }

  function copyJSON() {
      const data = getKeyValuePairs(content);
      navigator.clipboard.writeText(JSON.stringify(data, null, 2)).then(() => {
          // If we had a toast prop, we could call it. Since not, we just rely on standard behavior.
      });
  }

  function downloadBlob(dataStr: string, filename: string, type: string) {
      const blob = new Blob([dataStr], { type });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  }
</script>

<div class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
  <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
      {t.export.title}
  </h3>

  <div class="grid sm:grid-cols-2 gap-4">
      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={exportJSON}>
          <span class="text-indigo-500 font-bold font-mono">{"{ }"}</span>
          {t.export.json}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={exportYAML}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
          {t.export.yaml}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={exportDocker}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 12.002h-4.001M2 12.002h4.001M12.002 2v4.001M12.002 22v-4.001"></path><path d="m20.003 4.001-2.83 2.828M3.998 20.003l2.828-2.83M20.003 20.003l-2.83-2.83M3.998 4.001l2.828 2.828"></path><circle cx="12" cy="12" r="3"></circle></svg>
          {t.export.docker}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={exportK8s}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"></polygon><line x1="12" y1="22" x2="12" y2="15.5"></line><polyline points="22 8.5 12 15.5 2 8.5"></polyline><polyline points="2 15.5 12 8.5 22 15.5"></polyline><line x1="12" y1="2" x2="12" y2="8.5"></line></svg>
          {t.export.k8s}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={exportVercel}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m2 22 10-20 10 20z"></path></svg>
          {t.export.vercel || 'Vercel JSON'}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={exportNetlify}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 2-8 4v12l8 4 8-4V6l-8-4z"></path><path d="m12 22v-8"></path><path d="m4 18 8-4 8 4"></path><path d="m12 14-8-4"></path><path d="m12 14 8-4"></path></svg>
          {t.export.netlify || 'Netlify JSON'}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={exportTypeScript}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><path d="m8 10 3-3 3 3"></path><path d="M11 7v10"></path></svg>
          {t.export.typescript || 'TypeScript'}
      </button>

      <button class="min-h-[44px] min-w-[44px] px-6 py-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition flex items-center justify-center gap-2" on:click={copyJSON}>
          <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-indigo-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
          {t.copyJson}
      </button>
  </div>
</div>