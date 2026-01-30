export const COLORS = [
    'red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal',
    'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose',
    'slate', 'gray', 'zinc', 'neutral', 'stone'
];

export const COLOR_MAP: Record<string, string> = {
    red: '#f87171', orange: '#fb923c', amber: '#fbbf24', yellow: '#facc15',
    lime: '#a3e635', green: '#4ade80', emerald: '#34d399', teal: '#2dd4bf',
    sky: '#38bdf8', blue: '#60a5fa', indigo: '#818cf8', violet: '#a78bfa',
    purple: '#c084fc', fuchsia: '#e879f9', pink: '#f472b6', rose: '#fb7185',
    slate: '#94a3b8', gray: '#9ca3af', zinc: '#a1a1aa', neutral: '#a3a3a3',
    stone: '#a8a29e', white: '#ffffff', black: '#000000'
};

export function getRandomColor(): string {
    return COLORS[Math.floor(Math.random() * COLORS.length)];
}
