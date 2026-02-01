import mermaid from 'mermaid';

export const initMermaid = (theme: string = 'default') => {
    mermaid.initialize({
        startOnLoad: false,
        theme: theme as 'default' | 'forest' | 'dark' | 'neutral' | 'base',
        securityLevel: 'loose',
        logLevel: 'error',
    });
};

export const renderDiagram = async (id: string, code: string): Promise<{ svg: string, error?: string }> => {
    try {
        // mermaid.render returns an object { svg } in newer versions
        const { svg } = await mermaid.render(id, code);
        return { svg };
    } catch (e) {
        return { svg: '', error: (e as Error).message || String(e) };
    }
};
