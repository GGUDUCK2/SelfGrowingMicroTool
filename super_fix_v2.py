import os
import re

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge', 'id-forge', 'pixel-forge', 'demographics-forge', 'zen-forge', 'unit-verse', 'barcode-forge', 'docker-forge']

def fix_buttons_in_file(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Safest approach: add style="min-height: 44px; min-width: 44px;" to all buttons
    # Unless they already have it.
    # This avoids touching `class` which is easily broken due to Svelte's strict checking

    def replacer(match):
        tag = match.group(0)

        if 'min-h-[44px]' in tag and 'min-w-[44px]' in tag:
            return tag

        if 'min-height: 44px' in tag:
            return tag

        if 'style="' in tag:
            return tag.replace('style="', 'style="min-height: 44px; min-width: 44px; ')
        else:
            return tag.replace('<button', '<button style="min-height: 44px; min-width: 44px;"', 1)

    new_content = re.sub(r'<button(?![^>]*style="min-height: 44px)[^>]*>', replacer, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed buttons safely with style in {file_path}")

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
