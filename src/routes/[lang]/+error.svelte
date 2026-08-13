<script>
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-900 text-slate-50 p-4">
  <div class="text-center max-w-lg">
    <div class="mb-6 flex justify-center">
       <!-- Brand Icon -->
       <svg class="w-20 h-20 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
    </div>
    <h1 class="text-4xl font-bold mb-2">{$page.status} Error</h1>
    <h2 class="text-2xl font-bold mb-4 text-slate-50">{$page.error?.message || 'Something went wrong'}</h2>

    <p class="text-slate-400 mb-8 text-lg">
      <span class="text-sm opacity-80 mt-2 block">문제가 발생했습니다. 다시 시도해 주세요.</span>
    </p>

    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <!-- svelte-ignore svelte/no-navigation-without-resolve -->
      <a
        href={$page.params.lang ? '/' + $page.params.lang : '/'}
        class="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium min-h-[44px] min-w-[44px] flex items-center justify-center"
      >
        Go Home / 홈으로 돌아가기
      </a>
      <button class="border border-slate-600 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
         on:click={() => window.location.href = 'https://github.com/microfactory/issues'}
      >
        Report Issue / 문제 신고하기
      </button>
    </div>
  </div>
</div>
