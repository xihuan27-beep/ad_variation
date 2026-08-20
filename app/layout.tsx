import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'AdSpec — 소재 가이드 자동화',
  description: '매체 기획 엑셀을 업로드하면 LLM 교차검증 후 소재 제작 가이드 PPT를 자동 생성합니다.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
