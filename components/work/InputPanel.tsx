'use client';

import { Check, Image as ImageIcon } from 'lucide-react';
import { formatSpec } from '@/lib/spec-db';
import type { AssetArea } from '@/lib/spec-db';
import { resolveAsset, type AreaValue, type CampaignMeta } from '@/lib/campaign';
import RatioBox from './RatioBox';

interface Props {
  areas: AssetArea[];
  values: Record<number, AreaValue>;
  meta: CampaignMeta;
  onChange: (order: number, value: string) => void;
  onConfirm: (order: number) => void;
  onUseSubVisual: (order: number) => void;
}

/**
 * 캠페인마다 사용자가 채워야 하는 항목들.
 * 시작값은 캠페인 공통 소재를 근거로 제안하고, 사용자가 수정·확정한다.
 */
export default function InputPanel({ areas, values, meta, onChange, onConfirm, onUseSubVisual }: Props) {
  if (areas.length === 0) {
    return (
      <div className="px-4 py-5 text-sm" style={{ color: 'var(--text-muted)' }}>
        이 상품은 추가로 입력할 항목이 없습니다.
      </div>
    );
  }

  return (
    <div>
      {areas.map((a) => {
        const v = values[a.displayOrder] ?? { value: '', confirmed: false };
        const isVisual = a.areaType === 'IMAGE' || a.areaType === 'VIDEO';
        const asset = resolveAsset(meta, v.assetRef);
        // 동영상 영역은 이미지처럼 미리보기 크롭이 되지 않으므로 파일 존재 여부만 보여준다
        const showImagePreview = a.areaType === 'IMAGE' && asset;

        const canConfirm = isVisual ? !!asset : !!v.value.trim() && !(a.maxChars && v.value.length > a.maxChars);

        return (
          <div
            key={a.displayOrder}
            className="flex flex-col gap-3 px-4 py-4 md:flex-row md:gap-6"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="w-full shrink-0 md:w-40">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {a.areaName}
              </div>
              <div className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                {formatSpec(a)}
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <span
                className="mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-semibold"
                style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
              >
                {isVisual ? 'AI 선택' : 'AI 제안'}
              </span>

              {isVisual ? (
                <div className="flex flex-col gap-2">
                  {asset ? (
                    <div className="flex items-center gap-3">
                      {a.widthPx && a.heightPx ? (
                        <RatioBox
                          width={a.widthPx}
                          height={a.heightPx}
                          src={showImagePreview ? asset.dataUrl : undefined}
                          caption={asset.name}
                        />
                      ) : (
                        // 치수가 정해지지 않은 영역(예: 이미지 내 삽입 로고)도
                        // 어떤 소재가 선택됐는지는 보여 줘야 한다
                        <span
                          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-[13px]"
                          style={{
                            background: 'var(--accent-muted)',
                            border: '1px solid var(--border-strong)',
                            color: 'var(--text-primary)',
                          }}
                        >
                          <ImageIcon size={14} />
                          {asset.name}
                        </span>
                      )}
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 rounded-md px-3 py-4 text-sm"
                      style={{ background: 'var(--bg-surface)', color: 'var(--text-muted)' }}
                    >
                      <ImageIcon size={16} />
                      업로드된 비주얼이 없습니다
                    </div>
                  )}
                  {a.widthPx && a.heightPx && asset && (
                    <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      {asset.name} 기반 · {a.widthPx}×{a.heightPx} px 크롭 필요
                      {a.isTransparentBg ? ' · 투명배경 처리' : ''}
                    </div>
                  )}
                </div>
              ) : (
                <textarea
                  value={v.value}
                  onChange={(e) => onChange(a.displayOrder, e.target.value)}
                  rows={a.maxChars && a.maxChars > 40 ? 3 : 2}
                  placeholder={a.areaType === 'URL' ? 'https://' : '내용을 입력하세요'}
                  className="w-full resize-y rounded-md px-3 py-2 text-sm outline-none"
                  style={{
                    background: 'var(--bg-base)',
                    border: '1px solid var(--border)',
                    color: 'var(--text-primary)',
                  }}
                />
              )}

              {a.maxChars && (
                <div
                  className="mt-1 text-[11px]"
                  style={{ color: v.value.length > a.maxChars ? 'var(--danger)' : 'var(--text-muted)' }}
                >
                  {v.value.length} / {a.maxChars}자
                  {v.value.length > a.maxChars ? ' — 글자 수 초과' : ''}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {isVisual && meta.assets.subVisual && (
                  <button
                    type="button"
                    onClick={() => onUseSubVisual(a.displayOrder)}
                    className="rounded-md px-3 py-1.5 text-[13px]"
                    style={{
                      background: 'transparent',
                      border: '1px solid var(--border)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    서브 비주얼로 변경
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onConfirm(a.displayOrder)}
                  disabled={!canConfirm}
                  className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] font-medium disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    background: v.confirmed ? 'var(--success-muted)' : 'transparent',
                    border: `1px solid ${v.confirmed ? 'var(--success)' : 'var(--border)'}`,
                    color: v.confirmed ? 'var(--success)' : 'var(--text-secondary)',
                  }}
                >
                  <Check size={14} />
                  {v.confirmed ? '확정됨' : '확정'}
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
