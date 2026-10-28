"""도로시펫 공식 사이트(dorothypet.co.kr) 페이지·이미지 수집 → raw/site/ (사용자 허락: 이미지·내용 사용 가능)

  python -I scripts/crawl_site.py
페이지는 html 그대로, 본문 텍스트는 raw/site/text/<path>.txt, 이미지는 raw/site/img/ 에 원본 파일명으로.
"""
import os, re, sys, json, urllib.request, urllib.parse
from html import unescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, 'raw', 'site')
BASE = 'https://dorothypet.co.kr'
UA = {'User-Agent': 'Mozilla/5.0'}


def get(url):
    with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
        return r.read()


def text_of(html):
    html = re.sub(r'<script.*?</script>|<style.*?</style>', ' ', html, flags=re.S | re.I)
    t = re.sub(r'<(br|/p|/div|/h\d|/li)[^>]*>', '\n', html, flags=re.I)
    t = unescape(re.sub(r'<[^>]+>', ' ', t))
    return '\n'.join(l.strip() for l in re.sub(r'[ \t]+', ' ', t).splitlines() if l.strip())


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    os.makedirs(os.path.join(OUT, 'text'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'img'), exist_ok=True)
    todo, seen, imgs = ['/'], set(), {}
    while todo:
        path = todo.pop(0)
        if path in seen or len(seen) > 300: continue
        seen.add(path)
        try: html = get(BASE + path).decode('utf-8', 'replace')
        except Exception as e:
            print('실패', path, e); continue
        name = path.strip('/').replace('/', '_') or 'index'
        open(os.path.join(OUT, name + '.html'), 'w', encoding='utf-8').write(html)
        open(os.path.join(OUT, 'text', name + '.txt'), 'w', encoding='utf-8').write(text_of(html))
        for h in re.findall(r'href="(/[^"#?]*)"', html):
            if not re.search(r'\.\w{2,4}$', h) and h not in seen: todo.append(h)
        for src in re.findall(r'(?:src|href|content)="([^"]+\.(?:jpe?g|png|webp|gif))(?:\?[^"]*)?"', html, flags=re.I) + \
                   re.findall(r'url\(["\']?([^"\')]+\.(?:jpe?g|png|webp|gif))', html, flags=re.I):
            u = urllib.parse.urljoin(BASE + path, unescape(src))
            imgs.setdefault(u, []).append(path)
    for u in imgs:
        fn = os.path.join(OUT, 'img', urllib.parse.unquote(u.split('/')[-1]))
        if os.path.exists(fn): continue
        try: open(fn, 'wb').write(get(u))
        except Exception as e: print('이미지 실패', u, e)
    json.dump({u: sorted(set(p)) for u, p in imgs.items()}, open(os.path.join(OUT, 'images.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    print(f'페이지 {len(seen)}개, 이미지 {len(imgs)}개')


if __name__ == '__main__':
    main()
