/**
 * 엑셀 행 원문에서 규격 숫자를 뽑는다.
 *
 * 이름 매칭이 실패했을 때 스펙으로 재시도하기 위한 재료다. 정확도가 생명이라
 * 최대한 보수적으로 뽑는다 — 특히 비율은 화이트리스트만 인정한다. 느슨한
 * `\d+:\d+` 패턴은 실제 데이터에 자주 나오는 "8/21 19:00" 같은 라이브 일정
 * 시각을 "19:0" 비율로 잘못 집어낸다.
 */

export interface SpecTokens {
  widthPx?: number;
  heightPx?: number;
  /** 화이트리스트에 있는 비율 표기 하나 (예: "9:16") */
  ratio?: string;
  maxFileSizeKb?: number;
  maxDurationSec?: number;
  formats?: string[];
}

/** 실제 광고 소재에 쓰이는 비율만 인정한다 — 그 외 숫자쌍은 비율로 보지 않는다 */
const KNOWN_RATIOS = ['1.91:1', '9:16', '16:9', '4:5', '5:4', '2:3', '3:2', '4:3', '3:4', '1:1'];

const FORMAT_RE = /\b(JPG|JPEG|PNG|GIF|MP4|MOV|AVI|WMV|WEBM|MPG|HTML5)\b/gi;

export function extractSpecTokens(text: string): SpecTokens {
  const tokens: SpecTokens = {};

  const res = text.match(/(\d{2,5})\s*[x×X]\s*(\d{2,5})/);
  if (res) {
    tokens.widthPx = Number(res[1]);
    tokens.heightPx = Number(res[2]);
  }

  const ratio = KNOWN_RATIOS.find((r) => text.includes(r));
  if (ratio) tokens.ratio = ratio;

  const size = text.match(/(\d+(?:\.\d+)?)\s*(KB|MB)\b/i);
  if (size) {
    const n = Number(size[1]);
    tokens.maxFileSizeKb = size[2].toUpperCase() === 'MB' ? n * 1024 : n;
  }

  // "최초"·"초과" 등과 헷갈리지 않도록 숫자 뒤에 바로 붙은 "초"만 본다
  const dur = text.match(/(\d+)\s*초(?!\S)/) ?? text.match(/(\d+)\s*(?:sec|s)\b/i);
  if (dur) tokens.maxDurationSec = Number(dur[1]);

  const formats = text.match(FORMAT_RE);
  if (formats) tokens.formats = [...new Set(formats.map((f) => f.toUpperCase()))];

  return tokens;
}

/** 토큰이 하나라도 있는지 — 없으면 스펙 매칭을 시도할 이유가 없다 */
export function hasAnyToken(t: SpecTokens): boolean {
  return !!(t.widthPx || t.ratio || t.maxFileSizeKb || t.maxDurationSec || t.formats?.length);
}
