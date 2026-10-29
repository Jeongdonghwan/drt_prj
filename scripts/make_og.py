"""페이지별 og:image(1200×630) — seo-foundation make_og.py 레이아웃 그대로, 배경 사진만 페이지 주제에 맞춘다.
  견종 페이지 = 그 견종 분양 사진, 고양이 일반 = 고양이 사진, 강아지 일반 = 강아지 사진, 사진 없는 견종 = 부산본점 매장 사진(미용·호텔 사진은 쓰지 않음)

  python -I scripts/make_og.py [--force]
글자는 네이버 정사각형 크롭을 고려해 가운데 630×630 안에 둔다.
"""
import hashlib, json, os, re, sys
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMG = os.path.join(ROOT, 'public', 'images')
OUT = os.path.join(ROOT, 'public', 'og')
W, H = 1200, 630
FB, FR = r'C:\Windows\Fonts\malgunbd.ttf', r'C:\Windows\Fonts\malgun.ttf'
ACCENT, BRAND, PHONE = '#b08d6a', '도로시펫', '010-2236-8276'


def fit(d, text, maxw, size):
    while size > 28:
        f = ImageFont.truetype(FB, size)
        if d.textlength(text, font=f) <= maxw: return f
        size -= 4
    return ImageFont.truetype(FB, size)


def card(title, sub, photo, path):
    im = Image.open(photo).convert('RGB')
    s = max(W / im.width, H / im.height); im = im.resize((int(im.width * s) + 1, int(im.height * s) + 1))
    im = im.crop(((im.width - W) // 2, (im.height - H) // 2, (im.width - W) // 2 + W, (im.height - H) // 2 + H))
    im = ImageEnhance.Brightness(im).enhance(0.42)
    d = ImageDraw.Draw(im)
    d.rectangle([285, 150, 297, 480], fill=ACCENT)
    f = fit(d, title, 590, 84)
    y = 315 - f.size * 0.62
    d.text((315, y), title, font=f, fill='white')
    d.text((315, y + f.size * 1.18 + 8), sub, font=ImageFont.truetype(FR, 30), fill='#e6e9ee')
    d.text((315, 520), f'{BRAND}  ·  {PHONE}', font=ImageFont.truetype(FB, 30), fill=ACCENT)
    im.save(path, quality=80, optimize=True, progressive=True)


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    force = '--force' in sys.argv
    os.makedirs(OUT, exist_ok=True)
    breeds = json.load(open(os.path.join(ROOT, 'data', 'breeds.json'), encoding='utf-8'))
    alias, by_id = breeds['alias'], {b['id']: b for b in breeds['breeds']}
    keys = sorted(alias, key=len, reverse=True)
    pool = {k: [os.path.join(IMG, 'b', f'{p}.webp') for b in breeds['breeds'] if b['kind'] == k and 'special' not in (b['site'] or '') for p in b['photos']] for k in ('dog', 'cat')}
    store_rooms = [os.path.join(IMG, f) for f in ('place-hall-1.webp', 'place-hall-2.webp', 'place-hall-3.webp', 'place-front.webp')]  # 부산본점 매장 사진
    pages = json.load(open(os.path.join(ROOT, 'data', 'pages.json'), encoding='utf-8'))
    items = [('home', '도로시펫 부산본점', '강아지·고양이 분양 · 홈딜리버리', [os.path.join(IMG, 'place-hall-1.webp')]),
             ('area', '도로시펫 분양 안내', '견종별 · 부산 동네별', [os.path.join(IMG, 'hero-cat.webp')])]
    for p in pages['store']:
        k = p['kw'].replace(' ', '')
        hit = next((a for a in keys if a in k), None)
        b = by_id.get(alias[hit]) if hit else None
        own = b and b['photos']  # 특수견은 build_breeds에서 글 제목으로 맞춘 사진만 들어 있음
        photos = [os.path.join(IMG, 'b', f'{x}.webp') for x in b['photos']] if own else \
            store_rooms[:3] if b else pool['cat'] if (b and b['kind'] == 'cat') or (hit and alias[hit] == 'cat') or re.search('고양이|묘', k) else pool['dog']
        items.append((p['slug'], p['kw'], '도로시펫 부산본점 분양 상담', photos))
    n = 0
    for slug, title, sub, photos in items:
        path = os.path.join(OUT, f'{slug}.jpg')
        if os.path.exists(path) and not force: continue
        h = int(hashlib.md5(slug.encode()).hexdigest(), 16)
        card(title, sub, photos[h % len(photos)], path); n += 1
    print(f'og {n}장 생성')


if __name__ == '__main__':
    main()
