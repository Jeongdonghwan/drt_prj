// 키워드 페이지 점검(레이 구조, 2026-11-24): npx tsx scripts/x_check.ts
// description 길이(45~80)·중복, h1(키워드+수식어) 중복, 절 문단 길이, 본문 길이, 조사(끼워 넣은 단어 뒤), 같은 문장 비율(같은 견종 쌍 / 같은 동네 쌍 / 무작위 쌍)
import { STORE_PAGES, StorePage, hash } from '../lib/data';
import { composeRay } from '../lib/ray';
import { josa } from '../lib/ko';

const pages = STORE_PAGES;
type C = ReturnType<typeof composeRay>;
const cache = new Map<string, { c: C; set: Set<string>; len: number }>();
const get = (p: StorePage) => {
  if (!cache.has(p.slug)) {
    const c = composeRay(p);
    const body = [c.lead, c.summary, ...c.sections.map((x) => x.p), ...c.faq.map((f) => f.a)].join(' ');
    cache.set(p.slug, { c, len: body.replace(/\s/g, '').length, set: new Set(body.split(/(?<=[.?!])\s+/).map((x) => x.trim()).filter((x) => x.length > 12)) });
  }
  return cache.get(p.slug)!;
};
const share = (a: StorePage, b: StorePage) => { const A = get(a).set, B = get(b).set; let n = 0; A.forEach((x) => { if (B.has(x)) n++; }); return n / Math.min(A.size, B.size); };

const titles = new Map<string, number>(); const tl: number[] = []; let tBad = 0;
const h1 = new Map<string, number>(); const desc = new Map<string, number>(); const dl: number[] = []; const lens: number[] = []; const plens: number[] = []; let josaBad = 0; let kwH2 = 0;
for (const p of pages) {
  const { c, len } = get(p);
  const h = `${p.kw} ${c.h1sub}`.replace(/\s+/g, ''); h1.set(h, (h1.get(h) || 0) + 1);
  desc.set(c.description, (desc.get(c.description) || 0) + 1); dl.push(c.description.length);
  titles.set(c.title, (titles.get(c.title) || 0) + 1); tl.push(c.title.length);
  { const head = c.title.split(' | ')[0]; if (head !== `${p.kw} ${c.h1sub}` || head.length > 40 || c.title.length > 40) { tBad++; if (tBad < 4) console.log('title 어긋남:', c.title); } }
  lens.push(len); c.sections.forEach((x) => plens.push(x.p.replace(/\s/g, '').length));
  kwH2 += c.sections.filter((x) => x.h.includes(p.kw)).length;
  const text = [c.lead, c.summary, ...c.sections.flatMap((x) => [x.h, x.p]), ...c.faq.flatMap((f) => [f.q, f.a])].join(' ');
  for (const w of [p.kw, c.name, p.place?.label, c.store].filter(Boolean) as string[]) {
    const re = new RegExp(`${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(을|를|은|는|이|가|와|과|으로|로)(?=[\\s,.])`, 'g');
    for (const m of text.matchAll(re)) if (josa(w, m[1]) !== m[1]) { josaBad++; if (josaBad < 6) console.log('조사 오류:', p.kw, '→', m[0]); }
  }
}
const avg = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);
const pct = (x: number) => `${Math.round(x * 100)}%`;
const sample = (pairs: [StorePage, StorePage][]) => { const v = pairs.map(([a, b]) => share(a, b)); return v.length ? `평균 ${pct(avg(v))} · 최대 ${pct(Math.max(...v))} (${v.length}쌍)` : '없음'; };
const rnd = (seed: string, n: number) => hash(seed) % n;
const group = (key: (x: StorePage) => string | undefined) => { const m = new Map<string, StorePage[]>(); for (const x of pages) { const k = key(x); if (!k) continue; if (!m.has(k)) m.set(k, []); m.get(k)!.push(x); } return [...m.values()].filter((v) => v.length > 1); };
const within = (gs: StorePage[][], n: number) => Array.from({ length: n }, (_, i) => { const g = gs[rnd(`g${i}`, gs.length)]; return [g[rnd(`x${i}`, g.length)], g[rnd(`y${i}`, g.length)]] as [StorePage, StorePage]; }).filter(([a, b]) => a !== b);
const randomPairs = Array.from({ length: 400 }, (_, i) => [pages[rnd(`a${i}`, pages.length)], pages[rnd(`b${i}`, pages.length)]] as [StorePage, StorePage]).filter(([a, b]) => a !== b);

console.log(`페이지 ${pages.length}`);
console.log(`description 길이 ${Math.min(...dl)}~${Math.max(...dl)} (45~80 밖 ${dl.filter((x) => x < 45 || x > 80).length}) · 중복 ${[...desc.values()].filter((v) => v > 1).length}`);
console.log(`title 길이 ${Math.min(...tl)}~${Math.max(...tl)} · 상호 붙은 쪽 ${[...titles.keys()].filter((x) => x.includes(' | ')).length} · 상호 뺀 쪽 ${[...titles.keys()].filter((x) => !x.includes(' | ')).length} · 중복 ${[...titles.values()].filter((v) => v > 1).length} · h1 불일치·길이 초과 ${tBad}`);
console.log(`h1 중복 ${[...h1.values()].filter((v) => v > 1).length} · 조사 오류 ${josaBad}`);
console.log(`본문(설명+요약+절+FAQ답, 공백 제외) 평균 ${Math.round(avg(lens))} · 최소 ${Math.min(...lens)} · 최대 ${Math.max(...lens)}`);
console.log(`절 문단 평균 ${Math.round(avg(plens))} · 최소 ${Math.min(...plens)} · 최대 ${Math.max(...plens)} · 키워드 든 h2 평균 ${(kwH2 / pages.length).toFixed(1)}개`);
console.log('같은 문장 — 같은 견종:', sample(within(group((x) => x.breed?.id || `g-${x.generic}`), 600)));
console.log('같은 문장 — 같은 동네:', sample(within(group((x) => x.placeKey), 400)));
console.log('같은 문장 — 같은 의도:', sample(within(group((x) => x.intent), 400)));
console.log('같은 문장 — 무작위:', sample(randomPairs));
for (const p of [pages[0], pages.find((x) => x.intent === 'price'), pages.find((x) => !x.breed && x.place)].filter(Boolean) as StorePage[]) {
  const c = get(p).c;
  console.log(`\n[${p.intent}] h1: ${p.kw} / ${c.h1sub}\n  desc: ${c.description}\n  요약: ${c.summary}\n  h2: ${c.sections.map((x) => x.h).join(' | ')}\n  절1: ${c.sections[0].p}\n  절2: ${c.sections[1].p}`);
}
