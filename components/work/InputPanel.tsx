'use client';

import { useState } from 'react';
import { Check, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { formatSpec } from '@/lib/spec-db';
import type { AssetArea } from '@/lib/spec-db';
import { resolveAsset, type AreaValue, type CampaignMeta } from '@/lib/campaign';
import RatioBox from './RatioBox';

interface Props {
  areas: AssetArea[];
  values: Record<number, AreaValue>;
  meta: CampaignMeta;
  /** AI 문구 제안 호출 시 맥락으로 넘긴다 */
  mediaName: string;
  productName: string;
  onChange: (order: number, value: string) => void;
  onConfirm: (order: number) => void;
  onUseSubVisual: (order: number) => void;
}

/**
 * 캠페인마다 사용자가 채워야 하는 항목들.
 * 시작값은 캠페인 공통 소재를 근거로 제안하고, 사용자가 수정·확정한다.
 */
export default function InputPanel({
  areas,
  values,
  meta,
  mediaName,
  productName,
  onChange,
  onConfirm,
  onUseSubVisual,
}: Props) {
  const [pending, setPending] = useState<Record<number, boolean>>({});
  const [suggestErrors, setSuggestErrors] = useState<Record<number, string>>({});

  async function requestSuggestion(a: AssetArea) {
    setPending((p) => ({ ...p, [a.displayOrder]: true }));
    setSuggestErrors((e) => ({ ...e, [a.displayOrder]: '' }));
    try {
      const res = await fetch('/api/suggest-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: meta.brand,
          mainCopy: meta.mainCopy,
          mediaName,
          productName,
          areaName: a.areaName,
          specLabel: formatSpec(a),
          maxChars: a.maxChars,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'AI 제안에 실패했습니다.');
      onChange(a.displayOrder, body.suggestion);
    } catch (e) {
      setSuggestErrors((prev) => ({
        ...prev,
        [a.displayOrder]: e instanceof Error ? e.message : 'AI 제안에 실패했습니다.',
      }));
    } finally {
      setPending((p) => ({ ...p, [a.displayOrder]: false }));
    }
  }

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

        // 규칙 기반 제안(suggestInitial)이 못 채운 TEXT 필드에만 AI 제안 버튼을 보여준다.
        // "못 채웠다"는 비어 있는 경우뿐 아니라, 캠페인 메인 카피를 그대로 복사해 넣었더니
        // 이 필드의 글자수 제한을 넘어버린 경우도 포함한다 — 규칙이 답을 내놓긴 했지만
        // 그대로 못 쓰는 값이라 사실상 못 채운 것과 같다.
        const overLimit = !!a.maxChars && v.value.length > a.maxChars;
        const canSuggest = a.areaType === 'TEXT' && (!v.value.trim() || overLimit);

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

              {suggestErrors[a.displayOrder] && (
                <div className="mt-1 text-[11px]" style={{ color: 'var(--danger)' }}>
                  {suggestErrors[a.displayOrder]}
                </div>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {canSuggest && (
                  <button
                    type="button"
                    onClick={() => requestSuggestion(a)}
                    disabled={!!pending[a.displayOrder]}
                    className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] disabled:cursor-wait disabled:opacity-60"
                    style={{
                      background: 'var(--accent-muted)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                    }}
                  >
                    {pending[a.displayOrder] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    {pending[a.displayOrder] ? 'AI 생성 중…' : 'AI 제안 받기'}
                  </button>
                )}
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
