/**
 * 점수 계산 엔진 (순수 함수 — React/브라우저에 의존하지 않음)
 *
 * ※ 교육용 규칙 기반 모델입니다. 실제 통계적 검증을 거치지 않았으며
 *   투자 권유·투자자문·공식 적합성 평가가 아닙니다.
 */
import { OPTION_KEYS, QUESTIONS, type OptionKey, type QuestionId } from '../data/questions';
import {
  ASSET_ORDER, ASSET_WEIGHTS, CAPS, DIMENSION_RULES, SCORE_BANDS,
  type AssetKey, type DimensionKey, type FactorKey,
} from '../data/scoringModel';
import type { ProfileKey } from '../data/profiles';

/* ───────────────── 타입 ───────────────── */

/** 문항 id → 선택지. 객체이므로 같은 문항에 중복 응답이 쌓일 수 없음 */
export type Answers = Partial<Record<QuestionId, OptionKey>>;
export type CompleteAnswers = Record<QuestionId, OptionKey>;
export type Dimensions = Record<DimensionKey, number>;

export interface Flags {
  /** [규칙1] 생활자금 확보 최우선 */
  foundationFirst: boolean;
  /** [규칙2] 1년 이내 사용 또는 언제든 인출 필요 */
  shortTerm: boolean;
  /** [규칙3] 가상자산 고유 위험 이해 부족 */
  lowCryptoUnderstanding: boolean;
  /** 손실을 거의 감내하기 어려움 */
  lowLossTolerance: boolean;
}

export interface AssetScore {
  key: AssetKey;
  /** 최종 점수 0~100 (정수) */
  score: number;
  /** 제한 규칙 적용 전 기본 점수 */
  baseScore: number;
  band: string;
  /** 적용된 제한 규칙 설명 */
  limits: string[];
}

export interface KeyFactor {
  questionIds: QuestionId[];
  answers: string[];
  message: string;
}

export interface FinanceResult {
  dimensions: Dimensions;
  flags: Flags;
  /** 점수 높은 순 정렬 (동점 시 ASSET_ORDER 순) */
  scores: AssetScore[];
  profile: ProfileKey;
  /** 관심을 갖고 공부해볼 자산 2~3개 */
  exploreAssets: AssetKey[];
  keyFactors: KeyFactor[];
}

export class AnswerValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AnswerValidationError';
  }
}

/* ───────────────── 유틸 ───────────────── */

/** 0~100으로 제한. NaN·Infinity 등 비정상 값은 0으로 처리 */
export function clamp(value: number, min = 0, max = 100): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, value));
}

const QUESTION_IDS = QUESTIONS.map((q) => q.id);

/** 응답을 저장할 때 사용하는 순수 함수: 같은 문항은 항상 '교체'됨 (중복 누적 방지) */
export function setAnswer(answers: Answers, questionId: QuestionId, option: OptionKey): Answers {
  if (!QUESTION_IDS.includes(questionId)) throw new AnswerValidationError(`알 수 없는 문항: ${questionId}`);
  if (!OPTION_KEYS.includes(option)) throw new AnswerValidationError(`잘못된 선택지: ${option}`);
  return { ...answers, [questionId]: option };
}

/** ['A','B',...] 15개 배열 → Answers 객체 (테스트·디버깅용) */
export function answersFromArray(list: OptionKey[]): Answers {
  return list.reduce<Answers>((acc, opt, i) => {
    const q = QUESTIONS[i];
    if (q) acc[q.id] = opt;
    return acc;
  }, {});
}

/** 15문항이 모두 A~D 중 하나로 응답되었는지 검증 */
export function validateAnswers(answers: unknown): CompleteAnswers {
  if (answers === null || typeof answers !== 'object' || Array.isArray(answers)) {
    throw new AnswerValidationError('응답 형식이 올바르지 않습니다.');
  }
  const record = answers as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    if (!QUESTION_IDS.includes(key as QuestionId)) {
      throw new AnswerValidationError(`알 수 없는 문항: ${key}`);
    }
  }
  for (const id of QUESTION_IDS) {
    const v = record[id];
    if (v === undefined) throw new AnswerValidationError(`${id} 문항에 응답하지 않았습니다.`);
    if (typeof v !== 'string' || !OPTION_KEYS.includes(v as OptionKey)) {
      throw new AnswerValidationError(`${id} 문항의 응답 값이 올바르지 않습니다: ${String(v)}`);
    }
  }
  return record as CompleteAnswers;
}

export function scoreBand(score: number): string {
  return (SCORE_BANDS.find((b) => score >= b.min) ?? SCORE_BANDS[SCORE_BANDS.length - 1]).label;
}

/* ───────────────── 1단계: 평가 차원 ───────────────── */

export function computeDimensions(input: Answers): Dimensions {
  const answers = validateAnswers(input);
  const dims = {} as Dimensions;

  for (const rule of DIMENSION_RULES) {
    if (rule.sources.length === 0) continue;
    let sum = 0;
    let weightSum = 0;
    for (const src of rule.sources) {
      sum += src.points[answers[src.questionId]] * src.weight;
      weightSum += src.weight;
    }
    dims[rule.key] = clamp(weightSum > 0 ? sum / weightSum : 0);
  }
  // 외화 및 실물자산 관심도 = 달러·금·부동산 관심의 평균
  dims.foreignRealInterest = clamp((dims.fxInterest + dims.goldInterest + dims.realEstateInterest) / 3);
  return dims;
}

/* ───────────────── 2단계: 판정 플래그 ───────────────── */

export function computeFlags(input: Answers, dims: Dimensions): Flags {
  const a = validateAnswers(input);
  const lowIncome = a.q1 === 'C' || a.q1 === 'D';
  const lowSaving = a.q2 === 'A' || a.q2 === 'B';
  return {
    foundationFirst:
      a.q3 === 'A' ||                                   // 비상자금 없음
      (lowIncome && lowSaving) ||                       // 소득과 저축 여력이 모두 부족
      (a.q2 === 'A' && a.q3 === 'B'),                   // 저축 여력 거의 없음 + 비상금 1개월 미만
    shortTerm: a.q4 === 'A' || a.q13 === 'A',
    lowCryptoUnderstanding: dims.cryptoRiskUnderstanding < CAPS.cryptoUnderstandingMin,
    lowLossTolerance: dims.lossTolerance <= CAPS.lowLossTolerance,
  };
}

/* ───────────────── 3단계: 자산별 점수 ───────────────── */

function factorValue(key: FactorKey, dims: Dimensions, answers: CompleteAnswers): number {
  switch (key) {
    case 'foundation':
      return dims.incomeStability * 0.3 + dims.savingCapacity * 0.3 + dims.emergencyFund * 0.4;
    case 'safetyGoal':
      return answers.q5 === 'A' || answers.q5 === 'B' ? 100 : 0;
    case 'riskAversion':
      return 100 - dims.lossTolerance;
    case 'passivePreference':
      return 100 - dims.directAnalysis * 0.5;
    default:
      return dims[key];
  }
}

export function computeAssetScores(input: Answers, dims: Dimensions, flags: Flags): AssetScore[] {
  const answers = validateAnswers(input);
  const map = {} as Record<AssetKey, AssetScore>;

  // 기본 점수
  for (const key of ASSET_ORDER) {
    const { base, weights } = ASSET_WEIGHTS[key];
    let s = base;
    for (const [factor, w] of Object.entries(weights) as [FactorKey, number][]) {
      s += factorValue(factor, dims, answers) * w;
    }
    const baseScore = clamp(s);
    map[key] = { key, score: baseScore, baseScore, band: '', limits: [] };
  }

  const cap = (key: AssetKey, max: number | undefined, reason: string) => {
    if (max === undefined) return;
    if (map[key].score > max) {
      map[key].score = max;
      if (!map[key].limits.includes(reason)) map[key].limits.push(reason);
    }
  };

  // [규칙1] 생활기반 우선
  if (flags.foundationFirst) {
    for (const key of ASSET_ORDER) cap(key, CAPS.foundationFirst[key], '생활자금 확보가 우선이라 점수를 제한했어요.');
  }
  // [규칙2] 1년 이내 사용 자금
  if (flags.shortTerm) {
    for (const key of ASSET_ORDER) cap(key, CAPS.shortTerm[key], '1년 이내 사용할 돈에는 적합하지 않은 특성이 있어 점수를 제한했어요.');
  }
  // 손실 감내가 매우 낮음
  if (flags.lowLossTolerance) {
    for (const key of ASSET_ORDER) cap(key, CAPS.lowLossToleranceCap[key], '가격 하락을 감내하기 어려운 응답을 반영해 점수를 제한했어요.');
  }
  // [규칙4] 부동산: 자금·부채 정보 없음
  if (dims.realEstateInterest < 50) cap('realEstate', CAPS.realEstateLowInterestCap, '부동산에 대한 관심이 낮다는 응답을 반영했어요.');
  cap('realEstate', CAPS.realEstateMax, '초기자금·부채 정보가 없어 학습 관심도까지만 반영했어요.');

  // [규칙3] 가상자산: 위험 이해 없이 상위 배치 금지
  if (flags.lowCryptoUnderstanding) {
    cap('crypto', CAPS.cryptoLowUnderstandingCap, '가상자산 고유 위험(거래소·보관·기술) 이해가 충분하지 않아 점수를 제한했어요.');
  } else if (dims.cryptoRiskUnderstanding < 100) {
    cap('crypto', CAPS.cryptoPartialUnderstandingCap, '손실 가능성 외에 거래소·보관·기술적 위험까지 이해해야 학습 범위를 넓힐 수 있어 점수를 제한했어요.');
  }
  cap('crypto', CAPS.cryptoAbsoluteMax, '가상자산은 변동성이 매우 커서 최대 점수를 제한했어요.');
  const topOther = Math.max(...ASSET_ORDER.filter((k) => k !== 'crypto').map((k) => map[k].score));
  cap('crypto', Math.max(0, topOther - CAPS.cryptoBelowTopMargin), '가상자산은 다른 자산보다 앞서 배치하지 않도록 설계했어요.');

  // 정수화 및 0~100 보정
  const list = ASSET_ORDER.map((key) => {
    const item = map[key];
    const score = Math.round(clamp(item.score));
    return { ...item, score, baseScore: Math.round(clamp(item.baseScore)), band: scoreBand(score) };
  });

  // 점수 내림차순, 동점이면 위험이 낮은 자산 우선
  return list.sort((x, y) => y.score - x.score || ASSET_ORDER.indexOf(x.key) - ASSET_ORDER.indexOf(y.key));
}

/* ───────────────── 4단계: 성향 판정 ───────────────── */

export function determineProfile(dims: Dimensions, flags: Flags): ProfileKey {
  if (flags.foundationFirst) return 'foundation';
  if (flags.shortTerm || flags.lowLossTolerance) return 'stableSaver';

  const foundation = dims.incomeStability * 0.3 + dims.savingCapacity * 0.3 + dims.emergencyFund * 0.4;
  const realInterest = Math.max(dims.goldInterest, dims.realEstateInterest);

  // 후보: [성향, 친화도, 기준 충족 여부] — 동점이면 배열 앞쪽(보수적 성향) 우선
  const candidates: [ProfileKey, number, boolean][] = [
    ['longTermDiversified', (dims.diversification + dims.timeHorizon) / 2,
      dims.diversification >= 60 && dims.timeHorizon >= 60],
    ['companyAnalyst', dims.directAnalysis * 0.7 + dims.timeHorizon * 0.3,
      dims.directAnalysis >= 65 && dims.timeHorizon >= 50],
    ['realAsset', realInterest * 0.8 + dims.foreignRealInterest * 0.2,
      realInterest >= 80],
    ['highVolatility', Math.min(dims.lossTolerance, dims.cryptoRiskUnderstanding, dims.riskLiteracy),
      // 손실 감내 + 고유 위험 이해 + 위험 이해도 + 장기자금 + 생활기반이 모두 갖춰져야 함
      dims.lossTolerance >= 70 && !flags.lowCryptoUnderstanding && dims.riskLiteracy >= 65 &&
      dims.timeHorizon >= 50 && foundation >= 50],
  ];

  let best: ProfileKey | null = null;
  let bestValue = -1;
  for (const [key, value, ok] of candidates) {
    if (ok && value >= 65 && value > bestValue) {
      best = key;
      bestValue = value;
    }
  }
  if (best) return best;
  if (dims.lossTolerance < 40) return 'stableSaver';
  return 'balanced';
}

/* ───────────────── 5단계: 결과에 영향을 준 주요 응답 ───────────────── */

function answerText(answers: CompleteAnswers, id: QuestionId): string {
  const q = QUESTIONS.find((x) => x.id === id)!;
  const n = QUESTIONS.indexOf(q) + 1;
  return `Q${n}. ${q.text} → ${q.options[answers[id]]}`;
}

export function buildKeyFactors(input: Answers, dims: Dimensions, flags: Flags): KeyFactor[] {
  const a = validateAnswers(input);
  const out: KeyFactor[] = [];
  const add = (ids: QuestionId[], message: string) =>
    out.push({ questionIds: ids, answers: ids.map((id) => answerText(a, id)), message });

  if (a.q3 === 'A') add(['q3'], '비상자금이 없어 생활자금 확보를 가장 먼저 해야 할 과제로 판단했어요.');
  else if (flags.foundationFirst) add(['q1', 'q2', 'q3'], '소득·저축 여력·비상자금 상황을 고려해 생활기반 마련을 우선 과제로 보았어요.');

  if (flags.shortTerm) {
    const ids: QuestionId[] = [];
    if (a.q4 === 'A') ids.push('q4');
    if (a.q13 === 'A') ids.push('q13');
    add(ids, '가까운 시기에 쓸 돈이라 가격 변동이 크거나 바로 현금화하기 어려운 자산의 점수를 제한했어요.');
  } else if (dims.timeHorizon >= 80) {
    add(['q4', 'q13'], '오래 보유할 수 있는 자금이 있어 장기적인 관점의 자산 학습 점수가 높아졌어요.');
  }

  if (flags.lowLossTolerance) {
    add(['q6', 'q7'], '가격 하락을 감당하기 어렵다는 응답을 반영해 원금 변동이 큰 자산의 점수를 낮췄어요.');
  }

  if (flags.lowCryptoUnderstanding && dims.lossTolerance >= 60) {
    add(['q7', 'q14'], '손실을 감수할 의향은 있지만 가상자산 고유 위험에 대한 이해가 충분하지 않아 가상자산 점수를 제한했어요.');
  } else if (!flags.lowCryptoUnderstanding && a.q14 === 'D') {
    add(['q14'], '가상자산의 가격 외 위험까지 이해하고 있다는 응답을 위험 이해도에 반영했어요.');
  }

  if (dims.directAnalysis >= 65) add(['q8', 'q9'], '기업과 실적을 직접 분석하려는 관심이 주식 학습 점수에 반영됐어요.');
  if (dims.diversification >= 70) add(['q10'], '분산투자에 대한 이해와 관심이 ETF 등 분산형 자산 학습 점수에 반영됐어요.');
  if (a.q12 === 'C' || a.q12 === 'D') add(['q12'], '부동산 관심이 반영됐지만, 자금 규모·부채 정보가 없어 실제 매입 적합성은 판단하지 않았어요.');
  else if (a.q12 === 'B') add(['q12'], '금에 대한 관심이 금 학습 점수에 반영됐어요.');
  if (a.q11 === 'C' || a.q11 === 'D') add(['q11'], '환율과 환전 비용에 대한 이해가 달러 학습 점수에 반영됐어요.');
  if (a.q5 === 'C') add(['q5'], '물가와 자산가치 변동에 대비하려는 목표가 금·달러 학습 점수에 반영됐어요.');

  return out.slice(0, 5);
}

/* ───────────────── 전체 결과 ───────────────── */

export function computeResult(input: Answers): FinanceResult {
  const answers = validateAnswers(input);
  const dimensions = computeDimensions(answers);
  const flags = computeFlags(answers, dimensions);
  const scores = computeAssetScores(answers, dimensions, flags);
  const profile = determineProfile(dimensions, flags);

  // 공부해볼 자산: 상위 2개 + 3위가 35점 이상이면 3개
  const exploreAssets = scores.slice(0, 3).filter((s, i) => i < 2 || s.score >= 35).map((s) => s.key);

  return {
    dimensions, flags, scores, profile, exploreAssets,
    keyFactors: buildKeyFactors(answers, dimensions, flags),
  };
}
