/**
 * 캠페인 작업 상태
 *
 * 엑셀 업로드로 만들어진 매체별 작업 항목과, 사용자가 매체마다 확정해 나가는
 * 입력값을 담는다. 실제 저장소가 붙기 전까지는 클라이언트 메모리에만 존재한다.
 */

import type { AssetArea, SpecEntry } from './spec-db';

/** 캠페인 전역에서 한 번만 올리는 소재 */
export interface CampaignAssets {
  /** 메인 비주얼 — 필수 */
  mainVisual?: string;
  /** 서브 비주얼 — 선택 */
  subVisual?: string;
  /** 브랜드 로고 — 선택 */
  logo?: string;
}

export interface CampaignMeta {
  brand: string;
  mainCopy: string;
  fileName?: string;
  assets: CampaignAssets;
}

/** 한 영역(area)에 대해 사용자가 확정한 값 */
export interface AreaValue {
  /** 사용자가 입력하거나 AI 제안을 수정한 값 */
  value: string;
  /** 확정 여부 — 확정되어야 해당 매체를 완료 처리할 수 있다 */
  confirmed: boolean;
}

/** 작업 화면의 매체 1건 */
export interface WorkItem {
  /** 엑셀에 적힌 원문 매체 표기 */
  rawMediaName: string;
  rawProductName: string;
  /** 마스터 DB 매칭 결과 — 실패하면 null */
  entry: SpecEntry | null;
  matchScore: number;
  /** 소재 전달 기한 */
  deadline?: string;
  /** 라이브 일정 */
  liveSchedule?: string;
  /** 원본 엑셀 행 번호 — 사용자가 엑셀에서 대조할 수 있게 */
  excelRow?: number;
  /** 영역별 확정값. key 는 area.displayOrder */
  values: Record<number, AreaValue>;
  done: boolean;
}

export function isItemComplete(item: WorkItem): boolean {
  if (!item.entry) return false;
  const required = item.entry.areas.filter((a) => a.isUserInput);
  return required.every((a) => item.values[a.displayOrder]?.confirmed);
}

/** 아직 확정되지 않은 사용자 입력 영역 */
export function pendingAreas(item: WorkItem): AssetArea[] {
  if (!item.entry) return [];
  return item.entry.areas.filter((a) => a.isUserInput && !item.values[a.displayOrder]?.confirmed);
}

/**
 * 영역별 초기 제안값.
 *
 * 캠페인 공통 소재와 영역 성격을 근거로 시작점을 채워 준다. 사용자가 그대로
 * 확정하거나 수정할 수 있으며, 근거가 없으면 빈 값으로 두어 직접 입력을 유도한다.
 */
export function suggestValue(area: AssetArea, meta: CampaignMeta): string {
  switch (area.areaType) {
    case 'IMAGE':
    case 'VIDEO':
      return meta.assets.mainVisual ?? '';
    case 'TEXT': {
      const name = area.areaName;
      if (/로고|브랜드/.test(name)) return meta.brand;
      if (/타이틀|메인|카피|제목/.test(name)) return meta.mainCopy;
      return '';
    }
    default:
      return '';
  }
}

export function progressOf(items: WorkItem[]): { done: number; total: number; pct: number } {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}
