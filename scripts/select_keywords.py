"""도로시펫 키워드 → data/pages.json + keywords/도로시펫_키워드_2000.xlsx

  python -I scripts/select_keywords.py
매장(store): raw/도로시펫 키워드 - 1000개.csv 953개(같은 검색어가 두 번 나온 47행은 한 페이지) + 같은 패턴 97개 = 1,050개(1,000 + 여유 50)
  추가: 사이트 분양 분류에 사진·건수가 있는 견종 중 아직 없는 '부산○○분양'·'○○분양가'·'○○분양'·'부산○○입양'·'○○입양' (건수 많은 순)
창업(franchise): raw/애견창업 - 도로시.xlsx 914개(중복 제외) + 같은 패턴 86개 = 1,000개
엑셀은 요약 시트 없이 키워드 시트가 첫 시트.
"""
import csv, json, os, re, sys
import openpyxl
from openpyxl.styles import Font, PatternFill

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
WORDS = ['창업', '소자본창업', '강아지분양창업', '펫샵창업', '애견샵창업', '애견분양창업', '애견분양샵창업']
ADD_CITIES = ['군산', '안동', '김천', '통영', '사천', '밀양', '광양', '제천', '군포', '논산', '속초', '정읍']
ADD_CORE = ['펫샵창업비용', '애견분양샵창업비용']
STORE_PATTERNS = ['부산{}분양', '{}분양가', '{}분양', '부산{}입양', '{}입양']
STORE_TARGET = 1050  # 1,000 + 여유 50 (사용자 요청)


def slug(kw):
    return re.sub(r'\s+', '-', kw.strip())


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    rows = list(csv.reader(open(os.path.join(ROOT, 'raw', '도로시펫 키워드 - 1000개.csv'), encoding='utf-8-sig')))[1:]
    store, seen = [], {}
    for r in rows:
        kw = r[0].strip()
        if not kw: continue
        n = lambda v: int(re.sub(r'\D', '', v) or 0)
        if kw in seen:
            seen[kw]['dupRows'] += 1
            continue
        seen[kw] = dict(kw=kw, slug=slug(kw), set='store', impressions=n(r[1]), clicks=n(r[2]), dupRows=0, added=False)
        store.append(seen[kw])

    # 매장 1,000개 맞추기: 사이트 분양 분류(사진·건수 있는 견종)로 같은 패턴 키워드를 건수 많은 순으로
    breeds = json.load(open(os.path.join(ROOT, 'data', 'breeds.json'), encoding='utf-8'))['breeds']
    bs = sorted([b for b in breeds if b['siteCount'] and b['photos'] and 'special' not in b['site']], key=lambda b: -b['siteCount'])
    have = {p['kw'].replace(' ', '') for p in store}
    for pat in STORE_PATTERNS:
        for b in bs:
            kw = pat.format(b['siteName'].replace(' ', ''))
            if len(store) >= STORE_TARGET: break
            if kw in have: continue
            have.add(kw)
            store.append(dict(kw=kw, slug=slug(kw), set='store', impressions=0, clicks=0, dupRows=0, added=True))
    assert len(store) == STORE_TARGET, len(store)

    ws = openpyxl.load_workbook(os.path.join(ROOT, 'raw', '애견창업 - 도로시.xlsx'), read_only=True).active
    fr, fseen = [], set()
    for r in ws.iter_rows(values_only=True):
        kw = (r[1] or '').strip()
        if kw and kw not in fseen:
            fseen.add(kw); fr.append(dict(kw=kw, slug=slug(kw), set='franchise', added=False))
    for kw in [f'{c} {w}' for c in ADD_CITIES for w in WORDS] + ADD_CORE:
        assert kw not in fseen, kw
        fseen.add(kw); fr.append(dict(kw=kw, slug=slug(kw), set='franchise', added=True))
    assert len(fr) == 1000, len(fr)
    assert not ({p['slug'] for p in store} & {p['slug'] for p in fr})

    json.dump({'store': store, 'franchise': fr}, open(os.path.join(ROOT, 'data', 'pages.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)

    wb = openpyxl.Workbook()
    s1 = wb.active; s1.title = '키워드'
    s1.append(['구분', '키워드', 'URL', '노출수', '클릭수', 'CSV 중복 행', '추가 키워드'])
    green = PatternFill('solid', fgColor='E2EFDA')
    for p in store + fr:
        s1.append(['매장' if p['set'] == 'store' else '창업', p['kw'], f"/{'franchise/' if p['set'] == 'franchise' else ''}{p['slug']}/",
                   p.get('impressions'), p.get('clicks'), p.get('dupRows') or None, 'O' if p['added'] else None])
        if p['added']:
            for c in s1[s1.max_row]: c.fill = green
    for c in s1[1]: c.font = Font(bold=True)
    s1.column_dimensions['B'].width = 28; s1.column_dimensions['C'].width = 40
    wb.save(os.path.join(ROOT, 'keywords', '도로시펫_키워드_매장1050_창업1000.xlsx'))
    print(f'매장 {len(store)}개 (CSV {len(rows)}행 중 중복 {sum(p["dupRows"] for p in store)}행 → {sum(not p["added"] for p in store)} + 추가 {sum(p["added"] for p in store)}) · 창업 {len(fr)}개 (원본 {len(fr) - 86} + 추가 86)')


if __name__ == '__main__':
    main()
