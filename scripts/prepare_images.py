"""raw/site 이미지 → public/images/*.webp (도로시펫 공식 사이트 사진, 사용자 허락)

  python -I scripts/prepare_images.py
- 히어로·소개: pillar-01~03(강아지·고양이), 매장 실내(미용실·호텔), 로고
- 견종: raw/site/breeds/<kind>/<slug>/*.jpg → public/images/b/<slug>-<n>.webp (600px)
"""
import json, os, sys
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SITE = os.path.join(ROOT, 'raw', 'site')
OUT = os.path.join(ROOT, 'public', 'images')


def save(src, dst, w):
    im = Image.open(src)
    im = im.convert('RGBA' if im.mode in ('RGBA', 'LA', 'P') and dst.endswith('logo.webp') else 'RGB')
    if im.width > w: im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    im.save(dst, 'WEBP', quality=80, method=6)


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    os.makedirs(os.path.join(OUT, 'b'), exist_ok=True)
    for src, dst, w in [('pillar-01.jpg', 'hero-dog.webp', 1400), ('pillar-02.jpg', 'hero-cat.webp', 1400), ('pillar-03.jpg', 'hero-puppy.webp', 1400),
                        # 미용실·드라이룸·호텔 사진은 쓰지 않음(사용자 요청 2026-10-29). 매장 사진은 raw/place(네이버 플레이스 업체 사진) → public/images/place-*.webp
                        ('logo-black.png', 'logo.webp', 400)]:
        save(os.path.join(SITE, 'img', src), os.path.join(OUT, dst), w)
    breeds = json.load(open(os.path.join(SITE, 'breeds.json'), encoding='utf-8'))
    n = 0
    for key, b in breeds.items():
        kind, slug = key.split('/')
        for p in b['photos']:
            save(os.path.join(SITE, 'breeds', kind, slug, f'{p}.jpg'), os.path.join(OUT, 'b', f'{slug}-{p}.webp'), 600); n += 1
    print('견종 사진', n)


if __name__ == '__main__':
    main()
