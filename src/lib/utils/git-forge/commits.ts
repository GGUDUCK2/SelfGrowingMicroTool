import type { CommitMessage } from './types';

export function generateCommit(data: CommitMessage): string {
    const scopePart = data.scope ? `(${data.scope})` : '';
    const breakingMark = data.isBreaking ? '!' : '';
    const header = `${data.type}${scopePart}${breakingMark}: ${data.description}`;

    let bodyPart = data.body ? `\n\n${data.body}` : '';
    let footerPart = data.footer ? `\n\n${data.footer}` : '';

    return `${header}${bodyPart}${footerPart}`;
}
