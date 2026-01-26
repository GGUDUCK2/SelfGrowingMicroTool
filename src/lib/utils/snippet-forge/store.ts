import { writable } from 'svelte/store';

export interface SnippetState {
  code: string;
  language: string;
  theme: string;
  background: string;
  padding: number;
  windowControls: string;
  fontSize: number;
  fontFamily: string;
  title: string;
  windowTitle: string;
  dropShadow: boolean;
}

const initialState: SnippetState = {
  code: "function hello() {\n  console.log('Hello, World!');\n}",
  language: 'javascript',
  theme: 'dracula',
  background: 'gradient-2',
  padding: 64,
  windowControls: 'mac',
  fontSize: 14,
  fontFamily: 'Fira Code',
  title: 'Untitled Snippet',
  windowTitle: 'app.js',
  dropShadow: true
};

export const snippetStore = writable<SnippetState>(initialState);
