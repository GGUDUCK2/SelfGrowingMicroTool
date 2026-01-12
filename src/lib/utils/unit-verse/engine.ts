import { type UnitDefinition, type CategoryDefinition, categories } from './definitions';

export type ConversionResult = {
  value: number;
  formatted: string;
  formula: string;
};

export class UnitEngine {
  private categoryMap: Map<string, CategoryDefinition>;
  private unitMap: Map<string, UnitDefinition>;

  constructor() {
    this.categoryMap = new Map();
    this.unitMap = new Map();

    categories.forEach((cat) => {
      this.categoryMap.set(cat.id, cat);
      cat.units.forEach((unit) => {
        this.unitMap.set(unit.id, unit);
      });
    });
  }

  getCategory(id: string): CategoryDefinition | undefined {
    return this.categoryMap.get(id);
  }

  getUnit(id: string): UnitDefinition | undefined {
    return this.unitMap.get(id);
  }

  convert(
    value: number,
    fromUnitId: string,
    toUnitId: string,
    categoryId: string,
    precision: number = 6
  ): ConversionResult {
    const category = this.categoryMap.get(categoryId);
    const fromUnit = this.unitMap.get(fromUnitId);
    const toUnit = this.unitMap.get(toUnitId);

    if (!category || !fromUnit || !toUnit) {
      throw new Error('Invalid category or unit ID');
    }

    // Special case for Temperature (uses offset)
    if (categoryId === 'temperature') {
      return this.convertTemperature(value, fromUnit, toUnit, precision);
    }

    // Standard linear conversion
    // Base unit value = value / factor (since factor is "units per base unit")
    // e.g. 1000m = 1km. Factor for km is 0.001 (1m = 0.001km).
    // Wait, my definition says "factor: Multiplier relative to base unit".
    // Let's re-verify definitions.
    // meter factor: 1.
    // kilometer factor: 0.001.
    // Meaning 1 meter = 0.001 kilometer.
    // So to convert FROM meter TO kilometer: value * 0.001.
    // To convert FROM kilometer TO meter: value / 0.001.

    // General formula:
    // val_base = val_from / factor_from
    // val_to = val_base * factor_to

    const baseValue = value / fromUnit.factor;
    const resultValue = baseValue * toUnit.factor;

    const formula = `${value} ${fromUnit.symbol} ÷ ${this.formatNumber(fromUnit.factor)} × ${this.formatNumber(toUnit.factor)} = ${this.formatNumber(resultValue)} ${toUnit.symbol}`;

    // Simplified formula for display
    // If factor is 1, omit it.
    let formulaStr = '';
    if (fromUnit.id === category.baseUnit) {
        formulaStr = `${value} × ${toUnit.factor} = ${resultValue}`;
    } else if (toUnit.id === category.baseUnit) {
        formulaStr = `${value} ÷ ${fromUnit.factor} = ${resultValue}`;
    } else {
         formulaStr = `(${value} ÷ ${fromUnit.factor}) × ${toUnit.factor} = ${resultValue}`;
    }


    return {
      value: resultValue,
      formatted: this.formatNumber(resultValue, precision),
      formula: formulaStr
    };
  }

  private convertTemperature(
    value: number,
    fromUnit: UnitDefinition,
    toUnit: UnitDefinition,
    precision: number
  ): ConversionResult {
    // Temperature uses: val_base = (val_from - offset_from) / factor_from
    // val_to = (val_base * factor_to) + offset_to

    // Let's verify with Celsius (Base) to Fahrenheit.
    // C (Base): factor 1, offset 0.
    // F: factor 1.8, offset 32.
    // Convert 100 C to F.
    // val_base = (100 - 0) / 1 = 100.
    // val_to = (100 * 1.8) + 32 = 212. Correct.

    // Convert 212 F to C.
    // val_base = (212 - 32) / 1.8 = 100.
    // val_to = (100 * 1) + 0 = 100. Correct.

    const fromOffset = fromUnit.offset ?? 0;
    const toOffset = toUnit.offset ?? 0;

    const baseValue = (value - fromOffset) / fromUnit.factor;
    const resultValue = (baseValue * toUnit.factor) + toOffset;

    // Formula generation
    let formula = '';
    if (fromUnit.id === 'celsius' && toUnit.id === 'fahrenheit') {
        formula = `(${value}°C × 9/5) + 32 = ${this.formatNumber(resultValue)}°F`;
    } else if (fromUnit.id === 'fahrenheit' && toUnit.id === 'celsius') {
        formula = `(${value}°F − 32) × 5/9 = ${this.formatNumber(resultValue)}°C`;
    } else if (fromUnit.id === 'celsius' && toUnit.id === 'kelvin') {
        formula = `${value}°C + 273.15 = ${this.formatNumber(resultValue)}K`;
    } else if (fromUnit.id === 'kelvin' && toUnit.id === 'celsius') {
        formula = `${value}K − 273.15 = ${this.formatNumber(resultValue)}°C`;
    } else {
         formula = `((${value} - ${fromOffset}) ÷ ${fromUnit.factor}) × ${toUnit.factor} + ${toOffset}`;
    }

    return {
      value: resultValue,
      formatted: this.formatNumber(resultValue, precision),
      formula
    };
  }

  private formatNumber(num: number, precision: number = 10): string {
    if (num === 0) return '0';

    // Use exponential notation for very small or very large numbers
    if (Math.abs(num) < 1e-6 || Math.abs(num) > 1e12) {
        // Convert to exponential string
        const exp = num.toExponential(precision);
        // Remove trailing zeros from mantissa part if possible, but standard toExponential keeps them for precision.
        // Let's just return it as is, or strip trailing zeros?
        // e.g. 1.5000e+20 -> 1.5e+20
        return exp.replace(/(\.[0-9]*[1-9])0+e/, '$1e').replace(/\.0+e/, 'e');
    }

    // For normal range
    return parseFloat(num.toFixed(precision)).toString();
  }
}

export const unitEngine = new UnitEngine();
