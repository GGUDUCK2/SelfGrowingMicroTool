export const content = {
  en: {
    title: "Compound Interest Calculator",
    description: "Calculate how your investments grow over time with compound interest.",
    inputs: {
      principal: "Initial Principal ($)",
      rate: "Annual Interest Rate (%)",
      years: "Time Period (Years)",
      frequency: "Compound Frequency",
      contribution: "Monthly Contribution ($)",
    },
    frequencies: {
      daily: "Daily",
      monthly: "Monthly",
      quarterly: "Quarterly",
      annually: "Annually",
    },
    results: {
      futureValue: "Future Value",
      totalInterest: "Total Interest Earned",
      totalContributions: "Total Contributions",
    },
    chart: {
      title: "Growth Over Time",
      year: "Year",
      balance: "Balance",
    },
    howToUse: {
      title: "How to Use",
      steps: [
        "Enter your initial investment amount (Principal).",
        "Add any regular monthly contributions.",
        "Input the expected annual interest rate.",
        "Set the duration of your investment in years.",
        "Choose how often the interest is compounded.",
        "The calculator will instantly show your potential future balance."
      ]
    },
    faq: {
      title: "Frequently Asked Questions",
      items: [
        {
          question: "What is compound interest?",
          answer: "Compound interest is the interest on a loan or deposit calculated based on both the initial principal and the accumulated interest from previous periods."
        },
        {
          question: "How does the frequency affect the result?",
          answer: "The more frequently interest is compounded (e.g., daily vs. annually), the higher your future value will be because interest is earned on interest more often."
        }
      ]
    }
  },
  ko: {
    title: "복리 계산기",
    description: "복리 이자를 통해 시간이 지남에 따라 투자가 어떻게 성장하는지 계산해보세요.",
    inputs: {
      principal: "초기 투자금 (원)",
      rate: "연 이자율 (%)",
      years: "투자 기간 (년)",
      frequency: "복리 주기",
      contribution: "월 추가 납입금 (원)",
    },
    frequencies: {
      daily: "매일",
      monthly: "매월",
      quarterly: "분기별",
      annually: "매년",
    },
    results: {
      futureValue: "미래 가치",
      totalInterest: "총 이자 수익",
      totalContributions: "총 납입금",
    },
    chart: {
      title: "시간 경과에 따른 성장",
      year: "년",
      balance: "잔액",
    },
    howToUse: {
      title: "사용 방법",
      steps: [
        "초기 투자금(원금)을 입력하세요.",
        "매월 추가로 납입할 금액이 있다면 입력하세요.",
        "예상 연 이자율을 입력하세요.",
        "투자를 유지할 기간(년)을 설정하세요.",
        "이자가 복리로 계산되는 주기를 선택하세요.",
        "계산기가 즉시 예상 미래 잔액을 보여줍니다."
      ]
    },
    faq: {
      title: "자주 묻는 질문 (FAQ)",
      items: [
        {
          question: "복리란 무엇인가요?",
          answer: "복리는 원금뿐만 아니라 이전에 발생한 이자에 대해서도 이자가 붙는 방식입니다."
        },
        {
          question: "복리 주기는 결과에 어떤 영향을 미치나요?",
          answer: "복리 주기가 짧을수록(예: 매년보다 매일) 이자가 이자를 낳는 횟수가 많아져 미래 가치가 더 높아집니다."
        }
      ]
    }
  }
};
