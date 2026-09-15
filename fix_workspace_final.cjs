const fs = require('fs');

const file = 'src/lib/components/css-forge/CssWorkspace.svelte';
let content = fs.readFileSync(file, 'utf8');

// Fix the textarea issue
content = content.replace(/<textarea\s+bind:value=\{state\.input\}\s+on:input=\{handleProcess\}\s+placeholder="Paste your CSS here..."\s+class="w-full h-96 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900\/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-900 dark:text-slate-100"\s+spellcheck="false"\s+>\s+<\/textarea>/m,
`<textarea
            bind:value={state.input}
            on:input={handleProcess}
            placeholder="Paste your CSS here..."
            class="w-full h-96 p-4 font-mono text-sm bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-slate-900 dark:text-slate-100"
            spellcheck="false"
        ></textarea>`);

// Fix the handleProcess issue
content = content.replace(/\/\/ Hook into handleProcess\s*const originalHandleProcess = handleProcess;\s*handleProcess = function\(\) \{\s*validateCss\(state\.input\);\s*originalHandleProcess\(\);\s*\}/m, "");
content = content.replace(/function handleProcess\(\) \{/g, "function handleProcess() {\n    validateCss(state.input);");

fs.writeFileSync(file, content);
