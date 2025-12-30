export default function Footer({ lang }: { lang: string }) {
    const year = new Date().getFullYear();

    return (
      <footer className="bg-white dark:bg-zinc-950 border-t border-zinc-100 dark:border-zinc-800 mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              &copy; {year} Micro-Tools Factory. {lang === 'ko' ? 'All rights reserved.' : 'All rights reserved.'}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-600 mt-2">
              Self-Evolving Web Tools
            </p>
          </div>
        </div>
      </footer>
    );
  }
