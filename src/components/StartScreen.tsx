import { BRAND } from '../data/brand';
import { DISCLAIMERS } from '../data/profiles';
import { TOTAL_QUESTIONS } from '../data/questions';

export default function StartScreen({ onStart }: { onStart: () => void }) {
  return (
    <main className="start">
      <div className="start__brand">
        {BRAND.brandEn}
        <span className="start__brand-ko">{BRAND.brandKo}</span>
      </div>

      <section className="start__main" aria-labelledby="program-title">
        <div className="start__line" aria-hidden="true" />
        <h1 id="program-title" className="start__title">
          {BRAND.programNameLines[0]}
          <br />
          <em>{BRAND.programNameLines[1]}</em>
        </h1>
        <div>
          <h2 className="start__test">{BRAND.testTitle}</h2>
        </div>
        <p className="start__desc">{BRAND.subtitle}</p>

        <div className="info-card" role="list">
          <div role="listitem"><strong>{TOTAL_QUESTIONS}문항</strong><span>4지선다</span></div>
          <div role="listitem"><strong>약 3~5분</strong><span>소요시간</span></div>
          <div role="listitem"><strong>7가지</strong><span>금융자산</span></div>
        </div>
      </section>

      <button type="button" className="btn btn--gold start__cta" onClick={onStart}>
        나의 금융생활 알아보기 <span aria-hidden="true">→</span>
      </button>
      <p className="start__notice">
        {DISCLAIMERS.main}
        <br />
        {DISCLAIMERS.privacy}
      </p>
    </main>
  );
}
