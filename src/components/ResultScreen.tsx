import { useEffect, useRef, useState } from 'react';
import BrandBar from './BrandBar';
import ImageModal from './ImageModal';
import { BRAND } from '../data/brand';
import { ASSETS } from '../data/assets';
import { DISCLAIMERS, PROFILES } from '../data/profiles';
import { ASSET_ORDER } from '../data/scoringModel';
import type { FinanceResult } from '../scoring/scoring';
import { renderResultImage } from '../utils/resultImage';

interface Props {
  result: FinanceResult;
  onRestart: () => void;
}

export default function ResultScreen({ result, onRestart }: Props) {
  const profile = PROFILES[result.profile];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const [image, setImage] = useState<{ url: string; blob: Blob } | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const conservative = result.profile === 'foundation' || result.profile === 'stableSaver';

  useEffect(() => headingRef.current?.focus({ preventScroll: true }), []);
  useEffect(() => () => { if (image) URL.revokeObjectURL(image.url); }, [image]);

  const saveImage = async () => {
    setSaving(true);
    setError('');
    try {
      const blob = await renderResultImage(result);
      setImage({ blob, url: URL.createObjectURL(blob) });
    } catch (e) {
      console.error(e);
      setError('이미지를 만드는 중 문제가 발생했어요. 화면 캡처로 저장해 주세요.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <BrandBar />
      <main className="result">
        {/* 1. 성향 */}
        <section className="card hero" aria-labelledby="result-heading">
          <p className="hero__label">{BRAND.testTitle}</p>
          <span className="hero__badge">나의 금융생활 성향</span>
          <h1 className="hero__name" id="result-heading" tabIndex={-1} ref={headingRef}>
            {profile.name}
          </h1>
          <p className="hero__sentence">당신의 금융생활 성향은 {profile.name}입니다!</p>
          <p className="hero__summary">{profile.summary}</p>
        </section>

        {/* 2. 우선 과제 */}
        <section className="card" aria-labelledby="priority-heading">
          <h2 className="card__title" id="priority-heading">지금 나의 금융생활 우선 과제</h2>
          <div className="priority">
            <p className="priority__title">{profile.priority.title}</p>
            <p className="priority__desc">{profile.priority.description}</p>
            {conservative && <p className="priority__extra">✓ {DISCLAIMERS.noInvest}</p>}
          </div>
        </section>

        {/* 3. 자산별 점수 */}
        <section className="card" aria-labelledby="scores-heading">
          <h2 className="card__title" id="scores-heading">7가지 금융자산 탐색 점수</h2>
          <ol className="bars">
            {result.scores.map((s, i) => {
              const tier = i < result.exploreAssets.length && s.score >= 35 ? 'bar--top' : s.score >= 35 ? 'bar--mid' : '';
              return (
                <li key={s.key} className={`bar ${tier}`}>
                  <div className="bar__head">
                    <span className="bar__name">
                      <span className="bar__rank" aria-hidden="true">{i + 1}</span>
                      {ASSETS[s.key].name}
                      <span className="bar__band">{s.band}</span>
                    </span>
                    <span className="bar__score">{s.score}<small>점</small></span>
                  </div>
                  <div className="bar__track" aria-hidden="true">
                    <div className="bar__fill" style={{ width: `${s.score}%`, animationDelay: `${i * 70}ms` }} />
                  </div>
                  {s.limits.length > 0 && <p className="bar__limit">ⓘ {s.limits[s.limits.length - 1]}</p>}
                </li>
              );
            })}
          </ol>
          <p className="bars-note">
            {DISCLAIMERS.score} 각 점수는 서로 독립적으로 계산되며 합계가 100점이 되도록 맞추지 않았습니다.
          </p>
        </section>

        {/* 4. 공부해볼 자산 */}
        <section className="card" aria-labelledby="explore-heading">
          <h2 className="card__title" id="explore-heading">
            {result.profile === 'foundation' ? '생활기반을 다진 뒤 비교해볼 금융자산' : '관심을 갖고 공부해볼 금융자산'}
          </h2>
          <div className="explore">
            {result.exploreAssets.map((key) => {
              const a = ASSETS[key];
              const s = result.scores.find((x) => x.key === key)!;
              return (
                <article className="explore__item" key={key}>
                  <div className="explore__head">
                    <h3>{a.name}</h3>
                    <span>{s.score}점 · {s.band}</span>
                  </div>
                  <div className="explore__body">
                    <p className="explore__label">살펴볼 이유</p>
                    <p>{a.reason}</p>
                    <p className="explore__label explore__label--risk">주의할 위험</p>
                    <ul>{a.risks.map((r) => <li key={r}>{r}</li>)}</ul>
                    {a.note && <p className="explore__note">{a.note}</p>}
                  </div>
                </article>
              );
            })}
          </div>
        </section>

        {/* 5. 금융지식 */}
        <section className="card" aria-labelledby="knowledge-heading">
          <h2 className="card__title" id="knowledge-heading">내가 알아두면 좋은 금융지식</h2>
          <ul className="knowledge">
            {profile.knowledge.map((k) => (
              <li key={k.title}><strong>{k.title}</strong><span>{k.description}</span></li>
            ))}
          </ul>
        </section>

        {/* 6. 주요 응답 */}
        {result.keyFactors.length > 0 && (
          <section className="card" aria-labelledby="factors-heading">
            <h2 className="card__title" id="factors-heading">결과에 영향을 준 주요 응답</h2>
            <ul className="factors">
              {result.keyFactors.map((f) => (
                <li key={f.message}>
                  {f.answers.map((t) => <span className="q" key={t}>{t}</span>)}
                  <p>{f.message}</p>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* 7. 전체 자산 비교 */}
        <section className="card" aria-labelledby="all-heading">
          <h2 className="card__title" id="all-heading">7가지 금융자산 특징 비교하기</h2>
          <div className="assets-all">
            {ASSET_ORDER.map((key) => {
              const a = ASSETS[key];
              return (
                <details key={key}>
                  <summary>{a.name}</summary>
                  <div className="body">
                    <div>{a.reason}</div>
                    <ul>{a.risks.map((r) => <li key={r}>{r}</li>)}</ul>
                  </div>
                </details>
              );
            })}
          </div>
        </section>

        {/* 8. 안내 */}
        <section className="card disclaimer" aria-label="유의사항">
          <p>· {DISCLAIMERS.main}</p>
          <p>· {DISCLAIMERS.model}</p>
          <p>· 은행 예·적금도 상품에 따라 중도해지 조건과 예금자보호 적용 여부가 다르며, 물가 상승 시 실질구매력이 줄어들 수 있습니다.</p>
          <p>· 금과 달러도 가격 변동에 따라 원금 손실이 발생할 수 있습니다.</p>
          <p>· 모든 ETF가 분산투자나 안정성을 보장하지 않으며, 이 프로그램은 비레버리지 분산형 ETF를 교육 예시로 사용합니다.</p>
          <p>· 부동산은 초기자금과 부채 상황을 묻지 않았기 때문에 실제 매입 적합성은 판단하지 않았습니다.</p>
          <p>· {DISCLAIMERS.noInvest}</p>
          <p>· {DISCLAIMERS.privacy}</p>
        </section>

        {error && <p role="alert" className="card" style={{ color: 'var(--danger)', margin: 0 }}>{error}</p>}

        <div className="actions">
          <button type="button" className="btn btn--navy" onClick={saveImage} disabled={saving}>
            {saving ? '이미지 만드는 중…' : '결과 이미지 저장'}
          </button>
          <button type="button" className="btn btn--ghost" onClick={onRestart}>다시 검사하기</button>
        </div>
        <p className="footer">© {BRAND.brandFull}</p>
      </main>

      {image && <ImageModal url={image.url} blob={image.blob} onClose={() => setImage(null)} />}
    </>
  );
}
