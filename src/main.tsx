import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
// Pretendard (SIL Open Font License 1.1) — 프로젝트에 포함(self-host)되어 외부 CDN 없이 동작
import 'pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css';
import './styles.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
