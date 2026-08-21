'use client';

import { useCallback, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Check, Download, FileSpreadsheet, Upload, AlertTriangle } from 'lucide-react';

import { fixedSpecAreas, userInputAreas, matchSpec, LOW_CONFIDENCE_SCORE } from '@/lib/spec-db';
import { parseMediaPlan, type MediaPlanRow } from '@/lib/media-plan';
import {
  isItemComplete,
  progressOf,
  suggestValue,
  type CampaignMeta,
  type WorkItem,
} from '@/lib/campaign';
import SpecTable from '@/components/work/SpecTable';
import InputPanel from '@/components/work/InputPanel';

type Screen = 'upload' | 'work' | 'review';

const INITIAL_META: CampaignMeta = {
  brand: 'Diageo JW Blue',
  mainCopy: 'Keep Walking. 더 나아가라',
  assets: { mainVisual: '메인 비주얼', subVisual: '2nd 비주얼', logo: 'JW 로고' },
};

/** 엑셀에서 읽은 집행 건을 마스터 DB에 연결해 작업 항목으로 만든다 */
function buildItems(rows: MediaPlanRow[], meta: CampaignMeta): WorkItem[] {
  return rows.map((row) => {
    const match = matchSpec(row.mediaName, row.productName);
    const entry = match?.entry ?? null;
    const values: WorkItem['values'] = {};

    if (entry) {
      for (const area of userInputAreas(entry)) {
        values[area.displayOrder] = { value: suggestValue(area, meta), confirmed: false };
      }
    }

    return {
      rawMediaName: row.mediaName,
      rawProductName: row.productName,
      entry,
      matchScore: match?.score ?? 0,
      deadline: row.assetDeadline,
      liveSchedule: row.liveSchedule,
      excelRow: row.excelRow,
      values,
      done: false,
    };
  });
}

export default function DashboardPage() {
  const [screen, setScreen] = useState<Screen>('upload');
  const [meta, setMeta] = useState<CampaignMeta>(INITIAL_META);
  const [items, setItems] = useState<WorkItem[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsing, setParsing] = useState(false);

  const active = items[activeIdx];
  const progress = useMemo(() => progressOf(items), [items]);
  const isLast = activeIdx >= items.length - 1;

  const handleFile = useCallback(
    async (file: File) => {
      setParsing(true);
      setParseError(null);
      try {
        const rows = parseMediaPlan(await file.arrayBuffer());
        if (rows.length === 0) {
          setParseError(
            '집행 매체 목록을 찾지 못했습니다. 매체·상품 열이 있는 시트가 포함된 기획 엑셀인지 확인해 주세요.'
          );
          return;
        }
        setMeta((m) => ({ ...m, fileName: file.name }));
        setItems(buildItems(rows, meta));
        setActiveIdx(0);
        setScreen('work');
      } catch (e) {
        setParseError(`엑셀을 읽지 못했습니다: ${e instanceof Error ? e.message : String(e)}`);
      } finally {
        setParsing(false);
      }
    },
    [meta]
  );

  const updateActive = useCallback(
    (fn: (item: WorkItem) => WorkItem) => {
      setItems((prev) => prev.map((it, i) => (i === activeIdx ? fn(it) : it)));
    },
    [activeIdx]
  );

  const handleChange = useCallback(
    (order: number, value: string) => {
      updateActive((it) => ({
        ...it,
        // 값을 고치면 확정을 풀어 다시 확인하게 한다
        values: { ...it.values, [order]: { value, confirmed: false } },
      }));
    },
    [updateActive]
  );

  const handleConfirm = useCallback(
    (order: number) => {
      updateActive((it) => {
        const cur = it.values[order];
        if (!cur) return it;
        const values = { ...it.values, [order]: { ...cur, confirmed: !cur.confirmed } };
        const next = { ...it, values };
        return { ...next, done: isItemComplete(next) };
      });
    },
    [updateActive]
  );

  const handleUseSubVisual = useCallback(
    (order: number) => {
      const sub = meta.assets.subVisual;
      if (!sub) return;
      updateActive((it) => ({
        ...it,
        values: { ...it.values, [order]: { value: sub, confirmed: false } },
      }));
    },
    [meta.assets.subVisual, updateActive]
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
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
            상세 소재 가이드 생성
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
            매체 기획 엑셀과 캠페인 소재를 올리면, 매체별 제작 가이드를 만들어 드립니다.
          </p>

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
              style={{ background: 'var(--danger-muted)', color: 'var(--danger)' }}
            >
              필수
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

          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: '메인 비주얼', required: true },
              { label: '2nd 비주얼', required: false },
              { label: '브랜드 로고', required: false },
            ].map((a) => (
              <div
                key={a.label}
                className="flex flex-col items-center gap-1.5 rounded-lg px-3 py-4"
                style={{ background: 'var(--bg-surface)', border: '1px dashed var(--border-strong)' }}
              >
                <Upload size={16} style={{ color: 'var(--text-muted)' }} />
                <div className="text-[13px]" style={{ color: 'var(--text-primary)' }}>
                  {a.label}
                </div>
                <div className="text-[11px]" style={{ color: a.required ? 'var(--danger)' : 'var(--text-muted)' }}>
                  {a.required ? '필수' : '선택'}
                </div>
              </div>
            ))}
          </div>

          <p className="mt-6 text-center text-[12px]" style={{ color: 'var(--text-muted)' }}>
            엑셀을 선택하면 매체별 가이드 생성이 시작됩니다.
          </p>

          {items.length > 0 && (
            <button
              type="button"
              onClick={() => setScreen('work')}
              className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold"
              style={{ background: 'var(--accent)', color: '#fff' }}
            >
              작업 화면으로 돌아가기
              <ArrowRight size={16} />
            </button>
          )}

          <Link
            href="/"
            className="mt-3 block text-center text-[13px]"
            style={{ color: 'var(--text-muted)' }}
          >
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
                  <span style={{ color: complete ? 'var(--success)' : 'var(--warn)' }}>
                    {complete ? <Check size={18} /> : <AlertTriangle size={18} />}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                      {it.rawProductName || it.rawMediaName}
                    </div>
                    <div className="text-[12px]" style={{ color: 'var(--text-muted)' }}>
                      {it.rawMediaName}
                      {it.deadline ? ` · ${it.deadline}` : ''}
                      {it.entry ? ` · 적용 규격 ${it.entry.productName}` : ' · DB에서 매칭되는 상품을 찾지 못했습니다'}
                    </div>
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
              className="flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold"
              style={{ background: 'var(--success)', color: '#04231A' }}
            >
              <Download size={16} />
              PPT 다운로드
            </button>
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
                      {it.deadline ? ` · ${it.deadline}` : ''}
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
                .filter((a) => a.widthPx && a.heightPx)
                .map((a) => (
                  <div
                    key={a.displayOrder}
                    className="shrink-0 rounded-lg p-3"
                    style={{ background: 'var(--bg-card)', border: '1px solid var(--border)' }}
                  >
                    <div className="mb-2 text-[12px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      {a.areaName}
                    </div>
                    <RatioPreview width={a.widthPx!} height={a.heightPx!} />
                  </div>
                ))}
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
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
              <span>
                {active?.rawMediaName}
                {active?.deadline ? ` · 소재 전달 기한 ${active.deadline}` : ''}
                {active?.liveSchedule ? ` · 라이브 ${active.liveSchedule}` : ''}
              </span>
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
              {active?.entry && active.matchScore < LOW_CONFIDENCE_SCORE && (
                <span
                  className="rounded px-2 py-0.5 text-[11px] font-semibold"
                  style={{ background: 'var(--warn-muted)', color: 'var(--warn)' }}
                  title={`엑셀 표기 "${active.rawMediaName} ${active.rawProductName}" 로 찾은 결과입니다`}
                >
                  상품 매칭 확인 필요
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
                      AI 제안
                    </span>
                    <span className="text-[13px] font-medium" style={{ color: 'var(--text-primary)' }}>
                      선택 및 입력 항목
                    </span>
                  </div>
                  <InputPanel
                    areas={userInputAreas(active.entry)}
                    values={active.values}
                    meta={meta}
                    onChange={handleChange}
                    onConfirm={handleConfirm}
                    onUseSubVisual={handleUseSubVisual}
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

/** 집행 예시 컬럼에서 쓰는 축소 비율 박스 */
function RatioPreview({ width, height }: { width: number; height: number }) {
  const scale = Math.min(180 / width, 120 / height, 1);
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className="flex items-center justify-center rounded text-[11px]"
        style={{
          width: Math.max(Math.round(width * scale), 24),
          height: Math.max(Math.round(height * scale), 16),
          background: 'var(--accent-muted)',
          border: '1px solid var(--border-strong)',
          color: 'var(--text-primary)',
        }}
      >
        {width}×{height}
      </div>
      <div className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {width} × {height} px
      </div>
    </div>
  );
}
