"""견종·묘종 목록 페이지(raw/site/pets_dogs_*.html, pets_cats_*.html)에서 분양 동물 사진을 견종별로 받는다.
→ raw/site/breeds/<dogs|cats>/<영문 슬러그>/<번호>.jpg (견종당 최대 8장) + raw/site/breeds.json

  python -I scripts/fetch_breed_photos.py
"""
import glob, json, os, re, sys, urllib.request
from html import unescape

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'raw', 'site')
UA = {'User-Agent': 'Mozilla/5.0'}


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    out = {}
    for f in sorted(glob.glob(os.path.join(SITE, 'pets_*_*.html'))):
        kind, slug = re.match(r'pets_(dogs|cats)_(.+)\.html', os.path.basename(f)).groups()
        html = open(f, encoding='utf-8').read()
        title = unescape(re.search(r'<title>([^<|]+)', html).group(1)).strip()
        pics = re.findall(r'<img[^>]+src="(/uploads/pets/(\d+)/main\.\w+)"[^>]*alt="([^"]*)"', html)
        d = os.path.join(SITE, 'breeds', kind, slug)
        os.makedirs(d, exist_ok=True)
        got = []
        for src, n, alt in pics[:8]:
            fn = os.path.join(d, f'{n}.jpg')
            if not os.path.exists(fn):
                try: open(fn, 'wb').write(urllib.request.urlopen(urllib.request.Request('https://dorothypet.co.kr' + src, headers=UA), timeout=30).read())
                except Exception as e: print('실패', src, e); continue
            got.append(n)
        out[f'{kind}/{slug}'] = {'title': title, 'listed': len(pics), 'photos': got}
        print(kind, slug, title, len(pics), len(got))
    json.dump(out, open(os.path.join(SITE, 'breeds.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=1)


if __name__ == '__main__':
    main()
