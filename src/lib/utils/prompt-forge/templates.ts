export interface PromptTemplate {
    id: string;
    title: string;
    description: string;
    category: 'coding' | 'writing' | 'marketing' | 'analysis' | 'fun';
    system: string;
    user: string;
    variables: Record<string, string>; // Default variables
}

export const TEMPLATES: PromptTemplate[] = [
    {
        id: 'code-refactor',
        title: 'Code Refactoring Expert',
        description: 'Refactors code for readability and performance while following best practices.',
        category: 'coding',
        system: 'You are a Senior Software Engineer specializing in {{language}}. Your goal is to refactor the provided code to improve readability, performance, and maintainability without changing its behavior. Explain your changes.',
        user: 'Refactor this code:\n\n```{{language}}\n{{code_snippet}}\n```',
        variables: {
            language: 'TypeScript',
            code_snippet: 'function sum(a,b){return a+b}'
        }
    },
    {
        id: 'unit-test-gen',
        title: 'Unit Test Generator',
        description: 'Generates comprehensive unit tests for a given function or component.',
        category: 'coding',
        system: 'You are a QA Automation Engineer. Write comprehensive unit tests for the provided code using {{test_framework}}. Include edge cases and happy paths.',
        user: 'Generate tests for:\n\n```\n{{code}}\n```',
        variables: {
            test_framework: 'Jest',
            code: 'export const add = (a, b) => a + b;'
        }
    },
    {
        id: 'email-writer',
        title: 'Professional Email Writer',
        description: 'Drafts professional emails based on key points and desired tone.',
        category: 'writing',
        system: 'You are an executive assistant. Write a professional email based on the user\'s bullet points. The tone should be {{tone}}.',
        user: 'Subject: {{subject}}\n\nPoints to cover:\n{{points}}',
        variables: {
            tone: 'Professional but friendly',
            subject: 'Project Update',
            points: '- We finished Phase 1\n- Phase 2 starts next week\n- Need approval for budget'
        }
    },
    {
        id: 'blog-post',
        title: 'SEO Blog Post Generator',
        description: 'Creates an outline and introduction for an SEO-optimized blog post.',
        category: 'marketing',
        system: 'You are an SEO Content Writer. Create a detailed outline and a hooky introduction for a blog post about {{topic}}. Target audience: {{audience}}.',
        user: 'Topic: {{topic}}\nKeywords: {{keywords}}',
        variables: {
            topic: 'The Future of AI',
            audience: 'Tech enthusiasts',
            keywords: 'AI, Machine Learning, Future'
        }
    },
    {
        id: 'summarizer',
        title: 'Universal Summarizer',
        description: 'Summarizes text into a concise format.',
        category: 'analysis',
        system: 'You are a precise summarizer. Summarize the following text in {{format}}.',
        user: 'Text:\n{{text}}',
        variables: {
            format: '3 bullet points',
            text: 'Paste long text here...'
        }
    },
    {
        id: 'sql-expert',
        title: 'Text to SQL Converter',
        description: 'Converts natural language questions into SQL queries.',
        category: 'coding',
        system: 'You are a Database Administrator. Convert the user\'s natural language question into a {{dialect}} SQL query. Schema: {{schema}}',
        user: 'Question: {{question}}',
        variables: {
            dialect: 'PostgreSQL',
            schema: 'users(id, name, email), orders(id, user_id, amount)',
            question: 'Show me the top 5 spenders.'
        }
    }
];
