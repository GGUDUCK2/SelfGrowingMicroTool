export interface GitForgeDictionary {
    title: string;
    description: string;
    tabs: Record<string, string>;
    command: Record<string, any>;
    ignore: Record<string, any>;
    commit: Record<string, any>;
    doctor: Record<string, any>;
    history: Record<string, any>;
    guide: Record<string, any>;
    faqTitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
    smartTemplates?: Record<string, string>;
}
