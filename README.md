# 방구석월가의 똑똑한 금융생활 첫걸음!

**나에게 알맞는 재테크는?**
15가지 질문으로 알아보는 나의 금융생활 성향과 금융자산 탐색
방구석월가 | ROOMWALLST

청년 금융경제교육용 QR코드 기반 웹 프로그램입니다. 교육생이 강의 PPT의 QR코드로 접속해 15문항에 답하면 금융생활 성향과 7가지 금융자산(은행 예·적금, 부동산, 달러, 금, 가상자산, 주식, ETF)의 **교육용 탐색 점수**를 보여줍니다.

> 본 프로그램은 금융교육용으로 제작되었으며 투자상품 추천이나 수익을 보장하지 않습니다.
> 점수는 교육용 규칙 기반 모델로 계산되며, 실제 통계적 검증을 거치지 않았습니다.

---

## 주요 특징

| 항목 | 내용 |
|---|---|
| 기술 | React 18 + TypeScript + Vite 5 |
| 서버 | 필요 없음 (GitHub Pages 정적 호스팅) |
| 개인정보 | 로그인 없음 · 응답은 서버로 전송/저장하지 않음 · 새로고침 시 초기화 |
| 결과 이미지 | 브라우저 안에서 Canvas로 직접 생성(외부 전송 없음), 실명 등 개인정보 미포함 |
| 테스트 | Vitest 자동 테스트 23개 (사례 A~E, 0~100 범위, NaN/음수, 중복 응답, 무작위 5,000건) |

---

## 1. Windows에서 프로젝트 폴더 열기

1. **Node.js 설치**: https://nodejs.org 에서 **LTS** 버전을 받아 설치합니다(20 이상 권장).
   설치 후 `명령 프롬프트` 또는 `PowerShell`에서 확인합니다.
   ```bash
   node -v
   ```
2. 받은 `roomwallst-finance-test.zip`의 압축을 원하는 위치(예: `C:\Projects\roomwallst-finance-test`)에 풉니다.
3. 파일 탐색기에서 해당 폴더를 연 뒤, 주소창에 `cmd` 또는 `powershell`을 입력하고 Enter를 누르면 그 폴더에서 터미널이 열립니다.
   (VS Code를 쓰면 `파일 → 폴더 열기`로 열고, `터미널 → 새 터미널`을 사용하세요.)

## 2. Claude Code에서 작업하기

프로젝트 폴더에서 터미널을 연 뒤 실행합니다.

```bash
claude
```

예시 요청:
- "Q5 문항 문구를 '올해 가장 중요한 목표는?'으로 바꿔줘"
- "기업분석형 결과 설명을 더 쉽게 고쳐줘"
- "npm test 실행해서 결과 알려줘"

> 수정 후에는 항상 `npm test`와 `npm run build`가 성공하는지 확인하세요.

## 3. 패키지 설치

처음 한 번만 실행합니다.

```bash
npm install
```

## 4. 개발 서버 실행

```bash
npm run dev
```

## 5. 브라우저에서 테스트하기

- 터미널에 표시된 주소(보통 `http://localhost:5173/`)를 브라우저에서 엽니다.
- **스마트폰 화면 확인**: Chrome에서 `F12` → 왼쪽 위 휴대폰 모양 아이콘(기기 툴바)을 눌러 iPhone/Galaxy 크기로 확인합니다.
- **같은 Wi-Fi의 실제 휴대폰으로 확인**하려면:
  ```bash
  npm run dev -- --host
  ```
  `Network:` 에 표시된 주소(예: `http://192.168.0.10:5173/`)를 휴대폰에서 엽니다.
- 자동 테스트 실행:
  ```bash
  npm test
  ```

## 6. 빌드

```bash
npm run build
```

`dist` 폴더가 만들어지면 성공입니다. 빌드 결과를 미리 보려면:

```bash
npm run preview
```

## 7. GitHub 저장소 만들기

1. https://github.com 로그인 → 오른쪽 위 `+` → **New repository**
2. Repository name: 예) `roomwallst-finance-test` → **Public** 선택 → **Create repository**
   (무료 계정에서 GitHub Pages는 Public 저장소에서 사용할 수 있습니다.)
3. 프로젝트 폴더 터미널에서 아래를 순서대로 실행합니다. (`<아이디>`는 본인 GitHub 아이디)
   ```bash
   git init
   ```
   ```bash
   git add .
   ```
   ```bash
   git commit -m "첫 배포"
   ```
   ```bash
   git branch -M main
   ```
   ```bash
   git remote add origin https://github.com/<아이디>/roomwallst-finance-test.git
   ```
   ```bash
   git push -u origin main
   ```
   > Git이 없다면 https://git-scm.com 에서 설치하세요. GitHub Desktop 앱을 써도 됩니다.

## 8. GitHub Pages 배포

이 프로젝트에는 자동 배포 설정(`.github/workflows/deploy.yml`)이 포함되어 있습니다.

1. GitHub 저장소 → **Settings** → 왼쪽 **Pages**
2. **Build and deployment → Source** 를 **GitHub Actions** 로 선택
3. 저장소 **Actions** 탭에서 `Deploy to GitHub Pages` 가 초록색 체크로 끝나면 배포 완료 (1~3분)
4. 이후에는 `main` 브랜치에 push할 때마다 **테스트 → 빌드 → 배포**가 자동으로 진행됩니다.
   테스트가 실패하면 배포되지 않으므로, 잘못된 수정이 강의 현장에 나가는 것을 막아줍니다.

> Vite `base: './'`(상대 경로)로 설정되어 있어 저장소 이름을 바꿔도 별도 수정 없이 작동합니다.

## 9. 배포 URL 확인

- **Settings → Pages** 상단 또는 Actions 실행 결과의 `deploy` 단계에 주소가 표시됩니다.
- 형식: `https://<아이디>.github.io/roomwallst-finance-test/`
- 강의 전 반드시 **본인 휴대폰(데이터/와이파이 각각)** 으로 접속해 끝까지 진행해 보세요.

## 10. 배포 URL을 QR코드로 만들기

- **Chrome(가장 간단, 무료·광고 없음)**: 배포 주소를 연 상태에서 주소창 오른쪽의 공유 아이콘 → **QR 코드 만들기** → 다운로드
- 그 밖의 무료 생성기를 써도 되지만, **유효기간이 있거나 중간 리다이렉트 주소를 쓰는 "동적 QR"은 피하세요.** URL이 그대로 담긴 정적 QR이 가장 안전합니다.
- PPT 삽입 팁: QR은 슬라이드 높이의 1/3 이상 크기로, 흰 여백을 두고 넣으면 강의실 뒷자리에서도 잘 인식됩니다. QR 아래에 주소를 텍스트로도 적어두세요.

---

## 11. 강사가 15문항을 수정하는 방법

파일: `src/data/questions.ts`

```ts
{
  id: 'q1',              // ← 바꾸지 마세요 (점수 모델과 연결)
  category: '소득',       // 문항 위 작은 태그
  text: '현재 나의 주된 수입 형태는?',   // ← 문항 문구 수정
  options: {
    A: '일정한 정기 소득이 있다',        // ← 선택지 문구 수정
    B: '...',
    C: '...',
    D: '...',
  },
},
```

- 문구만 바꾸는 것은 자유롭게 해도 됩니다.
- 선택지의 **의미**를 바꾸면 `src/data/scoringModel.ts`의 해당 문항 배점도 점검하세요.

### 점수 모델 수정 (선택)

파일: `src/data/scoringModel.ts`

1. **`DIMENSION_RULES`** – 각 평가 차원이 어떤 문항·선택지로 몇 점이 되는지 정의
   예) 비상자금 확보 수준 = Q3 (A 0점, B 30점, C 70점, D 100점)
2. **`ASSET_WEIGHTS`** – 7개 자산 점수를 어떤 차원으로 얼마나 반영하는지
3. **`CAPS`** – 안전 제한 규칙(상한값)
4. **`SCORE_BANDS`** – 점수 구간 이름(우선 학습 / 비교 학습 / 기초 탐색 / 천천히 알아보기)

| 평가 차원 | 사용 문항 |
|---|---|
| 소득 안정성 | Q1 |
| 저축 여력 | Q2 |
| 비상자금 확보 수준 | Q3 |
| 자금 사용 시기 | Q4(60%), Q13(40%) |
| 유동성 필요도 | Q13(50%), Q4(30%), Q5(20%) |
| 손실 감내 능력 | Q6(50%), Q7(50%) |
| 금융위험 이해도 | Q14(35%), Q10(25%), Q11(25%), Q6(15%) |
| 직접 분석 관심도 | Q9(60%), Q8(40%) |
| 분산투자 관심도 | Q10(75%), Q15(25%) |
| 외화 및 실물자산 관심도 | 달러 관심(Q11·Q5), 금 관심(Q12·Q5), 부동산 관심(Q12)의 평균 |
| (보조) 가상자산 고유 위험 이해 | Q14 |

### 안전 제한 규칙 요약

| 규칙 | 조건 | 처리 |
|---|---|---|
| 생활자금 우선 | 비상자금 없음 / 소득·저축 여력 모두 부족 / 저축 여력 없음 + 비상금 1개월 미만 | '생활기반 준비형', 위험자산 점수 상한 |
| 단기 자금 | Q4 = 1년 이내 또는 Q13 = 언제든 인출 | 주식·가상자산·부동산·ETF 등 상한, '안정저축형' |
| 가상자산 | Q14 A·B → 최대 35점 / Q14 C → 최대 55점 / 항상 다른 자산 최고점보다 5점 이상 낮게, 최대 70점 | 단독 최상위 배치 방지 |
| 부동산 | 항상 최대 70점, 관심 낮으면 45점 | 자금·부채 정보가 없어 '매입 적합' 판단 안 함 |
| 손실 감내 매우 낮음 | Q6·Q7 모두 낮은 응답 | 주식·가상자산 상한 |

수정 후에는 반드시 실행하세요.

```bash
npm test
```

## 12. 결과 설명을 수정하는 방법

| 수정할 내용 | 파일 |
|---|---|
| 프로그램명·브랜드·부제 | `src/data/brand.ts` |
| 성향 7종 이름·설명·우선 과제·금융지식 | `src/data/profiles.ts` → `PROFILES` |
| 하단 안내문(면책 문구) | `src/data/profiles.ts` → `DISCLAIMERS` |
| 자산 7종의 살펴볼 이유·주의할 위험·유의사항 | `src/data/assets.ts` |
| 결과에 영향을 준 응답 문구 | `src/scoring/scoring.ts` → `buildKeyFactors` |

---

## 폴더 구조

```
roomwallst-finance-test/
├─ .github/workflows/deploy.yml   GitHub Pages 자동 배포
├─ public/favicon.svg
├─ src/
│  ├─ data/                       ★ 강사 수정용 데이터
│  │  ├─ brand.ts                 프로그램 명칭
│  │  ├─ questions.ts             15문항
│  │  ├─ scoringModel.ts          평가 차원·자산 가중치·제한 규칙
│  │  ├─ profiles.ts              성향 7종 결과 문구, 안내문
│  │  └─ assets.ts                자산 7종 설명
│  ├─ scoring/scoring.ts          점수 계산 순수 함수
│  ├─ components/                 화면 (시작/문항/결과/이미지 모달)
│  ├─ utils/resultImage.ts        결과 이미지(Canvas) 생성
│  ├─ App.tsx, main.tsx, styles.css
├─ tests/scoring.test.ts          자동 테스트
├─ index.html, vite.config.ts, tsconfig.json, package.json
```

## 폰트 라이선스

- **Pretendard** (Copyright © 2021 Kil Hyung-jin) — **SIL Open Font License 1.1**
  - 상업적 사용, 수정, 재배포가 가능한 무료 폰트입니다. 단, 폰트 파일 자체를 단독으로 판매할 수는 없습니다.
  - npm 패키지 `pretendard`로 프로젝트에 포함(self-hosting)되어 외부 CDN 없이 동작합니다.
  - 출처: https://github.com/orioncactus/pretendard
  - 라이선스 전문: https://github.com/orioncactus/pretendard/blob/main/LICENSE (요약은 CSS 파일 상단 주석에도 포함)

## 사용 라이브러리 라이선스

React, React DOM, Vite, @vitejs/plugin-react, TypeScript(Apache-2.0), Vitest — 모두 MIT 등 무료 오픈소스 라이선스입니다. 유료 API·외부 AI API는 사용하지 않습니다.

## 간편 배포 보조 스크립트 (추가)

`배포하기.ps1`은 Windows PowerShell에서 **새 전용 저장소**를 생성하여 파일을 업로드하도록 돕습니다. Git, GitHub CLI(`gh`), Node.js 설치가 필요하고, 사용자의 GitHub 로그인이 필요합니다. 기존 저장소나 이미 있는 동일 이름의 저장소는 수정하지 않습니다.

PowerShell에서 프로젝트 폴더로 이동한 후 다음을 실행하세요.

```powershell
powershell -ExecutionPolicy Bypass -File .\배포하기.ps1
```

스크립트가 `npm ci` → `npm test` → `npm run build`를 실행하고 성공한 경우에만 새 공개 저장소 `roomwallst-finance-test`에 업로드합니다. GitHub의 **Settings → Pages**에서 **GitHub Actions**를 선택하면 포함된 배포 워크플로로 사이트를 게시할 수 있습니다. 업로드 이후 Actions의 빌드/배포 성공을 확인하기 전에는 사이트가 열리지 않을 수 있습니다.
