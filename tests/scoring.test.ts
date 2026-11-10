import { describe, expect, it } from 'vitest';
import {
  AnswerValidationError, answersFromArray, computeResult, setAnswer, validateAnswers,
  type Answers, type FinanceResult,
} from '../src/scoring/scoring';
import { OPTION_KEYS, QUESTIONS, type OptionKey } from '../src/data/questions';
import { CAPS, type AssetKey } from '../src/data/scoringModel';

const run = (s: string): FinanceResult => computeResult(answersFromArray(s.split('') as OptionKey[]));
const scoreOf = (r: FinanceResult, k: AssetKey) => r.scores.find((s) => s.key === k)!.score;
const rankOf = (r: FinanceResult, k: AssetKey) => r.scores.findIndex((s) => s.key === k);
const HIGH_RISK: AssetKey[] = ['crypto', 'stock', 'realEstate'];

//            Q 123456789012345
describe('사례 A: 무소득 · 비상금 없음 · 단기 사용', () => {
  const r = run('DAAAAAAAAAAAAAA');

  it('생활기반 준비형으로 판정하고 비상자금 확보를 우선한다', () => {
    expect(r.profile).toBe('foundation');
    expect(r.flags.foundationFirst).toBe(true);
    expect(r.flags.shortTerm).toBe(true);
    expect(r.scores[0].key).toBe('deposit');
  });

  it('위험자산(가상자산·주식·부동산)이 상위 2위·탐색 자산에 들지 않는다', () => {
    for (const k of HIGH_RISK) {
      expect(rankOf(r, k)).toBeGreaterThanOrEqual(2);
      expect(r.exploreAssets).not.toContain(k);
      expect(scoreOf(r, k)).toBeLessThanOrEqual(15);
    }
    expect(scoreOf(r, 'crypto')).toBeLessThanOrEqual(15);
  });

  it('위험 감내 응답이 높아도 생활기반 부족이면 위험자산이 상위로 가지 않는다', () => {
    // 무소득·비상금 없음·1년 이내, 그러나 손실감내/위험이해는 최고
    const r2 = run('DAAADDDDDDDDADD');
    expect(r2.profile).toBe('foundation');
    expect(r2.scores[0].key).toBe('deposit');
    expect(scoreOf(r2, 'crypto')).toBeLessThanOrEqual(15);
    expect(scoreOf(r2, 'stock')).toBeLessThanOrEqual(35);
  });
});

describe('사례 B: 정기 소득 · 충분한 비상금 · 장기 · 분산 선호', () => {
  const r = run('ADDDDCCBBDBADBD');

  it('장기분산형으로 판정한다', () => {
    expect(r.profile).toBe('longTermDiversified');
  });

  it('ETF가 최상위 학습 자산이며 주식보다 높다', () => {
    expect(r.scores[0].key).toBe('etf');
    expect(scoreOf(r, 'etf')).toBeGreaterThan(scoreOf(r, 'stock'));
    expect(r.exploreAssets).toContain('etf');
  });
});

describe('사례 C: 높은 위험 감내 의향 · 낮은 위험 이해도', () => {
  const r = run('ACCCDDDBAAAACBC');

  it('가상자산을 최상위로 분류하지 않고 점수를 제한한다', () => {
    expect(r.scores[0].key).not.toBe('crypto');
    expect(r.flags.lowCryptoUnderstanding).toBe(true);
    expect(scoreOf(r, 'crypto')).toBeLessThanOrEqual(CAPS.cryptoLowUnderstandingCap);
    expect(r.exploreAssets).not.toContain('crypto');
  });

  it('손실 가능성만 알고 거래소·보관 위험을 모르면(Q14=C) 중간 상한을 적용한다', () => {
    const r3 = run('ADDDDCCCBCCCDCD');
    expect(scoreOf(r3, 'crypto')).toBeLessThanOrEqual(CAPS.cryptoPartialUnderstandingCap);
  });

  it('고변동성 이해형으로 판정하지 않는다', () => {
    expect(r.profile).not.toBe('highVolatility');
  });

  it('제한 이유가 결과 설명에 포함된다', () => {
    const crypto = r.scores.find((s) => s.key === 'crypto')!;
    expect(crypto.limits.join(' ')).toMatch(/고유 위험/);
    expect(r.keyFactors.some((f) => f.questionIds.includes('q14'))).toBe(true);
  });

  it('위험 이해도가 높아도 가상자산은 단독 최상위가 되지 않는다', () => {
    const r2 = run('ADDDDDDDDDDADDD');
    expect(r2.scores[0].key).not.toBe('crypto');
    expect(scoreOf(r2, 'crypto')).toBeLessThan(r2.scores[0].score);
  });
});

describe('사례 D: 부동산 관심 높음 · 자본 규모/부채 정보 없음', () => {
  const r = run('ADDDDCCCBCCCDCD');
  const re = r.scores.find((s) => s.key === 'realEstate')!;

  it('부동산 점수는 상한(70점) 이하이며 "우선 학습" 단계로 표시되지 않는다', () => {
    expect(re.score).toBeLessThanOrEqual(CAPS.realEstateMax);
    expect(re.band).not.toBe('우선 학습');
  });

  it('매입 적합성을 판단하지 않았다는 안내가 포함된다', () => {
    expect(re.limits.join(' ')).toMatch(/초기자금·부채/);
    expect(r.keyFactors.some((f) => /매입 적합성/.test(f.message))).toBe(true);
  });
});

describe('사례 E: 기업 직접 분석을 즐기고 장기 자금이 있음', () => {
  const r = run('ACDDDDCDDBBADBD');

  it('기업분석형으로 판정한다', () => {
    expect(r.profile).toBe('companyAnalyst');
  });

  it('주식이 최상위이며 ETF보다 높다', () => {
    expect(r.scores[0].key).toBe('stock');
    expect(scoreOf(r, 'stock')).toBeGreaterThan(scoreOf(r, 'etf'));
  });

  it('실물자산에 관심 없다고 답하면 부동산이 탐색 자산에 포함되지 않는다', () => {
    expect(r.exploreAssets).not.toContain('realEstate');
    expect(scoreOf(r, 'realEstate')).toBeLessThanOrEqual(CAPS.realEstateLowInterestCap);
  });
});

describe('단기 자금 규칙', () => {
  it('1년 이내 사용 자금이면 고변동·저유동 자산 점수를 제한한다', () => {
    const r = run('ADDADDDDDDDDDDD'); // Q4=A만 단기
    expect(r.flags.shortTerm).toBe(true);
    expect(scoreOf(r, 'stock')).toBeLessThanOrEqual(CAPS.shortTerm.stock!);
    expect(scoreOf(r, 'crypto')).toBeLessThanOrEqual(CAPS.shortTerm.crypto!);
    expect(scoreOf(r, 'realEstate')).toBeLessThanOrEqual(CAPS.shortTerm.realEstate!);
    expect(r.profile).toBe('stableSaver');
  });
});

describe('점수 범위 · NaN · 음수 · 전수/무작위 검증', () => {
  const check = (r: FinanceResult) => {
    expect(r.scores).toHaveLength(7);
    expect(new Set(r.scores.map((s) => s.key)).size).toBe(7);
    for (const s of r.scores) {
      expect(Number.isInteger(s.score)).toBe(true);
      expect(Number.isNaN(s.score)).toBe(false);
      expect(s.score).toBeGreaterThanOrEqual(0);
      expect(s.score).toBeLessThanOrEqual(100);
    }
    for (const v of Object.values(r.dimensions)) {
      expect(Number.isFinite(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(100);
    }
    // 정렬 확인
    for (let i = 1; i < r.scores.length; i++) expect(r.scores[i - 1].score).toBeGreaterThanOrEqual(r.scores[i].score);
    // 가상자산은 어떤 경우에도 1위가 아님
    expect(r.scores[0].key).not.toBe('crypto');
    // 탐색 자산 2~3개
    expect(r.exploreAssets.length).toBeGreaterThanOrEqual(2);
    expect(r.exploreAssets.length).toBeLessThanOrEqual(3);
  };

  it('모든 문항을 같은 선택지로 응답한 4가지 경우', () => {
    for (const k of OPTION_KEYS) check(run(k.repeat(15)));
  });

  it('무작위 응답 5,000건', () => {
    let seed = 42;
    const rand = () => ((seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648);
    for (let n = 0; n < 5000; n++) {
      const arr = Array.from({ length: 15 }, () => OPTION_KEYS[Math.floor(rand() * 4)]);
      const r = computeResult(answersFromArray(arr));
      check(r);
      if (r.flags.foundationFirst) expect(r.profile).toBe('foundation');
      if (r.flags.shortTerm) {
        expect(scoreOf(r, 'crypto')).toBeLessThanOrEqual(CAPS.shortTerm.crypto!);
        expect(scoreOf(r, 'stock')).toBeLessThanOrEqual(CAPS.shortTerm.stock!);
      }
      expect(scoreOf(r, 'realEstate')).toBeLessThanOrEqual(CAPS.realEstateMax);
    }
  });
});

describe('응답 검증 · 중복 응답 처리', () => {
  const full = answersFromArray(Array(15).fill('B'));

  it('같은 문항에 여러 번 응답하면 마지막 응답으로 교체된다(누적되지 않음)', () => {
    let a: Answers = {};
    a = setAnswer(a, 'q1', 'A');
    a = setAnswer(a, 'q1', 'C');
    a = setAnswer(a, 'q1', 'C');
    expect(Object.keys(a)).toEqual(['q1']);
    expect(a.q1).toBe('C');
  });

  it('setAnswer는 원본을 변경하지 않는다(순수 함수)', () => {
    const a: Answers = { q1: 'A' };
    const b = setAnswer(a, 'q1', 'D');
    expect(a.q1).toBe('A');
    expect(b.q1).toBe('D');
  });

  it('미응답 문항이 있으면 계산하지 않는다', () => {
    const partial = { ...full };
    delete partial.q15;
    expect(() => computeResult(partial)).toThrow(AnswerValidationError);
  });

  it('A~D 외의 값, 숫자, null, 배열, 알 수 없는 문항을 거부한다', () => {
    expect(() => validateAnswers({ ...full, q1: 'E' })).toThrow(AnswerValidationError);
    expect(() => validateAnswers({ ...full, q2: 3 })).toThrow(AnswerValidationError);
    expect(() => validateAnswers({ ...full, q3: NaN })).toThrow(AnswerValidationError);
    expect(() => validateAnswers(null)).toThrow(AnswerValidationError);
    expect(() => validateAnswers(['A'])).toThrow(AnswerValidationError);
    expect(() => validateAnswers({ ...full, q99: 'A' })).toThrow(AnswerValidationError);
    expect(() => setAnswer({}, 'q1', 'Z' as OptionKey)).toThrow(AnswerValidationError);
  });

  it('문항 수는 15개이며 모두 4지선다', () => {
    expect(QUESTIONS).toHaveLength(15);
    for (const q of QUESTIONS) expect(Object.keys(q.options)).toEqual(['A', 'B', 'C', 'D']);
  });
});
