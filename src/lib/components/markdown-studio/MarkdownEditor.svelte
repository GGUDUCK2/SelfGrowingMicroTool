<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte';

  export let value: string = "";
  export let dictionary: any;

  const dispatch = createEventDispatcher();
  let textarea: HTMLTextAreaElement;

  function handleInput(event: Event) {
    const target = event.target as HTMLTextAreaElement;
    value = target.value;
    dispatch('change', value);
  }

  function handleKeydown(event: KeyboardEvent) {
    // Tab support
    if (event.key === 'Tab') {
      event.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      // Insert 2 spaces
      value = value.substring(0, start) + "  " + value.substring(end);

      // Update cursor position
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + 2;
        dispatch('change', value);
      }, 0);
    }

    // Command/Ctrl + S to save
    if ((event.metaKey || event.ctrlKey) && event.key === 's') {
      event.preventDefault();
      dispatch('save');
    }
  }

  export function insertAtCursor(text: string, selectionOffset: number = 0, selectionLength: number = 0) {
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // If there is a selection, wrap it if possible (basic implementation)
    // Actually, simpler logic: if text has placeholders like 'text', replace it with selection if exists
    let replacement = text;
    const selectedText = value.substring(start, end);

    // Simple wrap logic for common markdown patterns
    if (selectedText.length > 0) {
       // Check for patterns like **text**
       if (text.includes('text') && !text.startsWith('\n')) {
          replacement = text.replace('text', selectedText);
       } else if (text === '\n- ' || text === '\n1. ') {
          // List logic: apply to each line
          replacement = '\n' + selectedText.split('\n').map(line => text.trim() + ' ' + line).join('\n');
       }
    }

    value = value.substring(0, start) + replacement + value.substring(end);

    // Move cursor
    setTimeout(() => {
      textarea.focus();
      if (selectedText.length > 0 && text.includes('text')) {
         // Keep selection fully selected if it was wrapped
         textarea.selectionStart = start;
         textarea.selectionEnd = start + replacement.length;
      } else {
         // Place cursor at the offset
         textarea.selectionStart = textarea.selectionEnd = start + selectionOffset;
      }
      dispatch('change', value);
    }, 0);
  }
</script>

<div class="w-full h-full relative group">
  <textarea
    bind:this={textarea}
    class="w-full h-full p-4 bg-slate-50 dark:bg-slate-900/50 text-slate-800 dark:text-slate-200 border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm leading-relaxed"
    {value}
    placeholder={dictionary.placeholders.input}
    on:input={handleInput}
    on:keydown={handleKeydown}
    spellcheck="false"
  ></textarea>

  <!-- Line numbers visual cue could be added here if needed, but keeping it simple for now -->
</div>

<style>
  /* Custom scrollbar for better look */
  textarea::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  textarea::-webkit-scrollbar-track {
    background: transparent;
  }
  textarea::-webkit-scrollbar-thumb {
    background-color: #cbd5e1;
    border-radius: 4px;
  }
  :global(.dark) textarea::-webkit-scrollbar-thumb {
    background-color: #475569;
  }
  textarea::-webkit-scrollbar-thumb:hover {
    background-color: #94a3b8;
  }
  :global(.dark) textarea::-webkit-scrollbar-thumb:hover {
    background-color: #64748b;
  }
</style>
