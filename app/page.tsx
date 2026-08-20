'use client';

import Link from 'next/link';
import { ArrowRight, Zap, Shield, RefreshCw, FileDown, CheckCircle2, AlertTriangle, Database, Brain } from 'lucide-react';

const WORKFLOW_STEPS = [
  {
    num: '01',
    icon: <FileDown size={20} />,
    title: '엑셀 업로드',
    desc: '매체 기획 엑셀 파일을 업로드합니다. 오버뷰 시트에서 집행 매체·상품·라이브 일정을 자동으로 추출합니다.',
    color: '#5B6EF5',
  },
  {
    num: '02',
    icon: <Brain size={20} />,
    title: 'LLM 교차 검증',
    desc: '마스터 DB 기준값과 엑셀 내용을 LLM에 전송하여 수치 변경·신규 조건 등 Delta를 JSON으로 식별합니다.',
    color: '#9B5CF6',
  },
  {
    num: '03',
    icon: <AlertTriangle size={20} />,
    title: '불일치 검토',
    desc: '차이가 감지되면 경고 팝업으로 항목별 비교값을 표시합니다. 엑셀 기준 또는 DB 기준 중 하나를 선택합니다.',
    color: '#F59E0B',
  },
  {
    num: '04',
    icon: <FileDown size={20} />,
    title: 'PPT 자동 생성',
    desc: '확정된 스펙을 마스터 슬라이드 템플릿에 매핑하여 소재 제작 가이드 PPT를 즉시 다운로드합니다.',
    color: '#10B981',
  },
];

const FEATURES = [
  {
    icon: <Database size={22} />,
    title: '퍼지 매칭 사전',
    desc: '담당자가 엑셀에 임의로 작성한 "네이버GDA", "FB피드" 등 약어를 마스터 DB의 정식 명칭과 자동 연결합니다.',
  },
  {
    icon: <RefreshCw size={22} />,
    title: 'DB 자가 업데이트',
    desc: '사용자가 "엑셀 기준"을 선택하면 마스터 DB의 해당 규격을 최신 수치로 자동 반영합니다. 관리자 승인 워크플로우 지원.',
  },
  {
    icon: <Shield size={22} />,
    title: 'URL 변동 감지',
    desc: '매체사 가이드라인 URL의 텍스트 변경을 백그라운드 봇이 감지하여 관리자에게 스펙 업데이트 알림을 발송합니다.',
  },
  {
    icon: <Zap size={22} />,
    title: '휴먼 에러 제로화',
    desc: '엑셀→PPT 수작업 복붙을 완전히 자동화합니다. 수시로 변동되는 매체사 규격에 완벽하게 대응 가능한 유지보수 안정성.',
  },
];

const SUPPORTED_MEDIA = [
  '네이버 GDA', '브랜드검색', '파워링크',
  '카카오 비즈보드', '카카오 디스플레이', '카카오모먼트',
  '유튜브 범퍼', '트루뷰 인스트림',
  '메타 피드', '메타 스토리', '릴스',
  '구글 GDN', '틱톡 인피드', '쿠팡 CPC',
];

export default function LandingPage() {
  return (
    <div className="min-h-screen" style={{ background: '#070C1A' }}>
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(7,12,26,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1E3050' }}>
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #5B6EF5, #9B5CF6)' }}>
              <Zap size={14} color="#fff" />
            </div>
            <span className="font-bold text-sm tracking-tight" style={{ color: '#EEF2FF' }}>AdSpec</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#workflow" className="text-sm transition-colors" style={{ color: '#8B9EC7' }}>워크플로우</a>
            <a href="#features" className="text-sm transition-colors" style={{ color: '#8B9EC7' }}>기능</a>
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded-md text-sm font-medium transition-all"
              style={{ background: '#5B6EF5', color: '#fff' }}
            >
              시작하기
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        {/* Background glow */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(91,110,245,0.12) 0%, transparent 70%)',
          }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage: 'linear-gradient(rgba(91,110,245,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(91,110,245,0.15) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative max-w-4xl mx-auto text-center">
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: 'rgba(91,110,245,0.15)', border: '1px solid rgba(91,110,245,0.3)', color: '#9BA8FF' }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            Master DB + LLM Delta Check 아키텍처
          </div>

          <h1 className="text-5xl font-bold leading-tight mb-6" style={{ color: '#EEF2FF', letterSpacing: '-0.02em', textWrap: 'balance' }}>
            소재 제작 가이드,
            <br />
            <span style={{ background: 'linear-gradient(135deg, #5B6EF5, #9B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              이제 자동으로
            </span>
          </h1>

          <p className="text-lg mb-12 max-w-2xl mx-auto" style={{ color: '#8B9EC7', lineHeight: 1.7 }}>
            매체 기획 엑셀 파일 업로드 한 번으로, LLM이 마스터 DB와 교차 검증하여
            <br className="hidden md:block" />
            오류 없는 소재 제작 가이드 PPT를 즉시 생성합니다.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all hover:translate-y-[-1px]"
              style={{ background: 'linear-gradient(135deg, #5B6EF5, #4A5DE4)', color: '#fff', boxShadow: '0 4px 24px rgba(91,110,245,0.35)' }}
            >
              지금 바로 시작하기
              <ArrowRight size={16} />
            </Link>
            <a
              href="#workflow"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-sm transition-all"
              style={{ border: '1px solid #273D60', color: '#8B9EC7' }}
            >
              워크플로우 보기
            </a>
          </div>
        </div>

        {/* Hero preview card */}
        <div className="relative max-w-3xl mx-auto mt-20">
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: '1px solid #1E3050', background: '#0F1729', boxShadow: '0 32px 80px rgba(0,0,0,0.5)' }}
          >
            {/* Window bar */}
            <div className="flex items-center gap-2 px-4 h-10" style={{ borderBottom: '1px solid #1E3050', background: '#0A1020' }}>
              <div className="w-3 h-3 rounded-full" style={{ background: '#EF4444' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#F59E0B' }} />
              <div className="w-3 h-3 rounded-full" style={{ background: '#10B981' }} />
              <span className="ml-2 text-xs" style={{ color: '#4C6591' }}>adspec.kr — 소재 가이드 대시보드</span>
            </div>
            {/* Preview content */}
            <div className="p-6 grid grid-cols-2 gap-4">
              <div className="col-span-2 flex items-center gap-3 p-4 rounded-lg" style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)' }}>
                <CheckCircle2 size={18} style={{ color: '#10B981' }} />
                <div>
                  <p className="text-sm font-medium" style={{ color: '#EEF2FF' }}>12개 매체 스펙 검증 완료</p>
                  <p className="text-xs" style={{ color: '#8B9EC7' }}>10개 일치 · 2개 불일치 감지</p>
                </div>
                <span className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(16,185,129,0.15)', color: '#10B981' }}>완료</span>
              </div>
              {[
                { media: '네이버 GDA', status: 'match', spec: '1200×628 · 200KB · JPG/PNG/GIF' },
                { media: '카카오 비즈보드', status: 'warn', spec: '용량 변동 감지 [200KB → 300KB]' },
                { media: '유튜브 범퍼', status: 'match', spec: '1920×1080 · 6초 · 16:9' },
                { media: '메타 스토리', status: 'match', spec: '1080×1920 · 9:16 · 15초' },
              ].map((item) => (
                <div
                  key={item.media}
                  className="p-3 rounded-lg"
                  style={{ background: '#162038', border: `1px solid ${item.status === 'warn' ? 'rgba(245,158,11,0.25)' : '#1E3050'}` }}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-xs font-semibold" style={{ color: '#EEF2FF' }}>{item.media}</span>
                    {item.status === 'warn'
                      ? <AlertTriangle size={13} style={{ color: '#F59E0B' }} />
                      : <CheckCircle2 size={13} style={{ color: '#10B981' }} />}
                  </div>
                  <span className="text-xs" style={{ color: item.status === 'warn' ? '#FCD34D' : '#4C6591' }}>{item.spec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Workflow */}
      <section id="workflow" className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#5B6EF5' }}>System Workflow</p>
            <h2 className="text-3xl font-bold" style={{ color: '#EEF2FF', letterSpacing: '-0.01em' }}>4단계 자동화 파이프라인</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div
              className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-px"
              style={{ background: 'linear-gradient(90deg, #1E3050, #273D60, #1E3050)' }}
            />

            {WORKFLOW_STEPS.map((step, i) => (
              <div key={i} className="relative flex flex-col">
                {/* Icon circle */}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mb-5 z-10"
                  style={{ background: step.color + '20', border: `2px solid ${step.color}40`, color: step.color }}
                >
                  {step.icon}
                </div>
                <span className="text-xs font-bold mb-2 font-mono" style={{ color: step.color }}>{step.num}</span>
                <h3 className="text-base font-semibold mb-2" style={{ color: '#EEF2FF' }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8B9EC7' }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6" style={{ borderTop: '1px solid #1E3050' }}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: '#5B6EF5' }}>Key Features</p>
            <h2 className="text-3xl font-bold" style={{ color: '#EEF2FF', letterSpacing: '-0.01em' }}>핵심 기능</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className="p-6 rounded-xl"
                style={{ background: '#0F1729', border: '1px solid #1E3050' }}
              >
                <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: 'rgba(91,110,245,0.12)', color: '#5B6EF5' }}>
                  {feat.icon}
                </div>
                <h3 className="font-semibold text-base mb-2" style={{ color: '#EEF2FF' }}>{feat.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8B9EC7' }}>{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported media */}
      <section className="py-16 px-6" style={{ borderTop: '1px solid #1E3050' }}>
        <div className="max-w-6xl mx-auto">
          <p className="text-center text-xs font-semibold uppercase tracking-widest mb-8" style={{ color: '#4C6591' }}>
            지원 매체 · {SUPPORTED_MEDIA.length}개 상품 탑재
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {SUPPORTED_MEDIA.map((m) => (
              <span
                key={m}
                className="px-3 py-1 rounded-full text-xs"
                style={{ background: '#0F1729', border: '1px solid #1E3050', color: '#8B9EC7' }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6" style={{ borderTop: '1px solid #1E3050' }}>
        <div
          className="max-w-2xl mx-auto text-center rounded-2xl p-12"
          style={{ background: 'linear-gradient(135deg, rgba(91,110,245,0.1), rgba(155,92,246,0.08))', border: '1px solid rgba(91,110,245,0.2)' }}
        >
          <h2 className="text-3xl font-bold mb-4" style={{ color: '#EEF2FF', letterSpacing: '-0.01em' }}>
            지금 바로 자동화를 시작하세요
          </h2>
          <p className="mb-8 text-sm" style={{ color: '#8B9EC7' }}>
            매체 기획 엑셀 파일만 있으면 됩니다.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-lg font-semibold transition-all hover:translate-y-[-1px]"
            style={{ background: 'linear-gradient(135deg, #5B6EF5, #4A5DE4)', color: '#fff', boxShadow: '0 8px 32px rgba(91,110,245,0.4)' }}
          >
            엑셀 파일 업로드하기
            <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 text-center" style={{ borderTop: '1px solid #1E3050' }}>
        <p className="text-xs" style={{ color: '#4C6591' }}>
          © 2026 AdSpec — 디지털 매체 소재 제작 가이드 자동화 시스템
        </p>
      </footer>
    </div>
  );
}
