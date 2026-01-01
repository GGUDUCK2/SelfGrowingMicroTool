/**
 * Debounces a function execution.
 * @param func The function to debounce.
 * @param wait The delay in milliseconds.
 * @returns A debounced version of the function.
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function (this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

/**
 * Formats seconds into MM:SS format.
 * @param seconds The number of seconds.
 * @returns Formatted time string.
 */
export function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

/**
 * Formats a number as currency.
 * @param amount The amount to format.
 * @param lang The language code ('en' or 'ko').
 * @returns Formatted currency string.
 */
export function formatMoney(amount: number, lang: string): string {
  return new Intl.NumberFormat(lang === "ko" ? "ko-KR" : "en-US", {
    style: "currency",
    currency: lang === "ko" ? "KRW" : "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}
