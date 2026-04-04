import os
import re

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge']

def add_min_h_w_to_button_classes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def replace_class(match):
        class_val = match.group(2)
        if 'min-h-[44px]' not in class_val:
            class_val += ' min-h-[44px] min-w-[44px]'
        return f'{match.group(1)}"{class_val}"'

    # 1. Add to existing class attributes inside <button>
    # We'll do this by finding all <button ... >
    def parse_button(match):
        tag = match.group(0)
        if 'class="' in tag:
            return re.sub(r'(class=)"([^"]*)"', replace_class, tag)
        else:
            return tag.replace('<button', '<button class="min-h-[44px] min-w-[44px]"')

    new_content = re.sub(r'<button[^>]*>', parse_button, content)

    # 2. Check if there are svelte dynamic classes like class:active="..."
    # Note: adding min-h/min-w there isn't ideal. Usually min-h/min-w should be in base class=""

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed buttons in {file_path}")

for tool in tools_to_fix:
    # Check page
    page_file = f'src/routes/[lang]/tools/{tool}/+page.svelte'
    if os.path.exists(page_file):
        add_min_h_w_to_button_classes(page_file)

    # Check components
    lib_dir = f'src/lib/components/{tool}'
    if os.path.exists(lib_dir):
        for root, dirs, files in os.walk(lib_dir):
            for file in files:
                if file.endswith('.svelte'):
                    add_min_h_w_to_button_classes(os.path.join(root, file))
