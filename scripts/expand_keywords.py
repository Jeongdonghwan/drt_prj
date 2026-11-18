"""매장 키워드 확장 1,000개 → raw/도로시펫 키워드 - 부산 확장 1000개.csv (사용자 요청 2026-11-18 "부산 천 개 더")

  python -I scripts/expand_keywords.py
축(앞에서부터 채우고 1,000에서 끊음), 이미 있는 키워드(원본 CSV + select_keywords.py 의 추가·확장 패턴)와 겹치면 건너뜀. 검색량은 측정 안 함(0).
 1. 견종 92종(특수견·묘 분류 제외) × 종류별 패턴 4 — 개: ○○강아지분양·○○새끼·○○분양비용·○○분양샵, 고양이: ○○고양이분양·○○새끼·○○분양비용·○○분양샵
 2. 부산 동네 33곳(규모 큰 순) × 분양 어휘 8
 3. 경남 도시(울산·거제·진주) × 분양 분류 건수 많은 견종 '분양'·'입양', 창원·김해·양산 × '입양'
 4. 부산 동네 × 짧은 어휘(강아지·고양이·애견·반려견분양·반려묘분양)
"""
import csv, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
BASE = os.path.join(ROOT, 'raw', '도로시펫 키워드 - 1000개.csv')
OUT = os.path.join(ROOT, 'raw', '도로시펫 키워드 - 부산 확장 1000개.csv')
TARGET = 1000
KIND_PATTERNS = {'dog': ['{}강아지분양', '{}새끼', '{}분양비용', '{}분양샵'], 'cat': ['{}고양이분양', '{}새끼', '{}분양비용', '{}분양샵']}
PLACE_WORDS = ['강아지분양', '고양이분양', '애견샵', '펫샵', '애견분양', '강아지입양', '고양이입양', '애견분양샵']
CITY_PATTERNS = ['울산{}분양', '거제{}분양', '진주{}분양', '창원{}입양', '김해{}입양', '양산{}입양', '울산{}입양', '거제{}입양', '진주{}입양']
PLACE_WORDS2 = ['강아지', '고양이', '애견', '반려견분양', '반려묘분양']
# select_keywords.py 가 이미 만드는 패턴 — 같은 키워드를 두 번 만들지 않게 미리 '있는 것'에 넣는다
EXISTING_PATTERNS = ['부산{}분양', '{}분양가', '{}분양', '부산{}입양', '{}입양', '{}가격', '{}분양가격', '창원{}분양', '김해{}분양', '양산{}분양', '부산{}']


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    have = {r[0].replace(' ', '') for r in list(csv.reader(open(BASE, encoding='utf-8-sig')))[1:] if r and r[0].strip()}
    breeds = json.load(open(os.path.join(ROOT, 'data', 'breeds.json'), encoding='utf-8'))['breeds']
    allb = [b for b in breeds if 'special' not in (b['site'] or '')]
    bname = lambda b: (b['siteName'] or b['name']).replace(' ', '')
    for pat in EXISTING_PATTERNS:
        for b in allb: have.add(pat.format(bname(b)))
    top = sorted([b for b in allb if b['siteCount']], key=lambda b: -b['siteCount'])
    places = json.load(open(os.path.join(ROOT, 'data', 'regions.json'), encoding='utf-8'))['places']
    plist = sorted([k for k in places if k != '부산'], key=lambda k: -(places[k].get('dongHouseholds') or places[k]['households']))
    out, how = [], {}

    def add(kw, axis):
        k = kw.replace(' ', '')
        if k in have or len(out) >= TARGET: return
        have.add(k); out.append(k); how[axis] = how.get(axis, 0) + 1

    for i in range(4):
        for b in allb: add(KIND_PATTERNS[b['kind']][i].format(bname(b)), '견종×종류별패턴')
    for w in PLACE_WORDS:
        for p in plist: add(f'{p}{w}', '동네×어휘')
    for pat in CITY_PATTERNS:
        for b in top: add(pat.format(bname(b)), '경남도시×견종')
    for w in PLACE_WORDS2:
        for p in plist: add(f'{p}{w}', '동네×짧은어휘')
    assert len(out) == TARGET, len(out)
    with open(OUT, 'w', encoding='utf-8-sig', newline='') as f:
        w = csv.writer(f); w.writerow(['검색어', '노출수', '클릭수', '원본 키워드', '비고'])
        for k in out: w.writerow([k, '', '', '', '확장(2026-11-18)'])
    print(f'확장 {len(out)}: ' + ' · '.join(f'{a} {n}' for a, n in how.items()))


if __name__ == '__main__':
    main()
