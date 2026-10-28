"""지역 사실 → data/regions.json (창업 페이지 지역 + 매장 페이지 동네)

  python -I scripts/build_regions.py
출처
- 반려동물 등록 누계(개·고양이, 사망 제외): 농림축산검역본부 '행정구역별 반려동물등록 개체 수 현황' 2022.12.31
  (data.go.kr/data/15125454, raw/public/pet_reg_2022.csv)
- 주민등록 세대·1인 세대: 행정안전부 '지역별(행정동) 세대원수별 주민등록 세대수' 2026.09.30
  (data.go.kr/data/15097974, raw/public/mois_households_20260930.csv)
2026년 행정구역(전남광주통합특별시, 강원·전북특별자치도)은 세대 파일 이름 그대로, 등록 현황은 2022년 이름으로 맞춘다.
"""
import csv, json, os, sys
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# 시도: (정식 이름, 2022 등록 파일 짧은 이름, 2026 세대 파일 시도명, 광주·전남은 2026.7 통합)
SIDO = {
    '서울': ('서울특별시', '서울', ['서울특별시']), '부산': ('부산광역시', '부산', ['부산광역시']), '대구': ('대구광역시', '대구', ['대구광역시']),
    '인천': ('인천광역시', '인천', ['인천광역시']), '광주': ('광주광역시', '광주', None), '대전': ('대전광역시', '대전', ['대전광역시']),
    '울산': ('울산광역시', '울산', ['울산광역시']), '세종': ('세종특별자치시', '세종', ['세종특별자치시']), '경기': ('경기도', '경기', ['경기도']),
    '강원': ('강원특별자치도', '강원', ['강원특별자치도']), '충북': ('충청북도', '충북', ['충청북도']), '충남': ('충청남도', '충남', ['충청남도']),
    '전북': ('전북특별자치도', '전북', ['전북특별자치도']), '전남': ('전라남도', '전남', None), '경북': ('경상북도', '경북', ['경상북도']),
    '경남': ('경상남도', '경남', ['경상남도']), '제주': ('제주특별자치도', '제주', ['제주특별자치도']),
}
SIDO_ALIAS = {'서울특별시': '서울', '부산광역시': '부산', '대구광역시': '대구', '인천광역시': '인천', '광주광역시': '광주', '대전광역시': '대전',
              '울산광역시': '울산', '세종특별자치시': '세종', '경기도': '경기', '강원도': '강원', '충청북도': '충북', '충청남도': '충남',
              '전라북도': '전북', '전라남도': '전남', '경상북도': '경북', '경상남도': '경남', '제주도': '제주', '제주특별자치도': '제주'}
# 광주광역시 = 2026 통합특별시 안의 옛 광주 5개 구, 전라남도 = 나머지
GWANGJU_GU = ['광산구', '남구', '동구', '북구', '서구']

# 창업 키워드 도시: 이름 → (시도 키, 2022 등록 파일 시군구 접두어들, 2026 세대 파일 시군구 접두어들)
CITY = {
    '수원': ('경기', ['수원'], ['수원시']), '용인': ('경기', ['용인'], ['용인시']), '고양': ('경기', ['고양'], ['고양시']), '화성': ('경기', ['화성'], ['화성시']),
    '성남': ('경기', ['성남'], ['성남시']), '부천': ('경기', ['부천'], ['부천시']), '남양주': ('경기', ['남양주'], ['남양주시']), '평택': ('경기', ['평택'], ['평택시']),
    '안산': ('경기', ['안산'], ['안산시']), '안양': ('경기', ['안양'], ['안양시']), '파주': ('경기', ['파주'], ['파주시']), '시흥': ('경기', ['시흥'], ['시흥시']),
    '김포': ('경기', ['김포'], ['김포시']), '의정부': ('경기', ['의정부'], ['의정부시']), '광주시': ('경기', ['광주시'], ['광주시']), '하남': ('경기', ['하남'], ['하남시']),
    '광명': ('경기', ['광명'], ['광명시']), '양주': ('경기', ['양주'], ['양주시']), '오산': ('경기', ['오산'], ['오산시']), '이천': ('경기', ['이천'], ['이천시']),
    '안성': ('경기', ['안성'], ['안성시']), '구리': ('경기', ['구리'], ['구리시']), '의왕': ('경기', ['의왕'], ['의왕시']), '군포': ('경기', ['군포'], ['군포시']),
    '창원': ('경남', ['창원'], ['창원시']), '마산': ('경남', ['창원 마산'], ['창원시 마산']), '김해': ('경남', ['김해'], ['김해시']), '양산': ('경남', ['양산'], ['양산시']),
    '진주': ('경남', ['진주'], ['진주시']), '거제': ('경남', ['거제'], ['거제시']), '통영': ('경남', ['통영'], ['통영시']), '사천': ('경남', ['사천'], ['사천시']),
    '밀양': ('경남', ['밀양'], ['밀양시']),
    '청주': ('충북', ['청주'], ['청주시']), '충주': ('충북', ['충주'], ['충주시']), '제천': ('충북', ['제천'], ['제천시']),
    '천안': ('충남', ['천안'], ['천안시']), '아산': ('충남', ['아산'], ['아산시']), '당진': ('충남', ['당진'], ['당진시']), '서산': ('충남', ['서산'], ['서산시']),
    '논산': ('충남', ['논산'], ['논산시']),
    '전주': ('전북', ['전주'], ['전주시']), '익산': ('전북', ['익산'], ['익산시']), '군산': ('전북', ['군산'], ['군산시']), '정읍': ('전북', ['정읍'], ['정읍시']),
    '순천': ('전남', ['순천'], ['순천시']), '여수': ('전남', ['여수'], ['여수시']), '목포': ('전남', ['목포'], ['목포시']), '광양': ('전남', ['광양'], ['광양시']),
    '포항': ('경북', ['포항'], ['포항시']), '구미': ('경북', ['구미'], ['구미시']), '경산': ('경북', ['경산'], ['경산시']), '경주': ('경북', ['경주'], ['경주시']),
    '안동': ('경북', ['안동'], ['안동시']), '김천': ('경북', ['김천'], ['김천시']),
    '원주': ('강원', ['원주'], ['원주시']), '춘천': ('강원', ['춘천'], ['춘천시']), '강릉': ('강원', ['강릉'], ['강릉시']), '속초': ('강원', ['속초'], ['속초시']),
    '제주시': ('제주', ['제주시'], ['제주시']), '서귀포': ('제주', ['서귀포'], ['서귀포시']),
}

# 매장 키워드 동네 → (표시 이름, 시도 키, 등록 파일 시군구, 세대 파일 시군구 접두어, 세대 파일 읍면동 접두어 또는 None)
PLACE = {
    '부산': ('부산', '부산', None, None, None),
    '명지': ('강서구 명지동', '부산', ['강서구'], ['강서구'], ['명지']), '대저': ('강서구 대저동', '부산', ['강서구'], ['강서구'], ['대저']),
    '양정': ('부산진구 양정동', '부산', ['부산진구'], ['부산진구'], ['양정']), '서면': ('부산진구 서면(부전동)', '부산', ['부산진구'], ['부산진구'], ['부전']),
    '전포': ('부산진구 전포동', '부산', ['부산진구'], ['부산진구'], ['전포']), '개금': ('부산진구 개금동', '부산', ['부산진구'], ['부산진구'], ['개금']),
    '진구': ('부산진구', '부산', ['부산진구'], ['부산진구'], None),
    '해운대': ('해운대구', '부산', ['해운대구'], ['해운대구'], None), '센텀': ('해운대구 센텀(우동)', '부산', ['해운대구'], ['해운대구'], ['우']),
    '중동': ('해운대구 중동', '부산', ['해운대구'], ['해운대구'], ['중']),
    '남포동': ('중구 남포동', '부산', ['중구'], ['중구'], ['남포']), '정관': ('기장군 정관읍', '부산', ['기장군'], ['기장군'], ['정관']),
    '기장': ('기장군', '부산', ['기장군'], ['기장군'], None), '화명동': ('북구 화명동', '부산', ['북구'], ['북구'], ['화명']),
    '구포': ('북구 구포동', '부산', ['북구'], ['북구'], ['구포']), '대연동': ('남구 대연동', '부산', ['남구'], ['남구'], ['대연']),
    '연산동': ('연제구 연산동', '부산', ['연제구'], ['연제구'], ['연산']), '연제구': ('연제구', '부산', ['연제구'], ['연제구'], None),
    '광안리': ('수영구 광안동', '부산', ['수영구'], ['수영구'], ['광안']), '광안': ('수영구 광안동', '부산', ['수영구'], ['수영구'], ['광안']),
    '주례': ('사상구 주례동', '부산', ['사상구'], ['사상구'], ['주례']), '사상': ('사상구', '부산', ['사상구'], ['사상구'], None),
    '하단': ('사하구 하단동', '부산', ['사하구'], ['사하구'], ['하단']), '장림': ('사하구 장림동', '부산', ['사하구'], ['사하구'], ['장림']),
    '사하구': ('사하구', '부산', ['사하구'], ['사하구'], None),
    '창원': ('창원시', '경남', ['창원'], ['창원시'], None), '마산': ('창원시 마산', '경남', ['창원 마산'], ['창원시 마산'], None),
    '진해': ('창원시 진해구', '경남', ['창원 진해'], ['창원시 진해구'], None), '김해': ('김해시', '경남', ['김해'], ['김해시'], None),
    '장유': ('김해시 장유', '경남', ['김해'], ['김해시'], ['장유']), '양산': ('양산시', '경남', ['양산'], ['양산시'], None),
    '거제': ('거제시', '경남', ['거제'], ['거제시'], None), '거제도': ('거제시', '경남', ['거제'], ['거제시'], None),
}


def main():
    sys.stdout.reconfigure(encoding='utf-8')
    reg_rows = list(csv.reader(open(os.path.join(ROOT, 'raw', 'public', 'pet_reg_2022.csv'), encoding='cp949')))[1:]
    reg_sido = {r[0]: (int(r[2]), int(r[3])) for r in reg_rows if r[1] == ''}
    reg_long = defaultdict(list)
    for r in reg_rows:
        if r[1]: reg_long[SIDO_ALIAS.get(r[0], r[0])].append((r[1], int(r[2]), int(r[3])))
    hh = list(csv.DictReader(open(os.path.join(ROOT, 'raw', 'public', 'mois_households_20260930.csv'), encoding='cp949')))
    for r in hh: r['t'], r['one'] = int(r['전체세대수']), int(r['1인세대'])

    def hh_sum(rows):
        t = sum(r['t'] for r in rows); o = sum(r['one'] for r in rows)
        return t, round(o / t * 100) if t else None

    def hh_sido(k):
        if k == '광주':
            return [r for r in hh if r['시도명'] == '전남광주통합특별시' and r['시군구명'] in GWANGJU_GU]
        if k == '전남':
            return [r for r in hh if r['시도명'] == '전남광주통합특별시' and r['시군구명'] not in GWANGJU_GU]
        return [r for r in hh if r['시도명'] in SIDO[k][2]]

    def reg_of(k, prefixes):
        rows = [x for x in reg_long[k] if any(x[0].startswith(p) for p in prefixes)]
        return sum(x[1] for x in rows), sum(x[2] for x in rows)

    def pack(label, sido, households, one, dogs, cats, level):
        return dict(label=label, sido=sido, sidoName=SIDO[sido][0], level=level, households=households, onePct=one, dogs=dogs, cats=cats,
                    per100=round(dogs / households * 100, 1) if households and dogs else None)

    out = {}
    for k, (name, short, _) in SIDO.items():
        t, one = hh_sum(hh_sido(k))
        d, c = reg_sido[short]
        out[k] = pack(name, k, t, one, d, c, 'sido')
        # 시도 안 시군구 나눔 (짧은 표기 페이지용): 세대 많은 순 8곳 + 2022 반려견 등록
        by = defaultdict(list)
        for r in hh_sido(k): by[r['시군구명'].split(' ')[0] or r['읍면동명']].append(r)
        parts = []
        for nm, rows in sorted(by.items(), key=lambda x: -sum(r['t'] for r in x[1]))[:8]:
            pt, po = hh_sum(rows)
            base = nm[:-1] if len(nm) > 2 and nm[-1] in '시군구' else nm
            dd = sum(x[1] for x in reg_long[short if short in reg_long else k] if x[0].startswith(base)) if k not in ('세종',) else None
            parts.append(dict(name=nm, households=pt, onePct=po, dogs=dd or None))
        out[k]['parts'] = parts
    for k, (sido, rp, hp) in CITY.items():
        cand = [r for r in hh_sido(sido) if any(r['시군구명'].startswith(p) for p in hp)]
        t, one = hh_sum(cand)
        d, c = reg_of(sido, rp)
        assert t and d, (k, t, d)
        out[k] = pack(k if k.endswith('시') else k + ('시' if k not in ('마산',) else ''), sido, t, one, d, c, 'city')
        # 시 안 나눔 (짧은 표기 페이지용): 구가 있으면 구별, 없으면 세대 많은 행정동 6곳
        gus = defaultdict(list)
        for r in cand: gus[r['시군구명']].append(r)
        out[k]['parts'] = [dict(name=r['읍면동명'], households=r['t'], onePct=round(r['one'] / r['t'] * 100)) for r in sorted(cand, key=lambda r: -r['t'])[:6]]
        out[k]['gus'] = [dict(name=nm, households=hh_sum(rows)[0], onePct=hh_sum(rows)[1]) for nm, rows in gus.items()] if len(gus) > 1 else []
    out['마산']['label'] = '창원시 마산(합포·회원구)'
    # 같은 단위 안 순위 (반려견 등록 수 / 세대 100곳당)
    for level in ('sido', 'city'):
        ks = [k for k in out if out[k]['level'] == level]
        for field, rk in (('dogs', 'rankDogs'), ('per100', 'rankPer100')):
            for i, k in enumerate(sorted(ks, key=lambda k: -(out[k][field] or 0))):
                out[k][rk] = i + 1
        for k in ks: out[k]['rankOf'] = len(ks)

    places = {}
    for k, (label, sido, rp, hp, dongs) in PLACE.items():
        if rp is None:
            places[k] = dict(label=label, **{f: out[sido][f] for f in ('households', 'onePct', 'dogs', 'cats')}, scope='시')
            continue
        rows = [r for r in hh_sido(sido) if any(r['시군구명'].startswith(p) for p in hp)]
        gu_t, gu_one = hh_sum(rows)
        d, c = reg_of(sido, rp)
        item = dict(label=label, gu=hp[0], households=gu_t, onePct=gu_one, dogs=d, cats=c, scope='구')
        if dongs:
            dr = [r for r in rows if any(r['읍면동명'].startswith(p) for p in dongs)]
            t, one = hh_sum(dr)
            assert t, k
            item.update(dongHouseholds=t, dongOnePct=one, dongUnits=[r['읍면동명'] for r in dr])
        places[k] = item
    json.dump({'_source': '반려동물 등록 누계: 농림축산검역본부 2022.12.31 (data.go.kr 15125454) / 세대: 행정안전부 주민등록 2026.09.30 (data.go.kr 15097974)',
               'regions': out, 'places': places}, open(os.path.join(ROOT, 'data', 'regions.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
    print(f"시도 {sum(v['level'] == 'sido' for v in out.values())} · 도시 {sum(v['level'] == 'city' for v in out.values())} · 매장 동네 {len(places)}")
    for k in ('부산', '광주', '전남', '수원', '마산', '광주시', '제주시'):
        v = out[k]; print(k, v['label'], v['households'], v['onePct'], v['dogs'], v['cats'], v['per100'], v['rankDogs'], v['rankOf'])
    for k in ('명지', '서면', '장유'): print(k, places[k])


if __name__ == '__main__':
    main()
