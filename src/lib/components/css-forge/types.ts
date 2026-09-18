export type CssAction = 'format' | 'minify' | 'analyze';

export interface CssStatistics {
    selectors: number;
    rules: number;
    declarations: number;
    variables: Array<{name: string, value: string}>;
}

export interface CssState {
    input: string;
    output: string;
    action: CssAction;
    indentSize: number;
    statistics: CssStatistics | null;
}

export const defaultState: CssState = {
    input: '',
    output: '',
    action: 'format',
    indentSize: 2,
    statistics: null
};

export interface GuideSectionType {
    title?: string;
    intro?: string;
    f1?: string;
    f2?: string;
    f3?: string;
    f4?: string;
}


export interface CssDictionary {
    title?: string;
    description?: string;
    guide?: GuideSectionType;
    faqTitle?: string;
    q1?: string;
    a1?: string;
    q2?: string;
    a2?: string;
    q3?: string;
    a3?: string;
    example1?: string;
    example2?: string;
    example3?: string;
    extractedVariables?: string;
    name?: string;
    value?: string;
    noVariables?: string;
    feedback?: {
        copied?: string;
        cleared?: string;
        processed?: string;
        autoFixed?: string;
    };
}


export interface Dictionary {
    tools?: {
        cssForge?: CssDictionary;
    };
    common?: {
        actions?: string;
    };
}
