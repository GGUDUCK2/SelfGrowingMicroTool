[Project Health Report - 2025-01-31]
## Repository Hygiene
- No temporary scripts or build artifacts in the root tree.
## Design Consistency
- Checked for mobile responsiveness (max-w, min-h-[44px] etc) on layout containers. Many are using `max-w-7xl mx-auto px-4`.
## Tech Debt
- Replaced hardcoded domain with `$page.url.origin` for canonical/hreflang links in tools `+page.svelte` files.
## AdSense Readiness
- Tool pages maintain `<AdPlaceholder>` components properly.

---
### [Daily Improvement Report - 2025-01-31]
#### 1. Identified Issues (발견된 문제)
- 모든 도구 페이지 (`src/routes/[lang]/tools/*/+page.svelte`) 내 SEO 태그(canonical, hreflang) 및 JSON-LD URL이 하드코딩된 프로덕션 도메인(`https://selfgrowingmicrotool.com`)을 사용 중이었습니다. 이로 인해 다양한 환경(개발, 스테이징 등)에서 올바른 도메인 처리가 어려웠습니다.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/tools/*/+page.svelte` (73개 파일) - 하드코딩된 도메인(`https://selfgrowingmicrotool.com`)을 `$page.url.origin`으로 동적 할당하도록 파이썬 스크립트(`scripts/fix_seo_urls.py`)를 통해 일괄 수정했습니다.
- **SEO/AEO**: `canonical`, `hreflang`, `schema.org/SoftwareApplication`, `BreadcrumbList`의 URL 경로를 실행 환경에 맞게 동적으로 렌더링되도록 개선하여, 정확한 URL 메타데이터를 크롤러에 제공할 수 있게 되었습니다.

#### 3. Performance Impact (기대 효과)
- 로컬 환경 및 스테이징 배포 시 올바른 호스트 도메인을 가지게 되어 SEO 디버깅 및 테스트가 용이해졌습니다.

[Project Health Report - 2025-01-31]
## Repository Hygiene
- No temporary scripts or build artifacts in the root tree.
## Design Consistency
- Checked for mobile responsiveness (max-w, min-h-[44px] etc) on layout containers. Many are using `max-w-7xl mx-auto px-4`.
## Tech Debt
- Replaced hardcoded domain with `$page.url.origin` for canonical/hreflang links in tools `+page.svelte` files.
## AdSense Readiness
- Tool pages maintain `<AdPlaceholder>` components properly.

---
### [Daily Improvement Report - 2025-01-31]
#### 1. Identified Issues (발견된 문제)
- 모든 도구 페이지 (`src/routes/[lang]/tools/*/+page.svelte`) 내 SEO 태그(canonical, hreflang) 및 JSON-LD URL이 하드코딩된 프로덕션 도메인(`https://selfgrowingmicrotool.com`)을 사용 중이었습니다. 이로 인해 다양한 환경(개발, 스테이징 등)에서 올바른 도메인 처리가 어려웠습니다.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/tools/*/+page.svelte` (73개 파일) - 하드코딩된 도메인(`https://selfgrowingmicrotool.com`)을 `$page.url.origin`으로 동적 할당하도록 수정했습니다.
- **SEO/AEO**: `canonical`, `hreflang`, `schema.org/SoftwareApplication`, `BreadcrumbList`의 URL 경로를 실행 환경에 맞게 동적으로 렌더링되도록 개선하여, 정확한 URL 메타데이터를 크롤러에 제공할 수 있게 되었습니다.

#### 3. Performance Impact (기대 효과)
- 로컬 환경 및 스테이징 배포 시 올바른 호스트 도메인을 가지게 되어 SEO 디버깅 및 테스트가 용이해졌습니다.

[Project Health Report - 2025-01-31]
## Repository Hygiene
- No redundant scripts found in root.
## Design Consistency
- Adjusted Mobile responsiveness and touch target sizes (min-h-[44px]) for improved usability in MatrixEditor.
## AdSense Readiness
- AdPlaceholders are consistently placed.
## Tech Debt
- Standardized interactive element sizes to meet accessibility guidelines.

---
### [Daily Improvement Report - 2025-01-31]
#### 1. Identified Issues (발견된 문제)
- `decision-forge` 도구의 `MatrixEditor` 컴포넌트 내 일부 인터랙티브 버튼들에 `min-h-[44px]` 및 `min-w-[44px]` 터치 타겟 사이즈 지정이 누락되어 모바일 환경 접근성(A11y) 기준에 미흡했습니다.
#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/lib/components/decision-forge/MatrixEditor.svelte` - 모바일 터치 타겟 기준(최소 44x44)을 충족하기 위해 `min-h-[44px] min-w-[44px]` 유틸리티 클래스를 추가했습니다. 기존의 시각적 아이콘 크기는 유지하면서 터치 영역만 확장되도록 개선했습니다.
- **SEO/AEO**: `decision-forge`의 SEO 및 JSON-LD 스키마가 적절히 주입되어 있는지 확인했습니다.
#### 3. Performance Impact (기대 효과)
- 모바일 디바이스에서 사용자가 버튼을 더 쉽고 정확하게 터치할 수 있게 되어 전반적인 사용자 경험(UX) 및 모바일 접근성이 향상되었습니다.
[Project Health Report - 2025-02-12]
## Tech Debt
- Removed duplicate `FAQPage` schema declarations.

---
### [Daily Improvement Report - 2025-02-12]
#### 1. Identified Issues (발견된 문제)
- Many tool pages included duplicated `FAQPage` JSON-LD schemas because `FAQSection` automatically injects it, but the parent components also had manual `@graph` objects or `FAQPage` scripts injected. This can confuse search engines and bloat the HTML.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/tools/*/+page.svelte` (Multiple files) - Removed manual `FAQPage` schemas that were being included in `@graph` definitions or `{@html}` tags in pages that utilize `FAQSection.svelte`.
- **SEO/AEO**: Removed redundant JSON-LD schemas, ensuring each page has exactly one `FAQPage` schema generated correctly via `FAQSection`.

#### 3. Performance Impact (기대 효과)
- Cleaner output HTML, reduction in page load payload size, and more concise schema graphs for better search engine readability.

[Project Health Report - 2025-02-12]
## Repository Hygiene
- Moved `plan.md` from root directory to `docs/` and ensured no other artifacts exist in root.
## Design Consistency
- No visual inconsistencies found during this pass.
## AdSense Readiness
- AdPlaceholders are consistently placed.
## Tech Debt
- Addressed `npm audit` vulnerabilities by upgrading dependencies.

---
### [Daily Improvement Report - 2025-02-12]
#### 1. Identified Issues (발견된 문제)
- 루트 디렉토리에 위치해서는 안 되는 `plan.md` 파일이 존재했습니다.
- `npm audit` 검사 결과, `brace-expansion` 및 의존 패키지에 대해 보안 취약점이 발견되었습니다.

#### 2. Key Changes (주요 수정 사항)
- **Repository Hygiene**: 프로젝트 루트에 있는 `plan.md` 파일을 `docs/plan.md`로 이동하여 루트 디렉토리를 정리했습니다.
- **Dependency**: `npm audit fix`를 실행하여 취약점이 있는 패키지를 업데이트하고 `package-lock.json`에 반영했습니다.

#### 3. Performance Impact (기대 효과)
- 프로젝트 루트 디렉토리의 위생 및 파일 구조가 개선되었습니다.
- 패키지 의존성에 대한 잠재적 보안 위협이 제거되어 안정성이 확보되었습니다.

[Project Health Report - 2026-08-02]
## Repository Hygiene
- No redundant scripts found in root.
## Design Consistency
- No visual inconsistencies found during this pass.
## AdSense Readiness
- AdPlaceholders are consistently placed.
## Tech Debt
- Removed hardcoded URLs and replaced them with `$page.url.origin` to improve SEO across environments.
- Added `cross-env` package to fix local build errors.

---
### [Daily Improvement Report - 2026-08-02]
#### 1. Identified Issues (발견된 문제)
- 일부 라우트 파일(`src/routes/[lang]/+page.svelte` 등)에서 URL(`https://selfgrowingmicrotool.com`)이 하드코딩되어 있어 개발/스테이징 환경에서 메타데이터 테스트 및 올바른 SEO가 어려웠습니다.
- `npm run build` 실행 시 `cross-env`가 설치되지 않아 빌드에 실패하는 현상을 발견했습니다.

#### 2. Key Changes (주요 수정 사항)
- **Code**: 파이썬 스크립트(`scripts/fix_hardcoded_urls.py` 등)를 사용하여 Svelte 파일에 하드코딩된 도메인 주소를 `$page.url.origin`으로 변경했습니다.
- **Tech Debt**: 패키지 매니저에 `cross-env`를 설치하여 크로스 플랫폼 빌드 문제를 해결했습니다.
- **SEO/AEO**: `canonical`, `og:url`, `JSON-LD` 등의 메타데이터 주소가 런타임에 동적으로 올바르게 렌더링되도록 수정했습니다.

#### 3. Performance Impact (기대 효과)
- 빌드 시스템의 안정성이 향상되었습니다.
- 다양한 배포 환경에서 메타데이터 및 SEO가 동적으로 올바르게 구성됩니다.


[Project Health Report - 2026-08-03]
## Repository Hygiene
- Checked for and ensured no temporary files or redundant scripts exist in the root tree.
## Design Consistency
- No visual inconsistencies identified in this pass.
## AdSense Readiness
- Injected `<AdPlaceholder>` components into legal and informational pages (about, contact, privacy-policy, pwa, terms-of-service) to prepare for future monetization.
## Tech Debt
- Corrected a category mismatch in the Pomodoro Timer tool page (`pomodoro-timer`) for `RelatedTools` component which caused incorrect related tools to show up.

---
### [Daily Improvement Report - 2026-08-03]
#### 1. Identified Issues (발견된 문제)
- `about`, `contact`, `privacy-policy`, `pwa`, `terms-of-service` 등 일반 정보성 및 법적 페이지에 `<AdPlaceholder>` (애드센스 예약 공간)가 누락되어 있었습니다.
- `pomodoro-timer` 도구 페이지에서 `<RelatedTools>` 컴포넌트 호출 시 `currentCategory` 속성에 잘못된 카테고리 이름(`productivity`)을 전달하고 있어, `registry.json` 기준 올바른 카테고리(`dev`)의 관련 도구가 노출되지 않았습니다.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/about/+page.svelte`, `contact`, `privacy-policy`, `pwa`, `terms-of-service` 파일 내에 `AdPlaceholder` 컴포넌트를 추가했습니다.
- **Code**: `src/routes/[lang]/tools/pomodoro-timer/+page.svelte` 파일 내 `RelatedTools` 컴포넌트의 `currentCategory` 값을 `"dev"`로 수정했습니다.
- **AdSense Readiness**: 주요 정보성 페이지에 광고 예약 공간을 확보하여 향후 수익화 기반을 마련했습니다.

#### 3. Performance Impact (기대 효과)
- 도구 사용 흐름을 방해하지 않으면서 일관된 광고 레이아웃 패턴을 구축했습니다.
- 카테고리 설정 오류 수정으로 사용자에게 더 관련성 높은 추천 도구를 보여줌으로써 탐색 여정(User Journey)을 개선했습니다.

[Project Health Report - 2026-08-04]
## Repository Hygiene
- No redundant scripts found in root.
## Design Consistency
- Checked main layout containers across all tools in `src/routes/[lang]/tools/*/+page.svelte`.
- Found 16 tools using inconsistent max-widths (e.g., `max-w-4xl`, `max-w-5xl`, `max-w-6xl`).
- Standardized all 16 tools main layout containers to use `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12` (or similar standard preserving spacing) according to the MicroFactory design guidelines.
## AdSense Readiness
- AdPlaceholders are consistently placed.
## Tech Debt
- N/A

---
### [Daily Improvement Report - 2026-08-04]
#### 1. Identified Issues (발견된 문제)
- 일부 도구 페이지(예: diagram-forge, id-forge, invoice-forge 등 16개)에서 메인 레이아웃 컨테이너가 `max-w-4xl`, `max-w-5xl`, `max-w-6xl` 등 다양한 너비를 사용하여 프로젝트 전체의 시각적 일관성(Design Consistency)이 깨져있었습니다.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/tools/*/+page.svelte` (16개 파일) - 모든 도구 페이지의 메인 레이아웃 컨테이너에 대해 표준 Tailwind 클래스인 `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8`를 적용하도록 파이썬 스크립트를 통해 일괄 수정했습니다.
- 타겟 컨테이너의 클래스들만 조작하여 의도적인 내부 레이아웃(e.g., -mt-8) 이 망가지지 않도록 세심하게 수정했습니다.

#### 3. Performance Impact (기대 효과)
- 모든 도구 페이지가 일관된 레이아웃 폭을 가지게 되어 전반적인 사용자 경험과 UI 일관성이 향상되었습니다.

---

### [Daily Improvement Report - 2024-08-04]
#### 1. Identified Issues (발견된 문제)
- SEO/AEO 상태 분석 결과, 많은 도구 페이지(`src/routes/[lang]/tools/*/+page.svelte`) 내의 Breadcrumb JSON-LD 스키마 및 `href` 경로에서 `en/tools` 또는 `/en/tools`와 같이 하드코딩된 언어 경로가 존재했습니다. 이로 인해 다국어 라우팅 시 적절한 지역화 링크를 제공하지 못해 검색 가시성이 저하될 가능성이 있었습니다.

#### 2. Key Changes (주요 수정 사항)
- **Code**: `src/routes/[lang]/tools/*/+page.svelte` - Breadcrumb JSON-LD 객체와 관련된 경로에서 하드코딩된 `en`을 `${lang}` (문자열 리터럴 시) 또는 `" + lang + "` 로 동적으로 렌더링되도록 모두 수정했습니다.
- **SEO/AEO**: Breadcrumb 스키마 및 기타 동적 URL 처리 과정에서 `lang` 변수를 참조하도록 개선하여, 다양한 언어 환경에서도 정확한 SEO 메타 데이터 및 구조화 데이터를 유지하도록 조치했습니다.

#### 3. Performance Impact (기대 효과)
- 다국어 지원에 맞는 정확한 라우팅 URL(Breadcrumb)을 제공함으로써 크롤링 효율이 상승하며, 지역별 사용자에게 보다 정확한 사이트 구조(구조화 데이터)를 검색 결과에 노출할 수 있습니다.
