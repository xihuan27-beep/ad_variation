'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Download,
  FileSpreadsheet,
  Loader2,
  Plus,
  Upload,
  AlertTriangle,
  X,
} from 'lucide-react';

import {
  fixedSpecAreas,
  userInputAreas,
  matchSpec,
  findSpecDiscrepancies,
  hasPsdRequirement,
  LOW_CONFIDENCE_SCORE,
} from '@/lib/spec-db';
import { extractSpecTokens } from '@/lib/spec-extract';
import { parseMediaPlan, type MediaPlanRow } from '@/lib/media-plan';
import { resolveDeadline } from '@/lib/business-days';
import {
  areaSlotKeys,
  isItemComplete,
  progressOf,
  resolveAsset,
  selectableAssets,
  suggestedAssetFor,
  suggestInitial,
  type AreaValue,
  type AssetRef,
  type CampaignMeta,
  type VisualAsset,
  type WorkItem,
} from '@/lib/campaign';
import SpecTable from '@/components/work/SpecTable';
import InputPanel from '@/components/work/InputPanel';
import MockupPreview from '@/components/work/MockupPreview';

type Screen = 'upload' | 'work' | 'review';

const INITIAL_META: CampaignMeta = {
  brand: 'Diageo JW Blue',
  mainCopy: 'Keep Walking. 더 나아가라',
  landingUrl: '',
  brandColor: '',
  ctaText: '',
  assets: { visuals: [] },
};

function AiDisclaimer() {
  return (
    <div
      className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-[12.5px]"
      style={{ background: 'var(--warn-muted)', color: 'var(--warn)', border: '1px solid var(--warn)' }}
    >
      <AlertTriangle size={14} className="shrink-0" />
      AI는 실수할 수 있습니다. 반드시 검토하십시오.
    </div>
  );
}

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error ?? new Error('파일을 읽지 못했습니다'));
    reader.readAsDataURL(file);
  });
}

/** 엑셀에서 읽은 집행 건을 마스터 DB에 연결해 작업 항목으로 만든다 */
function buildItems(rows: MediaPlanRow[], meta: CampaignMeta): WorkItem[] {
  return rows.map((row) => {
    const match = matchSpec(row.mediaName, row.productName, row.unit, row.rawText);
    const entry = match?.entry ?? null;
    const values: WorkItem['values'] = {};

    if (entry) {
      for (const area of userInputAreas(entry)) {
        const initial = suggestInitial(area, meta);
        for (const key of areaSlotKeys(area)) {
          values[key] = { ...initial, confirmed: false };
        }
      }
    }

    return {
      rawMediaName: row.mediaName,
      rawProductName: row.productName,
      entry,
      matchScore: match?.score ?? 0,
      matchedBy: match?.matchedBy,
      // 매칭은 됐어도 엑셀에 적힌 규격 숫자가 DB와 다를 수 있다 — 매체명/상품명이
      // 이름으로는 맞는데 실제 규격이 개정된 경우를 잡아낸다.
      specDiscrepancies: entry ? findSpecDiscrepancies(entry, extractSpecTokens(row.rawText)) : undefined,
      deadline: row.assetDeadline,
      liveSchedule: row.liveSchedule,
      excelRow: row.excelRow,
      values,
      done: false,
    };
  });
}

/** 눈에 띄는 마감일 배지 — deadline 이 "N영업일 전" 상대 표현이면 라이브 일정 기준 실제 날짜로 계산해 보여준다 */
function DeadlineBadge({ deadline, liveSchedule }: { deadline?: string; liveSchedule?: string }) {
  if (!deadline) return null;
  const resolved = resolveDeadline(deadline, liveSchedule);
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[12px] font-semibold"
      style={{ background: 'var(--danger-muted)', color: 'var(--danger)', border: '1px solid var(--danger)' }}
      title={resolved.computed ? `엑셀 원문: ${deadline}` : undefined}
    >
      <AlertTriangle size={12} />
      소재 전달 기한 {resolved.display}
    </span>
  );
}

export default function DashboardPage() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [meta, setMeta] = useState<CampaignMeta>(INITIAL_META);
  const [rows, setRows] = useState<MediaPlanRow[]>([]);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  // "집행 예시" 미리보기에서만 쓰는 소재 오버라이드 — 자동 추천(suggestedAssetFor)이
  // 틀렸을 때(예: 로고만 있는 걸로 오인) 사용자가 직접 바꿀 수 있게 한다. 확정값이
  // 아니라 미리보기 전용이라 WorkItem.values 와는 별도로 둔다. key: `${activeIdx}:${displayOrder}`.
  const [previewOverrides, setPreviewOverrides] = useState<Record<string, AssetRef | ''>>({});
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);
  const [pptError, setPptError] = useState<string | null>(null);
  const [downloadingPpt, setDownloadingPpt] = useState(false);

  const active = items[activeIdx];
  const progress = useMemo(() => progressOf(items), [items]);
  const isLast = activeIdx >= items.length - 1;

  const updateMeta = useCallback(<K extends keyof CampaignMeta>(key: K, value: CampaignMeta[K]) => {
    setMeta((m) => ({ ...m, [key]: value }));
  }, []);

  const addVisual = useCallback(async (file: File) => {
    try {
      const dataUrl = await readAsDataUrl(file);
      const asset: VisualAsset = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name: file.name, dataUrl };
      setMeta((m) => ({ ...m, assets: { ...m.assets, visuals: [...m.assets.visuals, asset] } }));
    } catch (e) {
      setParseError(`소재 파일을 읽지 못했습니다: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const removeVisual = useCallback((id: string) => {
    setMeta((m) => ({ ...m, assets: { ...m.assets, visuals: m.assets.visuals.filter((v) => v.id !== id) } }));
  }, []);

  const uploadLogo = useCallback(async (file: File) => {
    try {
      const dataUrl = await readAsDataUrl(file);
      setMeta((m) => ({ ...m, assets: { ...m.assets, logo: { name: file.name, dataUrl } } }));
    } catch (e) {
      setParseError(`소재 파일을 읽지 못했습니다: ${e instanceof Error ? e.message : String(e)}`);
    }
  }, []);

  const downloadPpt = useCallback(async () => {
    setDownloadingPpt(true);
    setPptError(null);
    try {
      const res = await fetch('/api/generate-ppt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meta, items }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.error ?? 'PPT 생성에 실패했습니다.');

      const bytes = Uint8Array.from(atob(body.pptBase64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], {
        type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${meta.brand || '소재가이드'}_제작가이드.pptx`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      setPptError(e instanceof Error ? e.message : 'PPT 생성 중 오류가 발생했습니다.');
    } finally {
      setDownloadingPpt(false);
    }
  }, [meta, items]);

  const handleFile = useCallback(async (file: File) => {
    setParsing(true);
    setParseError(null);
    try {
      const parsed = parseMediaPlan(await file.arrayBuffer());
      if (parsed.length === 0) {
        setParseError(
          '집행 매체 목록을 찾지 못했습니다. 매체·상품 열이 있는 시트가 포함된 기획 엑셀인지 확인해 주세요.'
        );
        return;
      }
      setMeta((m) => ({ ...m, fileName: file.name }));
      setRows(parsed);
    } catch (e) {
      setParseError(`엑셀을 읽지 못했습니다: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setParsing(false);
    }
  }, []);

  // 엑셀 파싱과 소재 업로드가 모두 끝난 뒤 사용자가 직접 눌러야 다음 화면으로 넘어간다 —
  // 엑셀을 올리자마자 자동으로 넘어가면 비주얼·로고를 올릴 틈이 없었다.
  const canProceed = rows.length > 0 && meta.assets.visuals.length > 0;
  const proceedToWork = useCallback(() => {
    setItems(buildItems(rows, meta));
    setActiveIdx(0);
    setScreen('work');
  }, [rows, meta]);

  const updateActive = useCallback(
    (fn: (item: WorkItem) => WorkItem) => {
      setItems((prev) => prev.map((it, i) => (i === activeIdx ? fn(it) : it)));
    },
    [activeIdx]
  );

  const handleChange = useCallback(
    (key: string, value: string) => {
      updateActive((it) => ({
        ...it,
        // 값을 고치면 확정을 풀어 다시 확인하게 한다
        values: { ...it.values, [key]: { ...it.values[key], value, confirmed: false } },
      }));
    },
    [updateActive]
  );

  const handleConfirm = useCallback(
    (key: string) => {
      updateActive((it) => {
        const cur = it.values[key];
        if (!cur) return it;
        const values = { ...it.values, [key]: { ...cur, confirmed: !cur.confirmed } };
        const next = { ...it, values };
        return { ...next, done: isItemComplete(next) };
      });
    },
    [updateActive]
  );

  const handleSelectAsset = useCallback(
    (key: string, ref: AssetRef | undefined, label: string) => {
      updateActive((it) => ({
        ...it,
        values: { ...it.values, [key]: { value: label, assetRef: ref, confirmed: false } },
      }));
    },
    [updateActive]
  );

  const goNext = useCallback(() => {
    if (isLast) {
      setScreen('review');
      return;
    }
    setActiveIdx((i) => i + 1);
  }, [isLast]);

  // ── 화면 1: 업로드 ──
  if (screen === 'upload') {
    return (
      <main className="flex min-h-screen items-center justify-center p-6" style={{ background: 'var(--bg-base)' }}>
        <div
          className="w-full max-w-xl rounded-xl p-8"
          style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
        >
          <div className="mb-5">
            <AiDisclaimer />
          </div>

          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            상세 소재 가이드 생성
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            매체 기획 엑셀과 캠페인 소재를 올리면, 매체별 제작 가이드를 만들어 드립니다.
          </p>

          {/* 캠페인 공통 정보 */}
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                브랜드명
              </span>
              <input
                value={meta.brand}
                onChange={(e) => updateMeta('brand', e.target.value)}
                className="rounded-md px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                광고주 컬러
              </span>
              <input
                value={meta.brandColor ?? ''}
                onChange={(e) => updateMeta('brandColor', e.target.value)}
                placeholder="#000000"
                className="rounded-md px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </label>
            <label className="flex flex-col gap-1 sm:col-span-2">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                메인 카피(키카피)
              </span>
              <input
                value={meta.mainCopy}
                onChange={(e) => updateMeta('mainCopy', e.target.value)}
                className="rounded-md px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                랜딩 페이지 URL
              </span>
              <input
                value={meta.landingUrl ?? ''}
                onChange={(e) => updateMeta('landingUrl', e.target.value)}
                placeholder="https://"
                className="rounded-md px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                CTA 버튼 텍스트
              </span>
              <input
                value={meta.ctaText ?? ''}
                onChange={(e) => updateMeta('ctaText', e.target.value)}
                placeholder="예: 더 알아보기"
                className="rounded-md px-3 py-2 text-sm outline-none"
                style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
              />
            </label>
          </div>

          <label
            className="mt-6 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-4"
            style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)' }}
          >
            <input
              type="file"
              accept=".xlsx,.xls,.xlsm"
              className="hidden"
              disabled={parsing}
              onChange={(e) => {
                const f = e.target.files?.[0];
                // 같은 파일을 다시 고를 수 있도록 값을 비운다
                e.target.value = '';
                if (f) void handleFile(f);
              }}
            />
            <FileSpreadsheet size={20} style={{ color: 'var(--accent)' }} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                {parsing ? '엑셀을 읽는 중…' : '매체 기획 엑셀'}
              </div>
              <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {meta.fileName ?? '집행 매체·상품·소재 전달 기한을 읽어옵니다'}
              </div>
            </div>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-semibold"
              style={{
                background: rows.length > 0 ? 'var(--success-muted)' : 'var(--danger-muted)',
                color: rows.length > 0 ? 'var(--success)' : 'var(--danger)',
              }}
            >
              {rows.length > 0 ? `${rows.length}건 읽음` : '필수'}
            </span>
          </label>

          {parseError && (
            <div
              className="mt-3 flex items-start gap-2 rounded-lg px-4 py-3 text-[13px]"
              style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
            >
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{parseError}</span>
            </div>
          )}

          {/* 비주얼 여러 장 업로드 */}
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[12px] font-medium" style={{ color: 'var(--text-secondary)' }}>
                비주얼 소재 {meta.assets.visuals.length === 0 && <span style={{ color: 'var(--danger)' }}>· 최소 1개 필수</span>}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {meta.assets.visuals.map((v) => (
                <div
                  key={v.id}
                  className="relative flex flex-col items-center gap-1 rounded-lg px-2 py-3"
                  style={{ background: 'var(--bg-surface)', border: '1px solid var(--success)' }}
                >
                  <button
                    type="button"
                    onClick={() => removeVisual(v.id)}
                    className="absolute right-1 top-1 rounded-full p-0.5"
                    style={{ background: 'var(--bg-elevated)', color: 'var(--text-muted)' }}
                    aria-label="비주얼 삭제"
                  >
                    <X size={12} />
                  </button>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL 미리보기 */}
                  <img src={v.dataUrl} alt={v.name} className="h-10 w-10 rounded object-cover" />
                  <div className="max-w-full truncate text-[11px]" style={{ color: 'var(--text-primary)' }} title={v.name}>
                    {v.name}
                  </div>
                </div>
              ))}
              <label
                className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-lg px-2 py-3"
                style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)' }}
              >
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    e.target.value = '';
                    if (f) void addVisual(f);
                  }}
                />
                <Plus size={16} style={{ color: 'var(--accent)' }} />
                <div className="text-[11px]" style={{ color: 'var(--accent)' }}>
                  비주얼 추가
                </div>
              </label>
            </div>
          </div>

          {/* 로고 */}
          <label
            className="mt-3 flex cursor-pointer items-center gap-3 rounded-lg px-4 py-3"
            style={{ background: 'var(--bg-surface)', border: `1px dashed ${meta.assets.logo ? 'var(--success)' : 'var(--border-strong)'}` }}
          >
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) void uploadLogo(f);
              }}
            />
            {meta.assets.logo ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL 미리보기
              <img src={meta.assets.logo.dataUrl} alt={meta.assets.logo.name} className="h-8 w-8 rounded object-cover" />
            ) : (
              <Upload size={16} style={{ color: 'var(--text-muted)' }} />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                브랜드 로고
              </div>
              <div className="truncate text-[12px]" style={{ color: 'var(--text-muted)' }}>
                {meta.assets.logo?.name ?? '선택 — 없으면 로고 영역은 직접 채워야 합니다'}
              </div>
            </div>
          </label>

          <button
            type="button"
            onClick={proceedToWork}
            disabled={!canProceed}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ background: 'var(--accent)', color: '#fff' }}
          >
            {items.length > 0 ? '작업 화면으로 돌아가기' : '다음 단계로'}
            <ArrowRight size={16} />
          </button>
          {!canProceed && (
            <p className="mt-2 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
              엑셀 업로드와 비주얼 소재(최소 1개)를 모두 마쳐야 다음으로 넘어갈 수 있습니다.
            </p>
          )}

          <Link href="/" className="mt-3 block text-center text-[13px]" style={{ color: 'var(--text-muted)' }}>
            홈으로
          </Link>
        </div>
      </main>
    );
  }

  // ── 화면 3: 최종 검토 ──
  if (screen === 'review') {
    return (
      <main className="min-h-screen p-6" style={{ background: 'var(--bg-base)' }}>
        <div className="mx-auto max-w-4xl">
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            최종 검토
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            업로드한 엑셀의 매체와 대조해 빠진 항목이 없는지 확인합니다.
          </p>

          <div
            className="mt-6 overflow-hidden rounded-xl"
            style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
          >
            {items.map((it, i) => {
              const complete = isItemComplete(it);
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 px-5 py-4"
                  style={{ borderBottom: '1px solid var(--border-subtle)' }}
                >
                  <span
                    style={{
                      color:
                        it.specDiscrepancies && it.specDiscrepancies.length > 0
                          ? 'var(--danger)'
                          : complete
                            ? 'var(--success)'
                            : 'var(--warn)',
                    }}
                  >
                    {complete ? <Check size={18} /> : <AlertTriangle size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {it.rawProductName || it.rawMediaName}
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      <span>{it.rawMediaName}</span>
                      {it.deadline && <DeadlineBadge deadline={it.deadline} liveSchedule={it.liveSchedule} />}
                      <span>
                        {it.entry
                          ? `적용 규격 ${it.entry.productName}${it.matchedBy === 'spec' ? ' (이름이 아닌 규격으로 찾음)' : ''}`
                          : 'DB에서 매칭되는 상품을 찾지 못했습니다'}
                      </span>
                    </div>
                    {it.specDiscrepancies && it.specDiscrepancies.length > 0 && (
                      <div className="mt-0.5 text-[12px]" style={{ color: 'var(--danger)' }}>
                        ⚠ 규격 불일치 — {it.specDiscrepancies.map((d) => d.fieldLabel).join(', ')} 확인 필요
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveIdx(i);
                      setScreen('work');
                    }}
                    className="rounded-md px-3 py-1.5 text-[13px]"
                    style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                  >
                    해당 매체로 이동
                  </button>
                </div>
              );
            })}
          </div>

          {pptError && (
            <div
              className="mt-4 flex items-start gap-2 rounded-lg px-4 py-3 text-[13px]"
              style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
            >
              <AlertTriangle size={15} className="mt-0.5 shrink-0" />
              <span>{pptError}</span>
            </div>
          )}

          <div className="mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setScreen('work')}
              className="flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={16} />
              작업 화면으로
            </button>
            <button
              type="button"
              onClick={downloadPpt}
              disabled={downloadingPpt}
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold disabled:opacity-60"
              style={{ background: 'var(--success)', color: '#04231A' }}
            >
              {downloadingPpt ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
              {downloadingPpt ? '생성 중…' : 'PPT 다운로드'}
            </button>
          </div>

          <div className="mt-6">
            <AiDisclaimer />
          </div>
        </div>
      </main>
    );
  }

  // ── 화면 2: 작업 (3-column) ──
  return (
    <main className="fixed inset-0 flex flex-col overflow-hidden" style={{ background: 'var(--bg-base)' }}>
      {/* 상단바 */}
      <header
        className="flex h-[50px] shrink-0 items-center gap-4 px-5"
        style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border-subtle)' }}
      >
        <span className="text-[13px] font-semibold" style={{ color: 'var(--text-primary)' }}>
          {meta.brand}
        </span>
        <span className="truncate text-[12px]" style={{ color: 'var(--text-secondary)' }}>
          {meta.mainCopy}
        </span>
        <div className="flex-1" />
        <div className="h-[3px] w-20 overflow-hidden rounded-full" style={{ background: 'var(--bg-elevated)' }}>
          <div className="h-full rounded-full" style={{ width: `${progress.pct}%`, background: 'var(--accent)' }} />
        </div>
        <span className="whitespace-nowrap text-[11px]" style={{ color: 'var(--text-secondary)' }}>
          {progress.done} / {progress.total} 완료
        </span>
        <button
          type="button"
          onClick={() => setScreen('upload')}
          className="rounded-md px-3 py-1.5 text-[12px]"
          style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
        >
          ← 홈
        </button>
      </header>

      <div className="flex min-h-0 flex-1 overflow-hidden">
        {/* 1번 컬럼: 매체 리스트 */}
        <aside
          className="flex w-[248px] shrink-0 flex-col overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
        >
          <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
              집행 매체
            </div>
            <div className="text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              {items.length}개 매체
            </div>
          </div>
          <nav className="min-h-0 flex-1 overflow-y-auto p-2">
            {items.map((it, i) => {
              const isActive = i === activeIdx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  className="mb-1 flex w-full items-center gap-2.5 rounded-md px-3 py-2.5 text-left"
                  style={{ background: isActive ? 'var(--accent-muted)' : 'transparent' }}
                >
                  <span
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[11px]"
                    style={{
                      background: it.done ? 'var(--success-muted)' : 'transparent',
                      border: it.done ? 'none' : '1.5px solid var(--border-strong)',
                      color: it.done ? 'var(--success)' : 'var(--text-muted)',
                    }}
                  >
                    {it.done ? '✓' : i + 1}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span
                      className="block truncate text-[13px]"
                      style={{
                        color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                        fontWeight: isActive ? 600 : 400,
                      }}
                    >
                      {/* 엑셀에 적힌 이름으로 보여줘야 담당자가 자기 기획안과 대조할 수 있다.
                          매칭된 DB 상품명을 쓰면 서로 다른 행이 같은 이름으로 겹쳐 구분되지 않는다. */}
                      {it.rawProductName || it.rawMediaName}
                    </span>
                    <span className="block truncate text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {it.rawMediaName}
                    </span>
                  </span>
                  {!it.entry && (
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
                    >
                      미매칭
                    </span>
                  )}
                  {it.entry && it.specDiscrepancies && it.specDiscrepancies.length > 0 && (
                    <span
                      className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold"
                      style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
                      title="엑셀에 적힌 규격이 DB와 다릅니다"
                    >
                      규격 불일치
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        {/* 2번 컬럼: 집행 예시 */}
        <aside
          className="flex w-[296px] shrink-0 flex-col overflow-hidden"
          style={{ background: 'var(--bg-surface)', borderRight: '1px solid var(--border-subtle)' }}
        >
          <div className="shrink-0 px-4 py-3" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            <span
              className="rounded px-2 py-0.5 text-[11px] font-semibold"
              style={{ background: 'var(--success-muted)', color: 'var(--success)' }}
            >
              집행 예시
            </span>
          </div>
          <div className="flex min-h-0 flex-1 flex-col gap-3.5 overflow-y-auto p-3.5">
            {active?.entry &&
              fixedSpecAreas(active.entry)
                .filter((a) => (a.widthPx && a.heightPx) || a.ratio)
                .map((a) => {
                  const overrideKey = `${activeIdx}:${a.displayOrder}`;
                  const override = previewOverrides[overrideKey];
                  const asset = override ? resolveAsset(meta, override) : suggestedAssetFor(a, meta);
                  const assets = selectableAssets(meta);
                  return (
                    <div
                      key={a.displayOrder}
                      className="shrink-0 rounded-lg p-3"
                      style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                    >
                      <div className="mb-2 text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                        {a.areaName}
                      </div>
                      <MockupPreview
                        width={a.widthPx}
                        height={a.heightPx}
                        ratioLabel={a.ratio}
                        src={a.areaType === 'IMAGE' ? asset?.dataUrl : undefined}
                        brand={meta.brand}
                        mainCopy={meta.mainCopy}
                        ctaText={meta.ctaText}
                      />
                      {a.areaType === 'IMAGE' && assets.length > 0 && (
                        <select
                          value={override ?? ''}
                          onChange={(e) =>
                            setPreviewOverrides((p) => ({ ...p, [overrideKey]: e.target.value as AssetRef }))
                          }
                          className="mt-2 w-full rounded-md px-2 py-1 text-[11px]"
                          style={{ background: 'var(--bg-base)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
                        >
                          <option value="">자동 추천{asset ? ` (${asset.name})` : ''}</option>
                          {assets.map((x) => (
                            <option key={x.ref} value={x.ref}>
                              이미지 변경: {x.label}
                            </option>
                          ))}
                        </select>
                      )}
                      {!asset && a.areaType === 'IMAGE' && (
                        <p className="mt-1.5 text-[11px]" style={{ color: 'var(--text-muted)' }}>
                          업로드된 소재를 이 비율로 크롭한 미리보기입니다 — 소재를 올리면 표시됩니다
                        </p>
                      )}
                    </div>
                  );
                })}
            {active?.entry && (
              <p className="shrink-0 text-[12px] leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {active.entry.mediaName} · {active.entry.productName} 지면에 노출됩니다.
              </p>
            )}
          </div>
        </aside>

        {/* 3번 컬럼: 선택·입력 항목 */}
        <section className="grid min-h-0 min-w-0 flex-1 grid-rows-[auto_1fr_auto] overflow-hidden">
          <div className="px-6 py-3.5" style={{ borderBottom: '1px solid var(--border-subtle)' }}>
            {/* 제목은 엑셀 표기 — 담당자가 기획안에서 찾는 이름이다 */}
            <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
              {active?.rawProductName || active?.rawMediaName}
            </h2>
            <div className="mt-1.5 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <span>
                {active?.rawMediaName}
                {active?.liveSchedule ? ` · 라이브 ${active.liveSchedule}` : ''}
              </span>
              {active?.deadline && <DeadlineBadge deadline={active.deadline} liveSchedule={active.liveSchedule} />}
              {active?.entry && (
                // 어떤 DB 규격이 적용됐는지 밝힌다 — 엑셀 표기와 다를 수 있다
                <span
                  className="rounded px-2 py-0.5 text-[11px]"
                  style={{ background: 'var(--bg-elevated)', color: 'var(--text-secondary)' }}
                  title={`${active.entry.mediaName} / ${active.entry.productName}`}
                >
                  적용 규격: {active.entry.productName}
                </span>
              )}
              {active?.entry && active.matchedBy === 'spec' && (
                <span
                  className="rounded px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                  title="엑셀 상품명이 DB와 달라 이름 대신 규격(크기·용량 등) 숫자로 찾았습니다. 매체 자체가 맞는지 한 번 확인해 주세요."
                >
                  규격 일치로 자동 연결됨
                </span>
              )}
              {active?.entry && !active.matchedBy && active.matchScore < LOW_CONFIDENCE_SCORE && (
                <span
                  className="rounded px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
                  title={`엑셀 표기 "${active.rawMediaName} ${active.rawProductName}" 로 찾은 결과입니다`}
                >
                  상품 매칭 확인 필요
                </span>
              )}
              {active?.entry && hasPsdRequirement(active.entry) && (
                <span
                  className="rounded px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
                  title="이 상품은 매체사가 제공하는 PSD 템플릿을 기준으로 제작해야 합니다"
                >
                  ⚠ PSD 템플릿 참고 필요
                </span>
              )}
            </div>
          </div>

          {/* 스크롤 영역 — 자식 카드는 flex-shrink:0 이어야 눌리지 않고 스크롤된다 */}
          <div className="flex min-h-0 flex-col gap-4 overflow-y-auto p-5">
            {!active?.entry ? (
              <div
                className="shrink-0 rounded-lg p-5 text-sm"
                style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
              >
                이 매체는 마스터 DB에서 매칭되는 상품을 찾지 못했습니다. 매체명과 상품명을 확인해 주세요.
              </div>
            ) : (
              <>
                {active.specDiscrepancies && active.specDiscrepancies.length > 0 && (
                  <div
                    className="shrink-0 rounded-lg p-4 text-[13px]"
                    style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
                  >
                    <p className="font-semibold">
                      엑셀에 적힌 규격이 DB와 다릅니다 — 매체사 규격이 바뀌었을 수 있습니다
                    </p>
                    <ul className="mt-1.5 space-y-0.5">
                      {active.specDiscrepancies.map((d) => (
                        <li key={d.field}>
                          · {d.fieldLabel}: 엑셀 {d.excelValue} / DB {d.dbValue}
                        </li>
                      ))}
                    </ul>
                    <p className="mt-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
                      최신 매체사 제작 가이드를 다시 확인해, 필요하면 DB 값을 갱신해 주세요.
                    </p>
                  </div>
                )}
                <section
                  className="shrink-0 overflow-hidden rounded-lg"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="flex items-center gap-2.5 px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                  >
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: 'var(--accent-muted)', color: 'var(--accent)' }}
                    >
                      제작 스펙
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      DB 기준 고정 규격
                    </span>
                  </div>
                  <SpecTable areas={fixedSpecAreas(active.entry)} />
                </section>

                <section
                  className="shrink-0 overflow-hidden rounded-lg"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                >
                  <div
                    className="flex items-center gap-2.5 px-4 py-3"
                    style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-surface)' }}
                  >
                    <span
                      className="rounded px-2 py-0.5 text-[11px] font-semibold"
                      style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
                    >
                      선택·입력
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      선택 및 입력 항목
                    </span>
                  </div>
                  <InputPanel
                    areas={userInputAreas(active.entry)}
                    values={active.values}
                    meta={meta}
                    mediaName={active.entry.mediaName}
                    productName={active.entry.productName}
                    onChange={handleChange}
                    onConfirm={handleConfirm}
                    onSelectAsset={handleSelectAsset}
                  />
                </section>
              </>
            )}
          </div>

          <div
            className="flex items-center justify-between px-6 py-3.5"
            style={{ borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-surface)' }}
          >
            <button
              type="button"
              onClick={() => setActiveIdx((i) => Math.max(0, i - 1))}
              disabled={activeIdx === 0}
              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm disabled:opacity-30"
              style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }}
            >
              <ArrowLeft size={15} />
              이전 매체
            </button>
            <button
              type="button"
              onClick={goNext}
              className="flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold"
              style={{
                background: isLast ? 'var(--success)' : 'var(--accent)',
                color: isLast ? '#04231A' : '#fff',
              }}
            >
              {isLast ? (
                <>
                  <Download size={15} />
                  PPT 다운로드
                </>
              ) : (
                <>
                  다음 매체
                  <ArrowRight size={15} />
                </>
              )}
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
