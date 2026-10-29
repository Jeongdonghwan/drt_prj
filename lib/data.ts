// 데이터 로더 — 키워드 페이지(매장·창업), 견종 사전, 지역 사실. 빌드 전용.
import pagesData from '../data/pages.json';
import breedData from '../data/breeds.json';
import regionData from '../data/regions.json';

export interface Breed {
  id: string; name: string; kind: 'dog' | 'cat'; size: string; coat: string; shed: string; trait: string; care: string;
  site: string | null; siteName: string | null; siteCount: number | null; photos: string[];
}
export interface Region {
  label: string; sido: string; sidoName: string; level: 'sido' | 'city'; households: number; onePct: number; dogs: number; cats: number;
  per100: number; rankDogs: number; rankPer100: number; rankOf: number;
  parts: { name: string; households: number; onePct: number; dogs?: number | null }[]; gus?: { name: string; households: number; onePct: number }[];
}
export interface Place { label: string; gu?: string; households: number; onePct: number; dogs: number; cats: number; scope: string; dongHouseholds?: number; dongOnePct?: number }

export type Intent = 'price' | 'shelter' | 'goods' | 'cafe' | 'origin' | 'trust' | 'info' | 'shop' | 'adopt' | 'sale' | 'brand' | 'breed';
export interface StorePage { set: 'store'; kw: string; slug: string; impressions: number; clicks: number; breed?: Breed; generic?: 'dog' | 'cat'; placeKey?: string; place?: Place; intent: Intent }
export type FrWord = '창업' | '소자본창업' | '강아지분양창업' | '펫샵창업' | '애견샵창업' | '애견분양창업' | '애견분양샵창업' | 'core';
// breakdown: '포항'·'경기'처럼 짧은 표기 → 구·동·시군 나눔 데이터 중심 / 정식 표기('포항시'·'경기도') → 전체·평균 비교 중심
export interface FrPage { set: 'franchise'; kw: string; slug: string; regionKey?: string; region?: Region; word: FrWord; added: boolean; breakdown: boolean }

export const BREEDS = breedData.breeds as Breed[];
const ALIAS = breedData.alias as Record<string, string>;
const BY_ID = new Map(BREEDS.map((b) => [b.id, b]));
export const REGIONS = regionData.regions as unknown as Record<string, Region>;
export const PLACES = regionData.places as unknown as Record<string, Place>;

// ---- 매장 키워드 해석: 동네(앞·뒤) → 견종(가장 긴 표기) → 의도 ----
const PLACE_KEYS = Object.keys(PLACES).sort((a, b) => b.length - a.length);
const ALIAS_KEYS = Object.keys(ALIAS).sort((a, b) => b.length - a.length);
const INTENTS: [Intent, RegExp][] = [
  ['brand', /도로시/],
  ['shelter', /유기견|유기묘|보호소|무료|책임분양|센터/],
  ['goods', /용품/],
  ['cafe', /카페|공원|동반/],
  ['origin', /교배|켄넬|캐터리/],
  ['trust', /후기|정직|추천/],
  ['price', /분양가|가격|비용|시세|저렴/],
  ['info', /성격|수명|성견|종류|품종|견종|키우기|새끼|생김/],
  ['shop', /펫샵|샵|샾|파는곳|분양소|분양전문|매장|거리|구매/],
  ['adopt', /입양/],
  ['sale', /분양/],
];

function parseStore(raw: any): StorePage {
  const k = raw.kw.replace(/\s/g, '');
  let placeKey: string | undefined;
  let rest = k;
  for (const pk of PLACE_KEYS) {
    if (rest.startsWith(pk) || rest.endsWith(pk)) { placeKey = pk; rest = rest.startsWith(pk) ? rest.slice(pk.length) : rest.slice(0, -pk.length); break; }
  }
  if (!placeKey && /사하구|연제구|강서구/.test(k)) placeKey = PLACE_KEYS.find((pk) => k.includes(pk));
  const hit = ALIAS_KEYS.find((a) => rest.includes(a));
  const id = hit ? ALIAS[hit] : undefined;
  const breed = id && BY_ID.get(id);
  const generic = !breed && id ? (id as 'dog' | 'cat') : !breed && /고양이|묘/.test(k) ? 'cat' : !breed ? 'dog' : undefined;
  let intent: Intent = (INTENTS.find(([, re]) => re.test(k)) || [breed ? 'breed' : 'shop'])[0] as Intent;
  if (intent === 'sale' && !breed && !placeKey) intent = 'shop';
  return { set: 'store', kw: raw.kw, slug: raw.slug, impressions: raw.impressions, clicks: raw.clicks, breed: breed || undefined, generic, placeKey, place: placeKey ? PLACES[placeKey] : undefined, intent };
}

// ---- 창업 키워드 해석: '지역 유형' ----
const SIDO_LONG: Record<string, string> = {
  서울특별시: '서울', 부산광역시: '부산', 대구광역시: '대구', 인천광역시: '인천', 광주광역시: '광주', 대전광역시: '대전', 울산광역시: '울산',
  세종특별자치시: '세종', 경기도: '경기', 강원도: '강원', 충청북도: '충북', 충청남도: '충남', 전라북도: '전북', 전라남도: '전남',
  경상북도: '경북', 경상남도: '경남', 제주도: '제주',
};
function regionKeyOf(name: string): string | undefined {
  if (SIDO_LONG[name]) return SIDO_LONG[name];
  if (REGIONS[name]) return name; // 서울·부산·…·광주(광역시)·제주(도)·광주시·제주시
  const short = name.replace(/시$/, '');
  return REGIONS[short] ? short : undefined;
}
function parseFr(raw: any): FrPage {
  const m = raw.kw.match(/^(\S+)\s+(\S+)$/);
  if (!m) return { set: 'franchise', kw: raw.kw, slug: raw.slug, word: 'core', added: raw.added, breakdown: false };
  const rk = regionKeyOf(m[1]);
  if (!rk) throw new Error(`지역 못 찾음: ${raw.kw}`);
  return { set: 'franchise', kw: raw.kw, slug: raw.slug, regionKey: rk, region: REGIONS[rk], word: m[2] as FrWord, added: raw.added, breakdown: m[1] === rk };
}

export const STORE_PAGES: StorePage[] = (pagesData.store as any[]).map(parseStore);
export const FR_PAGES: FrPage[] = (pagesData.franchise as any[]).map(parseFr);

const dec = (slug: string) => { try { return decodeURIComponent(slug); } catch { return slug; } };
export const getStore = (slug: string) => STORE_PAGES.find((p) => p.slug === dec(slug));
export const getFr = (slug: string) => FR_PAGES.find((p) => p.slug === dec(slug));
export const storePath = (p: StorePage) => `/${p.slug}/`;
export const storeEncPath = (p: StorePage) => `/${encodeURIComponent(p.slug)}/`;
export const frPath = (p: FrPage) => `/franchise/${p.slug}/`;
export const frEncPath = (p: FrPage) => `/franchise/${encodeURIComponent(p.slug)}/`;

// FNV-1a + murmur fmix32 — FNV만 쓰면 하위 비트가 접미어('::topics')에 끌려가 한글 슬러그끼리 같은 선택이 반복된다
export const hash = (s: string) => {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b) >>> 0; h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35) >>> 0; h ^= h >>> 16;
  return h >>> 0;
};
const rot = <T,>(arr: T[], seed: string, n: number) => { if (!arr.length) return arr; const k = hash(seed) % arr.length; return [...arr.slice(k), ...arr.slice(0, k)].slice(0, n); };

// 관련 페이지: 같은 견종 / 같은 동네 / 같은 의도
export function relatedStore(p: StorePage) {
  const pool = STORE_PAGES.filter((x) => x.slug !== p.slug);
  return {
    sameBreed: p.breed ? rot(pool.filter((x) => x.breed?.id === p.breed!.id), p.slug, 10) : rot(pool.filter((x) => !x.breed && x.generic === p.generic), p.slug, 10),
    samePlace: p.placeKey ? rot(pool.filter((x) => x.placeKey === p.placeKey), p.slug, 10) : rot(pool.filter((x) => x.placeKey === '부산'), p.slug, 10),
    sameIntent: rot(pool.filter((x) => x.intent === p.intent && x.breed?.kind === p.breed?.kind), p.slug + 'i', 8),
  };
}
// 같은 지역 다른 유형 / 같은 유형 같은 시도 다른 지역
export function relatedFr(p: FrPage) {
  const pool = FR_PAGES.filter((x) => x.slug !== p.slug);
  return {
    sameRegion: pool.filter((x) => p.regionKey && x.regionKey === p.regionKey).slice(0, 10),
    sameWord: rot(pool.filter((x) => x.word === p.word && x.region?.sido === p.region?.sido && x.regionKey !== p.regionKey), p.slug, 10),
    wider: rot(pool.filter((x) => x.word === p.word && x.region?.level === 'sido' && x.regionKey !== p.regionKey), p.slug + 'w', 8),
  };
}
