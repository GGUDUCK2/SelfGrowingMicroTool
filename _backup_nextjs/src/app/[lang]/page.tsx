import { getDictionary } from "@/lib/dictionaries";
import registry from '@/lib/registry.json';
import ToolList from './components/ToolList';

// Type for registry items
interface Tool {
  id: string;
  slug: string;
  title: { en: string; ko: string };
  description: { en: string; ko: string };
  category: string;
  tags: string[];
  createdAt: string;
}

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const dict = getDictionary(lang);
  const tools = registry as Tool[];

  return (
    <div className="space-y-8">
      <header className="text-center space-y-4">
        <h1 className="text-4xl font-bold tracking-tight">{dict.home.title}</h1>
        <p className="text-xl text-gray-600">{dict.home.description}</p>
      </header>

      <ToolList tools={tools} lang={lang} searchPlaceholder={dict.home.search} />
    </div>
  );
}
