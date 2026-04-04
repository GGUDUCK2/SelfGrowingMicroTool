import re

with open('src/lib/components/jwt-forge/HistoryPanel.svelte', 'r') as f:
    text = f.read()

new_text = re.sub(
    r'<button class="min-h-\[44px\] min-w-\[44px\]"(.*?)class="([^"]+)"',
    r'<button class="min-h-[44px] min-w-[44px] \2"\1',
    text, flags=re.DOTALL
)

with open('src/lib/components/jwt-forge/HistoryPanel.svelte', 'w') as f:
    f.write(new_text)
