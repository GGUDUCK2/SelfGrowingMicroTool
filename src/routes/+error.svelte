<script>
  import { page } from '$app/stores';
</script>

<div class="min-h-screen flex items-center justify-center bg-slate-900 text-slate-50 p-4">
  <div class="text-center max-w-lg">
    <div class="mb-6 flex justify-center">
        <svg class="w-20 h-20 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
        </svg>
    </div>
    <h1 class="text-4xl font-bold mb-4">Page Not Found</h1>
    <p class="text-slate-400 mb-8 text-lg">
      페이지를 찾을 수 없습니다. (The page you are looking for might have been removed or is temporarily unavailable.)
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <a
        href="/"
        class="bg-indigo-500 text-white px-6 py-3 rounded-lg hover:bg-indigo-600 transition-colors font-medium"
      >
        홈으로 돌아가기
      </a>
      <button
         class="border border-slate-600 text-slate-300 px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors"
         on:click={() => window.location.href = 'https://github.com/microfactory/issues'}
      >
        문제 신고하기
      </button>
    </div>
  </div>
</div>
