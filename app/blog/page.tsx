import type { Metadata } from 'next';
import Link from 'next/link';
import { getPosts, postPath, postEncPath, postImage } from '../../lib/blog';
import { BRAND, BUSINESS } from '../../lib/site';
import { pageListJsonLd, breadcrumbJsonLd } from '../../lib/jsonld';
import { IconArrow, JsonLd } from '../../components/Common';

const TITLE = `분양 가이드 | 강아지·고양이 데려오기 전에 읽는 글 · ${BRAND}`;
const DESC = `${BUSINESS.name}가 정리한 분양 가이드. 분양 절차, 준비물, 첫 주 적응, 건강 확인, 견종별 성격과 관리처럼 데려오기 전에 자주 묻는 것들.`;
export const metadata: Metadata = {
  title: TITLE, description: DESC, alternates: { canonical: '/blog/' },
  openGraph: { type: 'website', siteName: BRAND, locale: 'ko_KR', title: TITLE, description: DESC, url: '/blog/', images: ['/og/home.jpg?v=2'] },
  twitter: { card: 'summary_large_image', title: TITLE, description: DESC, images: ['/og/home.jpg?v=2'] },
};

export default function Blog() {
  const posts = getPosts();
  return (
    <main>
      <div className="wrap content page-top">
        <JsonLd data={[breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '분양 가이드', path: '/blog/' }]), pageListJsonLd(`${BRAND} 분양 가이드`, posts.map((p) => ({ name: p.title, path: postEncPath(p), image: postImage(p) })))]} />
        <p className="hero-label dark">GUIDE</p>
        <h1 className="page-title">분양 가이드</h1>
        <p className="prose-p">강아지·고양이를 데려오기 전에 자주 묻는 것들을 {BUSINESS.name} 상담사가 정리했습니다. 절차·준비물·첫 주 적응·건강 확인·견종별 관리 순으로 읽으면 됩니다.</p>
        <h2 className="area-h">최근 글</h2>
        <ul className="post-list">
          {posts.map((p) => (
            <li key={p.slug} data-reveal>
              <Link href={postPath(p)}>
                <img src={postImage(p)} alt={p.keyword} loading="lazy" />
                <span><small>{p.date.replace(/-/g, '.')}</small><b>{p.title}</b><em>{p.description}</em></span>
                <IconArrow />
              </Link>
            </li>
          ))}
        </ul>
        <p className="prose-p"><Link href="/area/">전체 분양 안내</Link> · <Link href="/about/">{BUSINESS.name} 소개</Link></p>
      </div>
    </main>
  );
}
