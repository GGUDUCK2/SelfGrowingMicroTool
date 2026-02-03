<script lang="ts">
  import type { Resume } from '$lib/utils/resume-forge/types';

  export let resume: Resume;

  const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');
</script>

<div class="p-12 min-h-[297mm] h-full bg-white text-slate-900 font-serif">
  <!-- Header -->
  <header class="text-center space-y-4 mb-8">
      <div>
          <h1 class="text-3xl font-bold uppercase tracking-widest text-slate-900">{resume.basics.name}</h1>
          <div class="text-lg text-slate-600 mt-1 italic">{resume.basics.label}</div>
      </div>

      <div class="text-sm flex flex-wrap justify-center gap-x-4 gap-y-1 text-slate-600 separator-dots">
          {#if resume.basics.email}<span>{resume.basics.email}</span>{/if}
          {#if resume.basics.phone}<span>{resume.basics.phone}</span>{/if}
          {#if resume.basics.location.city}<span>{resume.basics.location.city}</span>{/if}
          {#if resume.basics.url}<a href={resume.basics.url} class="hover:underline">{displayUrl(resume.basics.url)}</a>{/if}
          {#each resume.basics.profiles as profile}
             <a href={profile.url} class="hover:underline">{profile.username || profile.network}</a>
          {/each}
      </div>
  </header>

  <!-- Summary -->
  {#if resume.basics.summary}
  <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-3 pb-1">Professional Profile</h2>
      <p class="text-sm leading-relaxed text-slate-700 whitespace-pre-wrap">{resume.basics.summary}</p>
  </section>
  {/if}

  <!-- Skills -->
  {#if resume.skills.length > 0}
  <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-3 pb-1">Core Competencies</h2>
      <div class="flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-700">
          {#each resume.skills as skill}
             <div class="flex items-center gap-1">
                 <span class="font-bold">{skill.name}:</span>
                 <span>{skill.keywords.join(', ')}</span>
             </div>
          {/each}
      </div>
  </section>
  {/if}

  <!-- Experience -->
  {#if resume.work.length > 0}
  <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Professional Experience</h2>
      <div class="space-y-5">
          {#each resume.work as work}
          <article>
              <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-bold text-slate-900 text-base">{work.name}</h3>
                  <span class="text-sm italic text-slate-600">{work.startDate} – {work.endDate}</span>
              </div>
              <div class="text-sm font-semibold text-slate-700 italic mb-2">{work.position}</div>

              <p class="text-sm text-slate-700 mb-2 whitespace-pre-wrap">{work.summary}</p>

              {#if work.highlights.length > 0}
              <ul class="list-disc list-outside ml-4 text-sm text-slate-700 space-y-1">
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

  <!-- Education -->
  {#if resume.education.length > 0}
  <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Education</h2>
      <div class="space-y-3">
          {#each resume.education as edu}
          <div class="flex justify-between items-start">
              <div>
                  <div class="font-bold text-slate-900">{edu.institution}</div>
                  <div class="text-sm text-slate-700">{edu.studyType} in {edu.area}</div>
                  {#if edu.score}<div class="text-xs text-slate-500">GPA: {edu.score}</div>{/if}
              </div>
              <div class="text-sm text-slate-600 text-right">
                  {edu.startDate} – {edu.endDate}
              </div>
          </div>
          {/each}
      </div>
  </section>
  {/if}

  <!-- Projects -->
  {#if resume.projects.length > 0}
  <section class="mb-6">
      <h2 class="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-4 pb-1">Projects</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          {#each resume.projects as project}
          <article>
              <div class="flex justify-between items-baseline mb-1">
                  <h3 class="font-bold text-slate-900">{project.name}</h3>
              </div>
              <p class="text-sm text-slate-700 mb-1 leading-snug">{project.description}</p>
              <div class="text-xs text-slate-500 italic">
                  {project.keywords.join(', ')}
              </div>
          </article>
          {/each}
      </div>
  </section>
  {/if}

  <!-- Awards -->
  {#if resume.awards.length > 0}
  <section>
      <h2 class="text-sm font-bold uppercase tracking-widest border-b border-slate-300 mb-3 pb-1">Awards</h2>
      <ul class="list-disc list-inside text-sm text-slate-700">
          {#each resume.awards as award}
             <li><span class="font-bold">{award.title}</span> — {award.awarder} ({award.date})</li>
          {/each}
      </ul>
  </section>
  {/if}
</div>

<style>
    .separator-dots > *:not(:last-child)::after {
        content: "•";
        margin-left: 1rem;
        opacity: 0.5;
    }
</style>
