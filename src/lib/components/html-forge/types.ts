export type HtmlAction = 'format' | 'minify' | 'encode' | 'decode' | 'strip';

export interface HtmlState {
    input: string;
    action: HtmlAction;
    output: string;
}

export const defaultState: HtmlState = {
    input: '',
    action: 'format',
    output: ''
};



export interface HtmlDictionary {
    title?: string;
    description?: string;
    format?: string;
    minify?: string;
    encode?: string;
    decode?: string;
    strip?: string;
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
    guide?: unknown;
    [key: string]: unknown;
}

export interface Dictionary {
    tools?: {
        htmlForge?: HtmlDictionary;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}
