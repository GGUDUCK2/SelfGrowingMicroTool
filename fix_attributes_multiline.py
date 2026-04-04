import re
import os

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge']

def fix_duplicate_class_multiline(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # The regex r'class="min-h-\[44px\] min-w-\[44px\]"(.*?)class="([^"]*)"' with re.DOTALL
    new_content = re.sub(r'class="min-h-\[44px\] min-w-\[44px\]"(.*?)class="([^"]*)"', lambda m: 'class="min-h-[44px] min-w-[44px] ' + m.group(2) + '"' + m.group(1), content, flags=re.DOTALL)

    # Some cases might have class="..." then class="min-h-[44px] min-w-[44px]" which should already be covered by the first tool if we ran it, but just in case:
    # Actually wait, let's just make sure there are no buttons with duplicate classes
    # A generic approach: find all <button ...> tags. Parse them, combine class attributes.

    def parse_button(match):
        button_tag = match.group(0)
        # find all class="..."
        class_matches = re.findall(r'class="([^"]*)"', button_tag)
        if len(class_matches) > 1:
            combined_class = " ".join(class_matches)
            # Remove all class attributes
            clean_tag = re.sub(r'\s*class="[^"]*"', '', button_tag)
            # Insert combined class
            return clean_tag.replace('<button', f'<button class="{combined_class}"')
        return button_tag

    new_content = re.sub(r'<button[^>]*>', parse_button, content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed duplicate class in {file_path}")

for tool in tools_to_fix:
    # Check page
    page_file = f'src/routes/[lang]/tools/{tool}/+page.svelte'
    if os.path.exists(page_file):
        fix_duplicate_class_multiline(page_file)

    # Check components
    lib_dir = f'src/lib/components/{tool}'
    if os.path.exists(lib_dir):
        for root, dirs, files in os.walk(lib_dir):
            for file in files:
                if file.endswith('.svelte'):
                    fix_duplicate_class_multiline(os.path.join(root, file))
