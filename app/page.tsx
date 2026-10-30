import Link from 'next/link';
import { BREEDS, STORE_PAGES, Breed, storePath, storeEncPath } from '../lib/data';
import { BRAND, BUSINESS, FRANCHISE_SITE, ADOPT_STEPS, PROMISES, DELIVERY_STEPS } from '../lib/site';
import { faqJsonLd, pageListJsonLd, ogMeta } from '../lib/jsonld';
import { Actions, IconArrow, JsonLd, SectionHead } from '../components/Common';

const base = ogMeta(`부산강아지분양 ${BRAND} 부산본점 | 강아지·고양이 분양 상담`, `${BRAND} 부산본점 강아지·고양이 분양. 방문 예약 1:1 상담, 동물병원 건강 확인, 계약서, 사후관리, 홈딜리버리. 010-2236-8276.`, '/', 'home');
export const metadata = { ...base, alternates: { ...base.alternates, types: { 'application/rss+xml': [{ url: '/rss.xml', title: `${BRAND} 분양 안내` }] } } };

const FAQ = [
  { q: '분양가는 얼마인가요?', a: '혈통·모색·성별·월령에 따라 달라 아이를 보고 상담으로 안내합니다.' },
  { q: '건강은 어떻게 확인하나요?', a: '예비 견주·묘주님이 동물병원에 직접 가서 기본 건강검진으로 확인한 뒤 분양합니다.' },
  { q: '멀리 살아도 분양받을 수 있나요?', a: '매장 상담으로 분양을 정한 뒤 홈딜리버리로 집까지 데려다줍니다.' },
  { q: '방문은 예약제인가요?', a: '전화·오픈카톡·인스타그램 DM으로 예약하면 1:1로 상담합니다.' },
];

const listed = (kind: 'dog' | 'cat') =>
  BREEDS.filter((b) => b.kind === kind && b.siteCount && b.photos.length && !/special/.test(b.site || '')).sort((a, b) => b.siteCount! - a.siteCount!).slice(0, 12);
const pageOf = (name: string) => STORE_PAGES.find((p) => p.breed?.name === name && (p.intent === 'sale' || p.intent === 'breed'));

function BreedRail({ items }: { items: Breed[] }) {
  return (
    <div className="rail">
      {items.map((b) => {
        const pg = pageOf(b.name);
        const card = (
          <>
            <div className="prod-img"><img src={`/images/b/${b.photos[0]}.webp`} alt={`${b.name} 분양 ${BRAND} 부산본점`} loading="lazy" /><span className="prod-light">{b.size}</span></div>
            <div className="prod-body"><strong>{b.siteName}</strong><span>{b.coat} · 털 빠짐 {b.shed}</span></div>
          </>
        );
        return pg ? <Link key={b.id} className="prod" href={storePath(pg)}>{card}</Link> : <div key={b.id} className="prod">{card}</div>;
      })}
    </div>
  );
}

export default function Home() {
  const top = [...STORE_PAGES].sort((a, b) => b.impressions - a.impressions).slice(0, 30);
  return (
    <main>
      <JsonLd data={[faqJsonLd(FAQ), pageListJsonLd(`${BRAND} 분양 안내`, top.map((x) => ({ name: x.kw, path: storeEncPath(x) })))]} />
      <section className="hero hero-home">
        <img className="hero-bg" src="/images/place-hall-1.webp" alt={`${BRAND} 부산본점 분양 매장 내부 사진`} fetchPriority="high" />
        <div className="wrap">
          <div className="hero-copy">
            <p className="hero-label">PREMIUM CARE HOUSE · BUSAN</p>
            <h1 className="hero-title"><span>건강한 반려동물을</span><span>처음 만나는 곳, {BRAND}</span></h1>
            <p className="hero-lead">부산 사상구 주례동 {BRAND} 부산본점. 방문 예약 후 전문 펫플래너가 1:1로 상담하고, 동물병원 건강 확인부터 계약·사후관리까지 함께합니다.</p>
            <Actions />
          </div>
        </div>
      </section>

      <div className="wrap content">
        <section className="sec" id="breeds">
          <SectionHead no="01" title="많이 찾는 강아지" />
          <BreedRail items={listed('dog')} />
        </section>
        <section className="sec">
          <SectionHead no="02" title="많이 찾는 고양이" />
          <BreedRail items={listed('cat')} />
        </section>

        <section className="sec alt">
          <SectionHead no="03" title="분양은 이렇게 진행됩니다" />
          <ol className="timeline reveal-group">{ADOPT_STEPS.map((st) => <li key={st.t}><strong>{st.t}</strong><p>{st.d}</p></li>)}</ol>
        </section>

        <section className="sec">
          <SectionHead no="04" title={`${BRAND}이 지키는 것`} />
          <ul className="promises reveal-group">{PROMISES.map((x) => <li key={x.t}><h3>{x.t}</h3><p>{x.d}</p></li>)}</ul>
        </section>
      </div>

      <section className="cta-band" data-reveal>
        <div className="wrap cta-band-in"><p>방문 전 <em>예약</em>하면 1:1로 상담합니다.</p><Actions /></div>
      </section>

      <div className="wrap content">

        <section className="sec">
          <SectionHead no="05" title="부산본점 매장" sub={`${BUSINESS.address} · 방문 예약 후 1:1 상담`} />
          <div className="rooms-photo">
            <figure data-reveal><img src="/images/place-front.webp" alt={`${BRAND} 부산본점 매장 외관`} loading="lazy" /><figcaption>매장 외관</figcaption></figure>
            <figure data-reveal><img src="/images/place-hall-2.webp" alt={`${BRAND} 부산본점 상담 공간`} loading="lazy" /><figcaption>상담 공간</figcaption></figure>
            <figure data-reveal><img src="/images/place-hall-3.webp" alt={`${BRAND} 부산본점 분양 공간`} loading="lazy" /><figcaption>분양 공간</figcaption></figure>
          </div>
        </section>

        <section className="sec alt">
          <SectionHead no="06" title="홈딜리버리" sub="매장 상담으로 분양을 정한 뒤, 직접 오기 어려우면 집까지 데려다줍니다." />
          <ol className="steps11 reveal-group">{DELIVERY_STEPS.map((d) => <li key={d}>{d}</li>)}</ol>
        </section>

        <section className="sec" id="faq">
          <SectionHead no="07" title="자주 묻는 질문" />
          <div className="faq">{FAQ.map((f) => <details key={f.q} data-reveal><summary>{f.q}<i /></summary><p>{f.a}</p></details>)}</div>
        </section>

        <section className="sec related">
          <div><h3>많이 찾는 분양 안내</h3><ul>{top.slice(0, 12).map((x) => <li key={x.slug}><Link href={storePath(x)}>{x.kw}<IconArrow /></Link></li>)}</ul></div>
          <div><h3>더 보기</h3><ul><li><Link href="/area/">전체 분양 안내 {STORE_PAGES.length}개<IconArrow /></Link></li><li><a href={FRANCHISE_SITE} target="_blank" rel="noopener">가맹 창업 사이트<IconArrow /></a></li></ul></div>
        </section>
      </div>

      <section className="closing">
        <div className="wrap" data-reveal>
          <h2>방문 날짜부터 잡아 주세요</h2>
          <p>{BUSINESS.address}</p>
          <Actions />
        </div>
      </section>
    </main>
  );
}
