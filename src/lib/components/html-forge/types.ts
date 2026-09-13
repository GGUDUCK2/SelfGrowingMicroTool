export type HtmlAction = 'format' | 'minify' | 'encode' | 'decode';

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