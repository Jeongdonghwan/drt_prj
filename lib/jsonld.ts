import { SITE_URL, BRAND, CONTACT, BUSINESS, LINKS, BRANCHES } from './site';

export const businessJsonLd = () => ({
  '@context': 'https://schema.org',
  '@type': 'PetStore',
  '@id': `${SITE_URL}/#store`,
  name: BUSINESS.name,
  alternateName: BRAND,
  url: LINKS.home,
  image: `${SITE_URL}/images/hero-dog.webp`,
  telephone: CONTACT.phone,
  address: { '@type': 'PostalAddress', addressCountry: 'KR', addressRegion: '부산광역시', addressLocality: '사상구', streetAddress: '가야대로 336 A동' },
  department: BRANCHES.slice(1).map((b) => ({ '@type': 'PetStore', name: `${BRAND} ${b.name}`, telephone: b.phone, address: { '@type': 'PostalAddress', addressCountry: 'KR', streetAddress: b.address } })),
  sameAs: [LINKS.home, LINKS.instagram, LINKS.youtube, LINKS.blog],
});

export const breadcrumbJsonLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE_URL}${it.path}` })),
});

export const faqJsonLd = (faqs: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});

// 캐러셀용 페이지 목록 — 같은 도메인 절대 URL(인코딩된 경로)
export const pageListJsonLd = (name: string, items: { name: string; path: string; image?: string }[]) => ({
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name,
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, url: `${SITE_URL}${it.path}`, ...(it.image ? { image: `${SITE_URL}${it.image}` } : {}) })),
});

// 페이지별 og·트위터 (얕은 병합 함정 피하려고 openGraph 전체를 페이지에서 만든다)
export const ogMeta = (title: string, description: string, path: string, slug: string) => ({
  title, description,
  alternates: { canonical: path },
  openGraph: { type: 'website' as const, siteName: BRAND, locale: 'ko_KR', title, description, url: path, images: [{ url: `/og/${slug}.jpg?v=2`, width: 1200, height: 630, alt: title }] },
  twitter: { card: 'summary_large_image' as const, title, description, images: [`/og/${slug}.jpg?v=2`] },
});
