<script lang="ts">
  import type { Resume } from '$lib/utils/resume-forge/types';

  export let resume: Resume;

  const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
</script>

<div class="p-10 min-h-[297mm] h-full bg-white text-black font-sans">
  <!-- Header -->
  <header class="grid grid-cols-[2fr_1fr] gap-8 mb-10 border-b-4 border-black pb-8">
      <div>
          <h1 class="text-5xl font-black tracking-tighter uppercase mb-2 leading-none">{resume.basics.name}</h1>
          <div class="text-xl font-medium tracking-wide text-slate-600 uppercase">{resume.basics.label}</div>
      </div>

      <div class="text-right text-sm font-medium space-y-1">
          {#if resume.basics.email}<div class="block"><a href="mailto:{resume.basics.email}" class="hover:underline">{resume.basics.email}</a></div>{/if}
          {#if resume.basics.phone}<div class="block">{resume.basics.phone}</div>{/if}
          {#if resume.basics.location.city}<div class="block">{resume.basics.location.city}</div>{/if}
          {#if resume.basics.url}<div class="block"><a href={resume.basics.url} class="hover:underline">{displayUrl(resume.basics.url)}</a></div>{/if}
           {#each resume.basics.profiles as profile}
             <div class="block"><a href={profile.url} class="hover:underline">{profile.network}</a></div>
          {/each}
      </div>
  </header>

  <div class="grid grid-cols-[1fr_2.5fr] gap-12">
      <!-- Left Column -->
      <div class="space-y-8">
          <!-- Summary (Left) -->
           {#if resume.basics.summary}
           <section>
               <h2 class="text-xs font-black uppercase tracking-widest mb-3 text-slate-400">About</h2>
               <p class="text-sm leading-relaxed text-slate-800 font-medium">{resume.basics.summary}</p>
           </section>
           {/if}

          <!-- Skills -->
          {#if resume.skills.length > 0}
          <section>
              <h2 class="text-xs font-black uppercase tracking-widest mb-4 text-slate-400">Skills</h2>
              <div class="space-y-4">
                  {#each resume.skills as skill}
                  <div>
                      <div class="font-bold text-sm mb-1">{skill.name}</div>
                      <div class="text-xs text-slate-600 leading-relaxed">
                          {skill.keywords.join(', ')}
                      </div>
                  </div>
                  {/each}
              </div>
          </section>
          {/if}

          <!-- Education -->
          {#if resume.education.length > 0}
          <section>
              <h2 class="text-xs font-black uppercase tracking-widest mb-4 text-slate-400">Education</h2>
              <div class="space-y-4">
                  {#each resume.education as edu}
                  <div>
                      <div class="font-bold text-sm">{edu.institution}</div>
                      <div class="text-xs font-medium text-slate-600 mb-1">{edu.studyType}</div>
                      <div class="text-xs text-slate-500">{edu.endDate}</div>
                  </div>
                  {/each}
              </div>
          </section>
          {/if}

           <!-- Awards -->
          {#if resume.awards.length > 0}
          <section>
              <h2 class="text-xs font-black uppercase tracking-widest mb-4 text-slate-400">Awards</h2>
              <div class="space-y-3">
                  {#each resume.awards as award}
                  <div>
                      <div class="font-bold text-xs">{award.title}</div>
                      <div class="text-[10px] text-slate-500">{award.awarder}</div>
                  </div>
                  {/each}
              </div>
          </section>
          {/if}
      </div>

      <!-- Right Column -->
      <div class="space-y-10">
          <!-- Experience -->
          {#if resume.work.length > 0}
          <section>
              <h2 class="text-xs font-black uppercase tracking-widest mb-6 text-slate-400 border-b border-slate-100 pb-2">Experience</h2>
              <div class="space-y-8">
                  {#each resume.work as work}
                  <article>
                      <div class="flex justify-between items-start mb-2">
                          <div>
                              <h3 class="font-black text-lg">{work.position}</h3>
                              <div class="font-medium text-slate-600">{work.name}</div>
                          </div>
                          <div class="text-xs font-bold bg-black text-white px-2 py-1">
                              {work.startDate} - {work.endDate}
                          </div>
                      </div>

                      <p class="text-sm text-slate-800 mb-3 whitespace-pre-wrap leading-relaxed">{work.summary}</p>

                      {#if work.highlights.length > 0}
                      <ul class="text-sm text-slate-600 space-y-1.5 list-square ml-4 marker:text-black">
                          {#each work.highlights as highlight}
                          <li>{highlight}</li>
                          {/each}
                      </ul>
                      {/if}
                  </article>
                  {/each}
              </div>
          </section>
          {/if}

          <!-- Projects -->
          {#if resume.projects.length > 0}
          <section>
              <h2 class="text-xs font-black uppercase tracking-widest mb-6 text-slate-400 border-b border-slate-100 pb-2">Projects</h2>
              <div class="grid grid-cols-1 gap-6">
                  {#each resume.projects as project}
                  <article>
                      <div class="flex justify-between items-baseline mb-1">
                          <h3 class="font-bold text-base">{project.name}</h3>
                          <span class="text-xs font-mono text-slate-400">{project.startDate} — {project.endDate}</span>
                      </div>
                      <p class="text-sm text-slate-700 mb-2">{project.description}</p>
                      <div class="text-xs font-bold text-black uppercase tracking-wider">
                          {project.keywords.join(' / ')}
                      </div>
                  </article>
                  {/each}
              </div>
          </section>
          {/if}
      </div>
  </div>
</div>

<style>
    .list-square {
        list-style-type: square;
    }
</style>
