export interface RiskAnalysis {
  score: number;
  factors: string[];
  level: 'Safe' | 'Low' | 'Medium' | 'High' | 'Critical';
}

export function calculateRiskScore(
  file: File,
  magic: { type: string; matches: boolean },
  entropy: number,
  archiveData?: { compressionRatio: number; fileCount: number }
): RiskAnalysis {
  let score = 0;
  const factors: string[] = [];

  // 1. Double Extension Check
  // e.g. "invoice.pdf.exe"
  if (/\.[a-z0-9]{2,4}\.[a-z0-9]{2,4}$/i.test(file.name)) {
    const parts = file.name.split('.');
    const secondLast = parts[parts.length - 2].toLowerCase();
    const last = parts[parts.length - 1].toLowerCase();

    const safeExtensions = ['tar', 'gz', 'co', 'uk', 'com']; // common legitimate double endings
    const dangerousExtensions = ['exe', 'bat', 'cmd', 'sh', 'vbs', 'js', 'scr', 'pif', 'com'];

    if (!safeExtensions.includes(secondLast) && dangerousExtensions.includes(last)) {
      score += 80;
      factors.push(`Suspicious double extension (.${secondLast}.${last})`);
    }
  }

  // 2. Magic Number Mismatch
  if (magic.matches && magic.type !== 'Unknown') {
    // Basic check: if declared type is vastly different from magic type
    // e.g. text/plain file that is actually an executable
    const declaredType = file.type || '';
    const magicType = magic.type;

    // Allow fuzzy matching
    const declaredBase = declaredType.split('/')[1] || '';
    const magicBase = magicType.split('/')[1] || '';

    // Mismatch logic: explicit declared type that contradicts magic
    // Ignore generic application/octet-stream
    if (
      declaredType &&
      declaredType !== 'application/octet-stream' &&
      !magicType.includes(declaredType) &&
      !declaredType.includes(magicType) &&
      !magicBase.includes(declaredBase) &&
      !declaredBase.includes(magicBase)
    ) {
        // Special exceptions
        const isZipVariant = (declaredType.includes('zip') || declaredType.includes('office')) && magicType.includes('zip');

        if (!isZipVariant) {
            score += 30;
            factors.push(`File extension claims '${declaredType}' but internals look like '${magicType}'`);
        }
    }
  } else if (!magic.matches) {
      score += 10;
      factors.push('Unknown or custom file signature');
  }

  // 3. High Entropy in Text Files
  const textTypes = ['text/plain', 'text/html', 'application/json', 'image/svg+xml', 'text/javascript'];
  if (textTypes.some(t => file.type.includes(t)) && entropy > 7.5) {
      score += 60;
      factors.push('Abnormally high entropy for a text file (Possible obfuscated code or packed malware)');
  }

  // 4. Executable Detection
  if (magic.type.includes('executable') || magic.type.includes('dosexec') || magic.type.includes('elf')) {
      if (!file.name.endsWith('.exe') && !file.name.endsWith('.dll') && !file.name.endsWith('.so')) {
          score += 90;
          factors.push('Executable code detected in non-executable file');
      } else {
          score += 20; // It is an executable, inherent risk
          factors.push('Binary executable file');
      }
  }

  // 5. Archive Analysis (Zip Bombs)
  if (archiveData) {
      if (archiveData.compressionRatio > 100) {
          score += 70;
          factors.push(`Extreme compression ratio (${archiveData.compressionRatio.toFixed(0)}:1) - Possible Zip Bomb`);
      }
      if (archiveData.fileCount > 10000) {
          score += 40;
          factors.push('Archive contains an unusually large number of files');
      }
  }

  // Cap score
  score = Math.min(100, Math.max(0, score));

  let level: RiskAnalysis['level'] = 'Safe';
  if (score > 0) level = 'Low';
  if (score >= 40) level = 'Medium';
  if (score >= 70) level = 'High';
  if (score >= 90) level = 'Critical';

  return { score, factors, level };
}
