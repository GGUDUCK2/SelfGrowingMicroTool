import type { CommandDefinition } from './types';

export const COMMANDS: CommandDefinition[] = [
    {
        id: 'init',
        category: 'basic',
        command: 'git init',
        description: 'Initialize a new git repository.',
        options: [
            { id: 'bare', label: 'Bare Repository', type: 'boolean', flag: '--bare', description: 'Create a bare repository.' },
            { id: 'initialBranch', label: 'Initial Branch Name', type: 'string', flag: '--initial-branch=', defaultValue: 'main', placeholder: 'main' }
        ]
    },
    {
        id: 'clone',
        category: 'basic',
        command: 'git clone',
        description: 'Clone a repository into a new directory.',
        options: [
            { id: 'url', label: 'Repository URL', type: 'string', flag: '', placeholder: 'https://github.com/user/repo.git' },
            { id: 'depth', label: 'Depth (Shallow Clone)', type: 'string', flag: '--depth=', placeholder: '1' },
            { id: 'branch', label: 'Branch', type: 'string', flag: '--branch=', placeholder: 'dev' }
        ]
    },
    {
        id: 'commit',
        category: 'basic',
        command: 'git commit',
        description: 'Record changes to the repository.',
        options: [
            { id: 'message', label: 'Message', type: 'string', flag: '-m', placeholder: 'feat: add feature' },
            { id: 'all', label: 'Stage All (Tracked)', type: 'boolean', flag: '-a' },
            { id: 'amend', label: 'Amend Last Commit', type: 'boolean', flag: '--amend' },
            { id: 'noVerify', label: 'No Verify (Skip Hooks)', type: 'boolean', flag: '--no-verify' }
        ]
    },
    {
        id: 'push',
        category: 'remote',
        command: 'git push',
        description: 'Update remote refs along with associated objects.',
        options: [
            { id: 'remote', label: 'Remote', type: 'string', flag: '', defaultValue: 'origin' },
            { id: 'branch', label: 'Branch', type: 'string', flag: '', defaultValue: 'main' },
            { id: 'force', label: 'Force', type: 'boolean', flag: '--force' },
            { id: 'upstream', label: 'Set Upstream', type: 'boolean', flag: '-u' },
            { id: 'tags', label: 'Push Tags', type: 'boolean', flag: '--tags' }
        ]
    },
    {
        id: 'pull',
        category: 'remote',
        command: 'git pull',
        description: 'Fetch from and integrate with another repository or a local branch.',
        options: [
            { id: 'rebase', label: 'Rebase', type: 'boolean', flag: '--rebase' },
            { id: 'ffOnly', label: 'Fast-forward Only', type: 'boolean', flag: '--ff-only' }
        ]
    },
    {
        id: 'branch',
        category: 'branching',
        command: 'git branch',
        description: 'List, create, or delete branches.',
        options: [
            { id: 'name', label: 'New Branch Name', type: 'string', flag: '', placeholder: 'feature/new-thing' },
            { id: 'delete', label: 'Delete', type: 'boolean', flag: '-d' },
            { id: 'forceDelete', label: 'Force Delete', type: 'boolean', flag: '-D' },
            { id: 'all', label: 'List All', type: 'boolean', flag: '-a' }
        ]
    },
    {
        id: 'checkout',
        category: 'branching',
        command: 'git checkout',
        description: 'Switch branches or restore working tree files.',
        options: [
            { id: 'branch', label: 'Branch Name', type: 'string', flag: '', placeholder: 'main' },
            { id: 'newBranch', label: 'Create New Branch', type: 'boolean', flag: '-b' }
        ]
    },
    {
        id: 'merge',
        category: 'branching',
        command: 'git merge',
        description: 'Join two or more development histories together.',
        options: [
            { id: 'branch', label: 'Branch to Merge', type: 'string', flag: '', placeholder: 'feature/branch' },
            { id: 'noFf', label: 'No Fast-forward', type: 'boolean', flag: '--no-ff' },
            { id: 'squash', label: 'Squash', type: 'boolean', flag: '--squash' },
            { id: 'abort', label: 'Abort', type: 'boolean', flag: '--abort' }
        ]
    },
    {
        id: 'rebase',
        category: 'advanced',
        command: 'git rebase',
        description: 'Reapply commits on top of another base tip.',
        options: [
            { id: 'branch', label: 'Base Branch', type: 'string', flag: '', placeholder: 'main' },
            { id: 'interactive', label: 'Interactive', type: 'boolean', flag: '-i' },
            { id: 'abort', label: 'Abort', type: 'boolean', flag: '--abort' },
            { id: 'continue', label: 'Continue', type: 'boolean', flag: '--continue' }
        ]
    },
    {
        id: 'log',
        category: 'history',
        command: 'git log',
        description: 'Show commit logs.',
        options: [
            { id: 'oneline', label: 'One Line', type: 'boolean', flag: '--oneline' },
            { id: 'graph', label: 'Graph', type: 'boolean', flag: '--graph' },
            { id: 'decorate', label: 'Decorate', type: 'boolean', flag: '--decorate' },
            { id: 'number', label: 'Limit Count', type: 'string', flag: '-n ', placeholder: '10' },
            { id: 'author', label: 'Author', type: 'string', flag: '--author=', placeholder: 'Name' }
        ]
    },
    {
        id: 'reset',
        category: 'advanced',
        command: 'git reset',
        description: 'Reset current HEAD to the specified state.',
        options: [
            { id: 'commit', label: 'Commit / HEAD', type: 'string', flag: '', defaultValue: 'HEAD~1' },
            { id: 'soft', label: 'Soft (Keep Changes)', type: 'boolean', flag: '--soft' },
            { id: 'hard', label: 'Hard (Discard Changes)', type: 'boolean', flag: '--hard' }
        ]
    },
    {
        id: 'stash',
        category: 'advanced',
        command: 'git stash',
        description: 'Stash the changes in a dirty working directory away.',
        options: [
            { id: 'action', label: 'Action', type: 'select', options: ['push', 'pop', 'apply', 'list', 'drop', 'clear'], flag: '', defaultValue: 'push' },
            { id: 'message', label: 'Message', type: 'string', flag: '-m', placeholder: 'WIP' },
            { id: 'includeUntracked', label: 'Include Untracked', type: 'boolean', flag: '-u' }
        ]
    },
    {
        id: 'cherryPick',
        category: 'history',
        command: 'git cherry-pick',
        description: 'Apply the changes introduced by some existing commits.',
        options: [
            { id: 'commit', label: 'Commit Hash', type: 'string', flag: '', placeholder: 'abc1234' },
            { id: 'noCommit', label: 'No Commit', type: 'boolean', flag: '-n' },
            { id: 'signoff', label: 'Signoff', type: 'boolean', flag: '-s' }
        ]
    }
];

export function generateCommand(def: CommandDefinition, values: Record<string, any>): string {
    let parts = [def.command];

    // Handle subcommand if "action" exists (like git stash pop)
    if (values['action'] && def.id === 'stash') {
        if (values['action'] !== 'push') {
             parts.push(values['action']);
        } else {
             // push is default, do nothing or explicitly add? usually git stash is enough
             // but git stash push allows options
             parts.push('push');
        }
    }

    def.options.forEach(opt => {
        if (opt.id === 'action') return; // Handled specially for stash/subcommands

        const val = values[opt.id];

        if (opt.type === 'boolean' && val) {
            parts.push(opt.flag);
        } else if (opt.type === 'string' && val) {
            // Check if flag has =, otherwise space
            if (opt.flag.endsWith('=')) {
                // If value has spaces, wrap in quotes
                const safeVal = val.includes(' ') ? `"${val}"` : val;
                parts.push(`${opt.flag}${safeVal}`);
            } else if (opt.flag) {
                const safeVal = val.includes(' ') ? `"${val}"` : val;
                parts.push(`${opt.flag} ${safeVal}`);
            } else {
                // Positional arg
                const safeVal = val.includes(' ') ? `"${val}"` : val;
                parts.push(safeVal);
            }
        }
    });

    // Cleanup: remove empty strings
    return parts.filter(Boolean).join(' ');
}
