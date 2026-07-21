<script lang="ts">
  export let name = 'Kanban Board';

  let columns = [
      { id: 1, title: 'To Do', color: 'bg-slate-100 dark:bg-slate-800', tasks: [
          { id: 1, title: 'Research competitors', tag: 'Strategy', tagColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30' },
          { id: 2, title: 'Draft wireframes', tag: 'Design', tagColor: 'text-pink-600 bg-pink-50 dark:bg-pink-900/30' }
      ]},
      { id: 2, title: 'In Progress', color: 'bg-blue-50 dark:bg-blue-900/10', tasks: [
          { id: 3, title: 'Implement auth', tag: 'Backend', tagColor: 'text-amber-600 bg-amber-50 dark:bg-amber-900/30' }
      ]},
      { id: 3, title: 'Done', color: 'bg-green-50 dark:bg-green-900/10', tasks: [
          { id: 4, title: 'Project setup', tag: 'DevOps', tagColor: 'text-slate-600 bg-slate-50 dark:bg-slate-800/50' },
          { id: 5, title: 'Initial commit', tag: 'Git', tagColor: 'text-slate-600 bg-slate-50 dark:bg-slate-800/50' }
      ]}
  ];

  function moveTask(colIdx: number, taskIdx: number) {
      const task = columns[colIdx].tasks[taskIdx];
      columns[colIdx].tasks.splice(taskIdx, 1);
      const nextCol = (colIdx + 1) % columns.length;
      columns[nextCol].tasks.push(task);
      columns = columns; // trigger update
  }
</script>

<div class="h-full w-full flex flex-col p-4 bg-white dark:bg-slate-900/30 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
  <div class="flex justify-between items-center mb-4 px-1">
      <h3 class="font-bold text-sm flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-500"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
          {name}
      </h3>
      <div class="flex -space-x-2">
          <div class="w-6 h-6 rounded-full bg-slate-200 border-2 border-white dark:border-slate-900"></div>
          <div class="w-6 h-6 rounded-full bg-slate-300 border-2 border-white dark:border-slate-900"></div>
          <div class="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[8px] font-bold border-2 border-white dark:border-slate-900">+3</div>
      </div>
  </div>

  <div class="flex-1 flex gap-3 overflow-x-auto pb-2 snap-x">
      {#each columns as col, i (col.id)}
          <div class="flex-1 min-w-[140px] flex flex-col gap-2 rounded-lg p-2 {col.color} border border-transparent hover:border-slate-300 dark:hover:border-slate-600 transition-colors snap-center">
              <div class="flex justify-between items-center px-1 mb-1">
                  <span class="text-[10px] font-bold uppercase tracking-wider opacity-60">{col.title}</span>
                  <span class="text-[10px] bg-white dark:bg-black/20 px-1.5 rounded-full font-mono opacity-50">{col.tasks.length}</span>
              </div>

              <div class="flex-1 flex flex-col gap-2 overflow-y-auto max-h-[300px] custom-scrollbar">
                  {#each col.tasks as task, j (task.id)}
                      <button
                        class="bg-white dark:bg-slate-800 p-2.5 rounded shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md hover:-translate-y-0.5 transition-all text-left group min-h-[44px] min-w-[44px]"
                        on:click={() => moveTask(i, j)}
                        aria-label={`Move task ${task.title}`}
                      >
                          <div class="text-xs font-medium mb-2 leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">{task.title}</div>
                          <div class="flex justify-between items-center">
                              <span class="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase tracking-wide {task.tagColor}">{task.tag}</span>
                              <div class="w-4 h-4 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                          </div>
                      </button>
                  {/each}
                  <button class="w-full py-1.5 border border-dashed border-slate-300 dark:border-slate-600 rounded text-[10px] text-slate-400 hover:bg-white/50 dark:hover:bg-slate-700/50 hover:text-indigo-500 transition-colors flex items-center justify-center gap-1 min-h-[44px] min-w-[44px]">
                      <span>+ Add Task</span>
                  </button>
              </div>
          </div>
      {/each}
  </div>
</div>

<style>
  .custom-scrollbar::-webkit-scrollbar {
    width: 2px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: rgba(0,0,0,0.1);
    border-radius: 4px;
  }
</style>
