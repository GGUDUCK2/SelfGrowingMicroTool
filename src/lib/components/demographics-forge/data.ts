// Embedded, highly compressed demographic dataset for 5 key regions: World, Korea, Japan, USA, Nigeria
// Format:
// [RegionID]: {
//   [Year (e.g., 1950, 2024, 2050, 2100)]: [
//     [Male0_4, Female0_4],
//     [Male5_9, Female5_9],
//     ... (up to 100+)
//   ] // values in thousands
// }
// For brevity and extreme performance, we'll implement a procedural data generator that mimics UN World Population Prospects (WPP) patterns.
// In a true production environment, this would be a loaded JSON, but procedural generation allows us to ship a tiny bundle while still showing the "transition" mechanics perfectly.

export type AgeGroup = {
  age: string;
  male: number;
  female: number;
  total: number;
  malePercent: number;
  femalePercent: number;
};

export type DemographicSnapshot = {
  year: number;
  region: string;
  totalPopulation: number;
  medianAge: number;
  dependencyRatio: number;
  workingAgePercent: number;
  elderlyPercent: number;
  youthPercent: number;
  data: AgeGroup[];
};

// Procedural Demographic Engine (PDE)
// Mimics demographic transitions based on a set of parameters:
// Initial Base (1950): TFR (Total Fertility Rate), LE (Life Expectancy)
// Target (2100): Target TFR, Target LE
// Peak Year (for populations that shrink)
export const REGIONS = [
  { id: 'world', name: 'World', ko: '세계' },
  { id: 'kr', name: 'South Korea', ko: '대한민국' },
  { id: 'jp', name: 'Japan', ko: '일본' },
  { id: 'us', name: 'United States', ko: '미국' },
  { id: 'ng', name: 'Nigeria', ko: '나이지리아' }
];

const PARAMS: Record<string, { startPop: number, startTfr: number, endTfr: number, tfrDropYear: number, startLe: number, endLe: number, leRiseYear: number, peakYear: number, peakPop: number }> = {
  'world': { startPop: 2500000, startTfr: 5.0, endTfr: 1.9, tfrDropYear: 1970, startLe: 46, endLe: 82, leRiseYear: 1950, peakYear: 2086, peakPop: 10400000 },
  'kr': { startPop: 19000, startTfr: 6.0, endTfr: 0.7, tfrDropYear: 1960, startLe: 47, endLe: 89, leRiseYear: 1960, peakYear: 2020, peakPop: 51800 },
  'jp': { startPop: 83000, startTfr: 3.0, endTfr: 1.3, tfrDropYear: 1950, startLe: 60, endLe: 88, leRiseYear: 1950, peakYear: 2008, peakPop: 128000 },
  'us': { startPop: 152000, startTfr: 3.0, endTfr: 1.6, tfrDropYear: 1965, startLe: 68, endLe: 84, leRiseYear: 1950, peakYear: 2080, peakPop: 395000 }, // Migration keeps it growing longer
  'ng': { startPop: 37000, startTfr: 6.5, endTfr: 2.1, tfrDropYear: 2010, startLe: 33, endLe: 74, leRiseYear: 1990, peakYear: 2100, peakPop: 546000 }
};

// Helper to ease a value over time (Sigmoid-like transition)
function easeTransition(currentYear: number, startYear: number, duration: number, startVal: number, endVal: number) {
  if (currentYear <= startYear) return startVal;
  if (currentYear >= startYear + duration) return endVal;
  const t = (currentYear - startYear) / duration;
  // smoothstep
  const t2 = t * t * (3 - 2 * t);
  return startVal + (endVal - startVal) * t2;
}

// Generate age distribution for a given year and region
export function generateDemographics(regionId: string, year: number): DemographicSnapshot {
  const p = PARAMS[regionId];
  if (!p) throw new Error(`Unknown region: ${regionId}`);

  // 1. Determine current macro indicators
  // Fertility Rate (TFR) dictates base width (0-4 group)
  const currentTfr = easeTransition(year, p.tfrDropYear, 50, p.startTfr, p.endTfr);
  // Life Expectancy (LE) dictates top heavy-ness (survival rates)
  const currentLe = easeTransition(year, p.leRiseYear, 80, p.startLe, p.endLe);

  // Total Population trajectory (very simplified quadratic/logistic blend)
  let currentTotal = p.startPop;
  if (year <= p.peakYear) {
      // Growing phase
      const progress = (year - 1950) / (p.peakYear - 1950);
      currentTotal = p.startPop + (p.peakPop - p.startPop) * Math.sin(progress * Math.PI / 2);
  } else {
      // Shrinking phase (if past peak)
      const declineRate = 0.005; // 0.5% per year decline after peak
      const yearsPastPeak = year - p.peakYear;
      currentTotal = p.peakPop * Math.pow(1 - declineRate, yearsPastPeak);
  }

  // 2. Generate age buckets (0-4 to 100+) -> 21 buckets
  const buckets = 21;
  const rawData: { male: number, female: number }[] = [];
  let rawSum = 0;

  for (let i = 0; i < buckets; i++) {
    const ageStart = i * 5;

    // Survival curve based on Life Expectancy
    // High LE -> flatter curve, low LE -> steep drop
    // We use a Weibull-like survival function
    // scale parameter lambda ~ LE
    // shape parameter k ~ determines how "rectangular" the survival curve is (higher LE -> higher k)
    const k = currentLe > 70 ? 5 : (currentLe > 50 ? 3 : 1.5);
    const lambda = currentLe * 1.1; // roughly

    // Survival probability to reach this age group
    let survivalProb = Math.exp(-Math.pow(ageStart / lambda, k));

    // Echo effects (Baby booms and busts based on historical TFR)
    // To simulate realistic pyramids, the size of an age group depends on the TFR *when they were born*
    const birthYear = year - ageStart;
    const historicalTfr = easeTransition(birthYear, p.tfrDropYear, 50, p.startTfr, p.endTfr);

    // Base cohort size is proportional to the TFR at birth year, modified by survival
    let cohortBase = historicalTfr * survivalProb;

    // Slight female survival advantage at higher ages
    let mFactor = 0.51; // slightly more boys born
    let fFactor = 0.49;

    if (ageStart > 50) {
        // Women live longer
        mFactor -= (ageStart - 50) * 0.005;
        fFactor += (ageStart - 50) * 0.005;
        // Clamp
        if (mFactor < 0.2) mFactor = 0.2;
        if (fFactor > 0.8) fFactor = 0.8;
    }

    const maleCount = cohortBase * mFactor;
    const femaleCount = cohortBase * fFactor;

    rawData.push({ male: maleCount, female: femaleCount });
    rawSum += (maleCount + femaleCount);
  }

  // 3. Normalize to target population
  const scale = currentTotal / rawSum;
  let finalTotal = 0;
  let youthSum = 0; // 0-14 (indices 0, 1, 2)
  let workingSum = 0; // 15-64 (indices 3 to 12)
  let elderlySum = 0; // 65+ (indices 13+)

  const data: AgeGroup[] = rawData.map((d, i) => {
    const male = d.male * scale;
    const female = d.female * scale;
    const total = male + female;
    finalTotal += total;

    if (i < 3) youthSum += total;
    else if (i < 13) workingSum += total;
    else elderlySum += total;

    let ageLabel = `${i * 5}-${i * 5 + 4}`;
    if (i === 20) ageLabel = '100+';

    return {
      age: ageLabel,
      male: Math.round(male),
      female: Math.round(female),
      total: Math.round(total),
      malePercent: 0, // calculated next
      femalePercent: 0
    };
  });

  // Calculate percentages and median age
  let cumulative = 0;
  let medianAge = 0;
  const halfPop = finalTotal / 2;

  for (let i = 0; i < data.length; i++) {
    data[i].malePercent = (data[i].male / finalTotal) * 100;
    data[i].femalePercent = (data[i].female / finalTotal) * 100;

    cumulative += data[i].total;
    if (medianAge === 0 && cumulative >= halfPop) {
        // Linear interpolation within the bucket
        const bucketStart = i * 5;
        const bucketTotal = data[i].total;
        const overflow = cumulative - halfPop;
        const fraction = 1 - (overflow / bucketTotal);
        medianAge = bucketStart + (fraction * 5);
    }
  }

  const youthPercent = (youthSum / finalTotal) * 100;
  const workingAgePercent = (workingSum / finalTotal) * 100;
  const elderlyPercent = (elderlySum / finalTotal) * 100;

  // Dependency ratio: (Youth + Elderly) / Working Age * 100
  const dependencyRatio = ((youthSum + elderlySum) / workingSum) * 100;

  return {
    year,
    region: regionId,
    totalPopulation: Math.round(finalTotal), // in thousands
    medianAge: Math.round(medianAge * 10) / 10,
    dependencyRatio: Math.round(dependencyRatio * 10) / 10,
    workingAgePercent: Math.round(workingAgePercent * 10) / 10,
    elderlyPercent: Math.round(elderlyPercent * 10) / 10,
    youthPercent: Math.round(youthPercent * 10) / 10,
    data
  };
}
