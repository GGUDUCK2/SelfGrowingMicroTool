import re
import os

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge']

def fix_duplicate_class(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Find elements with two class attributes
    # The first one is from our script: class="min-h-[44px] min-w-[44px]"
    # Second one is existing: class="something"

    # Simple regex to merge them if they are on same line
    def merge_classes(m):
        # m.group(1) is min-h...
        # m.group(2) is the rest of classes
        return f'class="{m.group(1)} {m.group(2)}"'

    new_content = re.sub(r'class="min-h-\[44px\] min-w-\[44px\]"\s+[^>]*class="([^"]*)"', lambda m: 'class="min-h-[44px] min-w-[44px] ' + m.group(1) + '"' , content)

    # sometimes there are other attributes in between
    # <button class="min-h-[44px] min-w-[44px]" on:click={() => foo} class="p-2 text-slate-500">
    # regex: class="min-h-\[44px\] min-w-\[44px\]"(.*?)class="([^"]*)"
    # replace with class="min-h-[44px] min-w-[44px] \2"\1
    new_content = re.sub(r'class="min-h-\[44px\] min-w-\[44px\]"(.*?)class="([^"]*)"', lambda m: 'class="min-h-[44px] min-w-[44px] ' + m.group(2) + '"' + m.group(1), content)

    if new_content != content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Fixed duplicate class in {file_path}")

for tool in tools_to_fix:
    # Check page
    page_file = f'src/routes/[lang]/tools/{tool}/+page.svelte'
    if os.path.exists(page_file):
        fix_duplicate_class(page_file)

    # Check components
    lib_dir = f'src/lib/components/{tool}'
    if os.path.exists(lib_dir):
        for root, dirs, files in os.walk(lib_dir):
            for file in files:
                if file.endswith('.svelte'):
                    fix_duplicate_class(os.path.join(root, file))
