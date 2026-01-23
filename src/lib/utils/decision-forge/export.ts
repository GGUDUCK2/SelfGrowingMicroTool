import type { DecisionMatrixState } from './types';

export function exportToJson(matrix: DecisionMatrixState) {
  const dataStr = JSON.stringify(matrix, null, 2);
  const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
  const exportFileDefaultName = `${matrix.name.replace(/\s+/g, '_').toLowerCase()}_matrix.json`;

  const linkElement = document.createElement('a');
  linkElement.setAttribute('href', dataUri);
  linkElement.setAttribute('download', exportFileDefaultName);
  linkElement.click();
}

export function exportToCsv(matrix: DecisionMatrixState) {
  // Headers: Option Name, [Criteria Name...], Total Score
  const headers = ['Option', ...matrix.criteria.map(c => `${c.name} (w:${c.weight})`), 'Total Score'];

  const rows = matrix.options.map(opt => {
    let totalScore = 0;
    const scores = matrix.criteria.map(c => {
      const score = opt.scores[c.id] || 0;
      totalScore += score * c.weight;
      return score;
    });
    return [opt.name, ...scores, totalScore];
  });

  const csvContent = [
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${matrix.name.replace(/\s+/g, '_').toLowerCase()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
