'use client';

/**
 * "실제로 노출되면 이 정도 크기·형태구나"를 보여주는 목업.
 *
 * 매체별 UI를 정확히 재현하는 게 목적이 아니다(그건 저작권 리스크도 있고 과함) —
 * 규격 비율에 맞는 몇 가지 공통 틀(세로 풀스크린·피드 카드·배너·텍스트형) 중 하나에
 * 상품을 매핑해서, 실제 폰 화면에서 어느 정도 비중을 차지하는지 감을 준다.
 */

type Kind = 'phone' | 'card' | 'banner' | 'text';

/** widthPx/heightPx가 없어도 ratio 문자열("16:9" 등)만 있으면 그 비율로 목업을 그린다 */
function effectiveRatio(width?: number, height?: number, ratioLabel?: string): number | null {
  if (width && height) return width / height;
  const m = ratioLabel?.match(/(\d+(?:\.\d+)?)\s*:\s*(\d+(?:\.\d+)?)/);
  return m ? Number(m[1]) / Number(m[2]) : null;
}

function pickKind(ratio: number | null): Kind {
  if (ratio === null) return 'text';
  if (ratio <= 0.75) return 'phone'; // 세로로 긴 형태 — 숏폼/스토리류
  if (ratio >= 2.2) return 'banner'; // 가로로 아주 긴 형태 — 배너/팝업류
  return 'card'; // 그 외 정사각·카드형 — 피드류
}

interface Props {
  width?: number;
  height?: number;
  /** width/height 픽셀 치수가 없을 때 대신 쓰는 비율 문자열 (예: "16:9") */
  ratioLabel?: string;
  src?: string;
  brand: string;
  mainCopy: string;
  ctaText?: string;
}

const MAX_W = 176;
/** 픽셀 치수가 없어 ratio 문자열만으로 그릴 때 쓰는 명목 박스 높이 */
const NOMINAL_H = 130;

export default function MockupPreview({ width, height, ratioLabel, src, brand, mainCopy, ctaText }: Props) {
  const ratio = effectiveRatio(width, height, ratioLabel);
  const kind = pickKind(ratio);
  const cta = ctaText?.trim() || '더 알아보기';

  if (kind === 'text' || ratio === null) {
    return (
      <div
        className="rounded-lg p-3"
        style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border)' }}
      >
        <span
          className="rounded px-1.5 py-0.5 text-[9px] font-bold"
          style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
        >
          AD
        </span>
        <div className="mt-1.5 truncate text-[11px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {brand}
        </div>
        <div className="mt-0.5 line-clamp-2 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          {mainCopy}
        </div>
        <div className="mt-1.5 text-[10px] font-medium" style={{ color: 'var(--accent)' }}>
          {cta} ›
        </div>
      </div>
    );
  }

  const w = kind === 'card' ? Math.min(MAX_W, 150) : MAX_W;
  const h = width && height ? Math.round(w / ratio) : Math.round(Math.min(NOMINAL_H, w / ratio));

  if (kind === 'phone') {
    return (
      <div
        className="relative mx-auto overflow-hidden rounded-[18px]"
        style={{ width: w, height: h, background: '#000', border: '3px solid #1c1e28' }}
      >
        <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-between px-2 pt-1 text-[7px] text-white/90">
          <span>9:41</span>
          <span>●●●🔋</span>
        </div>
        <div className="absolute right-1.5 top-5 z-10 text-[10px] text-white/90">✕</div>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL 미리보기
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" style={{ background: 'linear-gradient(165deg, #2b3049, #13141f)' }} />
        )}
        <div
          className="absolute bottom-0 left-0 right-0 p-2"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,.88), transparent)' }}
        >
          <div className="truncate text-[8.5px] font-semibold text-white">{brand}</div>
          <div className="mt-0.5 line-clamp-2 text-[7.5px] leading-tight text-white/80">{mainCopy}</div>
          <div className="mt-1.5 flex items-center justify-between">
            <span
              className="rounded px-1 text-[6.5px] font-bold text-white"
              style={{ background: 'rgba(255,255,255,.18)' }}
            >
              AD
            </span>
            <span
              className="rounded px-2 py-0.5 text-[7.5px] font-semibold text-white"
              style={{ background: 'var(--accent)' }}
            >
              {cta}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (kind === 'banner') {
    const stripH = Math.max(h, 40);
    return (
      <div
        className="flex items-center gap-2 overflow-hidden rounded-md"
        style={{ width: w, height: stripH, border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)' }}
      >
        <div className="h-full shrink-0" style={{ width: stripH, background: src ? undefined : 'var(--accent-muted)' }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- data URL 미리보기 */}
          {src && <img src={src} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="min-w-0 flex-1 pr-1.5">
          <div className="truncate text-[9px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {brand}
          </div>
          <div className="truncate text-[8.5px]" style={{ color: 'var(--text-muted)' }}>
            {mainCopy}
          </div>
        </div>
        <span className="mr-1.5 shrink-0 text-[11px]" style={{ color: 'var(--accent)' }}>
          ›
        </span>
      </div>
    );
  }

  // card
  return (
    <div className="overflow-hidden rounded-lg" style={{ width: w, border: '1px solid var(--border-strong)', background: 'var(--bg-elevated)' }}>
      <div style={{ width: w, height: h }}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL 미리보기
          <img src={src} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full" style={{ background: 'var(--accent-muted)' }} />
        )}
      </div>
      <div className="p-2">
        <div className="flex items-center gap-1.5">
          <div className="h-4 w-4 shrink-0 rounded-full" style={{ background: 'var(--border-strong)' }} />
          <div className="min-w-0 truncate text-[9px] font-semibold" style={{ color: 'var(--text-primary)' }}>
            {brand}
          </div>
          <span
            className="ml-auto shrink-0 rounded px-1 text-[7px] font-bold"
            style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
          >
            AD
          </span>
        </div>
        <div className="mt-1 line-clamp-2 text-[9px]" style={{ color: 'var(--text-secondary)' }}>
          {mainCopy}
        </div>
        <div
          className="mt-1.5 rounded px-2 py-1 text-center text-[9px] font-semibold text-white"
          style={{ background: 'var(--accent)' }}
        >
          {cta}
        </div>
      </div>
    </div>
  );
}
