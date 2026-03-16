const fs = require('fs');

let file = fs.readFileSync('src/lib/dictionaries.ts', 'utf8');

const enInsertIdx = file.indexOf('gitForge: {');
const enString = `
      passwordForge: {
        title: "Password Forge: Secure Credentials",
        description: "The definitive password and passphrase generator. Create cryptographically secure keys with deep customization and strength analysis.",
        modePassword: "Password",
        modePassphrase: "Passphrase",
        generatedPassword: "Generated Password",
        regenerate: "Regenerate",
        copy: "Copy to Clipboard",
        history: "History",
        noHistory: "No passwords saved yet.",
        clearHistory: "Clear",
        star: "Star / Unstar",
        delete: "Delete",
        strength: "Strength",
        entropy: "Entropy",
        timeToCrack: "Time to crack (offline)",
        levels: ["Very Weak", "Weak", "Reasonable", "Strong", "Very Strong"],
        length: "Length",
        uppercase: "Uppercase",
        lowercase: "Lowercase",
        numbers: "Numbers",
        symbols: "Symbols",
        excludeSimilar: "Exclude Similar",
        excludeAmbiguous: "Exclude Ambiguous",
        words: "Number of Words",
        separator: "Separator",
        capitalize: "Capitalize",
        includeNumber: "Include Number",
        none: "None",
        first: "First Letter",
        all: "All Uppercase",
        guide: {
          title: "The Ultimate Guide to Secure Passwords",
          intro: "Creating strong passwords is the first line of defense in cybersecurity. Password Forge gives you the tools to create uncrackable passwords and memorable passphrases.",
          featuresTitle: "Core Features",
          f1: "<strong>Cryptographic Security:</strong> Uses the Web Crypto API for true randomness.",
          f2: "<strong>Entropy Calculation:</strong> Real-time feedback on your password's mathematical strength in bits.",
          f3: "<strong>Passphrase Support:</strong> Generate memorable 'xkcd-style' passphrases which are highly secure yet easy to type.",
          tipsTitle: "Security Pro Tips",
          tip1: "Use <strong>passphrases</strong> (4+ random words) for master passwords or accounts you need to remember.",
          tip2: "Never reuse passwords across different services.",
          tip3: "Exclude ambiguous characters if you might need to read the password over the phone or type it on a foreign keyboard."
        },
        faqTitle: "Frequently Asked Questions",
        q1: "What is password entropy?",
        a1: "Password entropy is a measurement of how unpredictable a password is, calculated in bits. Higher entropy means it would take longer for a computer program to guess the password through a brute-force attack. A score above 60 bits is generally considered strong.",
        q2: "Why use passphrases instead of complex passwords?",
        a2: "Passphrases (e.g., 'correct-horse-battery-staple') are easier for humans to remember and type than complex passwords (e.g., 'Tr0ub4dor&3'), while still maintaining high entropy due to their length and the size of the word pool.",
        q3: "Are my generated passwords stored safely?",
        a3: "All password generation happens locally in your browser. If you save them to history, they are stored securely in your browser's IndexedDB. No passwords are ever sent to a server."
      },
      `;
file = file.slice(0, enInsertIdx) + enString + file.slice(enInsertIdx);

const koInsertIdx = file.indexOf('gitForge: {', enInsertIdx + enString.length + 500);
const koString = `
      passwordForge: {
        title: "패스워드 포지: 안전한 자격 증명",
        description: "완벽한 암호 및 패스프레이즈 생성기입니다. 심층적인 사용자 지정 및 강도 분석을 통해 암호학적으로 안전한 키를 생성하세요.",
        modePassword: "비밀번호",
        modePassphrase: "패스프레이즈",
        generatedPassword: "생성된 비밀번호",
        regenerate: "다시 생성",
        copy: "클립보드에 복사",
        history: "히스토리",
        noHistory: "저장된 비밀번호가 없습니다.",
        clearHistory: "지우기",
        star: "즐겨찾기 추가 / 해제",
        delete: "삭제",
        strength: "강도",
        entropy: "엔트로피",
        timeToCrack: "오프라인 크래킹 예상 시간",
        levels: ["매우 취약", "취약", "보통", "안전", "매우 안전"],
        length: "길이",
        uppercase: "대문자",
        lowercase: "소문자",
        numbers: "숫자",
        symbols: "기호",
        excludeSimilar: "비슷한 문자 제외",
        excludeAmbiguous: "모호한 문자 제외",
        words: "단어 개수",
        separator: "구분 기호",
        capitalize: "대문자화",
        includeNumber: "숫자 포함",
        none: "없음",
        first: "첫 글자만",
        all: "모두 대문자",
        guide: {
          title: "안전한 비밀번호를 위한 완벽 가이드",
          intro: "강력한 비밀번호를 만드는 것은 사이버 보안의 첫 번째 방어선입니다. 패스워드 포지는 해독할 수 없는 비밀번호와 기억하기 쉬운 패스프레이즈를 만들 수 있는 도구를 제공합니다.",
          featuresTitle: "주요 기능",
          f1: "<strong>암호학적 보안:</strong> 진정한 무작위성을 위해 Web Crypto API를 사용합니다.",
          f2: "<strong>엔트로피 계산:</strong> 비밀번호의 수학적 강도를 비트 단위로 실시간 피드백합니다.",
          f3: "<strong>패스프레이즈 지원:</strong> 입력하기 쉬우면서도 매우 안전한 'xkcd 스타일'의 기억하기 쉬운 패스프레이즈를 생성합니다.",
          tipsTitle: "보안 프로 팁",
          tip1: "마스터 암호나 기억해야 할 계정에는 <strong>패스프레이즈</strong>(무작위 단어 4개 이상)를 사용하세요.",
          tip2: "다른 서비스에서 동일한 비밀번호를 재사용하지 마세요.",
          tip3: "전화로 비밀번호를 읽어주거나 외국어 키보드로 입력해야 할 수 있는 경우 모호한 문자를 제외하세요."
        },
        faqTitle: "자주 묻는 질문",
        q1: "비밀번호 엔트로피란 무엇인가요?",
        a1: "비밀번호 엔트로피는 비밀번호를 얼마나 예측하기 어려운지를 비트 단위로 계산한 측정값입니다. 엔트로피가 높을수록 컴퓨터 프로그램이 무차별 대입 공격을 통해 비밀번호를 추측하는 데 더 오래 걸립니다. 일반적으로 60비트 이상의 점수는 강력한 것으로 간주됩니다.",
        q2: "복잡한 비밀번호 대신 패스프레이즈를 사용하는 이유는 무엇인가요?",
        a2: "패스프레이즈(예: 'correct-horse-battery-staple')는 길이가 길고 단어 풀이 크기 때문에 높은 엔트로피를 유지하면서도 복잡한 비밀번호(예: 'Tr0ub4dor&3')보다 사람이 기억하고 입력하기가 훨씬 쉽습니다.",
        q3: "생성된 비밀번호는 안전하게 저장되나요?",
        a3: "모든 비밀번호 생성은 브라우저에서 로컬로 이루어집니다. 히스토리에 저장하는 경우 브라우저의 IndexedDB에 안전하게 저장됩니다. 비밀번호는 절대 서버로 전송되지 않습니다."
      },
      `;
file = file.slice(0, koInsertIdx) + koString + file.slice(koInsertIdx);

fs.writeFileSync('src/lib/dictionaries.ts', file);
