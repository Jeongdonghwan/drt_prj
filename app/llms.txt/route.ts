// llms.txt — 사이트 요약과 핵심 페이지 목록 (정적)
import { STORE_PAGES, storeEncPath } from '../../lib/data';
import { getPosts, postEncPath } from '../../lib/blog';
import { SITE_URL, BRAND, BUSINESS, CONTACT } from '../../lib/site';

export const dynamic = 'force-static';

export function GET() {
  const top = [...STORE_PAGES].sort((a, b) => b.impressions - a.impressions).slice(0, 60);
  const posts = getPosts().slice(0, 20);
  const lines = [
    `# ${BUSINESS.name} 강아지·고양이 분양`, '',
    `> ${BUSINESS.name}(${BUSINESS.address}) 분양 안내. 예약제 1:1 상담, 동물병원 건강 확인, 계약서, 분양 후 사후관리, 홈딜리버리. 상담 ${CONTACT.phone}. 분양가는 아이마다 달라 상담으로 안내합니다.`, '',
    '## 주요 페이지', `- [${BUSINESS.name} 소개](${SITE_URL}/about/)`, `- [전체 분양 안내](${SITE_URL}/area/)`, `- [분양 가이드](${SITE_URL}/blog/)`,
    ...top.map((p) => `- [${p.kw}](${SITE_URL}${storeEncPath(p)})`),
    ...(posts.length ? ['', '## 최근 글', ...posts.map((p) => `- [${p.title}](${SITE_URL}${postEncPath(p)})`)] : []),
    '', '## 사이트맵', `- ${SITE_URL}/sitemap.xml`, '',
  ];
  return new Response(lines.join('\n'), { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
}
