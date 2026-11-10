/**
 * 결과 이미지 생성 (Canvas 2D 직접 렌더링, 외부 라이브러리 없음)
 * - 이미지에는 프로그램명·브랜드·성향·점수만 포함되고 실명 등 개인정보는 포함되지 않습니다.
 * - 이미지는 브라우저 안에서만 만들어지며 서버로 전송되지 않습니다.
 */
import { BRAND } from '../data/brand';
import { ASSETS } from '../data/assets';
import { DISCLAIMERS, PROFILES } from '../data/profiles';
import type { FinanceResult } from '../scoring/scoring';

const W = 1080;
const H = 1980;
const FONT = '"Pretendard Variable", Pretendard, "Apple SD Gothic Neo", "Malgun Gothic", sans-serif';
const C = {
  navy: '#142943', navy700: '#1d3a5c', navy900: '#0d1c2f', gold: '#D4A547', gold600: '#b98b31',
  goldBg: '#f8efdb', white: '#FFFFFF', gray: '#CBD5E1', gray100: '#eef2f6', sub: '#4a5b70', muted: '#64748b',
};

const font = (weight: number, size: number) => `${weight} ${size}px ${FONT}`;

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  const rr = Math.min(r, h / 2, w / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.arcTo(x + w, y, x + w, y + h, rr);
  ctx.arcTo(x + w, y + h, x, y + h, rr);
  ctx.arcTo(x, y + h, x, y, rr);
  ctx.arcTo(x, y, x + w, y, rr);
  ctx.closePath();
}

/** 한글 줄바꿈: 어절 단위 → 넘치면 글자 단위 */
function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) { line = test; continue; }
    if (line) lines.push(line);
    line = '';
    for (const ch of word) {
      if (ctx.measureText(line + ch).width > maxWidth && line) { lines.push(line); line = ch; } else line += ch;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawLines(ctx: CanvasRenderingContext2D, lines: string[], x: number, y: number, lh: number, max: number) {
  const out = lines.slice(0, max);
  if (lines.length > max) out[max - 1] = out[max - 1].replace(/.{1}$/, '…');
  out.forEach((l, i) => ctx.fillText(l, x, y + i * lh));
  return out.length * lh;
}

async function ensureFonts(text: string) {
  if (!('fonts' in document)) return;
  try {
    await Promise.all([400, 600, 700, 800].map((w) => document.fonts.load(font(w, 40), text)));
    await document.fonts.ready;
  } catch {
    /* 폰트 로딩 실패 시 시스템 폰트로 대체 */
  }
}

export async function renderResultImage(result: FinanceResult): Promise<Blob> {
  const profile = PROFILES[result.profile];
  const allText = [
    BRAND.programName, BRAND.testTitle, BRAND.brandFull, BRAND.subtitle, profile.name, profile.priority.title,
    profile.priority.description, DISCLAIMERS.main, DISCLAIMERS.model, '나의 금융생활 성향 당신의 은 입니다! 7가지 금융자산 탐색 점수 우선 과제 공부해볼 자산 점 0123456789·',
    ...Object.values(ASSETS).map((a) => a.name), '우선 학습 비교 학습 기초 탐색 천천히 알아보기',
  ].join(' ');
  await ensureFonts(allText);

  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas를 사용할 수 없습니다.');
  ctx.textBaseline = 'alphabetic';

  /* 배경 */
  ctx.fillStyle = C.gray100;
  ctx.fillRect(0, 0, W, H);
  const g = ctx.createLinearGradient(0, 0, 0, 800);
  g.addColorStop(0, C.navy700);
  g.addColorStop(1, C.navy900);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, 800);

  /* 브랜드 */
  ctx.textAlign = 'center';
  ctx.fillStyle = C.gold;
  ctx.font = font(700, 30);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '10px';
  ctx.fillText(BRAND.brandEn, W / 2, 112);
  if ('letterSpacing' in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = '0px';
  ctx.fillStyle = C.gray;
  ctx.font = font(500, 26);
  ctx.fillText(BRAND.brandKo, W / 2, 152);

  /* 프로그램명 · 테스트 제목 */
  ctx.fillStyle = C.white;
  ctx.font = font(800, 62);
  ctx.fillText(BRAND.programNameLines[0], W / 2, 262);
  ctx.fillStyle = C.gold;
  ctx.fillText(BRAND.programNameLines[1], W / 2, 342);

  ctx.font = font(700, 36);
  const tw = ctx.measureText(BRAND.testTitle).width + 64;
  roundRect(ctx, W / 2 - tw / 2, 384, tw, 66, 33);
  ctx.strokeStyle = 'rgba(212,165,71,0.7)';
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = C.white;
  ctx.fillText(BRAND.testTitle, W / 2, 429);

  /* 성향 */
  ctx.fillStyle = 'rgba(255,255,255,0.14)';
  ctx.fillRect(140, 500, W - 280, 2);
  ctx.fillStyle = C.gray;
  ctx.font = font(600, 30);
  ctx.fillText('나의 금융생활 성향', W / 2, 568);
  ctx.fillStyle = C.gold;
  ctx.font = font(800, 92);
  ctx.fillText(profile.name, W / 2, 672);
  ctx.fillStyle = C.white;
  ctx.font = font(700, 34);
  ctx.fillText(`당신의 금융생활 성향은 ${profile.name}입니다!`, W / 2, 740);

  /* 점수 카드 */
  const cx = 60;
  const cw = W - 120;
  let y = 830;
  ctx.fillStyle = C.white;
  roundRect(ctx, cx, y, cw, 700, 32);
  ctx.fill();

  ctx.textAlign = 'left';
  ctx.fillStyle = C.gold;
  roundRect(ctx, cx + 48, y + 52, 8, 34, 4);
  ctx.fill();
  ctx.fillStyle = C.navy;
  ctx.font = font(800, 36);
  ctx.fillText('7가지 금융자산 탐색 점수', cx + 72, y + 82);

  const top = result.exploreAssets.length;
  const barX = cx + 270;
  const barW = cw - 270 - 150;
  result.scores.forEach((s, i) => {
    const by = y + 150 + i * 76;
    ctx.fillStyle = i < top ? C.navy : C.sub;
    ctx.font = font(i < top ? 800 : 600, 32);
    ctx.textAlign = 'left';
    ctx.fillText(ASSETS[s.key].name, cx + 48, by + 12);
    ctx.fillStyle = C.gray100;
    roundRect(ctx, barX, by - 10, barW, 26, 13);
    ctx.fill();
    if (s.score > 0) {
      if (i < top && s.score >= 35) {
        const bg = ctx.createLinearGradient(barX, 0, barX + barW, 0);
        bg.addColorStop(0, C.gold600);
        bg.addColorStop(1, C.gold);
        ctx.fillStyle = bg;
      } else ctx.fillStyle = s.score >= 35 ? C.navy700 : C.gray;
      roundRect(ctx, barX, by - 10, Math.max(26, (barW * s.score) / 100), 26, 13);
      ctx.fill();
    }
    ctx.textAlign = 'right';
    ctx.fillStyle = C.navy;
    ctx.font = font(800, 34);
    ctx.fillText(`${s.score}점`, cx + cw - 48, by + 14);
  });
  ctx.textAlign = 'left';
  ctx.fillStyle = C.muted;
  ctx.font = font(500, 22);
  ctx.fillText('※ 점수는 교육용 탐색 지표이며 예상 수익률이나 투자 권유가 아닙니다.', cx + 48, y + 660);

  /* 우선 과제 */
  y = 1560;
  ctx.fillStyle = C.goldBg;
  roundRect(ctx, cx, y, cw, 250, 28);
  ctx.fill();
  ctx.strokeStyle = 'rgba(212,165,71,0.6)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = C.gold600;
  ctx.font = font(800, 26);
  ctx.fillText('지금 나의 금융생활 우선 과제', cx + 44, y + 58);
  ctx.fillStyle = C.navy;
  ctx.font = font(800, 38);
  ctx.fillText(profile.priority.title, cx + 44, y + 112);
  ctx.fillStyle = C.sub;
  ctx.font = font(500, 26);
  const explore = result.exploreAssets.map((k) => ASSETS[k].name).join(' · ');
  ctx.fillText(`공부해볼 금융자산  ${explore}`, cx + 44, y + 166);
  ctx.font = font(500, 24);
  const conservative = result.profile === 'foundation' || result.profile === 'stableSaver';
  const tip = conservative ? DISCLAIMERS.noInvest : '비상자금과 생활자금은 분리해서 관리하는 것이 기본입니다.';
  drawLines(ctx, wrap(ctx, tip, cw - 88), cx + 44, y + 212, 34, 1);

  /* 하단 */
  ctx.textAlign = 'center';
  ctx.fillStyle = C.muted;
  ctx.font = font(500, 22);
  drawLines(ctx, wrap(ctx, `${DISCLAIMERS.main} ${DISCLAIMERS.model}`, W - 160), W / 2, 1858, 32, 2);
  ctx.fillStyle = C.navy;
  ctx.font = font(800, 26);
  ctx.fillText(BRAND.brandFull, W / 2, 1940);

  return new Promise((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('이미지 변환 실패'))), 'image/png'),
  );
}
