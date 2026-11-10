/**
 * ─────────────────────────────────────────────
 *  금융생활 성향 7종 결과 문구 (강사 수정용)
 * ─────────────────────────────────────────────
 *  - name        : 성향 이름 ('○○형'의 ○○ 부분까지 포함)
 *  - summary     : 결과 설명 2~3문장
 *  - priority    : 지금 나의 금융생활 우선 과제
 *  - knowledge   : 알아두면 좋은 금융지식
 */

export type ProfileKey =
  | 'foundation'
  | 'stableSaver'
  | 'balanced'
  | 'longTermDiversified'
  | 'companyAnalyst'
  | 'realAsset'
  | 'highVolatility';

export interface ProfileInfo {
  key: ProfileKey;
  name: string;
  tagline: string;
  summary: string;
  priority: { title: string; description: string };
  knowledge: { title: string; description: string }[];
}

export const PROFILES: Record<ProfileKey, ProfileInfo> = {
  foundation: {
    key: 'foundation',
    name: '생활기반 준비형',
    tagline: '탄탄한 기초가 가장 큰 경쟁력',
    summary:
      '지금은 투자보다 생활비와 비상금이라는 금융생활의 바닥을 다지는 시기입니다. 당장 투자하지 않는 선택도 충분히 정상적이고 합리적인 결정이에요. 기초가 마련되면 자산을 비교하는 공부가 훨씬 수월해집니다.',
    priority: {
      title: '생활비와 비상자금 확보',
      description:
        '고정 지출을 파악하고, 최소 1~3개월 생활비를 언제든 꺼낼 수 있는 곳에 모아두는 것이 첫 번째 과제입니다. 위험자산 투자는 그다음 단계에서 고민해도 늦지 않아요.',
    },
    knowledge: [
      { title: '비상자금', description: '예상치 못한 지출에 대비해 따로 모아두는 돈. 보통 3~6개월 생활비를 목표로 합니다.' },
      { title: '파킹통장·수시입출금', description: '언제든 입출금이 가능한 통장. 상품별 금리 조건을 비교해보세요.' },
      { title: '고금리 대출 주의', description: '급할 때 쓰는 카드론·현금서비스는 이자 부담이 매우 큽니다.' },
    ],
  },
  stableSaver: {
    key: 'stableSaver',
    name: '안정저축형',
    tagline: '원칙 있는 저축이 만드는 목돈',
    summary:
      '가까운 시기에 쓸 돈이 있거나 가격 하락을 감당하기 어려운 편입니다. 이런 돈은 가격 변동이 큰 자산보다 안정적으로 모으는 방법을 먼저 익히는 것이 합리적이에요. 금리와 저축 구조를 이해하면 목돈 계획이 선명해집니다.',
    priority: {
      title: '사용 시기에 맞춘 저축 계획 세우기',
      description:
        '언제, 얼마가 필요한지 목표를 정하고 그 기간에 맞는 예·적금을 비교해보세요. 1년 이내 쓸 돈은 가격 변동이 큰 자산에 두지 않는 것이 기본 원칙입니다.',
    },
    knowledge: [
      { title: '단리와 복리', description: '이자에 다시 이자가 붙는 복리의 원리를 이해해보세요.' },
      { title: '예금자보호제도', description: '금융회사·상품별로 보호 여부와 한도가 다르니 가입 전 확인하세요.' },
      { title: '실질금리', description: '명목금리에서 물가상승률을 뺀 값. 물가가 오르면 실제 구매력은 줄어듭니다.' },
    ],
  },
  balanced: {
    key: 'balanced',
    name: '균형탐색형',
    tagline: '여러 자산을 고루 비교하는 탐색가',
    summary:
      '안정성과 성장 가능성 사이에서 균형을 찾으려는 성향입니다. 특정 자산에 치우치기보다 여러 금융자산의 특징과 위험을 비교하며 나만의 기준을 세워가는 단계예요.',
    priority: {
      title: '자산별 특징과 위험 비교하기',
      description:
        '예·적금, ETF, 달러, 금 등 자산마다 수익 구조와 위험이 어떻게 다른지 표로 정리해보세요. 비상자금을 유지한 상태에서 학습 범위를 넓히는 것이 좋습니다.',
    },
    knowledge: [
      { title: '위험과 수익의 관계', description: '기대수익이 높을수록 손실 가능성도 커지는 것이 일반적입니다.' },
      { title: '자산배분', description: '성격이 다른 자산에 나누어 담아 한쪽의 충격을 줄이는 방법입니다.' },
      { title: '투자 비용', description: '수수료·보수·세금도 장기 성과에 큰 영향을 줍니다.' },
    ],
  },
  longTermDiversified: {
    key: 'longTermDiversified',
    name: '장기분산형',
    tagline: '시간과 분산을 내 편으로',
    summary:
      '오랫동안 쓰지 않아도 되는 돈이 있고, 여러 자산에 나누어 담는 분산의 가치를 이해하는 성향입니다. 시장 전체를 담는 분산형 상품과 꾸준한 적립 방식을 공부해보기 좋은 단계예요.',
    priority: {
      title: '장기 자금계획과 분산 원칙 세우기',
      description:
        '목표 기간과 금액을 정하고, 비상자금은 별도로 유지한 채 장기 자금을 나누어 관리하는 원칙을 세워보세요. 비용과 위험을 함께 점검하는 습관이 중요합니다.',
    },
    knowledge: [
      { title: '적립식 투자', description: '일정 금액을 정기적으로 나누어 투자해 매입 시점을 분산하는 방법입니다.' },
      { title: '지수와 인덱스', description: 'KOSPI200, S&P500처럼 시장 전체 흐름을 나타내는 기준입니다.' },
      { title: '리밸런싱', description: '정해둔 자산 비중이 흐트러졌을 때 다시 맞추는 관리 방법입니다.' },
    ],
  },
  companyAnalyst: {
    key: 'companyAnalyst',
    name: '기업분석형',
    tagline: '숫자 너머 기업을 읽는 눈',
    summary:
      '기업의 사업과 실적을 직접 공부하는 데 흥미가 있고, 장기적으로 기다릴 수 있는 자금이 있는 성향입니다. 재무제표와 사업구조를 읽는 힘을 기르면 금융시장을 보는 시야가 넓어져요.',
    priority: {
      title: '기업 분석의 기초 체력 기르기',
      description:
        '관심 기업의 사업보고서와 재무제표를 읽고 매출·이익의 흐름을 정리해보세요. 한두 종목에 집중하는 위험을 이해하고, 분산의 원칙도 함께 세우는 것이 중요합니다.',
    },
    knowledge: [
      { title: '재무제표 3종', description: '손익계산서·재무상태표·현금흐름표의 역할을 구분해보세요.' },
      { title: 'PER·PBR', description: '기업 가치를 이익·순자산과 비교하는 대표적인 지표입니다.' },
      { title: '공시 확인', description: 'DART(전자공시시스템)에서 기업 공식 자료를 확인할 수 있습니다.' },
    ],
  },
  realAsset: {
    key: 'realAsset',
    name: '실물자산 관심형',
    tagline: '눈에 보이는 가치를 탐구하는 관찰자',
    summary:
      '금이나 부동산처럼 실물에 기반한 자산, 그리고 물가와 화폐가치의 변화에 관심이 많은 성향입니다. 실물자산도 가격이 크게 변하고 거래 비용이 있다는 점을 함께 공부하면 균형 잡힌 시각을 가질 수 있어요.',
    priority: {
      title: '실물자산의 구조와 비용 이해하기',
      description:
        '금은 투자 방법별 수수료·세금을, 부동산은 초기자금·대출·세금 구조를 먼저 살펴보세요. 이 검사는 자금 규모와 부채 정보를 묻지 않았기 때문에 실제 매입 판단과는 구분해야 합니다.',
    },
    knowledge: [
      { title: '인플레이션', description: '물가가 오르면 같은 돈으로 살 수 있는 것이 줄어듭니다.' },
      { title: 'LTV·DSR', description: '주택담보대출 한도를 정하는 대표적인 규제 지표입니다.' },
      { title: '리츠(REITs)', description: '부동산에 간접 투자하는 상품으로, 구조와 위험을 소액으로 공부할 수 있습니다.' },
    ],
  },
  highVolatility: {
    key: 'highVolatility',
    name: '고변동성 이해형',
    tagline: '위험을 알고 다루는 신중한 탐험가',
    summary:
      '큰 손실 가능성을 이해하고, 가격 변동이 큰 자산의 고유한 위험까지 알고 있는 성향입니다. 다만 위험을 안다는 것과 감당할 수 있다는 것은 다르므로, 생활자금과 분리된 제한적인 범위에서만 학습을 넓혀가세요.',
    priority: {
      title: '위험 한도와 원칙을 먼저 정하기',
      description:
        '전체 자산 중 가격 변동이 큰 자산에 둘 수 있는 최대 비중과 손실 한도를 미리 정해두세요. 비상자금과 장기자금은 반드시 분리해 관리해야 합니다.',
    },
    knowledge: [
      { title: '변동성', description: '가격이 얼마나 크게 오르내리는지를 나타내는 개념입니다.' },
      { title: '최대 낙폭(MDD)', description: '고점 대비 가장 크게 하락한 비율. 내가 견딜 수 있는 수준을 점검해보세요.' },
      { title: '투자 사기 예방', description: '고수익 보장, 지인 추천 코인, 리딩방은 대표적인 사기 신호입니다.' },
    ],
  },
};

/** 결과 화면·이미지에 공통으로 표시되는 안내 문구 */
export const DISCLAIMERS = {
  main: '본 프로그램은 금융교육용으로 제작되었으며 투자상품 추천이나 수익을 보장하지 않습니다.',
  score:
    '자산별 점수는 해당 금융자산을 공부하고 비교해볼 때의 교육용 탐색 지표이며, 예상 수익률이나 금융기관의 공식 투자자 적합성 평가 결과가 아닙니다.',
  model: '이 결과는 교육용 규칙 기반 모델로 계산되었으며, 실제 통계적 검증을 거치지 않았습니다.',
  noInvest: '지금 투자하지 않는 선택도 정상적이고 합리적인 결과입니다.',
  privacy: '응답 내용은 서버에 저장되지 않으며, 새로고침하면 모두 초기화됩니다.',
};
