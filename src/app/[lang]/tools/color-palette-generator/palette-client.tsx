'use client';

import { useState, useEffect, useCallback } from 'react';
import { content } from './content';

// Simple ID Generator
const generateId = () => Math.random().toString(36).substr(2, 9);

// Random Color Generator
const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

// IndexedDB Helper
const DB_NAME = 'palette-db';
const STORE_NAME = 'palettes';
const DB_VERSION = 1;

interface Palette {
  id: string;
  colors: string[];
  createdAt: number;
}

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
};

const savePalette = async (palette: Palette) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(palette);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getPalettes = async (): Promise<Palette[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const clearPalettes = async () => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

export default function PaletteClient({ lang }: { lang: 'en' | 'ko' }) {
  const t = content[lang];
  const [colors, setColors] = useState<string[]>([]);
  const [locked, setLocked] = useState<boolean[]>([false, false, false, false, false]);
  const [history, setHistory] = useState<Palette[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const loadHistory = async () => {
    try {
      const palettes = await getPalettes();
      // Sort by newest first
      setHistory(palettes.sort((a, b) => b.createdAt - a.createdAt));
    } catch (e) {
      console.error(e);
    }
  };

  const generate = useCallback(() => {
    // Calculate new colors based on state
    const newColors = colors.length === 5 ? [...colors] : Array(5).fill('');
    for (let i = 0; i < 5; i++) {
      if (!locked[i] || newColors[i] === '') {
        newColors[i] = generateRandomColor();
      }
    }

    // Update state
    setColors(newColors);

    // Side effect: save to DB
    // We only save if it's a full palette (checking if it has 5 valid hex codes)
    if (newColors.every(c => c.startsWith('#'))) {
         const palette = { id: generateId(), colors: newColors, createdAt: Date.now() };
         savePalette(palette).then(() => loadHistory());
    }
  }, [colors, locked]);

  // Initial load
  useEffect(() => {
    if (colors.length === 0) {
        // Initial generation without saving? Or saving?
        // Let's generate initial colors without saving to history to avoid spam on refresh
        const initialColors = Array(5).fill('').map(() => generateRandomColor());
        setColors(initialColors);
    }
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [generate]);

  const toggleLock = (index: number) => {
    const newLocked = [...locked];
    newLocked[index] = !newLocked[index];
    setLocked(newLocked);
  };

  const copyToClipboard = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  };

  const clearAllHistory = async () => {
    if (confirm(lang === 'ko' ? '정말 모든 기록을 삭제하시겠습니까?' : 'Are you sure you want to clear all history?')) {
        await clearPalettes();
        loadHistory();
    }
  };

  const restorePalette = (paletteColors: string[]) => {
      setColors(paletteColors);
      setLocked([false, false, false, false, false]); // Reset locks when restoring
  };

  return (
    <div className="space-y-8">
      {/* Generator Area */}
      <div className="grid grid-cols-1 md:grid-cols-5 h-[500px] rounded-2xl overflow-hidden shadow-2xl">
        {colors.map((color, index) => (
          <div
            key={index}
            className="relative flex flex-col items-center justify-center h-full transition-colors duration-300 group"
            style={{ backgroundColor: color }}
          >
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />

            <div className="z-10 flex flex-col items-center space-y-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => toggleLock(index)}
                className={`p-3 rounded-full bg-white/20 backdrop-blur hover:bg-white/40 transition-all ${locked[index] ? 'opacity-100 ring-2 ring-white' : ''}`}
                title={locked[index] ? 'Unlock' : 'Lock'}
              >
                {locked[index] ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white/70"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                )}
              </button>

              <button
                onClick={() => copyToClipboard(color)}
                className="text-white font-mono text-xl font-bold uppercase tracking-wider hover:scale-105 transition-transform drop-shadow-md"
              >
                {copied === color ? t.copied : color}
              </button>
            </div>

            {/* Always visible on mobile */}
            <div className="md:hidden absolute bottom-8 text-white font-mono font-bold uppercase drop-shadow-md">
                {color}
            </div>
             {/* Always visible lock indicator if locked */}
            {locked[index] && (
                 <div className="absolute top-4 right-4 md:hidden">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white drop-shadow"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                 </div>
            )}
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center">
        <button
          onClick={() => generate()}
          className="px-8 py-4 bg-black text-white rounded-full text-lg font-bold shadow-lg hover:scale-105 transition-transform active:scale-95 flex items-center space-x-2"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12c0-5.5 4.5-10 10-10 1.5 0 2.9.3 4.2.9l-1.9 2.5C13.4 4.9 12.7 4.8 12 4.8c-4 0-7.2 3.2-7.2 7.2 0 4 3.2 7.2 7.2 7.2 1.3 0 2.6-.4 3.6-1.1l1.6 2.1c-1.5 1-3.2 1.6-5.2 1.6-5.5 0-10-4.5-10-10Z"/><path d="M21.5 8.5H17v-4.5"/><path d="M17 8.5l4.5-4.5"/></svg>
          <span>{t.generate}</span>
        </button>
      </div>
      <p className="text-center text-gray-500 text-sm hidden md:block">
        {lang === 'ko' ? '스페이스바를 눌러 생성하세요' : 'Press Spacebar to generate'}
      </p>

      {/* History */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">{t.history}</h2>
            {history.length > 0 && (
                <button onClick={clearAllHistory} className="text-sm text-red-500 hover:text-red-700">
                    {t.clearHistory}
                </button>
            )}
        </div>

        {history.length === 0 ? (
            <p className="text-gray-400 text-center py-8">{t.noHistory}</p>
        ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {history.map((palette) => (
                    <button
                        key={palette.id}
                        onClick={() => restorePalette(palette.colors)}
                        className="group relative flex h-16 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow ring-1 ring-gray-200"
                    >
                        {palette.colors.map((c, i) => (
                            <div key={i} className="flex-1 h-full" style={{ backgroundColor: c }} />
                        ))}
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <span className="text-white text-xs font-bold bg-black/50 px-2 py-1 rounded">Restore</span>
                        </div>
                    </button>
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
