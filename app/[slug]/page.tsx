import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STORE_PAGES, getStore, storePath, storeEncPath, relatedStore } from '../../lib/data';
import { composeRay } from '../../lib/ray';
import { BRAND, CONTACT, LINKS, tel } from '../../lib/site';
import { breadcrumbJsonLd, faqJsonLd, pageListJsonLd, ogMeta } from '../../lib/jsonld';
import { Actions, IconArrow, IconPhone, JsonLd } from '../../components/Common';

export const dynamicParams = false;
export function generateStaticParams() {
  return STORE_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getStore(params.slug);
  if (!p) return {};
  const c = composeRay(p);
  return ogMeta(c.title, c.description, storeEncPath(p), p.slug);
}

// 레이 모범 구조: 분류 줄 → h1(키워드+수식어) → 설명 → 핵심 요약 → 번호 절 6개 → FAQ → 관련 링크 (lib/ray.ts)
export default function StorePage({ params }: { params: { slug: string } }) {
  const p = getStore(params.slug);
  if (!p) notFound();
  const c = composeRay(p);
  const rel = relatedStore(p);
  const path = storeEncPath(p);
  const groups = [
    { h: `${c.name} 다른 안내`, items: rel.sameBreed.slice(0, 5) },
    { h: `${p.place ? p.place.label : c.store} 다른 안내`, items: rel.samePlace.slice(0, 5) },
    { h: '비슷한 질문', items: rel.sameIntent.slice(0, 4) },
  ].filter((g) => g.items.length);

  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '전체 안내', path: '/area/' }, { name: p.kw, path }]),
        faqJsonLd(c.faq),
        pageListJsonLd(`${p.kw} 관련 안내`, groups.flatMap((g) => g.items).map((x) => ({ name: x.kw, path: storeEncPath(x) }))),
      ]} />

      <section className="hero">
        <img className="hero-bg" src={`/images/${c.heroImg}.webp`} alt={`${p.kw} ${BRAND} ${c.kindWord} 사진`} fetchPriority="high" />
        <div className="wrap">
          <div className="hero-copy">
            <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><Link href="/area/">전체 안내</Link><span>/</span>{p.kw}</nav>
            <p className="hero-label">{c.cat}</p>
            <h1 className="hero-title"><span>{p.kw}</span>{' '}<span className="hero-sub">{c.h1sub}</span></h1>
            <p className="hero-lead">{c.lead}</p>
            <Actions />
          </div>
        </div>
      </section>

      <div className="wrap content x-grid">
        <div className="x-main">
          <section className="x-sum" data-reveal>
            <h2>{p.kw} 핵심 요약</h2>
            <p>{c.summary}</p>
            <dl>{c.facts.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </section>
          <article className="x-article">
            {c.sections.map((x, i) => (
              <section key={x.k}>
                <h2><span>{String(i + 1).padStart(2, '0')}</span>{x.h}</h2>
                <p>{x.p}</p>
              </section>
            ))}
          </article>
          {c.gallery.length > 0 && (
            <div className="gallery x-gallery">
              {c.gallery.map((src, i) => <figure key={src}><img src={src} alt={`${p.kw} ${c.name} 분양 사진 ${i + 1}`} loading="lazy" /></figure>)}
            </div>
          )}
          <section className="x-faq" id="faq">
            <h2>{p.kw} 자주 묻는 질문</h2>
            <div className="faq">{c.faq.map((f) => <details key={f.q}><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
          </section>
        </div>
        <aside className="x-side">
          <h3>바로 확인</h3>
          <dl>{c.facts.slice(0, 2).map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          <a className="btn-primary" href={tel}><IconPhone /><span>{CONTACT.phone}</span></a>
          <a className="btn-text" href={LINKS.kakao} target="_blank" rel="noopener"><span>카카오톡 상담</span><IconArrow /></a>
        </aside>
      </div>

      <div className="wrap content">
        <section className="sec related">
          {groups.map((g) => <div key={g.h}><h3>{g.h}</h3><ul>{g.items.map((x) => <li key={x.slug}><Link href={storePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>)}
        </section>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>{c.closing}</h2>
          <Actions />
        </div>
      </section>
    </main>
  );
}
