import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { STORE_PAGES, getStore, storePath, storeEncPath, relatedStore } from '../../lib/data';
import { composeStore } from '../../lib/compose-store';
import { BRAND, BUSINESS } from '../../lib/site';
import { breadcrumbJsonLd, faqJsonLd, pageListJsonLd, ogMeta } from '../../lib/jsonld';
import { Actions, IconArrow, JsonLd, SectionHead } from '../../components/Common';

export const dynamicParams = false;
export function generateStaticParams() {
  return STORE_PAGES.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const p = getStore(params.slug);
  if (!p) return {};
  const c = composeStore(p);
  return ogMeta(c.title, c.description, storeEncPath(p), p.slug);
}

export default function StorePage({ params }: { params: { slug: string } }) {
  const p = getStore(params.slug);
  if (!p) notFound();
  const c = composeStore(p);
  const rel = relatedStore(p);
  const path = storeEncPath(p);
  const links = [...rel.sameBreed, ...rel.samePlace, ...rel.sameIntent];
  let n = 0;
  const no = () => String(++n).padStart(2, '0');

  return (
    <main>
      <JsonLd data={[
        breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: '전체 안내', path: '/area/' }, { name: p.kw, path }]),
        faqJsonLd(c.faq),
        pageListJsonLd(`${p.kw} 관련 안내`, links.map((x) => ({ name: x.kw, path: storeEncPath(x) }))),
      ]} />

      <section className="hero">
        <img className="hero-bg" src={`/images/${c.heroImg}.webp`} alt={`${p.kw} ${BRAND} ${c.kindWord} 사진`} fetchPriority="high" />
        <div className="wrap">
          <div className="hero-copy">
            <nav className="crumbs" aria-label="경로"><Link href="/">홈</Link><span>/</span><Link href="/area/">전체 안내</Link><span>/</span>{p.kw}</nav>
            <p className="hero-label">{c.eyebrow}</p>
            <h1 className="hero-title"><span>{p.kw}</span></h1>
            <p className="hero-lead">{c.lead}</p>
            <Actions />
            <dl className="hero-specs">{c.specs.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
        </div>
      </section>

      <div className="wrap content">
        <section className="sec">
          <SectionHead no={no()} title={`${p.kw}, 먼저 알아둘 것`} />
          <ul className="summary" data-reveal>{c.summary.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>

        <section className="sec alt">
          <SectionHead no={no()} title={c.breedSec.heading} />
          <div className="cols">
            <div className="prose" data-reveal>{c.breedSec.body.map((t, i) => <p key={i}>{t}</p>)}</div>
            <dl className="info" data-reveal>{c.breedSec.dl.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>
          </div>
          {c.gallery.length > 0 && <div className="gallery" style={{ marginTop: 30 }}>
            {c.gallery.slice(0, c.mods.has('gallery') ? 6 : 3).map((src, i) => <figure key={src} data-reveal style={{ transitionDelay: `${i * 60}ms` }}><img src={src} alt={`${p.kw} ${c.name} 분양 사진 ${i + 1}`} loading="lazy" /></figure>)}
          </div>}
        </section>

        {c.similarSec && c.mods.has('similar') && (
          <section className="sec">
            <SectionHead no={no()} title={c.similarSec.heading} />
            <dl className="types reveal-group">{c.similarSec.items.map((x) => <div key={x.name}><dt>{x.name}</dt><dd>{x.d}</dd></div>)}</dl>
          </section>
        )}

        <section className="sec">
          <SectionHead no={no()} title={c.intentBlock.heading} />
          <div className="prose" data-reveal>{c.intentBlock.body.map((t, i) => <p key={i}>{t}</p>)}</div>
          {c.intentBlock.table && (
            <div className="price-wrap" data-reveal><table className="price-table">
              <thead><tr>{c.intentBlock.table.head.map((h) => <th key={h} scope="col">{h}</th>)}</tr></thead>
              <tbody>{c.intentBlock.table.rows.map((r) => <tr key={r[0]}>{r.map((x, i) => i === 0 ? <th key={i} scope="row">{x}</th> : <td key={i}>{x}</td>)}</tr>)}</tbody>
            </table></div>
          )}
          {c.intentBlock.steps && <ol className="timeline reveal-group" style={{ marginTop: 26 }}>{c.intentBlock.steps.map((st) => <li key={st.t}><strong>{st.t}</strong><p>{st.d}</p></li>)}</ol>}
        </section>

        {c.adoptBlock && c.mods.has('adopt') && (
          <section className="sec">
            <SectionHead no={no()} title={c.adoptBlock.heading} sub={c.adoptBlock.body[0]} />
            <ol className="timeline reveal-group">{c.adoptBlock.steps!.map((st) => <li key={st.t}><strong>{st.t}</strong><p>{st.d}</p></li>)}</ol>
          </section>
        )}

      </div>

      <section className="cta-band" data-reveal>
        <div className="wrap cta-band-in">
          <p>방문 전 <em>예약</em>하면 1:1로 상담합니다.</p>
          <Actions />
        </div>
      </section>

      <div className="wrap content">
        <section className="sec">
          {c.showRegion && <SectionHead no={no()} title={c.regionSec.heading} />}
          {c.showRegion && <div className="prose" data-reveal>{c.regionSec.body.map((t, i) => <p key={i}>{t}</p>)}</div>}
          {c.delivery && (
            <>
              <h3 className="sub-h">홈딜리버리 순서</h3>
              <ol className="steps11 reveal-group">{c.delivery.map((d) => <li key={d}>{d}</li>)}</ol>
            </>
          )}
          <div className="rooms-photo">
            {c.rooms.map(([img, cap]) => <figure key={img} data-reveal><img src={`/images/${img}.webp`} alt={`${BUSINESS.name} ${cap} — ${p.kw}`} loading="lazy" /><figcaption>{BUSINESS.name} {cap}</figcaption></figure>)}
          </div>
        </section>

        {c.mods.has('promises') && (
          <section className="sec alt">
            <SectionHead no={no()} title={`${BRAND}이 지키는 것`} />
            <ul className="promises reveal-group">{c.promises.map((x) => <li key={x.t}><h3>{x.t}</h3><p>{x.d}</p></li>)}</ul>
          </section>
        )}

        <section className="sec">
          <SectionHead no={no()} title={`${c.name} 키우기, 많이 묻는 세 가지`} />
          <dl className="types reveal-group">{c.care3.map((x) => <div key={x.q}><dt>{x.q}</dt><dd>{x.a}</dd></div>)}</dl>
        </section>

        <section className="sec" id="faq">
          <SectionHead no={no()} title="자주 묻는 질문" />
          <div className="faq">{c.faq.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
        </section>

        <section className="sec related">
          {rel.sameBreed.length > 0 && <div><h3>{c.name} 다른 안내</h3><ul>{rel.sameBreed.map((x) => <li key={x.slug}><Link href={storePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
          {rel.samePlace.length > 0 && <div><h3>{p.place ? p.place.label : '부산'} 다른 안내</h3><ul>{rel.samePlace.map((x) => <li key={x.slug}><Link href={storePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
          {rel.sameIntent.length > 0 && <div><h3>비슷한 질문</h3><ul>{rel.sameIntent.map((x) => <li key={x.slug}><Link href={storePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>}
        </section>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>{c.closing}</h2>
          <p>{BUSINESS.address} · 방문 예약 후 1:1 상담</p>
          <Actions />
        </div>
      </section>
    </main>
  );
}
