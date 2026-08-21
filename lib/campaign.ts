/**
 * 캠페인 작업 상태
 *
 * 엑셀 업로드로 만들어진 매체별 작업 항목과, 사용자가 매체마다 확정해 나가는
 * 입력값을 담는다. 실제 저장소가 붙기 전까지는 클라이언트 메모리에만 존재한다.
 */

import type { AssetArea, SpecEntry, SpecDiscrepancy } from './spec-db';
export type { SpecDiscrepancy } from './spec-db';

/** 업로드된 소재 파일. 미리보기와 PPT 생성 양쪽에 이 dataUrl 을 그대로 쓴다. */
export interface UploadedAsset {
  /** 원본 파일명 — 화면에 표시하고 확정값의 라벨로 쓴다 */
  name: string;
  /** data: URL. RatioBox의 <img> src 로도, PPT의 addImage 데이터로도 그대로 쓸 수 있다 */
  dataUrl: string;
}

export type AssetKey = 'mainVisual' | 'subVisual' | 'logo';

/** 캠페인 전역에서 한 번만 올리는 소재 */
export interface CampaignAssets {
  /** 메인 비주얼 — 필수 */
  mainVisual?: UploadedAsset;
  /** 서브 비주얼 — 선택 */
  subVisual?: UploadedAsset;
  /** 브랜드 로고 — 선택 */
  logo?: UploadedAsset;
}

export interface CampaignMeta {
  brand: string;
  mainCopy: string;
  fileName?: string;
  assets: CampaignAssets;
}

/** 한 영역(area)에 대해 사용자가 확정한 값 */
export interface AreaValue {
  /** 사용자가 입력하거나 AI 제안을 수정한 값. IMAGE/VIDEO 영역에서는 파일명 표시용 */
  value: string;
  /** IMAGE/VIDEO 영역이 캠페인 공통 소재를 가리킬 때만 쓴다 */
  assetRef?: AssetKey;
  /** 확정 여부 — 확정되어야 해당 매체를 완료 처리할 수 있다 */
  confirmed: boolean;
}

/** 영역이 참조하는 실제 업로드 파일을 찾는다 */
export function resolveAsset(meta: CampaignMeta, ref?: AssetKey): UploadedAsset | undefined {
  return ref ? meta.assets[ref] : undefined;
}

/**
 * 이 영역이 캠페인의 어떤 공통 소재를 기반으로 하는지 판단한다.
 *
 * DB의 IMAGE/VIDEO 영역은 거의 전부 isUserInput: false(고정 스펙)다 — 매체마다
 * 실제 파일을 새로 고르는 게 아니라, 캠페인이 한 번 올린 메인 비주얼을 그 매체의
 * 규격(가로×세로)대로 크롭해서 쓰는 구조이기 때문이다. 그래서 이 판단은 확정값이
 * 아니라 영역 이름만으로 한다 — "로고"·"브랜드"가 들어가면 로고, 그 외에는
 * 메인 비주얼이 근거가 된다.
 */
export function suggestedAssetFor(area: AssetArea, meta: CampaignMeta): UploadedAsset | undefined {
  if (area.areaType !== 'IMAGE') return undefined; // 동영상은 이미지로 대신 채우면 오해를 준다
  const ref: AssetKey = /로고|브랜드/.test(area.areaName) ? 'logo' : 'mainVisual';
  return meta.assets[ref];
}

/** 작업 화면의 매체 1건 */
export interface WorkItem {
  /** 엑셀에 적힌 원문 매체 표기 */
  rawMediaName: string;
  rawProductName: string;
  /** 마스터 DB 매칭 결과 — 실패하면 null */
  entry: SpecEntry | null;
  matchScore: number;
  /** 'spec' 이면 이름이 아니라 규격 숫자로 찾았다는 뜻 */
  matchedBy?: 'spec';
  /** 엑셀 원문의 규격 숫자가 매칭된 상품의 DB 값과 다를 때 채워진다 */
  specDiscrepancies?: SpecDiscrepancy[];
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
 *
 * IMAGE 영역 중 이름에 "로고"·"브랜드"가 들어간 것은 로고 소재를, 그 외 이미지와
 * 모든 동영상 영역은 메인 비주얼을 가리킨다 — 캠페인이 올리는 소재가 이 셋뿐이라
 * 참조로 저장한다(assetRef). 값을 통째로 복사하지 않아 매체 수만큼 같은 대용량
 * 이미지가 중복되는 일이 없다.
 */
export function suggestInitial(area: AssetArea, meta: CampaignMeta): { value: string; assetRef?: AssetKey } {
  switch (area.areaType) {
    case 'IMAGE': {
      const asset = suggestedAssetFor(area, meta);
      const ref: AssetKey = /로고|브랜드/.test(area.areaName) ? 'logo' : 'mainVisual';
      return asset ? { value: asset.name, assetRef: ref } : { value: '' };
    }
    case 'VIDEO': {
      const asset = meta.assets.mainVisual;
      return asset ? { value: asset.name, assetRef: 'mainVisual' } : { value: '' };
    }
    case 'TEXT': {
      const name = area.areaName;
      if (/로고|브랜드/.test(name)) return { value: meta.brand };
      if (/타이틀|메인|카피|제목/.test(name)) return { value: meta.mainCopy };
      return { value: '' };
    }
    default:
      return { value: '' };
  }
}

export function progressOf(items: WorkItem[]): { done: number; total: number; pct: number } {
  const total = items.length;
  const done = items.filter((i) => i.done).length;
  return { done, total, pct: total === 0 ? 0 : Math.round((done / total) * 100) };
}
