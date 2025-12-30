'use client';

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar({ lang }: { lang: string }) {
  const pathname = usePathname();

  // Helper to switch lang in path
  const switchLang = (newLang: string) => {
    if (!pathname) return `/${newLang}`;
    const segments = pathname.split('/');
    segments[1] = newLang; // assuming /lang/...
    return segments.join('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-black/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-shrink-0">
            <Link href={`/${lang}`} className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 transition-all">
              Micro-Tools
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex space-x-4">
                <Link href={`/${lang}`} className="text-sm font-medium hover:text-indigo-500 transition-colors">
                    {lang === 'en' ? 'Home' : '홈'}
                </Link>
            </div>

            <div className="flex items-center space-x-2 text-sm font-medium">
                <Link
                    href={switchLang('en')}
                    className={`px-2 py-1 rounded transition-colors ${lang === 'en' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    EN
                </Link>
                <span className="text-gray-300 dark:text-gray-700">|</span>
                <Link
                    href={switchLang('ko')}
                    className={`px-2 py-1 rounded transition-colors ${lang === 'ko' ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400' : 'text-gray-500 hover:text-gray-900 dark:hover:text-gray-300'}`}
                >
                    KO
                </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
