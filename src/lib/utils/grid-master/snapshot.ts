import { toPng } from 'html-to-image';

export async function captureSnapshot(node: HTMLElement, options: { name: string, theme: string }): Promise<void> {
    if (!node) return;

    try {
        const dataUrl = await toPng(node, {
            cacheBust: true,
            filter: (node) => {
                // Exclude any elements with class 'no-snapshot' if needed
                return !node.classList?.contains('no-snapshot');
            },
            backgroundColor: options.theme === 'cyber' ? '#111' : '#fff' // Ensure background is captured
        });

        const link = document.createElement('a');
        link.download = `${options.name}-${options.theme}-${Date.now()}.png`;
        link.href = dataUrl;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Snapshot failed:', error);
        throw error;
    }
}
