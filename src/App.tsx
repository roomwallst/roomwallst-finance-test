import { useCallback, useEffect, useState } from 'react';
import StartScreen from './components/StartScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';
import { computeResult, setAnswer, type Answers, type FinanceResult } from './scoring/scoring';
import { QUESTIONS, type OptionKey } from './data/questions';

type Screen = 'start' | 'quiz' | 'result';

/**
 * 응답은 React 메모리(state)에만 보관합니다.
 * 서버 전송·localStorage 저장을 하지 않으므로 새로고침하면 초기화됩니다.
 */
export default function App() {
  const [screen, setScreen] = useState<Screen>('start');
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState<FinanceResult | null>(null);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [screen, index]);

  const start = useCallback(() => {
    setAnswers({});
    setIndex(0);
    setResult(null);
    setScreen('quiz');
  }, []);

  const select = useCallback((option: OptionKey) => {
    setAnswers((prev) => setAnswer(prev, QUESTIONS[index].id, option));
  }, [index]);

  const next = useCallback(() => {
    if (!answers[QUESTIONS[index].id]) return; // 미선택 시 이동 불가
    if (index < QUESTIONS.length - 1) {
      setIndex(index + 1);
    } else {
      setResult(computeResult(answers));
      setScreen('result');
    }
  }, [answers, index]);

  const prev = useCallback(() => {
    if (index === 0) setScreen('start');
    else setIndex(index - 1);
  }, [index]);

  return (
    <div className="app">
      {screen === 'start' && <StartScreen onStart={start} />}
      {screen === 'quiz' && (
        <QuizScreen
          index={index}
          selected={answers[QUESTIONS[index].id]}
          onSelect={select}
          onNext={next}
          onPrev={prev}
        />
      )}
      {screen === 'result' && result && <ResultScreen result={result} onRestart={start} />}
    </div>
  );
}
