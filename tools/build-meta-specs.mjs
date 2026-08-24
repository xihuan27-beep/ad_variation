/**
 * data/meta-specs.json → lib/meta-specs.generated.ts
 *
 * PDF 에서 뽑은 규격 레코드를 앱이 쓰는 MediaProduct 형태로 바꾼다.
 * 이 파일이 만드는 결과물은 직접 고치지 말고, PDF 를 추가한 뒤 다시 생성한다.
 *
 * 사용법: node tools/build-meta-specs.mjs
 */
import { readFileSync, writeFileSync } from 'fs';

const FORMAT_KO = { image: '이미지', video: '동영상', carousel: '슬라이드', collection: '컬렉션' };
const OBJECTIVE_KO = { awareness: '인지도', traffic: '트래픽', unknown: '' };

/**
 * Meta 동영상 소재의 인코딩·오디오 기본 요건 — 거의 모든 게재위치 가이드에 동일하게
 * 반복되는 표준 문구다. PDF 추출 단계(tools/meta-extract.mjs)가 이 문단까지는 뽑지
 * 않으므로, 동영상 영역에는 여기서 공통으로 붙여 준다. 게재위치별로 다른 값(최소
 * 해상도·길이·용량)은 원래대로 r.minWidth/videoDurationSec/maxVideoKb 등에서 가져온다.
 */
const META_VIDEO_STANDARD_NOTE =
  '동영상 설정: H.264 압축 / 정사각형 픽셀 / 고정 프레임 속도 / 프로그레시브 스캔 / 128kbps 이상 스테레오 AAC 오디오 압축. 오디오는 선택 사항이지만 권장.';

const PLACEMENT_KO = {
  'facebook-feed': 'Facebook 피드',
  'facebook-groups-feed': 'Facebook 그룹 피드',
  'facebook-right-hand-column': 'Facebook 우측 칼럼',
  'facebook-marketplace': 'Facebook 마켓플레이스',
  'facebook-video-feeds': 'Facebook 동영상 피드',
  'facebook-facebook-reels': 'Facebook 릴스',
  'facebook-instream-video': 'Facebook 인스트림 동영상',
  'facebook-biz-disco-feed': 'Facebook 비즈니스 발견 피드',
  'facebook-facebook-reels-overlay': 'Facebook 릴스 오버레이',
  'facebook-stories': 'Facebook 스토리',
  'facebook-story': 'Facebook 스토리',
  'facebook-search': 'Facebook 검색 결과',
  'instagram-feed': 'Instagram 피드',
  'instagram-story': 'Instagram 스토리',
  'instagram-reels': 'Instagram 릴스',
  'instagram-explore': 'Instagram 탐색',
  'instagram-explore-home': 'Instagram 탐색 홈',
  'instagram-profile-feed': 'Instagram 프로필 피드',
  'messenger-story': 'Messenger 스토리',
  'messenger-inbox': 'Messenger 받은 메시지함',
  'audience-network-native': 'Audience Network 네이티브',
  'audience-network-rewarded-video': 'Audience Network 보상형 동영상',
  'audience-network-banner': 'Audience Network 배너',
};

/**
 * 게재위치 슬러그에서 사람이 실제로 쓰는 표기들을 만든다.
 * 국문 기획 엑셀은 매체를 "페이스북"·"인스타그램"으로 적으므로 그 표기도 넣는다.
 * 없으면 "페이스북 릴스" 가 "Instagram 릴스" 로 잘못 붙는다.
 */
function placementAliases(slug, ko) {
  const words = slug.replace(/^facebook-facebook-/, 'facebook-').split('-');
  const titled = words.map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');

  const set = new Set([ko, titled]);
  for (const base of [ko, titled]) {
    set.add(base.replace(/^Facebook /, 'FB '));
    set.add(base.replace(/^Instagram /, 'IG '));
    set.add(base.replace(/^Facebook /, '페이스북 '));
    set.add(base.replace(/^Instagram /, '인스타그램 '));
    set.add(base.replace(/^Messenger /, '메신저 '));
  }
  return [...set].filter(Boolean);
}

const q = (s) => JSON.stringify(s);

function areasFor(r) {
  const areas = [];
  let order = 0;
  const push = (a) => areas.push({ displayOrder: ++order, ...a });

  const ratio = r.ratio;
  const sizeNote = [
    // 비율이 조건부인 경우 원문 설명을 그대로 보여준다
    // (예: 이미지만 있는 슬라이드는 4:5, 동영상이 있으면 1:1만 지원)
    r.ratioNote ?? '',
    r.minWidth ? `최소 너비 ${r.minWidth}px` : '',
    r.minHeight ? `최소 높이 ${r.minHeight}px` : '',
    r.aspectTolerance ? `화면 비율 허용 범위 ${r.aspectTolerance}%` : '',
  ]
    .filter(Boolean)
    .join(' / ');

  // 비율별 해상도가 따로 주어지면 그 조합을 각각 만든다
  const sizes = r.variants?.length
    ? r.variants
    : [{ ratio: r.ratio, width: r.width, height: r.height }];
  const dims = r.width && r.height ? `${r.width} × ${r.height} px 이상` : '';
  const isCard = r.format === 'carousel';
  const isCover = r.format === 'collection';
  const label = isCard ? '카드' : isCover ? '커버' : '';

  if (r.imageFormats?.length) {
    for (const v of sizes) {
      const d = v.width && v.height ? `${v.width} × ${v.height} px 이상` : dims;
      push({
        areaName: `${label}${label ? ' ' : ''}이미지${sizes.length > 1 ? ` (${v.ratio})` : ''}`.trim(),
        areaType: 'IMAGE',
        widthPx: v.width,
        heightPx: v.height,
        ratio: v.ratio ?? ratio,
        maxFileSizeKb: r.maxImageKb,
        formats: r.imageFormats,
        specLabel: [d, v.ratio ?? ratio, r.maxImageKb ? `최대 ${Math.round(r.maxImageKb / 1024)}MB` : '', r.imageFormats.join(', ')]
          .filter(Boolean)
          .join(' / '),
        notes: sizeNote || undefined,
        isUserInput: false,
      });
    }
  }

  // 동영상 파일 형식 줄이 빠진 페이지가 있다. 길이나 용량 제한이 적혀 있으면
  // 동영상을 받는 지면이므로 영역은 만들되, 형식은 비워 두고 확인을 남긴다.
  const hasVideo = r.videoFormats?.length || r.videoDurationSec || r.maxVideoKb;
  if (hasVideo) {
    for (const v of sizes) {
    const vd = v.width && v.height ? `${v.width} × ${v.height} px 이상` : dims;
    push({
      areaName: `${label}${label ? ' ' : ''}동영상${sizes.length > 1 ? ` (${v.ratio})` : ''}`.trim(),
      areaType: 'VIDEO',
      widthPx: v.width,
      heightPx: v.height,
      ratio: v.ratio ?? ratio,
      maxDurationSec: r.videoDurationSec,
      maxFileSizeKb: r.maxVideoKb,
      formats: r.videoFormats,
      specLabel: [
        vd,
        v.ratio ?? ratio,
        r.videoDurationSec ? `1초 ~ ${Math.round(r.videoDurationSec / 60)}분` : '',
        r.maxVideoKb ? `최대 ${Math.round(r.maxVideoKb / 1024 / 1024)}GB` : '',
        r.videoFormats?.join(', ') ?? '',
      ]
        .filter(Boolean)
        .join(' / '),
      notes:
        [
          r.ratioNote ?? '',
          r.minWidth ? `최소 너비 ${r.minWidth}px` : '',
          r.minHeight ? `최소 높이 ${r.minHeight}px` : '',
          r.videoSettings ?? '',
          META_VIDEO_STANDARD_NOTE,
          r.videoFormats?.length ? '' : '가이드에 동영상 파일 형식이 명시되어 있지 않다 — 확인 필요',
        ]
          .filter(Boolean)
          .join(' / ') || undefined,
      isUserInput: false,
    });
    }
  }

  if (r.cardsMax) {
    push({
      areaName: '슬라이드 수',
      areaType: 'TEXT',
      specLabel: `${r.cardsMin ?? 2}~${r.cardsMax}개`,
      isUserInput: true,
    });
  }
  if (r.instantExperienceRequired) {
    push({ areaName: '인스턴트 경험', areaType: 'TEXT', specLabel: '필수', isUserInput: true });
  }
  if (r.primaryText) {
    push({ areaName: '기본 문구', areaType: 'TEXT', maxChars: r.primaryText, specLabel: `${r.primaryText}자 권장`, isUserInput: true });
  }
  if (r.headline) {
    push({ areaName: '제목', areaType: 'TEXT', maxChars: r.headline, specLabel: `${r.headline}자 권장`, isUserInput: true });
  }
  if (r.description) {
    push({ areaName: '설명', areaType: 'TEXT', maxChars: r.description, specLabel: `${r.description}자 권장`, isUserInput: true });
  }
  push({
    areaName: '랜딩 URL',
    areaType: 'URL',
    specLabel: r.landingUrlRequired ? '필수' : null,
    isUserInput: true,
  });

  return areas;
}

function serializeArea(a) {
  const parts = Object.entries(a)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}: ${typeof v === 'string' ? q(v) : Array.isArray(v) ? JSON.stringify(v) : v}`);
  return `        { ${parts.join(', ')} },`;
}

const records = JSON.parse(readFileSync('data/meta-specs.json', 'utf8'));

// 새 게재위치가 들어오면 한글 이름이 없어 슬러그가 그대로 화면에 나온다.
// 조용히 넘어가면 발견이 늦으므로 생성 단계에서 알린다.
const unnamed = [...new Set(records.map((r) => r.placement))].filter((p) => !PLACEMENT_KO[p]);
if (unnamed.length) {
  console.warn(`⚠ 한글 이름이 없는 게재위치 ${unnamed.length}건 — PLACEMENT_KO 에 추가하세요:`);
  for (const p of unnamed) console.warn(`    '${p}': '',`);
}

// 원천 문서 자체에 이상한 값이 실릴 때가 있다 (이미지 상한 4GB 등).
// 임의로 고치면 원천과 어긋나므로 값은 그대로 두고 사람이 볼 수 있게 알린다.
for (const r of records) {
  if (r.maxImageKb && r.maxImageKb > 100 * 1024) {
    console.warn(
      `⚠ ${r.format}/${r.placement}: 이미지 최대 크기가 ${Math.round(r.maxImageKb / 1024)}MB 로 이례적입니다. 원문 확인 필요`
    );
  }
}

const products = records.map((r) => {
  const ko = PLACEMENT_KO[r.placement] ?? r.placement;
  const name = `${OBJECTIVE_KO[r.objective]} — ${FORMAT_KO[r.format] ?? r.format} (${ko})`;
  const fmtKo = FORMAT_KO[r.format] ?? r.format;
  const aliases = [
    ...placementAliases(r.placement, ko),
    ...placementAliases(r.placement, ko).map((a) => `${a} ${fmtKo}`),
  ];
  return `      {
        name: ${q(name)},
        aliases: ${JSON.stringify([...new Set(aliases)])},
        areas: [
${areasFor(r).map(serializeArea).join('\n')}
        ],
      },`;
});

const out = `/**
 * 이 파일은 자동 생성됩니다. 직접 고치지 마세요.
 *
 * 원천: Meta 광고 가이드 PDF → data/meta-specs.json
 * 재생성: node tools/meta-extract.mjs <pdf...> > data/meta-specs.json
 *         node tools/build-meta-specs.mjs
 *
 * 게재위치 ${records.length}건.
 */

import type { MediaProduct } from './spec-data';

export const META_PLACEMENT_PRODUCTS: MediaProduct[] = [
${products.join('\n')}
];
`;

writeFileSync('lib/meta-specs.generated.ts', out);
console.log(`lib/meta-specs.generated.ts 생성 — 상품 ${records.length}개`);
