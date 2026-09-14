export type HtmlAction = 'format' | 'minify' | 'encode' | 'decode' | 'strip' | 'extractLinks' | 'analyze';

export interface HtmlState {
    input: string;
    action: HtmlAction;
    output: string;
    indentSize?: number; // 2, 4, or 0 for tabs
    stats?: {
        tagCount: number;
        charCount: number;
        fileSizeBytes: number;
        linkCount: number;
    } | null;
}

export const defaultState: HtmlState = {
    input: '',
    action: 'format',
    output: '',
    indentSize: 2,
    stats: null
};

export interface GuideDictionary {
    title?: string;
    intro?: string;
    f1?: string;
    f2?: string;
    f3?: string;
    tip1?: string;
    tip2?: string;
}

export interface HtmlDictionary {
    title?: string;
    description?: string;
    format?: string;
    minify?: string;
    encode?: string;
    decode?: string;
    strip?: string;
    extractLinks?: string;
    analyze?: string;
    tagCount?: string;
    charCount?: string;
    fileSize?: string;
    linksCount?: string;
    noLinks?: string;
    indentSize?: string;
    indent2?: string;
    indent4?: string;
    indentTab?: string;
    inputPlaceholder?: string;
    resultPlaceholder?: string;
    clear?: string;
    error?: string;
    copy?: string;
    copied?: string;
    history?: string;
    faqTitle?: string;
    q1?: string;
    a1?: string;
    q2?: string;
    a2?: string;
    q3?: string;
    a3?: string;
    download?: string;
    downloaded?: string;
    share?: string;
    shared?: string;
    example1?: string;
    example2?: string;
    example3?: string;
    guide?: GuideDictionary;
}

export interface Dictionary {
    tools?: {
        htmlForge?: HtmlDictionary;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
