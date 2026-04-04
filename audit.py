import os
import glob

tools_dir = 'src/routes/[lang]/tools'
tools = [d for d in os.listdir(tools_dir) if os.path.isdir(os.path.join(tools_dir, d))]

for tool in tools:
    page_file = os.path.join(tools_dir, tool, '+page.svelte')
    if not os.path.exists(page_file):
        continue

    with open(page_file, 'r', encoding='utf-8') as f:
        content = f.read()

    has_min_h = 'min-h-[44px]' in content or 'min-w-[44px]' in content
    # Some use Button component which has it, check for Button
    has_button_comp = 'Button ' in content or '<Button' in content
    has_software_app = 'SoftwareApplication' in content or 'WebApplication' in content
    has_faq = 'FAQPage' in content or 'FAQSection' in content

    if not (has_min_h or has_button_comp) or not has_software_app:
        print(f"Tool {tool} needs attention:")
        if not (has_min_h or has_button_comp):
            print("  - Missing touch targets (min-h-[44px] or Button)")
        if not has_software_app:
            print("  - Missing SoftwareApplication schema")
