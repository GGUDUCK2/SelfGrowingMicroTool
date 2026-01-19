export const dictionaries = {
  en: {
    home: {
      title: "MicroFactory",
      subtitle: "Developer tools, refined.",
    },
    common: {
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      copy: "Copy",
      download: "Download",
      loading: "Loading...",
      error: "Error",
      success: "Success",
    },
    tools: {
      "time-forge": {
        title: "Time Forge",
        description: "Professional world clock and meeting scheduler for distributed teams.",
        searchPlaceholder: "Search city...",
        addCity: "Add City",
        reset: "Reset to Now",
        share: "Share Link",
        saveTeam: "Save Team",
        loadTeam: "Load Team",
        teams: "Teams",
        noCities: "No cities selected.",
        homeBase: "Home Base",
      }
    }
  },
  ko: {
    home: {
      title: "마이크로팩토리",
      subtitle: "개발자 도구의 정수.",
    },
    common: {
      save: "저장",
      cancel: "취소",
      delete: "삭제",
      copy: "복사",
      download: "다운로드",
      loading: "로딩 중...",
      error: "오류",
      success: "성공",
    },
    tools: {
      "time-forge": {
        title: "타임 포지",
        description: "분산된 팀을 위한 전문 세계 시계 및 회의 일정 스케줄러입니다.",
        searchPlaceholder: "도시 검색...",
        addCity: "도시 추가",
        reset: "현재 시간으로 초기화",
        share: "링크 공유",
        saveTeam: "팀 저장",
        loadTeam: "팀 불러오기",
        teams: "팀 목록",
        noCities: "선택된 도시가 없습니다.",
        homeBase: "기준 도시",
      }
    }
  }
};

export function getDictionary(lang: string) {
    return dictionaries[lang as keyof typeof dictionaries] || dictionaries['en'];
}
