// 도로시펫 공통 UI — 각진 버튼, 선 아이콘, 번호 머리, 하단 고정 상담 바.
import Link from 'next/link';
import { BRAND, BRAND_EN, CONTACT, BUSINESS, LINKS, BRANCHES, FRANCHISE_SITE, tel } from '../lib/site';

export const JsonLd = ({ data }: { data: object | object[] }) => (
  <>{(Array.isArray(data) ? data : [data]).map((d, i) => <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(d) }} />)}</>
);

const Svg = ({ d, size = 18 }: { d: string; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
);
export const IconPhone = () => <Svg d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />;
export const IconMsg = () => <Svg d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />;
export const IconArrow = () => <Svg d="M5 12h14M13 6l6 6-6 6" size={16} />;
export const IconPin = () => <Svg d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />;

export const Actions = ({ franchise }: { franchise?: boolean }) => (
  <div className="actions">
    <a className="btn-primary" href={tel}><IconPhone /><span>{franchise ? '가맹 상담 ' : ''}{CONTACT.phone}</span></a>
    <a className="btn-text" href={LINKS.kakao} target="_blank" rel="noopener"><IconMsg /><span>카카오톡 상담</span><IconArrow /></a>
  </div>
);

export const SectionHead = ({ no, title, sub }: { no: string; title: React.ReactNode; sub?: string }) => (
  <header className="sh" data-reveal>
    <span className="sh-no">{no}</span>
    <h2>{title}</h2>
    {sub && <p>{sub}</p>}
  </header>
);

export const Header = () => (
  <header className="site-header">
    <div className="wrap header-inner">
      <Link href="/" className="logo"><b>{BRAND}</b><small>{BRAND_EN}</small></Link>
      <nav className="nav">
        <Link href="/#breeds">분양</Link>
        <Link href="/area/">전체 안내</Link>
        <a href={FRANCHISE_SITE} target="_blank" rel="noopener">가맹 창업</a>
        <a href={LINKS.home} target="_blank" rel="noopener">공식 사이트</a>
        <a href={tel} className="nav-call"><IconPhone />{CONTACT.phone}</a>
      </nav>
    </div>
  </header>
);

export const Footer = () => (
  <footer className="site-footer">
    <div className="wrap foot-grid">
      <div>
        <strong className="foot-brand">{BRAND}</strong>
        <p>강아지·고양이 분양, 애견미용·호텔, 홈딜리버리. 가맹점 모집 중.</p>
        <ul className="foot-branches">{BRANCHES.map((b) => <li key={b.name}><b>{b.name}</b> {b.address} · {b.phone}</li>)}</ul>
        <p className="foot-links"><a href={LINKS.home} target="_blank" rel="noopener">dorothypet.co.kr</a><a href={LINKS.instagram} target="_blank" rel="noopener">인스타그램</a><a href={LINKS.youtube} target="_blank" rel="noopener">유튜브</a><a href={LINKS.blog} target="_blank" rel="noopener">블로그</a></p>
      </div>
      <ul className="foot-info">
        <li><span>상호</span>{BUSINESS.name}</li>
        <li><span>대표</span>{BUSINESS.owner}</li>
        <li><span>사업자</span>{BUSINESS.bizNumber}</li>
        <li><span>주소</span>{BUSINESS.address}</li>
        <li><span>대표전화</span>{CONTACT.phone}</li>
      </ul>
    </div>
    <div className="wrap foot-bottom">© {new Date().getFullYear()} {BUSINESS.name} · 분양가는 아이마다 달라 상담으로 안내합니다.</div>
  </footer>
);

// 하단 고정 상담 바 — 항상 보임
export const StickyBar = () => (
  <div className="sticky-bar">
    <a href={tel} className="sb-call"><IconPhone /><span><b>전화 상담</b><small>{CONTACT.phone}</small></span></a>
    <a href={LINKS.kakao} target="_blank" rel="noopener" className="sb-kakao"><IconMsg /><span><b>카카오톡 상담</b><small>방문 예약</small></span></a>
    <a href={FRANCHISE_SITE} target="_blank" rel="noopener" className="sb-fr"><IconPin /><span><b>가맹 문의</b><small>창업 사이트</small></span></a>
  </div>
);
