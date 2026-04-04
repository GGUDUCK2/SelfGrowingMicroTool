import os
import re

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge', 'id-forge', 'pixel-forge', 'demographics-forge', 'zen-forge', 'unit-verse', 'barcode-forge', 'docker-forge']

def fix_buttons_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The issue is that some buttons have `class=...` or `class="something"`, some have `class:active="..."`, some have `class={\`...\`}`
    # The absolute safest way to add touch targets without breaking Svelte's compiler is to add an inline style if we can't safely modify class,
    # OR we can safely add it to a static `class="..."` IF AND ONLY IF it's the ONLY static `class="..."`.
    # Actually, Svelte allows mixing `class="..."` and `class:active={...}` but NOT two `class="..."` attributes.
    # What my previous script did was replace `<button>` with `<button class="...">` but then left the original `class="..."` which caused duplicates.

    # We will iterate through all matches of `<button[^>]*>`
    # Inside the match, we check if there's a `class="..."` (with quotes) or `class={'...'}` or `class={`...`}`
    # Wait, it's easier to just append the utility classes to the FIRST `class="` we find.
    # If no `class=` exists, we add `class="min-h-[44px] min-w-[44px]"`.
    # Wait, `class={`...`}` is a Svelte expression. We can't just inject into it safely easily.
    # Let's do it carefully:

    def replacer(match):
        tag = match.group(0)

        # If it already has the touch targets, return as is
        if 'min-h-[44px]' in tag and 'min-w-[44px]' in tag:
            return tag

        # Try to find a simple static class: `class="some-class"`
        # Not `class:`, not `class={`. Just `class="` or `class='`
        m = re.search(r'\sclass="([^"{}]*)"', tag)
        if m:
            # Append to it
            classes = m.group(1)
            new_classes = f"min-h-[44px] min-w-[44px] {classes}"
            # Replace the exact match
            new_tag = tag[:m.start()] + f' class="{new_classes}"' + tag[m.end():]
            return new_tag

        # Try `class={'...'}` or `class={`...`}`
        m2 = re.search(r'\sclass=\{([\'"`])(.*?)\1\}', tag)
        if m2:
            quote = m2.group(1)
            classes = m2.group(2)
            new_classes = f"min-h-[44px] min-w-[44px] {classes}"
            new_tag = tag[:m2.start()] + f' class={{{quote}{new_classes}{quote}}}' + tag[m2.end():]
            return new_tag

        # Try `class={`...${...}...`}` which is complex
        m3 = re.search(r'\sclass=\{`(.*?)`\}', tag, re.DOTALL)
        if m3:
            classes = m3.group(1)
            new_classes = f"min-h-[44px] min-w-[44px] {classes}"
            new_tag = tag[:m3.start()] + f' class={{`{new_classes}`}}' + tag[m3.end():]
            return new_tag

        # If it has NO `class=` at all (but might have `class:`)
        if 'class=' not in tag:
            return tag.replace('<button', '<button class="min-h-[44px] min-w-[44px]"', 1)

        # If we couldn't parse it but it has `class=`, just leave it to be safe, or add style
        # Actually Svelte allows style="..."
        if 'style="' in tag:
            return tag.replace('style="', 'style="min-height: 44px; min-width: 44px; ')
        else:
            return tag.replace('<button', '<button style="min-height: 44px; min-width: 44px;"', 1)

    new_content = re.sub(r'<button[^>]*>', replacer, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed buttons safely in {file_path}")

for tool in tools_to_fix:
    page_file = f'src/routes/[lang]/tools/{tool}/+page.svelte'
    if os.path.exists(page_file):
        fix_buttons_in_file(page_file)

    lib_dir = f'src/lib/components/{tool}'
    if os.path.exists(lib_dir):
        for root, dirs, files in os.walk(lib_dir):
            for file in files:
                if file.endswith('.svelte'):
                    fix_buttons_in_file(os.path.join(root, file))
