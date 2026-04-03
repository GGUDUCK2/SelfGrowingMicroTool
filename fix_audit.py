import os
import re

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge']

def add_touch_targets(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find buttons and add min-h-[44px] min-w-[44px] to their class
    # Basic heuristic to avoid breaking existing classes
    new_content = re.sub(r'(<button[^>]*class=")([^"]*)(")', lambda m: m.group(1) + m.group(2) + (' min-h-[44px] min-w-[44px]' if 'min-h-[44px]' not in m.group(2) else '') + m.group(3), content)

    # Check if there are buttons without class
    new_content = re.sub(r'(<button)(?![^>]*class=)([^>]*)>', lambda m: m.group(1) + ' class="min-h-[44px] min-w-[44px]"' + m.group(2) + '>', new_content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed touch targets in {file_path}")

for tool in tools_to_fix:
    # Check page
    page_file = f'src/routes/[lang]/tools/{tool}/+page.svelte'
    if os.path.exists(page_file):
        add_touch_targets(page_file)

    # Check components
    lib_dir = f'src/lib/components/{tool}'
    if os.path.exists(lib_dir):
        for root, dirs, files in os.walk(lib_dir):
            for file in files:
                if file.endswith('.svelte'):
                    add_touch_targets(os.path.join(root, file))
