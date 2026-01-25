import type { LogEntry } from './types';
import type { LogCluster } from './clustering';

export function generateInsightReport(entries: LogEntry[], clusters: LogCluster[]): string {
  if (entries.length === 0) return 'No logs to analyze.';

  const total = entries.length;
  const errors = entries.filter(e => e.level === 'error').length;
  const warns = entries.filter(e => e.level === 'warn').length;
  const errorRate = ((errors / total) * 100).toFixed(1);

  // Time Range
  const times = entries.map(e => e.timestamp?.getTime() || 0).filter(t => t > 0).sort((a, b) => a - b);
  const start = times.length > 0 ? new Date(times[0]).toLocaleString() : 'N/A';
  const end = times.length > 0 ? new Date(times[times.length - 1]).toLocaleString() : 'N/A';

  let report = `# Log Prism Analysis Report\n`;
  report += `Generated: ${new Date().toLocaleString()}\n\n`;

  report += `## Summary\n`;
  report += `- **Total Entries:** ${total}\n`;
  report += `- **Time Range:** ${start} - ${end}\n`;
  report += `- **Error Rate:** ${errorRate}% (${errors} errors)\n`;
  report += `- **Warnings:** ${warns}\n\n`;

  report += `## Top 5 Issues (Clustered Patterns)\n`;

  // Filter for clusters that are error or warn usually, but let's just take top count regardless
  // Actually, usually we care about high frequency errors.

  const topClusters = clusters.slice(0, 5);

  if (topClusters.length === 0) {
      report += `No clusters identified.\n`;
  } else {
      topClusters.forEach((c, i) => {
          report += `### ${i + 1}. [${c.level.toUpperCase()}] ${c.signature.substring(0, 100)}${c.signature.length > 100 ? '...' : ''} (x${c.count})\n`;
          report += `> Example: ${c.example.raw.substring(0, 200)}\n\n`;
      });
  }

  report += `## Recommendations\n`;
  if (parseFloat(errorRate) > 10) {
      report += `- 🔴 **Critical Error Rate:** The error rate is above 10%. Immediate investigation recommended.\n`;
  } else if (parseFloat(errorRate) > 1) {
      report += `- 🟠 **Elevated Errors:** Check the top error patterns above.\n`;
  } else {
      report += `- 🟢 **Healthy:** Error rate is within normal limits.\n`;
  }

  return report;
}
