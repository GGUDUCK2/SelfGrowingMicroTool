export interface PromptForgeDictionary {
    title: string;
    description: string;
    editor: {
        title: string;
        template: string;
        variables: string;
        preview: string;
        placeholder: string;
        system: string;
        user: string;
    };
    toolbar: {
        save: string;
        copy: string;
        clear: string;
        export: string;
        history: string;
        copied: string;
        saved: string;
        cleared: string;
    };
    stats: {
        tokens: string;
        chars: string;
        cost: string;
    };
    history: {
        title: string;
        empty: string;
        search: string;
        load: string;
        delete: string;
    };
    magicFill: string;
    templates: string;
    scenarios: string;
    exportCode: string;
    addScenario: string;
    deleteScenario: string;
    scenarioName: string;
    defaultScenario: string;
    preview: {
        mode: string;
        raw: string;
        chat: string;
        chatPlaceholder: string;
    };
    guide: {
        title: string;
        intro: string;
        featuresTitle: string;
        f1: string;
        f2: string;
        f3: string;
        tipsTitle: string;
        tip1: string;
        tip2: string;
        tip3: string;
    };
    faqTitle: string;
    q1: string;
    a1: string;
    q2: string;
    a2: string;
    q3: string;
    a3: string;
}
