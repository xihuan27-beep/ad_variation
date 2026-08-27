'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';
import { useLayoutEffect, useRef, useState } from 'react';

const LABEL_TEXT = '소재 제작 가이드만이라도';

/**
 * 위 작은 라벨 줄의 실제 렌더 폭을 "자동화" 줄 폭에 맞춘다.
 *
 * text-justify:inter-character 로 시도했더니 브라우저가 글자 사이가 아니라
 * 단어 사이 공백만 크게 벌려서 의도한 모양이 안 나왔다(CJK 대상 기능이지만
 * 지원이 일관되지 않는다). 대신 실제 렌더 폭을 재서 필요한 letter-spacing을
 * 직접 계산한다 — 글자 수가 바뀌어도, 폰트가 로딩되기 전/후에도 항상 정확하다.
 */
function useMatchWidth(text: string) {
  const bigRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLDivElement>(null);
  const [letterSpacing, setLetterSpacing] = useState(0);
  // recalc()는 useLayoutEffect가 처음 만들어질 때의 letterSpacing(0)만 기억하는
  // 클로저라서, 최신 값을 읽으려면 ref로 따로 추적해야 한다.
  const spacingRef = useRef(0);
  spacingRef.current = letterSpacing;

  useLayoutEffect(() => {
    function recalc() {
      const big = bigRef.current;
      const label = labelRef.current;
      if (!big || !label) return;
      // label.style를 직접 0으로 리셋해서 측정하면, 재계산 결과가 이전과 같은 값일 때
      // React가 "상태 변화 없음"으로 보고 리렌더를 건너뛰어(bail out) 이 리셋이 그대로
      // 영구히 남는 버그가 생긴다. 그래서 DOM을 건드리지 않고, 현재 적용된 자간을 역산해
      // 자연 폭을 구한다.
      const targetWidth = big.offsetWidth;
      const currentWidth = label.offsetWidth;
      const naturalWidth = currentWidth - text.length * spacingRef.current;
      const extra = Math.max(0, targetWidth - naturalWidth);
      setLetterSpacing(text.length > 0 ? extra / text.length : 0);
    }
    recalc();
    window.addEventListener('resize', recalc);
    // 웹폰트가 늦게 로드되면 자간 계산 시점의 폭이 최종 폭과 달라질 수 있어 로드 완료 후 한 번 더 맞춘다
    document.fonts?.ready.then(recalc);
    return () => window.removeEventListener('resize', recalc);
  }, [text]);

  return { bigRef, labelRef, letterSpacing };
}

export default function LandingPage() {
  const { bigRef, labelRef, letterSpacing } = useMatchWidth(LABEL_TEXT);

  return (
    <div className="flex min-h-screen flex-col" style={{ background: '#070C1A' }}>
      {/* Nav */}
      <nav className="flex h-14 shrink-0 items-center justify-between px-6" style={{ borderBottom: '1px solid #1E3050' }}>
        <div className="flex items-center gap-2">
          <div
            className="flex h-7 w-7 items-center justify-center rounded-md"
            style={{ background: 'linear-gradient(135deg, #5B6EF5, #9B5CF6)' }}
          >
            <Zap size={14} color="#fff" />
          </div>
          <span className="text-sm font-bold tracking-tight" style={{ color: '#EEF2FF' }}>
            AdSpec
          </span>
        </div>
        <Link
          href="/dashboard"
          className="rounded-md px-4 py-1.5 text-sm font-medium"
          style={{ background: '#5B6EF5', color: '#fff' }}
        >
          시작하기
        </Link>
      </nav>

      {/* Hero */}
      <section className="relative flex flex-1 items-center justify-center overflow-hidden px-6 py-24">
        <div
          className="pointer-events-none absolute inset-0"
          style={{ background: 'radial-gradient(ellipse 80% 50% at 50% 40%, rgba(91,110,245,0.14) 0%, transparent 70%)' }}
        />
        <div className="relative max-w-2xl text-center">
          <h1 className="mb-6 flex flex-col items-center leading-tight">
            <div
              ref={labelRef}
              style={{
                whiteSpace: 'nowrap',
                color: '#EEF2FF',
                fontSize: '1.05rem',
                fontWeight: 700,
                marginBottom: '0.4rem',
                letterSpacing: `${letterSpacing}px`,
              }}
            >
              {LABEL_TEXT}
            </div>
            <div
              ref={bigRef}
              style={{
                fontSize: '5.5rem',
                fontWeight: 800,
                letterSpacing: '-0.02em',
                whiteSpace: 'nowrap',
                background: 'linear-gradient(135deg, #5B6EF5, #9B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              자동화
            </div>
          </h1>
          <p className="mb-10 text-base leading-relaxed" style={{ color: '#8B9EC7' }}>
            집행 매체 엑셀을 업로드하면
            <br />
            LLM과 Master DB 교차 검증으로
            <br />
            소재 제작 가이드 PPT 초안을 작성합니다
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold transition-all hover:translate-y-[-1px]"
            style={{ background: 'linear-gradient(135deg, #5B6EF5, #4A5DE4)', color: '#fff', boxShadow: '0 4px 24px rgba(91,110,245,0.35)' }}
          >
            바로 시작하기
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}
