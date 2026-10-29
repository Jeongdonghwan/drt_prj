import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header, Footer, StickyBar, JsonLd } from '../components/Common';
import Motion from '../components/Motion';
import { businessJsonLd } from '../lib/jsonld';
import { SITE_URL, BRAND } from '../lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `${BRAND} 부산본점 | 강아지·고양이 분양 상담`, template: '%s' },
  description: '도로시펫 부산본점 강아지·고양이 분양. 방문 예약 1:1 상담, 동물병원 건강 확인, 계약서, 분양 후 사후관리, 홈딜리버리. 010-2236-8276.',
  robots: { index: true, follow: true },
  alternates: { canonical: '/', types: { 'application/rss+xml': [{ url: '/rss.xml', title: `${BRAND} 분양 안내` }] } },
  // TODO: 서치어드바이저·서치콘솔 소유확인 코드
};

export const viewport: Viewport = { themeColor: '#ffffff', width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css" />
      </head>
      <body>
        <JsonLd data={businessJsonLd()} />
        <Header />
        {children}
        <Footer />
        <StickyBar />
        <Motion />
      </body>
    </html>
  );
}
