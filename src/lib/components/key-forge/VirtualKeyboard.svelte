<script lang="ts">
  export let activeKey: string = '';

  const rows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
    ['Shift', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'Shift'],
    ['Ctrl', 'Alt', 'Space', 'Alt', 'Ctrl']
  ];

  const keyMap: Record<string, string> = {
    '!': '1', '@': '2', '#': '3', '$': '4', '%': '5', '^': '6', '&': '7', '*': '8', '(': '9', ')': '0',
    '_': '-', '+': '=', '{': '[', '}': ']', '|': '\\', ':': ';', '"': "'", '<': ',', '>': '.', '?': '/',
    '~': '`'
  };

  function getKeyWidth(key: string) {
      if (key === 'Space') return 'w-64';
      if (key === 'Backspace' || key === 'Tab' || key === 'Enter' || key === 'Shift' || key === 'Caps' || key === '\\') return 'w-20 flex-grow';
      return 'w-10 flex-grow';
  }

  function isMatch(key: string, active: string) {
      if (!active) return false;
      if (key === 'Space' && active === ' ') return true;
      if (key === active) return true;
      if (keyMap[active] === key) return true;
      if (key.length === 1 && active.length === 1 && key.toLowerCase() === active.toLowerCase()) return true;

      // Shift logic
      if (key === 'Shift') {
          // If active is uppercase (and different from lowercase) OR is a symbol in keyMap
          if ((active.toUpperCase() === active && active.toLowerCase() !== active) || keyMap[active]) {
              return true;
          }
      }
      return false;
  }
</script>

<div class="flex flex-col gap-1 select-none opacity-50 hover:opacity-100 transition-opacity duration-300 scale-90 md:scale-100 origin-top">
    {#each rows as row}
        <div class="flex gap-1 justify-center">
            {#each row as key}
                <div
                    class="{getKeyWidth(key)} h-10 rounded flex items-center justify-center text-xs font-bold transition-all duration-75 border-b-2 shadow-sm"
                    class:bg-indigo-600={isMatch(key, activeKey)}
                    class:text-white={isMatch(key, activeKey)}
                    class:border-indigo-800={isMatch(key, activeKey)}
                    class:translate-y-[2px]={isMatch(key, activeKey)}
                    class:border-b-0={isMatch(key, activeKey)}
                    class:bg-white={!isMatch(key, activeKey)}
                    class:dark:bg-slate-700={!isMatch(key, activeKey)}
                    class:text-slate-600={!isMatch(key, activeKey)}
                    class:dark:text-slate-400={!isMatch(key, activeKey)}
                    class:border-slate-200={!isMatch(key, activeKey)}
                    class:dark:border-slate-900={!isMatch(key, activeKey)}
                >
                    {key}
                </div>
            {/each}
        </div>
    {/each}
</div>
