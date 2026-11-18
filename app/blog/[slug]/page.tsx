import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPosts, getPost, postPath, postEncPath, postImage } from '../../../lib/blog';
import { BRAND, BUSINESS, CONTACT, SITE_URL } from '../../../lib/site';
import { breadcrumbJsonLd, pageListJsonLd } from '../../../lib/jsonld';
import { Actions, IconArrow, JsonLd, SectionHead } from '../../../components/Common';

export const dynamicParams = false;
export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getPost(params.slug);
  if (!p) return { robots: { index: false } };
  const url = postEncPath(p);
  const title = `${p.title} | ${BRAND}`;
  return { title, description: p.description, alternates: { canonical: url },
    openGraph: { type: 'article', siteName: BRAND, locale: 'ko_KR', title, description: p.description, url, publishedTime: p.date, images: [postImage(p)] },
    twitter: { card: 'summary_large_image', title, description: p.description, images: [postImage(p)] } };
}

// 문단 안 내부 링크 `[글자](/경로/)` 만 링크로 (그 외 마크다운은 쓰지 않는다)
function rich(t: string) {
  const parts = t.split(/(\[[^\]]+\]\(\/[^)]*\))/g);
  return parts.map((s, i) => { const m = s.match(/^\[([^\]]+)\]\((\/[^)]*)\)$/); return m ? <Link key={i} href={m[2]}>{m[1]}</Link> : s; });
}

export default function PostPage({ params }: { params: { slug: string } }) {
  const p = getPost(params.slug);
  if (!p) notFound();
  const all = getPosts(), at = all.indexOf(p);
  const others = [...all.slice(at + 1), ...all.slice(0, at)].slice(0, 6);
  const path = postEncPath(p);
  return (
    <main>
      <JsonLd data={[
        { '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.description, datePublished: p.date, dateModified: p.date,
          mainEntityOfPage: `${SITE_URL}${path}`, image: `${SITE_URL}${postImage(p)}`,
          author: { '@type': 'Organization', name: BUSINESS.name }, publisher: { '@type': 'Organization', name: BUSINESS.name } },
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '분양 가이드', path: '/blog/' }, { name: p.title, path }]),
        pageListJsonLd(`${BRAND} 분양 가이드 다른 글`, others.map((x) => ({ name: x.title, path: postEncPath(x), image: postImage(x) }))),
      ]} />
      <div className="wrap content page-top">
        <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><Link href="/blog/">분양 가이드</Link></nav>
        <p className="hero-label dark">{p.date.replace(/-/g, '.')}</p>
        <h1 className="page-title">{p.title}</h1>
        <p className="prose-p">{p.description}</p>
        <figure className="post-fig"><img src={postImage(p)} alt={`${p.keyword} — ${BUSINESS.name} 분양 아이 사진`} /></figure>
        <article className="prose">
          {p.sections.map((x, i) => (
            <section key={x.h} className="sec">
              <SectionHead no={String(i + 1).padStart(2, '0')} title={x.h} />
              {x.p.map((t) => <p key={t}>{rich(t)}</p>)}
              {x.list.length > 0 && <ul className="post-ul">{x.list.map((t) => <li key={t}>{rich(t)}</li>)}</ul>}
            </section>
          ))}
        </article>
        {others.length > 0 && (
          <section className="sec related">
            <div><h3>다른 분양 가이드</h3><ul>{others.map((x) => <li key={x.slug}><Link href={postPath(x)}>{x.title}<IconArrow /></Link></li>)}</ul></div>
          </section>
        )}
      </div>
      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>궁금한 아이가 있으면 방문 예약부터</h2>
          <p>전화 {CONTACT.phone}로 예약하면 {BUSINESS.name}에서 1:1로 상담합니다. 건강 확인은 동물병원에서 직접 하고, 계약서와 사후관리까지 안내합니다.</p>
          <Actions />
        </div>
      </section>
    </main>
  );
}
