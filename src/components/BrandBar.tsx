import type { ReactNode } from 'react';
import { BRAND } from '../data/brand';

export default function BrandBar({ children, showTestTitle = false }: { children?: ReactNode; showTestTitle?: boolean }) {
  return (
    <header className="brand-bar">
      <div className="brand-bar__mark" aria-label={BRAND.brandFull}>{BRAND.brandEn}</div>
      <p className="brand-bar__title">{BRAND.programName}</p>
      {showTestTitle && <p className="brand-bar__sub">{BRAND.testTitle}</p>}
      {children}
    </header>
  );
}
