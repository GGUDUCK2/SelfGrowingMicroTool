export function calculateCompoundInterest(
    p: number,
    r: number,
    y: number,
    c: number,
    inflation: number,
    freq: number,
    tax: number
  ) {
    // Limit years to avoid freezing
    if (y > 100) y = 100;

    if (p < 0 || r < 0 || y <= 0 || c < 0 || inflation < 0 || tax < 0) return [];

    let nominalBalance = p;
    const nominalRatePerPeriod = r / 100 / freq;
    const data = [];
    const totalMonths = y * 12;

    for (let i = 1; i <= totalMonths; i++) {
      // Add contribution at the end of the month
      nominalBalance += c;

      // Apply interest based on frequency
      if (i % (12 / freq) === 0) {
        const interest = nominalBalance * nominalRatePerPeriod;
        // Apply Tax on Interest immediately (simulating tax drag/annual tax payment)
        const taxAmount = interest * (tax / 100);
        const netInterest = interest - taxAmount;
        nominalBalance += netInterest;
      }

      if (i % 12 === 0) {
        const currentYear = i / 12;
        const discountFactor = Math.pow(1 + inflation / 100, currentYear);
        data.push({
          year: currentYear,
          nominalBalance: Math.round(nominalBalance),
          realBalance: Math.round(nominalBalance / discountFactor),
        });
      }
    }
    return data;
  }
