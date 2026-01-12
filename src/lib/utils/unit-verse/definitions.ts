export type UnitDefinition = {
  id: string;
  name: { en: string; ko: string };
  symbol: string;
  factor: number; // Multiplier relative to base unit
  offset?: number; // Additive offset relative to base unit (applied after factor when converting FROM base)
  // formula: val_in_unit = (val_in_base * factor) + offset
  // val_in_base = (val_in_unit - offset) / factor
};

export type CategoryDefinition = {
  id: string;
  name: { en: string; ko: string };
  baseUnit: string; // ID of the base unit
  units: UnitDefinition[];
};

export const categories: CategoryDefinition[] = [
  {
    id: "length",
    name: { en: "Length", ko: "길이" },
    baseUnit: "meter",
    units: [
      { id: "kilometer", name: { en: "Kilometer", ko: "킬로미터" }, symbol: "km", factor: 0.001 },
      { id: "meter", name: { en: "Meter", ko: "미터" }, symbol: "m", factor: 1 },
      { id: "centimeter", name: { en: "Centimeter", ko: "센티미터" }, symbol: "cm", factor: 100 },
      { id: "millimeter", name: { en: "Millimeter", ko: "밀리미터" }, symbol: "mm", factor: 1000 },
      { id: "micrometer", name: { en: "Micrometer", ko: "마이크로미터" }, symbol: "µm", factor: 1e6 },
      { id: "nanometer", name: { en: "Nanometer", ko: "나노미터" }, symbol: "nm", factor: 1e9 },
      { id: "mile", name: { en: "Mile", ko: "마일" }, symbol: "mi", factor: 0.000621371 },
      { id: "yard", name: { en: "Yard", ko: "야드" }, symbol: "yd", factor: 1.09361 },
      { id: "foot", name: { en: "Foot", ko: "피트" }, symbol: "ft", factor: 3.28084 },
      { id: "inch", name: { en: "Inch", ko: "인치" }, symbol: "in", factor: 39.3701 },
      { id: "nautical_mile", name: { en: "Nautical Mile", ko: "해리" }, symbol: "nmi", factor: 0.000539957 },
      { id: "light_year", name: { en: "Light Year", ko: "광년" }, symbol: "ly", factor: 1.057e-16 },
      { id: "parsec", name: { en: "Parsec", ko: "파섹" }, symbol: "pc", factor: 3.24078e-17 },
      { id: "astronomical_unit", name: { en: "Astronomical Unit", ko: "천문단위" }, symbol: "AU", factor: 6.68459e-12 },
    ],
  },
  {
    id: "mass",
    name: { en: "Mass/Weight", ko: "무게/질량" },
    baseUnit: "kilogram",
    units: [
      { id: "tonne", name: { en: "Tonne (Metric)", ko: "톤 (미터법)" }, symbol: "t", factor: 0.001 },
      { id: "kilogram", name: { en: "Kilogram", ko: "킬로그램" }, symbol: "kg", factor: 1 },
      { id: "gram", name: { en: "Gram", ko: "그램" }, symbol: "g", factor: 1000 },
      { id: "milligram", name: { en: "Milligram", ko: "밀리그램" }, symbol: "mg", factor: 1e6 },
      { id: "microgram", name: { en: "Microgram", ko: "마이크로그램" }, symbol: "µg", factor: 1e9 },
      { id: "imperial_ton", name: { en: "Ton (Imperial)", ko: "톤 (영국)" }, symbol: "long tn", factor: 0.000984207 },
      { id: "us_ton", name: { en: "Ton (US)", ko: "톤 (미국)" }, symbol: "sh tn", factor: 0.00110231 },
      { id: "stone", name: { en: "Stone", ko: "스톤" }, symbol: "st", factor: 0.157473 },
      { id: "pound", name: { en: "Pound", ko: "파운드" }, symbol: "lb", factor: 2.20462 },
      { id: "ounce", name: { en: "Ounce", ko: "온스" }, symbol: "oz", factor: 35.274 },
      { id: "carat", name: { en: "Carat", ko: "캐럿" }, symbol: "ct", factor: 5000 },
      { id: "grain", name: { en: "Grain", ko: "그레인" }, symbol: "gr", factor: 15432.4 },
    ],
  },
  {
    id: "volume",
    name: { en: "Volume", ko: "부피" },
    baseUnit: "liter",
    units: [
      { id: "cubic_meter", name: { en: "Cubic Meter", ko: "세제곱미터" }, symbol: "m³", factor: 0.001 },
      { id: "liter", name: { en: "Liter", ko: "리터" }, symbol: "l", factor: 1 },
      { id: "milliliter", name: { en: "Milliliter", ko: "밀리리터" }, symbol: "ml", factor: 1000 },
      { id: "gallon_us", name: { en: "Gallon (US)", ko: "갤런 (미국)" }, symbol: "gal", factor: 0.264172 },
      { id: "gallon_imp", name: { en: "Gallon (Imp)", ko: "갤런 (영국)" }, symbol: "gal", factor: 0.219969 },
      { id: "quart_us", name: { en: "Quart (US)", ko: "쿼트 (미국)" }, symbol: "qt", factor: 1.05669 },
      { id: "pint_us", name: { en: "Pint (US)", ko: "파인트 (미국)" }, symbol: "pt", factor: 2.11338 },
      { id: "cup_us", name: { en: "Cup (US)", ko: "컵 (미국)" }, symbol: "cup", factor: 4.22675 },
      { id: "fluid_ounce_us", name: { en: "Fluid Ounce (US)", ko: "액량 온스 (미국)" }, symbol: "fl oz", factor: 33.814 },
      { id: "tablespoon_us", name: { en: "Tablespoon (US)", ko: "테이블스푼" }, symbol: "tbsp", factor: 67.628 },
      { id: "teaspoon_us", name: { en: "Teaspoon (US)", ko: "티스푼" }, symbol: "tsp", factor: 202.884 },
      { id: "cubic_foot", name: { en: "Cubic Foot", ko: "세제곱피트" }, symbol: "ft³", factor: 0.0353147 },
      { id: "cubic_inch", name: { en: "Cubic Inch", ko: "세제곱인치" }, symbol: "in³", factor: 61.0237 },
      { id: "barrel_oil", name: { en: "Barrel (Oil)", ko: "배럴 (석유)" }, symbol: "bbl", factor: 0.00628981 },
    ],
  },
  {
    id: "temperature",
    name: { en: "Temperature", ko: "온도" },
    baseUnit: "celsius",
    units: [
      { id: "celsius", name: { en: "Celsius", ko: "섭씨" }, symbol: "°C", factor: 1, offset: 0 },
      { id: "fahrenheit", name: { en: "Fahrenheit", ko: "화씨" }, symbol: "°F", factor: 1.8, offset: 32 },
      { id: "kelvin", name: { en: "Kelvin", ko: "켈빈" }, symbol: "K", factor: 1, offset: 273.15 },
      { id: "rankine", name: { en: "Rankine", ko: "란씨" }, symbol: "°R", factor: 1.8, offset: 491.67 },
    ],
  },
  {
    id: "area",
    name: { en: "Area", ko: "넓이" },
    baseUnit: "square_meter",
    units: [
      { id: "square_kilometer", name: { en: "Square Kilometer", ko: "제곱킬로미터" }, symbol: "km²", factor: 1e-6 },
      { id: "square_meter", name: { en: "Square Meter", ko: "제곱미터" }, symbol: "m²", factor: 1 },
      { id: "square_centimeter", name: { en: "Square Centimeter", ko: "제곱센티미터" }, symbol: "cm²", factor: 10000 },
      { id: "hectare", name: { en: "Hectare", ko: "헥타르" }, symbol: "ha", factor: 1e-4 },
      { id: "square_mile", name: { en: "Square Mile", ko: "제곱마일" }, symbol: "mi²", factor: 3.861e-7 },
      { id: "square_yard", name: { en: "Square Yard", ko: "제곱야드" }, symbol: "yd²", factor: 1.19599 },
      { id: "square_foot", name: { en: "Square Foot", ko: "제곱피트" }, symbol: "ft²", factor: 10.7639 },
      { id: "square_inch", name: { en: "Square Inch", ko: "제곱인치" }, symbol: "in²", factor: 1550 },
      { id: "acre", name: { en: "Acre", ko: "에이커" }, symbol: "ac", factor: 0.000247105 },
      { id: "pyeong", name: { en: "Pyeong", ko: "평" }, symbol: "py", factor: 0.3025 },
    ],
  },
  {
    id: "time",
    name: { en: "Time", ko: "시간" },
    baseUnit: "second",
    units: [
      { id: "century", name: { en: "Century", ko: "세기" }, symbol: "c", factor: 3.169e-10 },
      { id: "decade", name: { en: "Decade", ko: "십년" }, symbol: "dec", factor: 3.169e-9 },
      { id: "year_gregorian", name: { en: "Year", ko: "년" }, symbol: "y", factor: 3.1688e-8 },
      { id: "month_avg", name: { en: "Month (Avg)", ko: "월 (평균)" }, symbol: "mo", factor: 3.8052e-7 },
      { id: "week", name: { en: "Week", ko: "주" }, symbol: "wk", factor: 1.6534e-6 },
      { id: "day", name: { en: "Day", ko: "일" }, symbol: "d", factor: 1.1574e-5 },
      { id: "hour", name: { en: "Hour", ko: "시간" }, symbol: "h", factor: 0.000277778 },
      { id: "minute", name: { en: "Minute", ko: "분" }, symbol: "min", factor: 0.0166667 },
      { id: "second", name: { en: "Second", ko: "초" }, symbol: "s", factor: 1 },
      { id: "millisecond", name: { en: "Millisecond", ko: "밀리초" }, symbol: "ms", factor: 1000 },
      { id: "microsecond", name: { en: "Microsecond", ko: "마이크로초" }, symbol: "µs", factor: 1e6 },
      { id: "nanosecond", name: { en: "Nanosecond", ko: "나노초" }, symbol: "ns", factor: 1e9 },
    ],
  },
  {
    id: "digital",
    name: { en: "Digital Storage", ko: "디지털 데이터" },
    baseUnit: "byte",
    units: [
      { id: "terabyte", name: { en: "Terabyte", ko: "테라바이트" }, symbol: "TB", factor: 1e-12 },
      { id: "gigabyte", name: { en: "Gigabyte", ko: "기가바이트" }, symbol: "GB", factor: 1e-9 },
      { id: "megabyte", name: { en: "Megabyte", ko: "메가바이트" }, symbol: "MB", factor: 1e-6 },
      { id: "kilobyte", name: { en: "Kilobyte", ko: "킬로바이트" }, symbol: "KB", factor: 0.001 },
      { id: "byte", name: { en: "Byte", ko: "바이트" }, symbol: "B", factor: 1 },
      { id: "bit", name: { en: "Bit", ko: "비트" }, symbol: "b", factor: 8 },
      { id: "tebibyte", name: { en: "Tebibyte", ko: "테비바이트" }, symbol: "TiB", factor: 9.0949e-13 },
      { id: "gibibyte", name: { en: "Gibibyte", ko: "기비바이트" }, symbol: "GiB", factor: 9.3132e-10 },
      { id: "mebibyte", name: { en: "Mebibyte", ko: "메비바이트" }, symbol: "MiB", factor: 9.5367e-7 },
      { id: "kibibyte", name: { en: "Kibibyte", ko: "키비바이트" }, symbol: "KiB", factor: 0.000976563 },
    ],
  },
  {
    id: "speed",
    name: { en: "Speed", ko: "속도" },
    baseUnit: "meters_per_second",
    units: [
      { id: "mach", name: { en: "Mach", ko: "마하" }, symbol: "Ma", factor: 0.00293858 },
      { id: "speed_of_light", name: { en: "Speed of Light", ko: "광속" }, symbol: "c", factor: 3.3356e-9 },
      { id: "kilometer_per_hour", name: { en: "Kilometer per Hour", ko: "시속 (km/h)" }, symbol: "km/h", factor: 3.6 },
      { id: "meters_per_second", name: { en: "Meter per Second", ko: "미터/초" }, symbol: "m/s", factor: 1 },
      { id: "mile_per_hour", name: { en: "Mile per Hour", ko: "마일/시간" }, symbol: "mph", factor: 2.23694 },
      { id: "knot", name: { en: "Knot", ko: "노트" }, symbol: "kn", factor: 1.94384 },
      { id: "foot_per_second", name: { en: "Foot per Second", ko: "피트/초" }, symbol: "fps", factor: 3.28084 },
    ],
  },
  {
    id: "pressure",
    name: { en: "Pressure", ko: "압력" },
    baseUnit: "pascal",
    units: [
      { id: "bar", name: { en: "Bar", ko: "바" }, symbol: "bar", factor: 1e-5 },
      { id: "pascal", name: { en: "Pascal", ko: "파스칼" }, symbol: "Pa", factor: 1 },
      { id: "psi", name: { en: "PSI", ko: "프사이" }, symbol: "psi", factor: 0.000145038 },
      { id: "standard_atmosphere", name: { en: "Standard Atmosphere", ko: "기압" }, symbol: "atm", factor: 9.8692e-6 },
      { id: "torr", name: { en: "Torr", ko: "토르" }, symbol: "Torr", factor: 0.00750062 },
    ],
  },
  {
    id: "energy",
    name: { en: "Energy", ko: "에너지" },
    baseUnit: "joule",
    units: [
      { id: "kilojoule", name: { en: "Kilojoule", ko: "킬로줄" }, symbol: "kJ", factor: 0.001 },
      { id: "joule", name: { en: "Joule", ko: "줄" }, symbol: "J", factor: 1 },
      { id: "kilocalorie", name: { en: "Kilocalorie", ko: "킬로칼로리" }, symbol: "kcal", factor: 0.000239006 },
      { id: "calorie", name: { en: "Calorie", ko: "칼로리" }, symbol: "cal", factor: 0.239006 },
      { id: "watt_hour", name: { en: "Watt Hour", ko: "와트시" }, symbol: "Wh", factor: 0.000277778 },
      { id: "electronvolt", name: { en: "Electronvolt", ko: "전자볼트" }, symbol: "eV", factor: 6.242e+18 },
      { id: "british_thermal_unit", name: { en: "BTU", ko: "BTU" }, symbol: "BTU", factor: 0.000947817 },
      { id: "foot_pound", name: { en: "Foot-Pound", ko: "피트-파운드" }, symbol: "ft⋅lb", factor: 0.737562 },
    ],
  },
  {
    id: "frequency",
    name: { en: "Frequency", ko: "주파수" },
    baseUnit: "hertz",
    units: [
      { id: "gigahertz", name: { en: "Gigahertz", ko: "기가헤르츠" }, symbol: "GHz", factor: 1e-9 },
      { id: "megahertz", name: { en: "Megahertz", ko: "메가헤르츠" }, symbol: "MHz", factor: 1e-6 },
      { id: "kilohertz", name: { en: "Kilohertz", ko: "킬로헤르츠" }, symbol: "kHz", factor: 0.001 },
      { id: "hertz", name: { en: "Hertz", ko: "헤르츠" }, symbol: "Hz", factor: 1 },
    ],
  },
  {
    id: "power",
    name: { en: "Power", ko: "일률/전력" },
    baseUnit: "watt",
    units: [
      { id: "megawatt", name: { en: "Megawatt", ko: "메가와트" }, symbol: "MW", factor: 1e-6 },
      { id: "kilowatt", name: { en: "Kilowatt", ko: "킬로와트" }, symbol: "kW", factor: 0.001 },
      { id: "watt", name: { en: "Watt", ko: "와트" }, symbol: "W", factor: 1 },
      { id: "horsepower", name: { en: "Horsepower (Metric)", ko: "마력" }, symbol: "hp", factor: 0.00135962 },
    ],
  },
];
