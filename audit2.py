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

    lib_dir = os.path.join('src/lib/components', tool)
    lib_content = ""
    if os.path.exists(lib_dir):
        for root, dirs, files in os.walk(lib_dir):
            for file in files:
                if file.endswith('.svelte'):
                    with open(os.path.join(root, file), 'r', encoding='utf-8') as f:
                        lib_content += f.read()

    total_content = content + lib_content

    has_min_h = 'min-h-[44px]' in total_content or 'min-w-[44px]' in total_content
    has_button_comp = 'Button ' in total_content or '<Button' in total_content
    has_software_app = 'SoftwareApplication' in total_content or 'WebApplication' in total_content
    has_faq = 'FAQPage' in total_content or 'FAQSection' in total_content

    if not (has_min_h or has_button_comp) or not has_software_app:
        print(f"Tool {tool} needs attention:")
        if not (has_min_h or has_button_comp):
            print("  - Missing touch targets (min-h-[44px] or Button)")
        if not has_software_app:
            print("  - Missing SoftwareApplication schema")
