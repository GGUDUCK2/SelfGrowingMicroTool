export interface CommandOption {
    id: string;
    label: string;
    type: 'boolean' | 'string' | 'select';
    defaultValue?: any;
    options?: string[]; // for select
    description?: string;
    flag: string; // e.g. "--hard" or "-m"
    placeholder?: string;
}

export interface CommandDefinition {
    id: string;
    category: 'basic' | 'branching' | 'history' | 'remote' | 'advanced';
    command: string; // e.g. "git commit"
    description: string;
    options: CommandOption[];
}

export interface GitignoreTemplate {
    id: string;
    name: string;
    content: string;
    tags: string[]; // e.g. ['language', 'ide', 'os']
}

export interface CommitMessage {
    type: string;
    scope: string;
    description: string;
    body: string;
    footer: string;
    isBreaking: boolean;
}
