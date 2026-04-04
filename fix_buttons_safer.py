import os
import re

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge']

def add_min_h_w_to_button_classes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def replace_class(match):
        pre = match.group(1)
        classes = match.group(2)
        if 'min-h-[44px]' not in classes:
            classes = f'min-h-[44px] min-w-[44px] {classes}'
        return f'{pre}class="{classes}"'

    def parse_button(match):
        tag = match.group(0)
        # Svelte has issues if we try to mess with dynamic classes
        # Let's find exactly the static class="..." attribute and append to it
        # If there is no static class="..." attribute, we insert one

        # Check if there's a static class attribute
        if re.search(r'\sclass="([^"]*)"', tag):
            # We have a static class. Let's make sure it's the only one we touch.
            # Using sub with count=1 in case there are weird things, but usually it's fine.
            # Wait, there could be multiple static classes? Svelte compiler forbids that.
            return re.sub(r'(\s)class="([^"]*)"', replace_class, tag, count=1)
        else:
            # Check if it has svelte class: directives or something
            # Just safely insert after <button
            return tag.replace('<button', '<button class="min-h-[44px] min-w-[44px]"', 1)

    # Use re.sub to find all <button ...> tags
    # Make sure we don't match <button> ... </button> inner text
    # But just the open tag `<button ...>` or `<button>`
    new_content = re.sub(r'<button(?:\s[^>]*)?>', parse_button, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed buttons safely in {file_path}")

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
