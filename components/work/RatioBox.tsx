'use client';

import { orientLabel } from '@/lib/spec-db';

interface Props {
  width?: number;
  height?: number;
  maxW?: number;
  maxH?: number;
  label?: string;
  /** 박스 안에 표시할 텍스트 (기본: 가로×세로). src 가 있으면 이미지 위 배지로만 쓰인다 */
  caption?: string;
  /** 실제 업로드된 이미지의 data URL — 있으면 박스 안에 이미지를 그대로 채운다 */
  src?: string;
}

/**
 * 소재 비율을 실제 종횡비 그대로 축소한 박스로 보여준다.
 * 담당자가 숫자만 보고는 감이 안 오는 가로/세로 형태를 눈으로 확인하게 하는 것이 목적.
 * 실제 업로드된 이미지가 있으면 크롭될 영역을 그대로 보여준다.
 */
export default function RatioBox({ width, height, maxW = 200, maxH = 120, caption, src }: Props) {
  if (!width || !height) return null;

  const scale = Math.min(maxW / width, maxH / height, 1);
  const w = Math.max(Math.round(width * scale), 24);
  const h = Math.max(Math.round(height * scale), 16);

  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="relative flex items-center justify-center overflow-hidden rounded-md text-[11px] font-medium"
        style={{
          width: w,
          height: h,
          background: 'var(--accent-muted)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
        }}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- data URL 미리보기, 최적화 대상 아님
          <img src={src} alt={caption ?? '업로드된 소재'} className="h-full w-full object-cover" />
        ) : (
          caption ?? `${width}×${height}`
        )}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {width} × {height} px · {orientLabel(width, height)}
      </div>
    </div>
  );
}
