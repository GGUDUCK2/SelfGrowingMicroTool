let mermaid: any;

export const initMermaid = async (theme: string = 'default') => {
    if (typeof window === 'undefined') return;

    if (!mermaid) {
        const m = await import('mermaid');
        mermaid = m.default;
    }

    mermaid.initialize({
        startOnLoad: false,
        theme: theme as 'default' | 'forest' | 'dark' | 'neutral' | 'base',
        securityLevel: 'loose',
        logLevel: 'error',
    });
};

export const renderDiagram = async (id: string, code: string): Promise<{ svg: string, error?: string }> => {
    if (typeof window === 'undefined') return { svg: '' };

    try {
        if (!mermaid) {
            const m = await import('mermaid');
            mermaid = m.default;
            // Initialize with default theme if not done yet
            mermaid.initialize({
                startOnLoad: false,
                theme: 'default',
            });
        }

        // mermaid.render returns an object { svg } in newer versions
        const { svg } = await mermaid.render(id, code);
        return { svg };
    } catch (e) {
        console.error('Mermaid render error:', e);
        return { svg: '', error: (e as Error).message || String(e) };
    }
};
