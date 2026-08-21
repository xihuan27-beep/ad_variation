/**
 * Meta 광고 가이드 PDF에서 규격 블록만 뽑아낸다.
 *
 * PDF 제목은 브라우저 탭에서 남은 값이라 믿을 수 없다. 페이지 안의
 * ads-guide/update/<형식>/<게재위치> 경로가 유일하게 신뢰할 수 있는 식별자다.
 *
 * 사용법: node meta-extract.mjs <pdf...>
 */
import { execFileSync } from 'child_process';

const FORMAT_KO = { image: '이미지', video: '동영상', carousel: '슬라이드', collection: '컬렉션' };

/** 규격 줄만 남긴다 — 사이트 내비게이션·푸터·페이지 머리글은 버린다 */
const KEEP = /(파일 형식|파일 유형|이미지 형식|비율|해상도|동영상 설정|캡션|소리|기본 문구|제목|설명|랜딩 페이지 URL|인스턴트 경험|슬라이드 수|최대|최소|동영상 길이|화면 비율 허용 범위)/;
const DROP = /(시작하기|광고하기|지원|로그인|더 알아보기|모범 사례|광고 정책|Meta for Business|https?:|^\d+\/\d+$|오전|오후|광고 가이드)/;

for (const file of process.argv.slice(2)) {
  const raw = execFileSync('pdftotext', ['-raw', file, '-'], { encoding: 'utf8' });

  const path = raw.match(/ads-guide\/update\/([a-z-]+)(?:\/([a-z-]+))?/);
  const format = path?.[1] ?? '?';
  const placement = path?.[2] ?? '(기본)';

  // 목표(인지도/트래픽 등)는 본문 안내 문구에 나온다
  const objective = /인지도/.test(raw) ? '인지도' : /트래픽/.test(raw) ? '트래픽' : '?';

  const lines = raw
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && KEEP.test(l) && !DROP.test(l))
    // 같은 항목이 목차·본문에 중복되므로 한 번만
    .filter((l, i, arr) => arr.indexOf(l) === i);

  console.log(`\n══ ${FORMAT_KO[format] ?? format} / ${placement} / ${objective} ══`);
  console.log(`   ${file}`);
  for (const l of lines) console.log('   ·', l.replace(/\s*\(\)\s*$/, ''));
}
