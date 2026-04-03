import re

with open('src/lib/components/diagram-forge/Toolbar.svelte', 'r') as f:
    text = f.read()

# Using regex to find <button class="min-h-[44px] min-w-[44px]" \n on:click={...} \n class="..."
# Replace it by combining classes

new_text = re.sub(
    r'<button class="min-h-\[44px\] min-w-\[44px\]"\s+on:click=([^\s]+)\s+class="([^"]+)"',
    r'<button class="min-h-[44px] min-w-[44px] \2"\n            on:click=\1',
    text
)

# If the on:click has spaces, above regex won't match, let's just use DOTALL

new_text = re.sub(
    r'<button class="min-h-\[44px\] min-w-\[44px\]"(.*?)class="([^"]+)"',
    r'<button class="min-h-[44px] min-w-[44px] \2"\1',
    text, flags=re.DOTALL
)

with open('src/lib/components/diagram-forge/Toolbar.svelte', 'w') as f:
    f.write(new_text)
