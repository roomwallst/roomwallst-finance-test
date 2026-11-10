/**
 * ─────────────────────────────────────────────
 *  점수 모델 설정 (강사 수정용)
 * ─────────────────────────────────────────────
 *  ※ 이 모델은 "교육용 규칙 기반 모델"입니다.
 *    실제 통계적 검증을 거치지 않았으며, 금융기관의 공식 투자자 적합성 평가나
 *    예상 수익률과 무관합니다.
 *
 *  계산 흐름
 *   1) 응답 → 평가 차원(0~100) : DIMENSION_RULES
 *   2) 평가 차원 → 자산별 기본 탐색 점수(0~100) : ASSET_WEIGHTS
 *   3) 안전 제한 규칙(상한) 적용 : CAPS
 *   4) 자산별 독립 점수(합계를 100으로 맞추지 않음)
 */
import type { OptionKey, QuestionId } from './questions';

/* ───────── 1. 평가 차원 ───────── */

export type DimensionKey =
  | 'incomeStability'   // 소득 안정성
  | 'savingCapacity'    // 저축 여력
  | 'emergencyFund'     // 비상자금 확보 수준
  | 'timeHorizon'       // 자금 사용 시기(길수록 높음)
  | 'liquidityNeed'     // 유동성 필요도(높을수록 언제든 꺼내 써야 함)
  | 'lossTolerance'     // 손실 감내 능력
  | 'riskLiteracy'      // 금융위험 이해도
  | 'directAnalysis'    // 직접 분석 관심도
  | 'diversification'   // 분산투자 관심도
  | 'foreignRealInterest' // 외화 및 실물자산 관심도
  // ── 아래는 자산별 계산에 쓰는 보조 차원 ──
  | 'fxInterest'        // (보조) 달러·환율 관심/이해
  | 'goldInterest'      // (보조) 금 관심
  | 'realEstateInterest'// (보조) 부동산 관심
  | 'cryptoRiskUnderstanding'; // (보조) 가상자산 고유 위험 이해

/** 한 질문이 한 차원에 기여하는 방식: 선택지별 점수(0~100) × 가중치 */
export interface DimensionSource {
  questionId: QuestionId;
  weight: number;
  points: Record<OptionKey, number>;
}

export interface DimensionRule {
  key: DimensionKey;
  label: string;
  /** 보조 차원이면 true (결과 화면의 10개 차원 표에는 표시하지 않음) */
  auxiliary?: boolean;
  sources: DimensionSource[];
}

/**
 * 차원 점수 = Σ(선택지 점수 × 가중치) ÷ Σ(가중치)   → 0~100
 * (foreignRealInterest는 보조 차원 3개의 평균으로 계산 — scoring.ts 참고)
 */
export const DIMENSION_RULES: DimensionRule[] = [
  {
    key: 'incomeStability',
    label: '소득 안정성',
    sources: [{ questionId: 'q1', weight: 1, points: { A: 100, B: 65, C: 30, D: 0 } }],
  },
  {
    key: 'savingCapacity',
    label: '저축 여력',
    sources: [{ questionId: 'q2', weight: 1, points: { A: 0, B: 35, C: 70, D: 100 } }],
  },
  {
    key: 'emergencyFund',
    label: '비상자금 확보 수준',
    sources: [{ questionId: 'q3', weight: 1, points: { A: 0, B: 30, C: 70, D: 100 } }],
  },
  {
    key: 'timeHorizon',
    label: '자금 사용 시기',
    sources: [
      { questionId: 'q4', weight: 0.6, points: { A: 0, B: 35, C: 70, D: 100 } },
      { questionId: 'q13', weight: 0.4, points: { A: 0, B: 30, C: 65, D: 100 } },
    ],
  },
  {
    key: 'liquidityNeed',
    label: '유동성 필요도',
    sources: [
      { questionId: 'q13', weight: 0.5, points: { A: 100, B: 65, C: 35, D: 0 } },
      { questionId: 'q4', weight: 0.3, points: { A: 100, B: 60, C: 30, D: 0 } },
      { questionId: 'q5', weight: 0.2, points: { A: 100, B: 50, C: 30, D: 20 } },
    ],
  },
  {
    key: 'lossTolerance',
    label: '손실 감내 능력',
    sources: [
      { questionId: 'q6', weight: 0.5, points: { A: 0, B: 35, C: 70, D: 100 } },
      { questionId: 'q7', weight: 0.5, points: { A: 0, B: 30, C: 65, D: 100 } },
    ],
  },
  {
    key: 'riskLiteracy',
    label: '금융위험 이해도',
    sources: [
      { questionId: 'q14', weight: 0.35, points: { A: 0, B: 25, C: 65, D: 100 } },
      { questionId: 'q10', weight: 0.25, points: { A: 0, B: 30, C: 60, D: 100 } },
      { questionId: 'q11', weight: 0.25, points: { A: 0, B: 30, C: 70, D: 100 } },
      // 10% 하락 시 '계획과 위험을 다시 점검'하는 태도 = 위험관리 이해
      { questionId: 'q6', weight: 0.15, points: { A: 20, B: 50, C: 60, D: 100 } },
    ],
  },
  {
    key: 'directAnalysis',
    label: '직접 분석 관심도',
    sources: [
      { questionId: 'q9', weight: 0.6, points: { A: 0, B: 35, C: 65, D: 100 } },
      { questionId: 'q8', weight: 0.4, points: { A: 0, B: 25, C: 65, D: 100 } },
    ],
  },
  {
    key: 'diversification',
    label: '분산투자 관심도',
    sources: [
      { questionId: 'q10', weight: 0.75, points: { A: 0, B: 45, C: 75, D: 100 } },
      { questionId: 'q15', weight: 0.25, points: { A: 20, B: 30, C: 100, D: 70 } },
    ],
  },
  {
    key: 'foreignRealInterest',
    label: '외화 및 실물자산 관심도',
    // 아래 보조 차원(fxInterest, goldInterest, realEstateInterest)의 평균으로 계산
    sources: [],
  },
  // ── 보조 차원 ──
  {
    key: 'fxInterest',
    label: '달러·환율 관심',
    auxiliary: true,
    sources: [
      { questionId: 'q11', weight: 0.7, points: { A: 0, B: 35, C: 70, D: 100 } },
      { questionId: 'q5', weight: 0.3, points: { A: 0, B: 10, C: 100, D: 40 } },
    ],
  },
  {
    key: 'goldInterest',
    label: '금 관심',
    auxiliary: true,
    sources: [
      { questionId: 'q12', weight: 0.7, points: { A: 10, B: 100, C: 20, D: 80 } },
      { questionId: 'q5', weight: 0.3, points: { A: 0, B: 20, C: 100, D: 30 } },
    ],
  },
  {
    key: 'realEstateInterest',
    label: '부동산 관심',
    auxiliary: true,
    sources: [{ questionId: 'q12', weight: 1, points: { A: 10, B: 20, C: 100, D: 80 } }],
  },
  {
    key: 'cryptoRiskUnderstanding',
    label: '가상자산 고유 위험 이해',
    auxiliary: true,
    sources: [{ questionId: 'q14', weight: 1, points: { A: 0, B: 25, C: 65, D: 100 } }],
  },
];

/* ───────── 2. 자산별 가중치 ───────── */

export type AssetKey = 'deposit' | 'etf' | 'stock' | 'gold' | 'dollar' | 'realEstate' | 'crypto';

/** 결과 막대그래프 동점 시 표시 순서(위험이 낮은 자산 우선) */
export const ASSET_ORDER: AssetKey[] = ['deposit', 'etf', 'stock', 'gold', 'dollar', 'realEstate', 'crypto'];

/**
 * 파생 지표 (scoring.ts에서 계산)
 *  - foundation      : 생활기반 = 소득안정성 30% + 저축여력 30% + 비상자금 40%
 *  - safetyGoal      : Q5가 '생활비·비상금' 또는 '안정적 목돈'이면 100
 *  - riskAversion    : 100 - 손실감내
 *  - passivePreference: 100 - 직접분석×0.5 (직접 분석보다 묶음 투자 선호)
 */
export type FactorKey = DimensionKey | 'foundation' | 'safetyGoal' | 'riskAversion' | 'passivePreference';

/** 자산 기본 점수 = base + Σ(지표 × 가중치)  (가중치 합 + base/100 ≤ 1 이 되도록 설계) */
export interface AssetWeight {
  base: number;
  weights: Partial<Record<FactorKey, number>>;
}

export const ASSET_WEIGHTS: Record<AssetKey, AssetWeight> = {
  // 예·적금: 모든 사람에게 기본 학습 대상이므로 기본 35점에서 출발
  deposit: {
    base: 35,
    weights: { liquidityNeed: 0.25, riskAversion: 0.2, safetyGoal: 0.2 },
  },
  etf: {
    base: 0,
    weights: {
      timeHorizon: 0.25, diversification: 0.25, lossTolerance: 0.15,
      riskLiteracy: 0.15, foundation: 0.1, passivePreference: 0.1,
    },
  },
  stock: {
    base: 0,
    weights: {
      directAnalysis: 0.3, timeHorizon: 0.2, lossTolerance: 0.2,
      riskLiteracy: 0.15, foundation: 0.15,
    },
  },
  gold: {
    base: 0,
    weights: {
      goldInterest: 0.4, timeHorizon: 0.15, lossTolerance: 0.15,
      riskLiteracy: 0.15, foundation: 0.15,
    },
  },
  dollar: {
    base: 0,
    weights: {
      fxInterest: 0.4, riskLiteracy: 0.15, lossTolerance: 0.15,
      foundation: 0.15, diversification: 0.15,
    },
  },
  realEstate: {
    base: 0,
    weights: {
      realEstateInterest: 0.5, timeHorizon: 0.2, incomeStability: 0.1,
      savingCapacity: 0.1, lossTolerance: 0.1,
    },
  },
  crypto: {
    base: 0,
    weights: {
      cryptoRiskUnderstanding: 0.35, lossTolerance: 0.25, riskLiteracy: 0.15,
      timeHorizon: 0.15, foundation: 0.1,
    },
  },
};

/* ───────── 3. 안전 제한 규칙(상한값) ───────── */

export const CAPS = {
  /** [규칙1] 생활기반 우선(비상자금 없음 등)일 때 자산별 최대 점수 */
  foundationFirst: { etf: 45, stock: 35, gold: 45, dollar: 45, realEstate: 25, crypto: 15 } as Partial<Record<AssetKey, number>>,
  /** [규칙2] 1년 이내 사용 / 언제든 꺼내야 하는 돈일 때 */
  shortTerm: { etf: 40, stock: 30, gold: 45, dollar: 50, realEstate: 20, crypto: 15 } as Partial<Record<AssetKey, number>>,
  /** [규칙3] 가상자산 고유 위험 이해가 이 값 미만이면 */
  cryptoUnderstandingMin: 65,
  cryptoLowUnderstandingCap: 35,
  /** [규칙3] 손실 가능성은 알지만 거래소·보관·기술 위험까지는 모르면(Q14=C) */
  cryptoPartialUnderstandingCap: 55,
  /** [규칙3] 가상자산은 다른 자산 최고점보다 최소 이만큼 낮게 (단독 최상위 방지) */
  cryptoBelowTopMargin: 5,
  cryptoAbsoluteMax: 70,
  /** [규칙4] 부동산은 초기자금·부채 정보가 없어 '매입 적합' 수준으로 올리지 않음 */
  realEstateMax: 70,
  /** 부동산 관심이 낮다고 응답(Q12=A·B)하면 */
  realEstateLowInterestCap: 45,
  /** 주식·ETF 등 위험자산을 손실을 거의 감내하지 못하는 경우 */
  lowLossTolerance: 25,
  lowLossToleranceCap: { stock: 40, crypto: 15 } as Partial<Record<AssetKey, number>>,
};

/* ───────── 4. 점수 구간 표현 (추천 표현 금지) ───────── */

export const SCORE_BANDS = [
  { min: 75, label: '우선 학습' },
  { min: 55, label: '비교 학습' },
  { min: 35, label: '기초 탐색' },
  { min: 0, label: '천천히 알아보기' },
] as const;
