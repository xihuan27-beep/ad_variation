'use client';

import { orientLabel } from '@/lib/spec-db';

interface Props {
  width?: number;
  height?: number;
  maxW?: number;
  maxH?: number;
  label?: string;
  /** 박스 안에 표시할 텍스트 (기본: 가로×세로) */
  caption?: string;
}

/**
 * 소재 비율을 실제 종횡비 그대로 축소한 박스로 보여준다.
 * 담당자가 숫자만 보고는 감이 안 오는 가로/세로 형태를 눈으로 확인하게 하는 것이 목적.
 */
export default function RatioBox({ width, height, maxW = 200, maxH = 120, caption }: Props) {
  if (!width || !height) return null;

  const scale = Math.min(maxW / width, maxH / height, 1);
  const w = Math.max(Math.round(width * scale), 24);
  const h = Math.max(Math.round(height * scale), 16);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex items-center justify-center rounded-md text-[11px] font-medium"
        style={{
          width: w,
          height: h,
          background: 'var(--accent-muted)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
        }}
      >
        {caption ?? `${width}×${height}`}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {width} × {height} px · {orientLabel(width, height)}
      </div>
    </div>
  );
}
