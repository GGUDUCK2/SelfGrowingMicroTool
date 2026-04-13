# AGENTS.md - SelfGrowingMicroTool Project Rules

이 문서는 이 리포지토리에서 작업하는 모든 AI 에이전트(Jules 포함)가
반드시 준수해야 하는 프로젝트 공통 규칙입니다.
어떤 스케줄 프롬프트보다 이 문서의 규칙이 우선합니다.


## 1. 프로젝트 개요

- 이름: SelfGrowingMicroTool
- 설명: Jules를 이용한 완전 자동화 생산성 도구 모음 플랫폼
- 프레임워크: SvelteKit 5 + TypeScript + Tailwind CSS 3
- 어댑터: @sveltejs/adapter-vercel (runtime nodejs20.x)
- 배포: Vercel (Hobby Plan)
- 다국어: 한국어(ko), 영어(en) - [lang] 동적 라우팅
- DB: Dexie.js (IndexedDB, 브라우저 로컬)
- 아이콘: lucide-svelte


## 2. 디렉토리 구조 규칙

### 2.1 허용된 루트 파일 (이것들만 루트에 존재해야 함)

- AGENTS.md
- .gitignore
- .github/ (디렉토리)
- eslint.config.js
- package.json
- package-lock.json
- postcss.config.js
- svelte.config.js
- tailwind.config.* (존재하는 경우)
- tsconfig.json (존재하는 경우)
- vite.config.* (존재하는 경우)
- src/ (디렉토리)
- static/ (디렉토리)

### 2.2 루트에 절대 커밋하면 안 되는 파일

- Python 스크립트: *.py
- 로그 파일: *.log
- 디버그 이미지: *.png, *.jpg (루트 레벨)
- 패치 스크립트: patch_*.cjs, patch_*.sh
- 리포트 파일: *_report.md, report.md (루트 레벨)
- 임시 파일: *.tmp, *.bak

위 파일들을 생성해야 하는 경우 반드시 scripts/ 또는 docs/ 하위에 배치할 것.
작업 완료 후 불필요한 임시 파일은 삭제할 것.

### 2.3 소스 코드 구조

- src/lib/components/ : 공통 컴포넌트 + 도구별 컴포넌트
  - Button.svelte : 공통 버튼
  - FAQSection.svelte : 공통 FAQ
  - GuideSection.svelte : 공통 가이드
  - GrowthChart.svelte : 공통 성장 차트
  - Head.svelte : 공통 메타태그
  - HistoryList.svelte : 공통 히스토리
  - [tool-name]/ : 도구 전용 컴포넌트
- src/lib/db.ts : Dexie.js DB 정의
- src/lib/db/ : DB 관련 추가 모듈
- src/lib/dictionaries.ts : i18n 번역 사전
- src/lib/i18n.ts : i18n 유틸리티
- src/lib/registry.json : 도구 등록부 (메타데이터)
- src/lib/stores/ : Svelte 스토어
- src/lib/types/ : TypeScript 타입 정의
- src/lib/utils/ : 공통 유틸리티 함수
- src/routes/+layout.svelte
- src/routes/+error.svelte
- src/routes/[lang]/+page.svelte : 홈페이지
- src/routes/[lang]/tools/[tool-name]/ : 각 도구 라우트
- src/routes/robots.txt/
- src/routes/sitemap.xml/
- src/routes/rss.xml/


## 3. 새 도구 생성 시 필수 체크리스트

새 도구를 만들 때 반드시 아래 항목을 모두 완료해야 합니다.

### 3.1 파일 생성

- src/routes/[lang]/tools/[tool-name]/+page.svelte
- src/routes/[lang]/tools/[tool-name]/+page.server.ts
  - lang 파라미터 검증 (ko, en만 허용, 나머지는 /en/으로 308 리다이렉트)
- src/lib/components/[tool-name]/ (전용 컴포넌트)

### 3.2 등록

- src/lib/registry.json에 도구 메타데이터 추가
  - id, name(ko/en), route, category, description(ko/en), keywords, createdAt

### 3.3 번역

- src/lib/dictionaries.ts에 해당 도구의 모든 UI 문자열 번역 키 추가
- ko, en 두 언어 모두 작성 (한쪽만 작성 금지)

### 3.4 SEO 필수 요소

- svelte:head: title, meta description, canonical URL, hreflang(ko, en, x-default)
- Open Graph 태그: og:title, og:description, og:url, og:type
- JSON-LD 스키마: SoftwareApplication + BreadcrumbList + FAQPage
- FAQ 섹션: 최소 3개 질문-답변 (FAQSection.svelte 공통 컴포넌트 사용)

### 3.5 접근성 필수 요소

- 모든 인터랙티브 요소에 aria-label
- 최소 터치 타겟: min-h-[44px] min-w-[44px]
- 키보드 포커스 스타일: focus:ring-2 focus:ring-blue-500
- 키보드 단축키: Ctrl/Cmd+Enter(실행), Ctrl/Cmd+K(초기화)

### 3.6 콘텐츠 최소 요구사항 (애드센스 대비)

- 도구 설명 텍스트: 최소 200자 (ko, en 각각)
- 사용 가이드 섹션 (GuideSection.svelte 공통 컴포넌트 사용)
- FAQ 섹션: 최소 3개 Q&A


## 4. 공통 컴포넌트 사용 규칙

### 4.1 반드시 공통 컴포넌트를 사용해야 하는 경우

아래 UI 패턴은 인라인으로 직접 구현하지 말고,
src/lib/components/ 의 공통 컴포넌트를 import하여 사용할 것.

- 버튼: Button.svelte
- FAQ 섹션: FAQSection.svelte
- 사용 가이드: GuideSection.svelte
- 메타태그: Head.svelte
- 히스토리 목록: HistoryList.svelte

### 4.2 도구 전용 컴포넌트

도구 고유의 UI는 src/lib/components/[tool-name]/ 하위에 배치.
파일명은 PascalCase (예: TextHasher.svelte, FileHasher.svelte).


## 5. 디자인 시스템 규칙

### 5.1 색상 (다크 테마 기준)

- 배경 기본: bg-gray-900 / dark:bg-gray-900
- 배경 카드: bg-gray-800 / dark:bg-gray-800
- 배경 입력: bg-gray-700 / dark:bg-gray-700
- 텍스트 기본: text-gray-100
- 텍스트 보조: text-gray-400
- 강조(Primary): text-blue-400 / bg-blue-600
- 성공: text-green-400 / bg-green-600
- 경고: text-yellow-400 / bg-yellow-600
- 에러: text-red-400 / bg-red-600
- 보더: border-gray-700

### 5.2 간격 (Spacing)

- 페이지 패딩: p-4 sm:p-6 lg:p-8
- 카드 패딩: p-4 sm:p-6
- 섹션 간 간격: space-y-6 sm:space-y-8
- 요소 간 간격: gap-3 sm:gap-4

### 5.3 타이포그래피

- 페이지 제목: text-2xl sm:text-3xl font-bold
- 섹션 제목: text-lg sm:text-xl font-semibold
- 본문: text-sm sm:text-base
- 캡션/레이블: text-xs sm:text-sm text-gray-400

### 5.4 카드/패널

- 모서리: rounded-lg sm:rounded-xl
- 그림자: shadow-lg
- 보더: border border-gray-700

### 5.5 버튼

- 기본: px-4 py-2 rounded-lg font-medium transition-colors
- 호버: hover:bg-opacity-80
- 포커스: focus:outline-none focus:ring-2 focus:ring-blue-500
- 터치: min-h-[44px] min-w-[44px]

### 5.6 반응형 브레이크포인트

- 모바일 우선(Mobile-first) 접근
- sm: 640px 이상
- md: 768px 이상
- lg: 1024px 이상
- 모든 레이아웃은 320px 너비에서도 깨지지 않아야 함


## 6. 코드 품질 규칙

### 6.1 커밋 전 필수 검증

모든 커밋 전에 아래 명령어가 통과해야 합니다.

- npm run lint
- npm run check
- npm run build

빌드가 실패하는 코드는 절대 커밋하지 않습니다.

### 6.2 금지 항목

- console.log() : 프로덕션 코드에 남기지 않을 것
- debugger 구문
- any 타입 사용 (구체적인 타입 또는 인터페이스로 대체)
- 주석 처리된 죽은 코드
- 하드코딩된 한국어/영어 문자열 (반드시 dictionaries.ts 사용)
- 인라인 스타일 (style 속성) : Tailwind 클래스로 대체

### 6.3 필수 패턴

- 모든 비동기 작업에 try-catch + 사용자 친화적 에러 메시지
- 입력 검증: 빈 값, 길이 제한, 유효성 검사
- 옵셔널 체이닝(?.) 사용: 딕셔너리 접근 시 런타임 에러 방지
- 이벤트 리스너는 onMount에서 등록하고 onDestroy에서 정리


## 7. i18n 규칙

### 7.1 지원 언어

- ko (한국어) : 기본
- en (영어)

### 7.2 라우팅

- 유효한 lang 값: "ko", "en"
- 유효하지 않은 lang 값 접근 시: /en/ 으로 308 리다이렉트
- +page.server.ts에서 lang 파라미터 검증 필수

### 7.3 번역 키 규칙

- 모든 UI 문자열은 src/lib/dictionaries.ts에서 관리
- 키 네이밍: tools.[toolId].[section].[key]
- 새 키 추가 시 ko, en 동시 작성 필수
- 번역이 자연스러워야 함 (기계 번역 금지)


## 8. SEO/AEO 규칙

### 8.1 모든 도구 페이지 필수 요소

- title 태그: "[도구명] - [카테고리] | SelfGrowingMicroTool"
- meta description: 120-160자, 도구 기능 + 혜택 중심
- canonical URL
- hreflang: ko, en, x-default
- Open Graph: og:title, og:description, og:url, og:type
- JSON-LD: SoftwareApplication + BreadcrumbList + FAQPage

### 8.2 JSON-LD 스키마 작성 규칙

- 스크립트 상단에서 객체로 정의 후 JSON.stringify로 변환
- svelte:head 내에서 {@html} 태그로 안전하게 삽입
- 절대로 svelte:head 안에서 직접 JSON 리터럴을 하드코딩하지 말 것

### 8.3 콘텐츠 요구사항

- 순수 UI만 있는 페이지는 구글에서 Thin Content로 판단함
- 각 도구 페이지에 최소 200자 이상의 설명 텍스트 필수
- FAQ 섹션 최소 3개 Q&A
- 사용 가이드 섹션 포함


## 9. 성능 규칙

- 모든 처리는 클라이언트 사이드 (서버 API 호출 금지)
- 대용량 데이터 처리 시 Web Worker 또는 청크 분할 고려
- 이미지: WebP 또는 AVIF 포맷 우선, lazy loading 적용
- 외부 라이브러리 추가 시 번들 크기 영향 반드시 확인
- Lighthouse Performance 90점 이상 목표


## 10. 애드센스 준비 필수 페이지

다음 페이지들이 반드시 존재해야 합니다.
없는 경우 생성해야 합니다.

- 개인정보처리방침 (Privacy Policy): /[lang]/privacy
- 이용약관 (Terms of Service): /[lang]/terms
- 소개 (About): /[lang]/about
- 문의 (Contact): /[lang]/contact


## 11. Git 규칙

### 11.1 커밋 메시지 형식

- 새 도구: feat: [Tool Name] - [설명] (YYYY-MM-DD)
- 기존 개선: improve: [Tool Name] - [설명] (YYYY-MM-DD)
- 버그 수정: fix: [Tool Name] - [설명] (YYYY-MM-DD)
- 프로젝트 위생: chore: [설명] (YYYY-MM-DD)

### 11.2 브랜치

- 모든 작업은 main 브랜치에 직접 커밋


## 12. 에이전트 간 충돌 방지

이 리포지토리에는 여러 Jules 스케줄이 동시에 작업합니다.

- 다른 에이전트가 최근 수정한 파일을 불필요하게 덮어쓰지 말 것
- registry.json 수정 시 기존 항목을 절대 삭제하거나 변경하지 말 것
- dictionaries.ts 수정 시 기존 번역 키를 삭제하거나 변경하지 말 것
- 공통 컴포넌트(src/lib/components/*.svelte) 수정 시
  기존 props 인터페이스를 깨뜨리는 변경 금지 (추가만 허용)
