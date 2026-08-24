'use client';

import { useState } from 'react';
import { Check, Image as ImageIcon, Loader2, Sparkles } from 'lucide-react';
import { formatSpec, parseFixedOptions, closestOption } from '@/lib/spec-db';
import type { AssetArea } from '@/lib/spec-db';
import {
  areaSlotKeys,
  resolveAsset,
  selectableAssets,
  type AreaValue,
  type AssetRef,
  type CampaignMeta,
} from '@/lib/campaign';
import RatioBox from './RatioBox';

interface Props {
  areas: AssetArea[];
  values: Record<string, AreaValue>;
  meta: CampaignMeta;
  /** AI 문구 제안 호출 시 맥락으로 넘긴다 */
  mediaName: string;
  productName: string;
  onChange: (key: string, value: string) => void;
  onConfirm: (key: string) => void;
  onSelectAsset: (key: string, ref: AssetRef | undefined, label: string) => void;
}

const NO_ASSET = '__none__';

/**
 * 캠페인마다 사용자가 채워야 하는 항목들.
 * 시작값은 캠페인 공통 소재를 근거로 제안하고, 사용자가 수정·확정한다.
 */
export default function InputPanel({ areas, values, meta, mediaName, productName, onChange, onConfirm, onSelectAsset }: Props) {
  const [pending, setPending] = useState<Record<string, boolean>>({});
  const [suggestErrors, setSuggestErrors] = useState<Record<string, string>>({});

  async function requestSuggestion(a: AssetArea, key: string) {
    setPending((p) => ({ ...p, [key]: true }));
    setSuggestErrors((e) => ({ ...e, [key]: '' }));
    try {
      const res = await fetch('/api/suggest-copy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand: meta.brand,
          mainCopy: meta.mainCopy,
          ctaText: meta.ctaText,
          mediaName,
          productName,
          areaName: a.areaName,
          specLabel: formatSpec(a),
          maxChars: a.maxChars,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'AI 제안에 실패했습니다.');
      onChange(key, body.suggestion);
    } catch (e) {
      setSuggestErrors((prev) => ({ ...prev, [key]: e instanceof Error ? e.message : 'AI 제안에 실패했습니다.' }));
    } finally {
      setPending((p) => ({ ...p, [key]: false }));
    }
  }

  if (areas.length === 0) {
    return (
      <div className="px-4 py-5 text-sm" style={{ color: 'var(--text-muted)' }}>
        이 상품은 추가로 입력할 항목이 없습니다.
      </div>
    );
  }

  const assets = selectableAssets(meta);

  return (
    <div>
      {areas.flatMap((a) => {
        const keys = areaSlotKeys(a);
        const multi = keys.length > 1;

        return keys.map((key, slotIdx) => {
          const v = values[key] ?? { value: '', confirmed: false };
          const isVisual = a.areaType === 'IMAGE' || a.areaType === 'VIDEO';
          const asset = resolveAsset(meta, v.assetRef);
          const showImagePreview = a.areaType === 'IMAGE' && asset;
          const options = a.areaType === 'TEXT' ? parseFixedOptions(a.specLabel) : undefined;

          const canConfirm = isVisual ? !!asset : !!v.value.trim() && !(a.maxChars && v.value.length > a.maxChars);

          // 규칙 기반 제안(suggestInitial)이 못 채운 TEXT 필드에만 AI 제안 버튼을 보여준다.
          // "못 채웠다"는 비어 있는 경우뿐 아니라, 캠페인 메인 카피를 그대로 복사해 넣었더니
          // 이 필드의 글자수 제한을 넘어버린 경우도 포함한다. 고정 선택지가 있는 필드는
          // 자유 문구 생성 대상이 아니므로 제외한다.
          const overLimit = !!a.maxChars && v.value.length > a.maxChars;
          const canSuggest = a.areaType === 'TEXT' && !options && (!v.value.trim() || overLimit);

          // 상단 라벨 — 실제로 AI가 관여하는 필드에만 "AI 제안/AI 선택"이라고 표시한다.
          // URL·COLOR·고정선택지 필드에까지 이 라벨을 붙이면 AI가 관여하는 것처럼 오해를 준다.
          const badgeLabel = isVisual ? 'AI 선택' : a.areaType === 'TEXT' && !options ? 'AI 제안' : '직접 입력';

          return (
            <div
              key={key}
              className="flex flex-col gap-3 px-4 py-4 md:flex-row md:gap-6"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="w-full shrink-0 md:w-40">
                <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {a.areaName}
                  {multi ? ` #${slotIdx + 1}` : ''}
                </div>
                <div className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                  {formatSpec(a)}
                </div>
                {a.notes && (
                  <div className="mt-1 text-[11px] leading-relaxed" style={{ color: 'var(--warn)' }}>
                    {a.notes}
                  </div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <span
                  className="mb-2 inline-block rounded px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
                >
                  {badgeLabel}
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
                    <select
                      value={v.assetRef ?? NO_ASSET}
                      onChange={(e) => {
                        const ref = e.target.value === NO_ASSET ? undefined : e.target.value;
                        const label = assets.find((x) => x.ref === ref)?.label ?? '';
                        onSelectAsset(key, ref, label);
                      }}
                      className="mt-1 w-fit rounded-md px-2.5 py-1.5 text-[13px]"
                      style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    >
                      <option value={NO_ASSET}>선택 안 함 (직접 작업)</option>
                      {assets.map((x) => (
                        <option key={x.ref} value={x.ref}>
                          {x.label}
                        </option>
                      ))}
                    </select>
                  </div>
                ) : options ? (
                  <select
                    value={options.includes(v.value) ? v.value : closestOption(v.value, options)}
                    onChange={(e) => onChange(key, e.target.value)}
                    className="w-full rounded-md px-3 py-2 text-sm outline-none"
                    style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    {options.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                ) : (
                  <textarea
                    value={v.value}
                    onChange={(e) => onChange(key, e.target.value)}
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

                {suggestErrors[key] && (
                  <div className="mt-1 text-[11px]" style={{ color: 'var(--danger)' }}>
                    {suggestErrors[key]}
                  </div>
                )}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  {canSuggest && (
                    <button
                      type="button"
                      onClick={() => requestSuggestion(a, key)}
                      disabled={!!pending[key]}
                      className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-[13px] disabled:cursor-wait disabled:opacity-60"
                      style={{
                        background: 'var(--accent-muted)',
                        border: '1px solid var(--accent)',
                        color: 'var(--accent)',
                      }}
                    >
                      {pending[key] ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      {pending[key] ? 'AI 생성 중…' : 'AI 제안 받기'}
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onConfirm(key)}
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
        });
      })}
    </div>
  );
}
