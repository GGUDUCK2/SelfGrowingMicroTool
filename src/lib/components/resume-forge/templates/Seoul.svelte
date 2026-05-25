<script lang="ts">
  import type { Resume } from '$lib/utils/resume-forge/types';
  import { MapPin, Mail, Phone, Globe, Linkedin, Github, Twitter } from '@lucide/svelte';

  export let resume: Resume;

  const displayUrl = (url: string) => url.replace(/^https?:\/\//, '').replace(/\/$/, '');

  function getIcon(network: string) {
      const n = network.toLowerCase();
      if (n.includes('linkedin')) return Linkedin;
      if (n.includes('github')) return Github;
      if (n.includes('twitter') || n.includes('x')) return Twitter;
      return Globe;
  }
</script>

<div class="flex min-h-[297mm] h-full">
  <!-- Sidebar -->
  <div class="w-[32%] bg-[var(--accent)] text-white p-8 space-y-8 flex-shrink-0 print:bg-[var(--accent)] print:-webkit-print-color-adjust:exact">

     <!-- Contact -->
     <div class="space-y-4 text-sm">
        {#if resume.basics.email}
        <div class="flex items-center gap-3">
            <Mail size={16} class="flex-shrink-0 opacity-80" />
            <a href="mailto:{resume.basics.email}" class="hover:underline truncate">{resume.basics.email}</a>
        </div>
        {/if}

        {#if resume.basics.phone}
        <div class="flex items-center gap-3">
            <Phone size={16} class="flex-shrink-0 opacity-80" />
            <span>{resume.basics.phone}</span>
        </div>
        {/if}

        {#if resume.basics.location.city}
        <div class="flex items-center gap-3">
            <MapPin size={16} class="flex-shrink-0 opacity-80" />
            <span>{resume.basics.location.city}</span>
        </div>
        {/if}

        {#if resume.basics.url}
        <div class="flex items-center gap-3">
            <Globe size={16} class="flex-shrink-0 opacity-80" />
            <a href={resume.basics.url} class="hover:underline truncate">{displayUrl(resume.basics.url)}</a>
        </div>
        {/if}

        {#each resume.basics.profiles as profile}
        <div class="flex items-center gap-3">
            <svelte:component this={getIcon(profile.network)} size={16} class="flex-shrink-0 opacity-80" />
            <a href={profile.url} class="hover:underline truncate">{profile.username || displayUrl(profile.url)}</a>
        </div>
        {/each}
     </div>

     <!-- Skills -->
     {#if resume.skills.length > 0}
     <div class="space-y-4">
        <h3 class="font-bold uppercase tracking-wider border-b border-white/30 pb-1">Skills</h3>
        <div class="space-y-3">
            {#each resume.skills as skill}
            <div>
                <div class="font-semibold">{skill.name}</div>
                <div class="text-xs opacity-90 leading-relaxed">
                    {#if skill.level}<span class="italic opacity-80">{skill.level}</span> - {/if}
                    {skill.keywords.join(', ')}
                </div>
            </div>
            {/each}
        </div>
     </div>
     {/if}

     <!-- Education -->
     {#if resume.education.length > 0}
     <div class="space-y-4">
        <h3 class="font-bold uppercase tracking-wider border-b border-white/30 pb-1">Education</h3>
        <div class="space-y-4">
            {#each resume.education as edu}
            <div>
                <div class="font-bold">{edu.institution}</div>
                <div class="text-sm opacity-90">{edu.area}</div>
                <div class="text-xs opacity-75 mt-0.5">
                    {edu.startDate} - {edu.endDate}
                </div>
                {#if edu.score}
                    <div class="text-xs mt-1">GPA: {edu.score}</div>
                {/if}
            </div>
            {/each}
        </div>
     </div>
     {/if}

     <!-- Awards -->
     {#if resume.awards.length > 0}
     <div class="space-y-4">
        <h3 class="font-bold uppercase tracking-wider border-b border-white/30 pb-1">Awards</h3>
        <div class="space-y-3">
            {#each resume.awards as award}
            <div>
                <div class="font-bold text-sm">{award.title}</div>
                <div class="text-xs opacity-75">{award.awarder} | {award.date}</div>
            </div>
            {/each}
        </div>
     </div>
     {/if}
  </div>

  <!-- Main Content -->
  <div class="flex-1 p-10 space-y-8 bg-white text-slate-800">
     <!-- Header -->
     <header class="space-y-2">
         <h1 class="text-4xl font-extrabold tracking-tight text-[var(--accent)] uppercase leading-none">{resume.basics.name}</h1>
         <div class="text-xl font-medium text-slate-500 tracking-wide">{resume.basics.label}</div>
     </header>

     <!-- Summary -->
     {#if resume.basics.summary}
     <section>
        <h2 class="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[var(--accent)] pb-1 mb-3">Profile</h2>
        <p class="text-sm leading-relaxed text-slate-600 whitespace-pre-wrap">{resume.basics.summary}</p>
     </section>
     {/if}

     <!-- Experience -->
     {#if resume.work.length > 0}
     <section class="space-y-6">
        <h2 class="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[var(--accent)] pb-1 mb-2">Experience</h2>

        {#each resume.work as work}
        <article>
            <div class="flex justify-between items-baseline mb-1">
                <h3 class="font-bold text-slate-800 text-lg">{work.position}</h3>
                <span class="text-sm font-medium text-[var(--accent)] whitespace-nowrap">{work.startDate} — {work.endDate}</span>
            </div>
            <div class="text-sm font-semibold text-slate-600 mb-2">{work.name} {#if work.url}| <a href={work.url} class="hover:underline">{displayUrl(work.url)}</a>{/if}</div>

            <p class="text-sm text-slate-600 mb-2 whitespace-pre-wrap">{work.summary}</p>

            {#if work.highlights.length > 0}
            <ul class="list-disc list-outside ml-4 text-sm text-slate-600 space-y-1">
                {#each work.highlights as highlight}
                <li>{highlight}</li>
                {/each}
            </ul>
            {/if}
        </article>
        {/each}
     </section>
     {/if}

     <!-- Projects -->
     {#if resume.projects.length > 0}
     <section class="space-y-6">
        <h2 class="text-lg font-bold uppercase tracking-wider text-slate-900 border-b-2 border-[var(--accent)] pb-1 mb-2">Projects</h2>

        {#each resume.projects as project}
        <article>
            <div class="flex justify-between items-baseline mb-1">
                <h3 class="font-bold text-slate-800">{project.name}</h3>
                <span class="text-xs font-medium text-slate-500 whitespace-nowrap">{project.startDate} — {project.endDate}</span>
            </div>
            <p class="text-sm text-slate-600 mb-1">{project.description}</p>
            <div class="text-xs text-[var(--accent)] font-medium">
                {project.keywords.join(' • ')}
            </div>
        </article>
        {/each}
     </section>
     {/if}
  </div>
</div>
