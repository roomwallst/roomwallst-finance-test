import { useEffect, useRef } from 'react';
import BrandBar from './BrandBar';
import { OPTION_KEYS, QUESTIONS, TOTAL_QUESTIONS, type OptionKey } from '../data/questions';

interface Props {
  index: number;
  selected?: OptionKey;
  onSelect: (option: OptionKey) => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function QuizScreen({ index, selected, onSelect, onNext, onPrev }: Props) {
  const q = QUESTIONS[index];
  const headingRef = useRef<HTMLHeadingElement>(null);
  const isLast = index === TOTAL_QUESTIONS - 1;
  // 진행률: 응답 완료한 문항 기준
  const progress = Math.round(((index + (selected ? 1 : 0)) / TOTAL_QUESTIONS) * 100);

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [index]);

  return (
    <>
      <BrandBar>
        <div
          className="progress"
          role="progressbar"
          aria-label="진행률"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
        >
          <div className="progress__bar" style={{ width: `${progress}%` }} />
        </div>
      </BrandBar>

      <main className="quiz">
        <div className="quiz__card" key={q.id}>
          <div className="quiz__meta">
            <span className="quiz__count">질문 <b>{index + 1}</b> / {TOTAL_QUESTIONS}</span>
            <span className="quiz__tag">{q.category}</span>
          </div>
          <h1 className="quiz__question" id={`${q.id}-title`} tabIndex={-1} ref={headingRef}>
            {q.text}
          </h1>

          <fieldset className="options" aria-labelledby={`${q.id}-title`}>
            {OPTION_KEYS.map((key) => (
              <label className="option" key={key}>
                <input
                  type="radio"
                  name={q.id}
                  value={key}
                  checked={selected === key}
                  onChange={() => onSelect(key)}
                  onKeyDown={(e) => { if (e.key === 'Enter' && selected) onNext(); }}
                />
                <span className="option__box">
                  <span className="option__key" aria-hidden="true">{key}</span>
                  <span>{q.options[key]}</span>
                  <svg className="option__check" width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                    <circle cx="12" cy="12" r="11" fill="#142943" />
                    <path d="M7 12.5l3.2 3.2L17 9" stroke="#D4A547" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </label>
            ))}
          </fieldset>
        </div>

        <nav className="quiz__nav" aria-label="문항 이동">
          <button type="button" className="btn btn--ghost" onClick={onPrev}>
            ← 이전
          </button>
          <button type="button" className="btn btn--gold" onClick={onNext} disabled={!selected}>
            {isLast ? '결과 확인하기' : '다음 →'}
          </button>
        </nav>
        <p className="quiz__hint" aria-live="polite">
          {selected ? '' : '답변을 선택하면 다음으로 넘어갈 수 있어요.'}
        </p>
      </main>
    </>
  );
}
