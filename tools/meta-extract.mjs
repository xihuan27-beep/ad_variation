/**
 * Meta 광고 가이드 PDF → 구조화된 규격 JSON
 *
 * Meta 가이드는 형식(이미지/동영상/슬라이드/컬렉션) × 게재위치 조합이라
 * 페이지가 수백 개다. 손으로 옮기면 느리고 틀리므로 PDF 를 단일 원천으로 삼아
 * 기계적으로 뽑는다.
 *
 * PDF 제목은 브라우저 탭에서 남은 값이라 실제 내용과 다른 경우가 많다.
 * 본문의 ads-guide/update/<형식>/<게재위치> 경로만이 신뢰할 수 있는 식별자다.
 *
 * 사용법: node tools/meta-extract.mjs <pdf...> > data/meta-specs.json
 */
import { execFileSync } from 'child_process';

/**
 * "125자" / "50-150 characters" → 125
 * 국문·영문 가이드가 섞여 들어오므로 두 표기를 모두 받는다.
 * 범위로 적힌 경우 상한을 쓴다.
 */
const chars = (t, ko, en) => {
  const m =
    t.match(new RegExp(`${ko}\\s*:\\s*(?:최대\\s*)?([\\d~\\-]+)\\s*자`)) ??
    (en && t.match(new RegExp(`${en}\\s*:\\s*([\\d\\-~]+)\\s*characters?`, 'i')));
  if (!m) return undefined;
  const parts = m[1].split(/[~\-]/).map(Number).filter(Number.isFinite);
  return parts.length ? Math.max(...parts) : undefined;
};

const num = (t, re) => {
  const m = t.match(re);
  return m ? Number(m[1]) : undefined;
};

/** "30MB" / "4GB" → KB */
const sizeKb = (t, label) => {
  const m = t.match(new RegExp(`${label}\\s*:\\s*<?\\s*([\\d.]+)\\s*(KB|MB|GB)`, 'i'));
  if (!m) return undefined;
  const n = Number(m[1]);
  return { KB: n, MB: n * 1024, GB: n * 1024 * 1024 }[m[2].toUpperCase()];
};

/**
 * 영상 길이 상한을 초 단위로 통일한다.
 * 가이드마다 "1초~240분", "1~240초", "1 second to 241 minutes" 로 제각각 적힌다.
 */
const durationSec = (t) => {
  const line =
    t.match(/동영상 길이\s*:\s*([^\n]+)/)?.[1] ?? t.match(/Video Duration\s*:\s*([^\n]+)/i)?.[1];
  if (!line) return undefined;
  const m = line.match(/(\d+)\s*(초|분|seconds?|minutes?|hours?|h|m|s)\s*(?:\(\))?\s*$/i);
  if (!m) return undefined;
  const n = Number(m[1]);
  const unit = m[2].toLowerCase();
  if (/분|minute|^m$/.test(unit)) return n * 60;
  if (/hour|^h$/.test(unit)) return n * 3600;
  return n;
};

const formats = (t, label) => {
  const m = t.match(new RegExp(`${label}\\s*:\\s*([^\\n]+)`));
  if (!m) return undefined;
  const found = m[1].match(/\b(JPG|JPEG|PNG|GIF|MP4|MOV|AVI|WMV|WebM|MPG)\b/gi);
  return found ? [...new Set(found.map((f) => f.toUpperCase()))] : undefined;
};

export function extract(file) {
  const t = execFileSync('pdftotext', ['-raw', file, '-'], { encoding: 'utf8' });

  const path = t.match(/ads-guide\/update\/([a-z-]+)(?:\/([a-z-]+))?/);
  if (!path) return null;

  // 게재위치가 경로에 없으면 기본 게재위치(Facebook 피드) 페이지다
  const placement = path[2] ?? 'facebook-feed';

  const res =
    t.match(/해상도\s*:\s*(?:최소\s*)?([\d,]+)\s*[x×]\s*([\d,]+)/) ??
    t.match(/Resolution\s*:\s*(?:At least\s*)?([\d,]+)\s*[x×]\s*([\d,]+)/i);
  const ratioM =
    t.match(/(?:커버\s*)?비율\s*:\s*([^\n(]+)/) ?? t.match(/Ratio\s*:\s*([^\n(]+)/i);

  return {
    format: path[1],
    placement,
    objective: /인지도|Awareness/i.test(t) ? 'awareness' : /트래픽|Traffic/i.test(t) ? 'traffic' : 'unknown',

    ratio: ratioM ? ratioM[1].trim().replace(/\s+/g, '') : undefined,
    width: res ? Number(res[1].replace(/,/g, '')) : undefined,
    height: res ? Number(res[2].replace(/,/g, '')) : undefined,

    imageFormats:
      formats(t, '이미지 (?:파일 )?(?:형식|유형)') ??
      formats(t, 'Image (?:File )?Type') ??
      formats(t, '파일 형식') ??
      formats(t, 'File Type'),
    videoFormats: formats(t, '동영상 파일 형식') ?? formats(t, 'Video File Type'),

    primaryText: chars(t, '기본 문구', 'Primary Text'),
    headline: chars(t, '제목', 'Headline'),
    description: chars(t, '설명', 'Description'),

    maxImageKb:
      sizeKb(t, '최대 이미지 파일 크기') ??
      sizeKb(t, 'Image Maximum File Size') ??
      sizeKb(t, '최대 파일 크기') ??
      sizeKb(t, 'Maximum File Size'),
    maxVideoKb: sizeKb(t, '최대 동영상 파일 크기') ?? sizeKb(t, 'Video Maximum File Size'),

    minWidth:
      num(t, /최소\s*(?:이미지\/동영상\s*)?너비\s*:\s*(\d+)\s*픽셀/) ??
      num(t, /Minimum Width\s*:\s*(\d+)\s*pixels?/i),
    minHeight:
      num(t, /최소\s*(?:이미지\/동영상\s*)?높이\s*:\s*(\d+)\s*픽셀/) ??
      num(t, /Minimum Height\s*:[^\n]*?(\d+)\s*pixels?/i),

    // "최소/최대 슬라이드 수" 를 먼저 본다. 범위 표기("2~10개")보다 뒤에 두면
    // "최대 슬라이드 수: 10" 이 최소값으로 잘못 잡힌다.
    cardsMin:
      num(t, /최소 슬라이드 수\s*:\s*(\d+)/) ??
      num(t, /슬라이드 수\s*:\s*(\d+)\s*[~\-]/) ??
      num(t, /Number of Carousel Cards\s*:\s*(\d+)/i),
    cardsMax:
      num(t, /최대 슬라이드 수\s*:\s*(\d+)/) ??
      num(t, /슬라이드 수\s*:\s*\d+\s*[~\-]\s*(\d+)/) ??
      num(t, /Number of Carousel Cards\s*:\s*\d+\s*(?:to|[~\-])\s*(\d+)/i),

    videoDurationSec: durationSec(t),
    aspectTolerance:
      num(t, /화면 비율 허용 범위\s*:\s*(\d+)\s*%/) ??
      num(t, /Aspect Ratio Tolerance\s*:\s*(\d+)\s*%/i),

    landingUrlRequired: /랜딩 페이지 URL\s*:\s*필수/.test(t) || /Landing Page URL\s*:\s*Required/i.test(t),
    instantExperienceRequired:
      /인스턴트 경험\s*:\s*필수/.test(t) || /Instant Experience\s*:\s*Required/i.test(t),
    videoSettings:
      t.match(/동영상 설정\s*:\s*([^\n]+)/)?.[1]?.trim() ??
      t.match(/Video Settings\s*:\s*([^\n]+)/)?.[1]?.trim(),
  };
}

const files = process.argv.slice(2);
if (files.length) {
  const out = files.map(extract).filter(Boolean);
  // 같은 형식·게재위치가 여러 번 들어와도 한 번만 남긴다
  const byKey = new Map(out.map((r) => [`${r.format}/${r.placement}`, r]));
  const records = [...byKey.values()].sort((a, b) =>
    `${a.format}/${a.placement}`.localeCompare(`${b.format}/${b.placement}`)
  );
  process.stdout.write(JSON.stringify(records, null, 2) + '\n');
}
