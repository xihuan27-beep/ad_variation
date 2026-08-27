'use client';

import Link from 'next/link';
import { ArrowRight, Zap } from 'lucide-react';

export default function LandingPage() {
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
          <h1 className="mb-6 text-5xl font-bold leading-tight" style={{ color: '#EEF2FF', letterSpacing: '-0.02em' }}>
            소재 제작 가이드만이라도
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #5B6EF5, #9B5CF6)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              자동화
            </span>
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
