
export interface ContextItem {
  id: string;
  category: string; // 'length', 'mass', 'area', 'volume', 'temperature', 'speed'
  value: number; // in base SI unit (meter, kg, m2, m3, kelvin, m/s)
  label: {
    en: string;
    ko: string;
  };
  icon?: string; // lucide icon name or emoji
}

export const contextData: ContextItem[] = [
  // Length (meters)
  { id: 'l_ant', category: 'length', value: 0.005, label: { en: 'Red Ant', ko: '붉은 개미' }, icon: '🐜' },
  { id: 'l_pencil', category: 'length', value: 0.19, label: { en: 'Standard Pencil', ko: '표준 연필' }, icon: '✏️' },
  { id: 'l_human', category: 'length', value: 1.7, label: { en: 'Average Human Height', ko: '평균 사람 키' }, icon: '🧍' },
  { id: 'l_bus', category: 'length', value: 12, label: { en: 'City Bus', ko: '시내버스' }, icon: '🚌' },
  { id: 'l_eiffel', category: 'length', value: 324, label: { en: 'Eiffel Tower', ko: '에펠탑' }, icon: '🗼' },
  { id: 'l_everest', category: 'length', value: 8848, label: { en: 'Mount Everest', ko: '에베레스트 산' }, icon: '🏔️' },
  { id: 'l_marathon', category: 'length', value: 42195, label: { en: 'Marathon Course', ko: '마라톤 코스' }, icon: '🏃' },
  { id: 'l_moon', category: 'length', value: 384400000, label: { en: 'Earth to Moon', ko: '지구에서 달까지' }, icon: '🌑' },

  // Mass (kg)
  { id: 'm_grain', category: 'mass', value: 0.000065, label: { en: 'Grain of Rice', ko: '쌀 한 톨' }, icon: '🌾' },
  { id: 'm_smartphone', category: 'mass', value: 0.2, label: { en: 'Smartphone', ko: '스마트폰' }, icon: '📱' },
  { id: 'm_cat', category: 'mass', value: 4.5, label: { en: 'Domestic Cat', ko: '집 고양이' }, icon: '🐈' },
  { id: 'm_human', category: 'mass', value: 70, label: { en: 'Average Adult', ko: '평균 성인' }, icon: '🧍' },
  { id: 'm_piano', category: 'mass', value: 300, label: { en: 'Grand Piano', ko: '그랜드 피아노' }, icon: '🎹' },
  { id: 'm_car', category: 'mass', value: 1500, label: { en: 'Compact Car', ko: '소형차' }, icon: '🚗' },
  { id: 'm_elephant', category: 'mass', value: 6000, label: { en: 'African Elephant', ko: '아프리카 코끼리' }, icon: '🐘' },
  { id: 'm_whale', category: 'mass', value: 150000, label: { en: 'Blue Whale', ko: '대왕고래' }, icon: '🐋' },

  // Speed (m/s)
  { id: 's_walk', category: 'speed', value: 1.4, label: { en: 'Walking Speed', ko: '걷는 속도' }, icon: '🚶' },
  { id: 's_bolt', category: 'speed', value: 12.4, label: { en: 'Usain Bolt (Top Speed)', ko: '우사인 볼트 (최고 속도)' }, icon: '🏃' },
  { id: 's_cheetah', category: 'speed', value: 33, label: { en: 'Cheetah', ko: '치타' }, icon: '🐆' },
  { id: 's_sound', category: 'speed', value: 343, label: { en: 'Speed of Sound', ko: '음속' }, icon: '🔊' },
  { id: 's_bullet', category: 'speed', value: 700, label: { en: 'Bullet', ko: '총알' }, icon: '🔫' },

  // Area (m2)
  { id: 'a_a4', category: 'area', value: 0.062, label: { en: 'A4 Paper', ko: 'A4 용지' }, icon: '📄' },
  { id: 'a_pingpong', category: 'area', value: 4.1785, label: { en: 'Ping Pong Table', ko: '탁구대' }, icon: '🏓' },
  { id: 'a_court', category: 'area', value: 260, label: { en: 'Tennis Court', ko: '테니스 코트' }, icon: '🎾' },
  { id: 'a_soccer', category: 'area', value: 7140, label: { en: 'Soccer Field', ko: '축구장' }, icon: '⚽' },

  // Volume (m3) (liters / 1000)
  { id: 'v_teaspoon', category: 'volume', value: 0.000005, label: { en: 'Teaspoon', ko: '티스푼' }, icon: '🥄' },
  { id: 'v_coke', category: 'volume', value: 0.000355, label: { en: 'Soda Can', ko: '캔 음료' }, icon: '🥤' },
  { id: 'v_bathtub', category: 'volume', value: 0.15, label: { en: 'Bathtub', ko: '욕조' }, icon: '🛁' },
  { id: 'v_pool', category: 'volume', value: 2500, label: { en: 'Olympic Pool', ko: '올림픽 수영장' }, icon: '🏊' },

  // Temperature (Kelvin) - Special handling needed in logic
];

export function findClosestContext(value: number, category: string, count: number = 2): ContextItem[] {
  const items = contextData.filter(i => i.category === category);
  if (items.length === 0) return [];

  // Sort by difference ratio
  // We want items where value is approximately a multiple of item.value, or item.value is multiple of value
  // But simplest is just finding the closest magnitude match to show "It's about X times Y"

  return items.sort((a, b) => {
    const ratioA = Math.max(value, a.value) / Math.min(value, a.value);
    const ratioB = Math.max(value, b.value) / Math.min(value, b.value);
    return ratioA - ratioB;
  }).slice(0, count);
}
