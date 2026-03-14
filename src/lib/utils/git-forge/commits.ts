import type { CommitMessage } from './types';

export function generateCommit(data: CommitMessage): string {
    const scopePart = data.scope ? `(${data.scope})` : '';
    const breakingMark = data.isBreaking ? '!' : '';
    const header = `${data.type}${scopePart}${breakingMark}: ${data.description}`;

    const bodyPart = data.body ? `\n\n${data.body}` : '';
    const footerPart = data.footer ? `\n\n${data.footer}` : '';

    return `${header}${bodyPart}${footerPart}`;
}
