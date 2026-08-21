'use client';

import { formatSpec, orientLabel } from '@/lib/spec-db';
import type { AssetArea } from '@/lib/spec-db';

const TYPE_COLOR: Record<string, string> = {
  IMAGE: 'var(--accent)',
  VIDEO: '#9B5CF6',
  TEXT: 'var(--success)',
  COLOR: 'var(--warn)',
  URL: 'var(--text-secondary)',
};

/** DB 기준 고정 규격 표. 매체사가 정해 둔, 사용자가 바꿀 수 없는 값들. */
export default function SpecTable({ areas }: { areas: AssetArea[] }) {
  if (areas.length === 0) {
    return (
      <div className="px-4 py-5 text-sm" style={{ color: 'var(--text-muted)' }}>
        이 상품은 고정 규격 없이 전 항목을 캠페인마다 입력합니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr style={{ background: 'var(--bg-surface)' }}>
            {['영역', '유형', '규격', '제약 조건'].map((h) => (
              <th
                key={h}
                className="whitespace-nowrap px-4 py-2.5 text-left text-xs font-semibold"
                style={{ color: 'var(--text-secondary)', borderBottom: '1px solid var(--border)' }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {areas.map((a) => (
            <tr key={a.displayOrder} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
              <td className="px-4 py-3 align-top font-medium" style={{ color: 'var(--text-primary)' }}>
                {a.areaName}
              </td>
              <td className="px-4 py-3 align-top">
                <span
                  className="whitespace-nowrap rounded px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'var(--bg-elevated)', color: TYPE_COLOR[a.areaType] }}
                >
                  {a.areaType}
                </span>
              </td>
              <td className="px-4 py-3 align-top" style={{ color: 'var(--text-primary)' }}>
                {a.widthPx && a.heightPx ? (
                  <>
                    <div className="font-semibold">
                      {a.widthPx} × {a.heightPx} px
                    </div>
                    <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
                      {orientLabel(a.widthPx, a.heightPx)}
                      {a.ratio ? ` · ${a.ratio}` : ''}
                    </div>
                  </>
                ) : (
                  <span style={{ color: 'var(--text-muted)' }}>—</span>
                )}
              </td>
              <td className="px-4 py-3 align-top text-[13px]" style={{ color: 'var(--text-secondary)' }}>
                {formatSpec(a)}
                {a.notes && (
                  <div className="mt-1 text-[12px]" style={{ color: 'var(--warn)' }}>
                    {a.notes}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
