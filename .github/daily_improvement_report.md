### [Daily Improvement Report - 2026-05-03]
#### 1. Identified Issues (발견된 문제)
- 여러 도구 페이지의 JSON-LD 스키마 데이터에 `@id` 속성이 누락되어 있어 AEO 최적화에 취약함.
- `curl-forge` 도구 페이지에서 홈으로 돌아가는 링크의 접근성(aria-label)이 명시적으로 제공되지 않음.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/tools/*/+page.svelte` - 60여 개의 도구 페이지의 JSON-LD `SoftwareApplication`/`WebApplication` 스키마에 정식 `@id` 속성 추가. 템플릿 리터럴(` ${lang} `)과 일반 JS 객체 텍스트(` + lang + `) 구문을 구분하여 구문 오류(Syntax Bug) 없이 올바른 스키마 삽입 완료.
- **Code**: `src/routes/[lang]/tools/curl-forge/+page.svelte` - 뒤로 가기 링크(Back to Home)에 `aria-label="Back to home"` 및 올바른 터치 타겟(최소 44px) 확인/개선.
- **SEO/AEO**: 모든 도구 페이지가 각자의 고유한 Canonical URL을 명시적으로 `@id`로 포함하도록 스키마 구조화 개선 완료.

#### 3. Performance Impact (기대 효과)
- 터치 타겟 크기(최소 44px)와 aria-label을 통해 모바일 사용자 경험과 접근성(A11y) 대폭 향상.
- 검색 엔진과 AI가 각 도구의 구조화된 데이터(Schema.org)를 명확히 식별할 수 있어, 리치 스니펫과 AI 검색 결과 노출 확률(AEO) 증대.
