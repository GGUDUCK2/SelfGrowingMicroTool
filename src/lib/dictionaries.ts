export const dictionaries = {
  en: {
    home: {
      title: "Micro-Tools Factory",
      description: "A collection of self-evolving web tools.",
      search: "Search tools...",
    },
    common: {
      back: "Back to Home",
    }
  },
  ko: {
    home: {
      title: "마이크로 툴 팩토리",
      description: "자가 발전하는 웹 도구 모음입니다.",
      search: "도구 검색...",
    },
    common: {
      back: "홈으로 돌아가기",
    }
  }
} as const;

export const getDictionary = (lang: string) => dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
