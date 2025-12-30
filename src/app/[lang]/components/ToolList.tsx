'use client';

import { useState } from 'react';
import Link from 'next/link';

interface Tool {
  id: string;
  slug: string;
  title: { en: string; ko: string };
  description: { en: string; ko: string };
  category: string;
  tags: string[];
  createdAt: string;
}

interface ToolListProps {
  tools: Tool[];
  lang: string;
  searchPlaceholder: string;
}

export default function ToolList({ tools, lang, searchPlaceholder }: ToolListProps) {
  const [search, setSearch] = useState('');

  const filteredTools = tools.filter(tool => {
    const term = search.toLowerCase();
    const title = (lang === 'ko' ? tool.title.ko : tool.title.en).toLowerCase();
    const desc = (lang === 'ko' ? tool.description.ko : tool.description.en).toLowerCase();
    const category = tool.category.toLowerCase();
    const tags = tool.tags.join(' ').toLowerCase();

    return title.includes(term) || desc.includes(term) || category.includes(term) || tags.includes(term);
  });

  return (
    <>
      <div className="max-w-xl mx-auto">
        <input
          type="search"
          placeholder={searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filteredTools.length > 0 ? (
          filteredTools.map((tool) => (
            <Link key={tool.id} href={`/${lang}/tools/${tool.slug}`} className="block group">
              <div className="p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow h-full">
                <div className="flex justify-between items-start mb-2">
                    <span className="inline-block px-2 py-1 text-xs font-semibold bg-gray-100 text-gray-600 rounded">
                        {tool.category}
                    </span>
                    <span className="text-xs text-gray-400">{tool.createdAt}</span>
                </div>
                <h2 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                  {lang === 'ko' ? tool.title.ko : tool.title.en}
                </h2>
                <p className="text-gray-600">
                  {lang === 'ko' ? tool.description.ko : tool.description.en}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                    {tool.tags.map(tag => (
                        <span key={tag} className="text-xs text-gray-500">#{tag}</span>
                    ))}
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-2 p-6 bg-white rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
            {lang === 'ko' ? '검색 결과가 없습니다.' : 'No tools found.'}
          </div>
        )}
      </div>
    </>
  );
}
