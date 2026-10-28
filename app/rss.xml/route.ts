// RSS 2.0 — 사이트맵과 같은 페이지(매장). 서치어드바이저 RSS 제출용
import { STORE_PAGES, storeEncPath } from '../../lib/data';
import { composeStore } from '../../lib/compose-store';
import { SITE_URL, BRAND } from '../../lib/site';

export const dynamic = 'force-static';

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export function GET() {
  const date = new Date().toUTCString();
  const item = (title: string, description: string, path: string) => {
    const url = `${SITE_URL}${path}`;
    return `<item><title>${esc(title)}</title><link>${url}</link><description>${esc(description)}</description><pubDate>${date}</pubDate><guid isPermaLink="true">${url}</guid></item>`;
  };
  const items = STORE_PAGES.map((p) => { const c = composeStore(p); return item(c.title, c.description, storeEncPath(p)); });
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>${esc(BRAND)} 분양 안내</title><link>${SITE_URL}/</link><description>${esc(BRAND)} 부산본점 강아지·고양이 분양 안내</description><language>ko</language><lastBuildDate>${date}</lastBuildDate>
${items.join('\n')}
</channel></rss>`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
}
