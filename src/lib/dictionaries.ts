export const dictionaries = {
  en: {
    home: {
      title: "Micro-Tools Factory",
      description: "A collection of self-evolving web tools.",
      search: "Search tools...",
    },
    common: {
      back: "Back to Home",
    },
    tools: {
      compoundInterest: {
        title: "Compound Interest Calculator",
        description: "Visualize how your investment grows over time with the power of compound interest.",
        config: "Configuration",
        initialInvestment: "Initial Investment",
        monthlyContribution: "Monthly Contribution",
        interestRate: "Interest Rate (%)",
        yearsToGrow: "Years to Grow",
        futureBalance: "Future Balance",
        totalInvested: "Total Invested",
        totalInterest: "Total Interest",
        growthChart: "Growth Chart",
        history: "Calculation History",
        historyEmpty: "No calculations saved yet.",
        save: "Save Result",
        delete: "Delete",
        share: "Share Result",
        copyLink: "Copy Link",
        linkCopied: "Link Copied!",
        faq: "Frequently Asked Questions",
        faqTitle: "Compound Interest Calculator FAQ",
        q1: "What is compound interest?",
        a1: "Compound interest is interest calculated on the initial principal, which also includes all of the accumulated interest of previous periods.",
        q2: "How often is interest compounded in this calculator?",
        a2: "This calculator assumes monthly compounding for both the principal and monthly contributions.",
        q3: "Can I use this for stocks or real estate?",
        a3: "Yes, you can use the estimated annual return rate to project growth for any investment vehicle.",
      }
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
    },
    tools: {
      compoundInterest: {
        title: "복리 계산기",
        description: "시간이 지남에 따라 자산이 어떻게 성장하는지 확인하세요. 복리의 마법을 경험해보세요.",
        config: "설정",
        initialInvestment: "초기 투자금",
        monthlyContribution: "월 적립금",
        interestRate: "연 수익률 (%)",
        yearsToGrow: "투자 기간 (년)",
        futureBalance: "총 평가액",
        totalInvested: "총 투자 원금",
        totalInterest: "총 이자 수익",
        growthChart: "성장 그래프",
        history: "계산 기록",
        historyEmpty: "저장된 기록이 없습니다.",
        save: "결과 저장",
        delete: "삭제",
        share: "결과 공유",
        copyLink: "링크 복사",
        linkCopied: "복사되었습니다!",
        faq: "자주 묻는 질문",
        faqTitle: "복리 계산기 자주 묻는 질문",
        q1: "복리란 무엇인가요?",
        a1: "복리는 원금뿐만 아니라 이전에 발생한 이자에도 이자가 붙는 방식을 말합니다.",
        q2: "이 계산기는 복리 주기가 어떻게 되나요?",
        a2: "이 계산기는 원금과 월 적립금 모두에 대해 월복리를 가정합니다.",
        q3: "주식이나 부동산 투자에도 사용할 수 있나요?",
        a3: "네, 예상 연 수익률을 입력하여 다양한 투자의 미래 가치를 예측하는 데 사용할 수 있습니다.",
      }
    }
  }
} as const;

export const getDictionary = (lang: string) => dictionaries[lang as keyof typeof dictionaries] || dictionaries.en;
