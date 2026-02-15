<script lang="ts">
  import { liveQuery } from 'dexie';
  import { db } from '$lib/db';
  import { Clock, TrendingUp, Calendar, Zap } from 'lucide-svelte';
  import type { getDictionary } from '$lib/dictionaries';

  export let dict: ReturnType<typeof getDictionary>['tools']['rhythmForge'];

  let sessions = liveQuery(() => db.rhythmForgeSessions.toArray());

  $: stats = calculateStats($sessions || []);

  function calculateStats(allSessions: any[]) {
      const today = new Date().setHours(0, 0, 0, 0);
      const todaySessions = allSessions.filter(s => new Date(s.createdAt).setHours(0,0,0,0) === today);

      const todayDuration = todaySessions.reduce((acc, s) => acc + s.duration, 0);
      const totalDuration = allSessions.reduce((acc, s) => acc + s.duration, 0);

      // Streak Calculation
      const dates = [...new Set(allSessions.map(s => new Date(s.createdAt).toDateString()))]
          .map(d => new Date(d).getTime())
          .sort((a, b) => b - a); // Descending

      let streak = 0;
      let currentCheck = new Date().setHours(0,0,0,0);

      // If no practice today, check if practice yesterday to continue streak
      // However, if we practice today, streak includes today.
      // If we didn't practice today, but did yesterday, streak is still active but doesn't include today?
      // Usually "Current Streak" implies consecutive days up to now.

      // If the most recent date is today, start counting.
      // If the most recent date is yesterday, start counting.
      // If the most recent date is before yesterday, streak is 0.

      if (dates.length > 0) {
          const lastPractice = dates[0];
          const diff = (today - lastPractice) / 86400000; // Days difference

          if (diff <= 1) {
              // Streak is active
              let checkDate = lastPractice;
              for (const date of dates) {
                  if (date === checkDate) {
                      streak++;
                      checkDate -= 86400000;
                  }
              }
          }
      }

      return {
          todayMinutes: Math.round(todayDuration / 60),
          totalMinutes: Math.round(totalDuration / 60),
          streak
      };
  }
</script>

<div class="grid grid-cols-3 gap-4">
    <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
        <div class="text-indigo-500 mb-2">
            <Clock size={24} />
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-white">
            {stats.todayMinutes}<span class="text-sm font-normal text-slate-400 ml-1">m</span>
        </div>
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {(dict as any)?.stats?.today || 'Today'}
        </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
        <div class="text-emerald-500 mb-2">
            <Zap size={24} />
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-white">
            {stats.streak}<span class="text-sm font-normal text-slate-400 ml-1">d</span>
        </div>
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {(dict as any)?.stats?.streak || 'Streak'}
        </div>
    </div>

    <div class="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
        <div class="text-purple-500 mb-2">
            <TrendingUp size={24} />
        </div>
        <div class="text-2xl font-black text-slate-800 dark:text-white">
            {stats.totalMinutes}<span class="text-sm font-normal text-slate-400 ml-1">m</span>
        </div>
        <div class="text-xs font-bold text-slate-400 uppercase tracking-wider">
            {(dict as any)?.stats?.total || 'Total'}
        </div>
    </div>
</div>
