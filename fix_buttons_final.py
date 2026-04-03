import os
import re

tools_to_fix = ['diagram-forge', 'time-forge', 'pdf-forge', 'banner-forge', 'jwt-forge', 'screen-forge']

def add_min_h_w_to_button_classes(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    def parse_button(match):
        button_tag = match.group(0)
        # Find all class attributes
        class_matches = re.findall(r'class="([^"]*)"', button_tag)
        if len(class_matches) >= 1:
            # Combine all class attributes
            combined_class = " ".join(class_matches)

            # Remove all class="..." attributes using a better loop
            clean_tag = button_tag
            while 'class="' in clean_tag:
                clean_tag = re.sub(r'\s*class="[^"]*"', '', clean_tag, count=1)

            # Deduplicate classes just in case
            classes_set = set()
            deduped_classes = []
            for c in combined_class.split():
                if c not in classes_set:
                    classes_set.add(c)
                    deduped_classes.append(c)

            # Make sure min-h/min-w are there
            if 'min-h-[44px]' not in classes_set:
                deduped_classes.append('min-h-[44px]')
            if 'min-w-[44px]' not in classes_set:
                deduped_classes.append('min-w-[44px]')

            final_class_str = " ".join(deduped_classes)

            return clean_tag.replace('<button', f'<button class="{final_class_str}"')
        else:
            return button_tag.replace('<button', '<button class="min-h-[44px] min-w-[44px]"')

    # Need to match multiline tags because sometimes button is: <button \n class="...">
    new_content = re.sub(r'<button[^>]*>', parse_button, content, flags=re.DOTALL)

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
