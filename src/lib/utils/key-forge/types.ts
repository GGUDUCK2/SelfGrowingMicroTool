export type Mode = 'time' | 'words' | 'quote' | 'zen';
export type Language = 'english' | 'javascript' | 'python' | 'rust' | 'go' | 'html' | 'css';

export interface KeyForgeState {
  mode: Mode;
  language: Language;
  content: string;
  originalContent: string;
  input: string;
  cursor: number;
  startTime: number | null;
  endTime: number | null;
  wpm: number;
  rawWpm: number;
  accuracy: number;
  consistency: number; // Standard deviation of keystroke intervals
  errors: number;
  timeRemaining: number;
  isFinished: boolean;
  isRunning: boolean;
  keystrokes: number[]; // Timestamps of each keystroke
}

export interface CharState {
  char: string;
  status: 'correct' | 'incorrect' | 'pending' | 'extra';
}

export interface GameConfig {
  mode: Mode;
  language: Language;
  duration: number; // 15, 30, 60, 120
  wordCount: number; // 10, 25, 50, 100
  sound: string; // 'mechanical', 'typewriter', 'laptop', 'mute'
  zen: boolean;
}
