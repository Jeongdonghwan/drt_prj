import type { Metadata } from 'next';
import Link from 'next/link';
import { BRAND, BUSINESS, CONTACT, BRANCHES, LINKS, ADOPT_STEPS, PROMISES, DELIVERY_STEPS } from '../../lib/site';
import { breadcrumbJsonLd, ogMeta } from '../../lib/jsonld';
import { Actions, JsonLd, SectionHead } from '../../components/Common';

export const metadata: Metadata = ogMeta(`${BUSINESS.name} 소개 | 사상구 주례동 강아지·고양이 분양`, `${BUSINESS.name}(${BUSINESS.address}) 소개. 예약제 1:1 상담, 동물병원 건강 확인, 계약서, 분양 후 사후관리, 홈딜리버리. ${CONTACT.phone}.`, '/about/', 'home');

// 소개 페이지 — 공식 사이트에 있는 사실만(지점·절차·약속·홈딜리버리·사업자 정보)
export default function About() {
  return (
    <main>
      <JsonLd data={breadcrumbJsonLd([{ name: '홈', path: '/' }, { name: `${BUSINESS.name} 소개`, path: '/about/' }])} />
      <div className="wrap content page-top">
        <p className="hero-label">ABOUT</p>
        <h1 className="page-title">{BUSINESS.name}</h1>
        <p className="prose-p">{BRAND}은 강아지·고양이 분양 매장입니다. 부산본점은 {BUSINESS.address}에 있고, 아이들 휴식 때문에 방문은 예약제로 받습니다. 예약 시간에 전문 펫플래너가 1:1로 상담하고, 건강 확인은 예비 보호자가 동물병원에서 직접 합니다.</p>
        <dl className="info" data-reveal>
          <div><dt>매장</dt><dd>{BUSINESS.name}</dd></div>
          <div><dt>주소</dt><dd>{BUSINESS.address}</dd></div>
          <div><dt>예약</dt><dd>전화 {CONTACT.phone} · 카카오톡 · 인스타그램 DM</dd></div>
          <div><dt>대표 · 사업자</dt><dd>{BUSINESS.owner} · {BUSINESS.bizNumber}</dd></div>
          <div><dt>공식 사이트</dt><dd><a href={LINKS.home} target="_blank" rel="noopener">dorothypet.co.kr</a></dd></div>
        </dl>
        <Actions />

        <section className="sec">
          <SectionHead no="01" title="분양은 이렇게 진행됩니다" />
          <ol className="timeline reveal-group">{ADOPT_STEPS.map((st) => <li key={st.t}><strong>{st.t}</strong><p>{st.d}</p></li>)}</ol>
        </section>
        <section className="sec alt">
          <SectionHead no="02" title={`${BRAND}이 지키는 것`} />
          <ul className="promises reveal-group">{PROMISES.map((x) => <li key={x.t}><h3>{x.t}</h3><p>{x.d}</p></li>)}</ul>
        </section>
        <section className="sec">
          <SectionHead no="03" title="홈딜리버리" sub="매장 상담으로 분양을 정한 뒤, 직접 오기 어려우면 집까지 데려다줍니다." />
          <ol className="steps11 reveal-group">{DELIVERY_STEPS.map((d) => <li key={d}>{d}</li>)}</ol>
        </section>
        <section className="sec alt">
          <SectionHead no="04" title="도로시펫 지점" sub="지점마다 분양 아이가 달라 방문 전 전화로 확인해 주세요." />
          <dl className="types reveal-group">{BRANCHES.map((b) => <div key={b.name}><dt>{BRAND} {b.name}</dt><dd>{b.address} · {b.phone}</dd></div>)}</dl>
        </section>
        <p className="prose-p"><Link href="/area/">전체 분양 안내</Link> · <Link href="/blog/">분양 가이드</Link> · <Link href="/">홈</Link></p>
      </div>
    </main>
  );
}
