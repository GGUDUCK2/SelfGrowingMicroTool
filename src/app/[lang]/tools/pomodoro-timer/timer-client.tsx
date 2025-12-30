'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// Types
interface Session {
  id?: number;
  startTime: number;
  duration: number; // in seconds
  type: 'work' | 'break';
  task?: string;
}

// IndexedDB Helper
const DB_NAME = 'pomodoro-db';
const STORE_NAME = 'sessions';
const DB_VERSION = 1;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true });
      }
    };
  });
};

const saveSession = async (session: Session) => {
  const db = await initDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.add(session);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getSessions = async (): Promise<Session[]> => {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export default function PomodoroTimer({ lang }: { lang: string }) {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');
  const [task, setTask] = useState('');
  const [history, setHistory] = useState<Session[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use a ref for task to access it inside callbacks without re-triggering effects
  const taskRef = useRef(task);
  useEffect(() => {
    taskRef.current = task;
  }, [task]);

  const resetTimer = useCallback((newMode: 'work' | 'break' = mode) => {
    setIsActive(false);
    setMode(newMode);
    setTimeLeft(newMode === 'work' ? 25 * 60 : 5 * 60);
    if (intervalRef.current) clearInterval(intervalRef.current);
  }, [mode]);

  const handleComplete = useCallback(() => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    // Play sound
    const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
    audio.play().catch(e => console.error("Audio play failed", e));

    // Save session
    const session: Session = {
      startTime: Date.now(),
      duration: mode === 'work' ? 25 * 60 : 5 * 60,
      type: mode,
      task: mode === 'work' ? taskRef.current : undefined
    };
    saveSession(session).then(() => {
        getSessions().then(setHistory);
    });

    alert(mode === 'work' ? 'Work session complete! Take a break.' : 'Break over! Back to work.');
    resetTimer(mode === 'work' ? 'break' : 'work');
  }, [mode, resetTimer]);

  useEffect(() => {
    getSessions().then(setHistory).catch(console.error);
  }, []);

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
            if (prev <= 1) {
                if (intervalRef.current) clearInterval(intervalRef.current);
                handleComplete();
                return 0;
            }
            return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive, timeLeft, handleComplete]);

  const toggleTimer = () => setIsActive(!isActive);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
        <Link href={`/${lang}`} className="text-sm text-gray-500 hover:underline mb-4 inline-block">
          &larr; {lang === 'ko' ? '홈으로 돌아가기' : 'Back to Home'}
        </Link>

        <div className="bg-white rounded-2xl shadow-lg p-8 text-center space-y-8 border border-gray-100">
            <h1 className="text-3xl font-bold text-gray-800">
                {lang === 'ko' ? '뽀모도로 타이머' : 'Pomodoro Timer'}
            </h1>

            <div className="flex justify-center space-x-4">
                <button
                    onClick={() => resetTimer('work')}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${mode === 'work' ? 'bg-red-100 text-red-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    {lang === 'ko' ? '집중' : 'Work'}
                </button>
                <button
                    onClick={() => resetTimer('break')}
                    className={`px-4 py-2 rounded-full font-medium transition-colors ${mode === 'break' ? 'bg-green-100 text-green-600' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    {lang === 'ko' ? '휴식' : 'Break'}
                </button>
            </div>

            <div className="text-8xl font-black text-gray-900 tracking-tighter tabular-nums">
                {formatTime(timeLeft)}
            </div>

            {mode === 'work' && (
                <input
                    type="text"
                    placeholder={lang === 'ko' ? '무엇을 하고 계신가요?' : 'What are you working on?'}
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    className="w-full max-w-sm mx-auto block px-4 py-2 text-center border-b-2 border-gray-200 focus:border-black outline-none bg-transparent"
                />
            )}

            <div className="flex justify-center space-x-4">
                <button
                    onClick={toggleTimer}
                    className="px-8 py-3 bg-black text-white rounded-xl font-bold hover:bg-gray-800 transition-transform active:scale-95"
                >
                    {isActive ? (lang === 'ko' ? '일시정지' : 'Pause') : (lang === 'ko' ? '시작' : 'Start')}
                </button>
                <button
                    onClick={() => resetTimer()}
                    className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-transform active:scale-95"
                >
                    {lang === 'ko' ? '리셋' : 'Reset'}
                </button>
            </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-2xl shadow p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-4">{lang === 'ko' ? '세션 기록' : 'Session History'}</h2>
            {history.length === 0 ? (
                <p className="text-gray-400 text-center py-4">{lang === 'ko' ? '아직 기록이 없습니다.' : 'No history yet.'}</p>
            ) : (
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                    {history.slice().reverse().map((session) => (
                        <li key={session.id} className="flex justify-between items-center text-sm p-2 hover:bg-gray-50 rounded">
                            <span className="font-medium text-gray-700">
                                {session.type === 'work' ? '🔴 Work' : '🟢 Break'}
                            </span>
                            <span className="text-gray-500">{session.task || '-'}</span>
                            <span className="text-gray-400">
                                {new Date(session.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>

        {/* AEO Content */}
        <article className="prose prose-gray max-w-none bg-white p-8 rounded-2xl shadow border border-gray-100 mt-12">
            <h3>{lang === 'ko' ? '이 도구는 무엇인가요?' : 'What is this tool?'}</h3>
            <p>
                {lang === 'ko'
                    ? '뽀모도로 타이머는 1980년대 후반 프란체스코 시릴로가 제안한 시간 관리 방법론인 "뽀모도로 기법"을 웹 브라우저에서 바로 실천할 수 있도록 돕는 도구입니다. 25분간 집중해서 일하고, 5분간 휴식하는 패턴을 반복함으로써 뇌의 피로를 줄이고 집중력을 극대화할 수 있습니다.'
                    : 'The Pomodoro Timer is a tool designed to help you practice the "Pomodoro Technique," a time management method proposed by Francesco Cirillo in the late 1980s. By repeating the pattern of working intensely for 25 minutes and resting for 5 minutes, you can reduce mental fatigue and maximize concentration.'}
            </p>

            <h3>{lang === 'ko' ? '사용 방법' : 'How to use'}</h3>
            <ol>
                <li>
                    <strong>{lang === 'ko' ? '목표 설정' : 'Set a Goal'}:</strong>
                    {lang === 'ko' ? ' 지금 집중해서 끝내야 할 작업을 입력하세요.' : ' Enter the task you need to focus on right now.'}
                </li>
                <li>
                    <strong>{lang === 'ko' ? '타이머 시작' : 'Start Timer'}:</strong>
                    {lang === 'ko' ? ' "집중(Work)" 또는 "시작" 버튼을 눌러 25분 타이머를 시작하세요.' : ' Click the "Work" or "Start" button to begin the 25-minute timer.'}
                </li>
                <li>
                    <strong>{lang === 'ko' ? '집중' : 'Focus'}:</strong>
                    {lang === 'ko' ? ' 알람이 울릴 때까지 한 가지 작업에만 몰두하세요.' : ' Focus on a single task until the alarm sounds.'}
                </li>
                <li>
                    <strong>{lang === 'ko' ? '휴식' : 'Take a Break'}:</strong>
                    {lang === 'ko' ? ' 25분이 지나면 "휴식(Break)" 모드로 전환하여 5분간 뇌를 쉬게 해주세요.' : ' After 25 minutes, switch to "Break" mode and rest your brain for 5 minutes.'}
                </li>
            </ol>

            <h3>FAQ</h3>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [{
                            "@type": "Question",
                            "name": lang === 'ko' ? "이 타이머는 무료인가요?" : "Is this timer free?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": lang === 'ko' ? "네, 100% 무료이며 별도의 회원가입이나 설치가 필요 없습니다." : "Yes, it is 100% free and requires no registration or installation."
                            }
                        }, {
                            "@type": "Question",
                            "name": lang === 'ko' ? "기록은 어디에 저장되나요?" : "Where is the history saved?",
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": lang === 'ko' ? "사용자의 브라우저 내부 저장소(IndexedDB)에 안전하게 저장됩니다. 서버로 전송되지 않습니다." : "It is securely saved in your browser's internal storage (IndexedDB). No data is sent to the server."
                            }
                        }]
                    })
                }}
            />
            <details className="cursor-pointer group">
                <summary className="font-medium text-gray-900 group-hover:underline">
                    {lang === 'ko' ? "이 타이머는 무료인가요?" : "Is this timer free?"}
                </summary>
                <p className="mt-2 text-gray-600">
                    {lang === 'ko' ? "네, 100% 무료이며 별도의 회원가입이나 설치가 필요 없습니다." : "Yes, it is 100% free and requires no registration or installation."}
                </p>
            </details>
            <details className="cursor-pointer group mt-4">
                <summary className="font-medium text-gray-900 group-hover:underline">
                    {lang === 'ko' ? "기록은 어디에 저장되나요?" : "Where is the history saved?"}
                </summary>
                <p className="mt-2 text-gray-600">
                    {lang === 'ko' ? "사용자의 브라우저 내부 저장소(IndexedDB)에 안전하게 저장됩니다. 서버로 전송되지 않습니다." : "It is securely saved in your browser's internal storage (IndexedDB). No data is sent to the server."}
                </p>
            </details>
        </article>
    </div>
  );
}
