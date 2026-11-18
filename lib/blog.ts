// 분양 가이드 글 로더 — content/blog/*.md (프런트매터 + '## 소제목' 문단·불릿). 커튼명장 lib/blog.ts 와 같은 규칙.
// 공개일(date)이 오늘(KST, env BUILD_DATE 우선)보다 뒤인 글은 목록·글·사이트맵·RSS 에서 뺀다 → 미리 써 두고 날짜대로 열린다 (post-launch 자동 발행).
// '_' 로 시작하는 파일은 읽지 않는다.
import fs from 'node:fs';
import path from 'node:path';
import breedData from '../data/breeds.json';

export type Post = { slug: string; title: string; description: string; keyword: string; date: string; time: string; sections: { h: string; p: string[]; list: string[] }[] };

const DIR = path.join(process.cwd(), 'content', 'blog');
const now = () => process.env.BUILD_DATE || new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 16);

function parse(raw: string): Post | null {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) return null;
  const meta: Record<string, string> = {};
  for (const line of m[1].split(/\r?\n/)) {
    const k = line.indexOf(':');
    if (k > 0) meta[line.slice(0, k).trim()] = line.slice(k + 1).trim().replace(/^"(.*)"$/, '$1');
  }
  const sections: Post['sections'] = [];
  let cur: Post['sections'][number] | null = null;
  for (const line of m[2].split(/\r?\n/)) {
    const h = line.match(/^##\s+(.*)$/);
    if (h) { if (cur) sections.push(cur); cur = { h: h[1].trim(), p: [], list: [] }; continue; }
    if (!cur) continue;
    const li = line.match(/^[-*]\s+(.*)$/);
    if (li) cur.list.push(li[1].trim()); else if (line.trim()) cur.p.push(line.trim());
  }
  if (cur) sections.push(cur);
  if (!meta.slug || !meta.title || !meta.date) return null;
  return { slug: meta.slug, title: meta.title, description: meta.description || '', keyword: meta.keyword || '', date: meta.date, time: meta.time || '00:00', sections };
}

let cache: Post[] | null = null;
export function getPosts(): Post[] {
  if (cache) return cache;
  let files: string[] = [];
  try { files = fs.readdirSync(DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_')); } catch {}
  const t = now();
  const at = (p: Post) => `${p.date}T${p.time}`;
  cache = files.map((f) => parse(fs.readFileSync(path.join(DIR, f), 'utf-8'))).filter((p): p is Post => !!p && at(p) <= t)
    .sort((a, b) => at(b).localeCompare(at(a)));
  return cache;
}
export const getPost = (slug: string) => getPosts().find((p) => p.slug === decodeURIComponent(slug));
export const postPath = (p: Post) => `/blog/${p.slug}/`;
export const postEncPath = (p: Post) => `/blog/${encodeURIComponent(p.slug)}/`;

// 대표 사진 — 글 키워드에 견종 이름이 있으면 그 견종 분양 사진, 고양이 글이면 고양이, 아니면 강아지 사진 (사이트 분양 분류 사진, 실제 아이들)
type B = { name: string; kind: string; photos: string[]; site?: string | null };
const BR = (breedData.breeds as B[]).filter((b) => b.photos.length && !/special/.test(b.site || ''));
const ALIAS = breedData.alias as Record<string, string>;
const h32 = (s: string) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
export function postImage(p: Post) {
  const k = (p.keyword + p.title).replace(/\s/g, '');
  const hit = Object.keys(ALIAS).sort((a, b) => b.length - a.length).find((a) => k.includes(a));
  const b = hit && (breedData.breeds as (B & { id: string })[]).find((x) => x.id === ALIAS[hit] && x.photos.length);
  if (b) return `/images/b/${b.photos[h32(p.slug) % b.photos.length]}.webp`;
  const kind = /고양이|묘|냥/.test(k) ? 'cat' : 'dog';
  const pool = BR.filter((x) => x.kind === kind).map((x) => x.photos[0]);
  return pool.length ? `/images/b/${pool[h32(p.slug) % pool.length]}.webp` : `/images/hero-${kind}.webp`;
}
