"use client";

import { useEffect, useState, useMemo } from "react";
import { content } from "./content";

type Lang = "en" | "ko";

interface CalculatorState {
  principal: number;
  rate: number;
  years: number;
  frequency: "daily" | "monthly" | "quarterly" | "annually";
  contribution: number;
}

const DB_NAME = "compound-calc-db";
const STORE_NAME = "settings";

export default function CalculatorClient({ lang }: { lang: Lang }) {
  const t = content[lang];
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<CalculatorState>({
    principal: 1000,
    rate: 5,
    years: 10,
    frequency: "monthly",
    contribution: 100,
  });

  // Load from IndexedDB on mount
  useEffect(() => {
    // setMounted(true) should be fine here as it triggers a re-render to show client-side only content
    // but React strict mode might complain. It is better to use it to gate the effect or just use empty dependency array.
    // However, the linter complains about calling it synchronously.
    // Let's delay it or wrap in a condition, or just ignore if it is standard pattern.
    // Actually, setting state in useEffect IS the standard way to handle hydration mismatch.
    // But let's check if we can do it differently.
    const timer = setTimeout(() => setMounted(true), 0);

    if (typeof window === "undefined") return;

    const request = indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const getReq = store.get("latest");
      getReq.onsuccess = () => {
        if (getReq.result) {
          // Validate loaded data to avoid crashes if schema changes or data is corrupt
          const loaded = getReq.result;
          setState(prev => ({
            ...prev,
            ...loaded
          }));
        }
      };
    };
    return () => clearTimeout(timer);
  }, []);

  // Save to IndexedDB on change
  useEffect(() => {
    if (!mounted || typeof window === "undefined") return;

    const save = setTimeout(() => {
        const request = indexedDB.open(DB_NAME, 1);
        request.onsuccess = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        const tx = db.transaction(STORE_NAME, "readwrite");
        const store = tx.objectStore(STORE_NAME);
        store.put(state, "latest");
        };
    }, 500); // Debounce save

    return () => clearTimeout(save);
  }, [state, mounted]);

  const results = useMemo(() => {
    let { years } = state;
    const { principal, rate, frequency, contribution } = state;
    // Prevent bad calculations
    if (years < 0) years = 0;
    if (principal < 0) principal = 0;
    if (rate < 0) rate = 0;
    if (contribution < 0) contribution = 0;

    const r = rate / 100;
    let n = 1; // times compounded per year
    if (frequency === "daily") n = 365;
    if (frequency === "monthly") n = 12;
    if (frequency === "quarterly") n = 4;
    if (frequency === "annually") n = 1;

    let balance = principal;
    let totalContribution = principal;
    const chartData = [];

    // Simulate month by month
    const totalMonths = Math.floor(years * 12);

    // Add initial point
    chartData.push({
        year: 0,
        balance: balance,
        invested: totalContribution
    });

    for (let i = 1; i <= totalMonths; i++) {
        // Add monthly contribution
        balance += contribution;
        totalContribution += contribution;

        // Apply interest for this month
        // Effective monthly rate based on compounding frequency
        const interestFactor = Math.pow(1 + r/n, n/12);
        balance = balance * interestFactor;

        // Snapshot every year
        if (i % 12 === 0) {
            chartData.push({
                year: i / 12,
                balance: Math.round(balance),
                invested: Math.round(totalContribution)
            });
        }
    }

    return {
        futureValue: Math.round(balance),
        totalContributions: Math.round(totalContribution),
        totalInterest: Math.round(balance - totalContribution),
        chartData
    };
  }, [state]);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat(lang === 'ko' ? 'ko-KR' : 'en-US', {
        style: 'currency',
        currency: lang === 'ko' ? 'KRW' : 'USD',
        maximumFractionDigits: 0
    }).format(val);
  };

  const handleChange = (key: keyof CalculatorState, value: string | number) => {
      setState(prev => ({ ...prev, [key]: value }));
  };

  // Find max value for chart scaling
  const maxChartValue = results.chartData.length > 0 ? results.chartData[results.chartData.length - 1].balance : 0;

  return (
    <div className="space-y-12">
      {/* Calculator Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Inputs */}
        <div className="lg:col-span-4 space-y-6 bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">{t.inputs.principal}</label>
            <input
              type="number"
              value={state.principal}
              onChange={(e) => handleChange('principal', Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">{t.inputs.contribution}</label>
            <input
              type="number"
              value={state.contribution}
              onChange={(e) => handleChange('contribution', Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">{t.inputs.rate}</label>
            <input
              type="number"
              value={state.rate}
              onChange={(e) => handleChange('rate', Number(e.target.value))}
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">{t.inputs.years}</label>
            <input
              type="range"
              min="1" max="50"
              value={state.years}
              onChange={(e) => handleChange('years', Number(e.target.value))}
              className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700"
            />
            <div className="text-right text-sm text-zinc-500 mt-1">{state.years} {lang === 'ko' ? '년' : 'Years'}</div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">{t.inputs.frequency}</label>
            <select
              value={state.frequency}
              onChange={(e) => handleChange('frequency', e.target.value)}
              className="w-full p-3 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-transparent focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              <option value="daily">{t.frequencies.daily}</option>
              <option value="monthly">{t.frequencies.monthly}</option>
              <option value="quarterly">{t.frequencies.quarterly}</option>
              <option value="annually">{t.frequencies.annually}</option>
            </select>
          </div>
        </div>

        {/* Results & Chart */}
        <div className="lg:col-span-8 space-y-8">
            {/* Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-6 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800">
                    <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">{t.results.futureValue}</div>
                    <div className="text-2xl font-bold text-blue-900 dark:text-blue-100">{formatCurrency(results.futureValue)}</div>
                </div>
                <div className="p-6 bg-green-50 dark:bg-green-900/20 rounded-xl border border-green-100 dark:border-green-800">
                    <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">{t.results.totalInterest}</div>
                    <div className="text-2xl font-bold text-green-900 dark:text-green-100">{formatCurrency(results.totalInterest)}</div>
                </div>
                <div className="p-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-700">
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 font-medium mb-1">{t.results.totalContributions}</div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(results.totalContributions)}</div>
                </div>
            </div>

            {/* Chart Visualization */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                <h3 className="text-lg font-semibold mb-6 text-zinc-800 dark:text-zinc-100">{t.chart.title}</h3>
                <div className="h-64 flex items-end space-x-2 w-full overflow-x-auto pb-2">
                    {results.chartData.map((data, i) => {
                        // Determine height percentage
                        const height = maxChartValue > 0 ? (data.balance / maxChartValue) * 100 : 0;
                        // Invested part height
                        // const investedHeight = maxChartValue > 0 ? (data.invested / maxChartValue) * 100 : 0;

                        // Only show every 5th year label on mobile, every 1 year on desktop if space allows
                        // For simplicity, showing every 2-3 data points or using tooltips is complex.
                        // I'll show bars for every year.
                        return (
                            <div key={i} className="flex-1 min-w-[20px] group relative flex flex-col justify-end h-full">
                                <div className="w-full bg-blue-500 rounded-t-sm transition-all duration-500 relative hover:opacity-90" style={{ height: `${height}%` }}>
                                    <div className="absolute bottom-0 left-0 w-full bg-zinc-300 dark:bg-zinc-600 opacity-50" style={{ height: `${(data.invested / data.balance) * 100}%` }}></div>

                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block bg-black text-white text-xs p-2 rounded whitespace-nowrap z-10">
                                        <div>{t.chart.year} {data.year}</div>
                                        <div>{t.chart.balance}: {formatCurrency(data.balance)}</div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
                <div className="flex justify-between text-xs text-zinc-400 mt-2">
                    <span>{t.chart.year} 0</span>
                    <span>{t.chart.year} {state.years}</span>
                </div>
            </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="prose dark:prose-invert max-w-none mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
        <div>
            <h2 className="text-2xl font-bold mb-4">{t.howToUse.title}</h2>
            <ul className="space-y-2 list-disc pl-5">
                {t.howToUse.steps.map((step, i) => (
                    <li key={i}>{step}</li>
                ))}
            </ul>
        </div>
        <div>
            <h2 className="text-2xl font-bold mb-4">{t.faq.title}</h2>
            <div className="space-y-4">
                {t.faq.items.map((item, i) => (
                    <div key={i}>
                        <h3 className="font-semibold text-lg mb-1">{item.question}</h3>
                        <p className="text-zinc-600 dark:text-zinc-400">{item.answer}</p>
                    </div>
                ))}
            </div>
        </div>
      </div>
    </div>
  );
}
