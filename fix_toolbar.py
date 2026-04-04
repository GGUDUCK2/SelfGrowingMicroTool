import re

with open('src/lib/components/diagram-forge/Toolbar.svelte', 'r') as f:
    text = f.read()

# Replace all class="..." that come after another class="..." or a <button with class
# The easiest way is just manual replace for Toolbar since it's just this one file that's stubborn

text = text.replace("""<button class="min-h-[44px] min-w-[44px]"
            on:click={() => dispatch('zoomOut')}
            class="p-3 md:p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
""", """<button class="min-h-[44px] min-w-[44px] p-3 md:p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            on:click={() => dispatch('zoomOut')}
""")

text = text.replace("""<button class="min-h-[44px] min-w-[44px]"
            on:click={() => dispatch('zoomIn')}
            class="p-3 md:p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
""", """<button class="min-h-[44px] min-w-[44px] p-3 md:p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-colors"
            on:click={() => dispatch('zoomIn')}
""")

text = text.replace("""<button class="min-h-[44px] min-w-[44px]"
            on:click={() => dispatch('saveHistory')}
            class="p-3 md:p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
""", """<button class="min-h-[44px] min-w-[44px] p-3 md:p-2 text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/30 rounded-lg transition-colors"
            on:click={() => dispatch('saveHistory')}
""")

# Actually let's just do a regex replace for any similar cases
def fix_button_with_two_classes(match):
    return match.group(0)

# The safest way is a robust script or manual replace for the specific lines
