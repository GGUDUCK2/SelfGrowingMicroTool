import { generateHTML } from './codegen';
import type { GridState } from './types';

export function openInStackBlitz(html: string) {
    const form = document.createElement('form');
    form.method = 'POST';
    form.action = 'https://stackblitz.com/run';
    form.target = '_blank';

    const inputHtml = document.createElement('input');
    inputHtml.type = 'hidden';
    inputHtml.name = 'project[files][index.html]';
    inputHtml.value = html;
    form.appendChild(inputHtml);

    const inputTitle = document.createElement('input');
    inputTitle.type = 'hidden';
    inputTitle.name = 'project[title]';
    inputTitle.value = 'Grid Master Layout';
    form.appendChild(inputTitle);

    const inputDesc = document.createElement('input');
    inputDesc.type = 'hidden';
    inputDesc.name = 'project[description]';
    inputDesc.value = 'Layout generated with Grid Master';
    form.appendChild(inputDesc);

    const inputTemplate = document.createElement('input');
    inputTemplate.type = 'hidden';
    inputTemplate.name = 'project[template]';
    inputTemplate.value = 'html';
    form.appendChild(inputTemplate);

    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
}

export function downloadProjectHtml(state: GridState) {
    const html = generateHTML(state);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'grid-master-project.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
