import re

with open('src/routes/[lang]/tools/diagram-forge/+page.svelte', 'r') as f:
    text = f.read()

# Let's see what it looks like currently
match = re.search(r'<button class="min-h-\[44px\] min-w-\[44px\]" on:click=\{\(\) => showSidebar = false\} class="p-2 text-slate-500">', text)
if match:
    print("Found exact duplicate class!")
