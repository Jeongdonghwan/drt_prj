import type { Metadata } from 'next';
import Link from 'next/link';
import { STORE_PAGES, storePath, storeEncPath } from '../../lib/data';
import { BRAND } from '../../lib/site';
import { pageListJsonLd, ogMeta } from '../../lib/jsonld';
import { JsonLd } from '../../components/Common';

export const metadata: Metadata = ogMeta(`${BRAND} 분양 안내 전체 | 강아지·고양이·부산 지역`, `${BRAND} 강아지·고양이 분양, 견종별·부산 동네별 분양 안내 페이지 모음. 부산본점 사상구 주례동, 방문 예약 1:1 상담.`, '/area/', 'area');

// 열린 모든 매장 키워드 페이지로 가는 크롤 경로
export default function Area() {
  const groups: [string, typeof STORE_PAGES][] = [
    ['강아지 견종', STORE_PAGES.filter((p) => p.breed?.kind === 'dog')],
    ['고양이 품종', STORE_PAGES.filter((p) => p.breed?.kind === 'cat')],
    ['부산·경남 동네', STORE_PAGES.filter((p) => !p.breed && p.placeKey)],
    ['분양·입양 일반', STORE_PAGES.filter((p) => !p.breed && !p.placeKey)],
  ];
  return (
    <main>
      <JsonLd data={pageListJsonLd(`${BRAND} 분양 안내 전체`, STORE_PAGES.map((x) => ({ name: x.kw, path: storeEncPath(x) })))} />
      <div className="wrap content page-top">
        <p className="hero-label">ALL</p>
        <h1 className="page-title">{BRAND} 분양 안내 전체</h1>
        <p className="prose-p">{BRAND} 부산본점 분양 안내 페이지 {STORE_PAGES.length.toLocaleString()}개입니다.</p>
        {groups.map(([h, list]) => (
          <section key={h} className="sec">
            <h2 className="area-h">{h} · {list.length}</h2>
            <ul className="area-list">{list.map((p) => <li key={p.slug}><Link href={storePath(p)}>{p.kw}</Link></li>)}</ul>
          </section>
        ))}
      </div>
    </main>
  );
}
