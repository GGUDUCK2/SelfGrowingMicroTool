import re

text = """
<button class="min-h-[44px] min-w-[44px]" on:click={() => showSidebar = false} class="p-2 text-slate-500">
"""

def parse_button(match):
    button_tag = match.group(0)
    # Find all class attributes
    class_matches = re.findall(r'class="([^"]*)"', button_tag)
    if len(class_matches) >= 1:
        # Combine all class attributes
        combined_class = " ".join(class_matches)

        # Svelte conditional classes: class:something={...} shouldn't be touched by the class="..." replacer
        # Remove all class="..." attributes
        clean_tag = re.sub(r'\s+class="[^"]*"', '', button_tag)

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

print(re.sub(r'<button[^>]*>', parse_button, text))
