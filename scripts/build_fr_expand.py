"""창업 사이트 확장 키워드 (2026-11-24, 1,000 → 약 5,000).
   python -I scripts/build_fr_expand.py  → data/fr-extra.json (창업 사이트 data/ 로도 복사) + keywords/도로시펫_창업확장.xlsx(키워드 시트가 첫 시트)
   유형: wt=업종×주제(지역 없음) / rwt=시도×업종×주제 / rw=지역×새 업종어 / gw=구×업종어
   주제 id·이름은 창업 사이트 data/topics/*.json 과 같아야 한다."""
import json, os, shutil, sys
sys.stdout.reconfigure(encoding='utf-8')
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FR = os.path.join(os.path.dirname(ROOT), 'dorothypet_franchise_prj')
pages = json.load(open(os.path.join(ROOT, 'data', 'pages.json'), encoding='utf-8'))
have = {p['kw'] for p in pages['franchise']} | {p['kw'] for p in pages['store']}
R = json.load(open(os.path.join(ROOT, 'data', 'regions.json'), encoding='utf-8'))['regions']

TOPICS = [('prep-order', '준비 순서'), ('license', '허가 절차'), ('consult', '상담 방법'), ('steps', '가맹 절차'), ('ready', '상담 전 준비'), ('lease', '점포 계약 전 확인'),
          ('contract', '가맹 계약 전 확인'), ('interior', '인테리어'), ('training', '점주 교육'), ('after-open', '오픈 후 관리'), ('area-analysis', '상권 분석'), ('location', '입지 고르는 법'),
          ('area-protect', '상권 보호'), ('supply', '분양 아이 공급'), ('health', '건강 관리 시스템'), ('marketing', '마케팅 방법'), ('online', '온라인 홍보'), ('manual', '운영 매뉴얼'),
          ('support', '본사 지원'), ('promotion', '프로모션 지원'), ('beginner', '초보 준비'), ('retire', '퇴직 후 준비'), ('switch', '업종 변경'), ('couple', '부부 운영'),
          ('compare', '개인 창업과 가맹 비교'), ('brand', '브랜드 고르는 법'), ('caution', '주의사항'), ('cost', '비용 항목'), ('outlook', '전망'), ('risk', '실패 줄이는 법')]
REGION_TOPICS = ['prep-order', 'license', 'consult', 'steps', 'ready', 'lease', 'contract', 'interior', 'training', 'after-open', 'area-analysis', 'location', 'area-protect', 'supply', 'health', 'marketing', 'support', 'beginner', 'caution', 'cost']
OLD = ['창업', '소자본창업', '강아지분양창업', '펫샵창업', '애견샵창업', '애견분양창업', '애견분양샵창업']
NEW = ['고양이분양창업', '반려동물창업', '반려동물분양창업', '펫창업', '강아지창업', '펫샵프랜차이즈', '애견샵프랜차이즈', '애견프랜차이즈']
TOPIC_WORDS = ['펫샵창업', '애견샵창업', '강아지분양창업', '애견분양창업', '애견분양샵창업', '고양이분양창업', '반려동물창업', '반려동물분양창업', '펫창업', '강아지창업',
               '펫샵프랜차이즈', '애견샵프랜차이즈', '애견프랜차이즈', '강아지프랜차이즈', '반려동물프랜차이즈']
RWT_WORDS = ['펫샵창업', '애견샵창업', '강아지분양창업', '애견분양창업']
GU_WORDS = OLD + [w for w in NEW if w != '반려동물분양창업']
SIDO = ['서울', '부산', '대구', '인천', '광주', '대전', '울산', '세종', '경기', '강원', '충북', '충남', '전북', '전남', '경북', '경남', '제주']
GUS = {
    '서울': '종로구 중구 용산구 성동구 광진구 동대문구 중랑구 성북구 강북구 도봉구 노원구 은평구 서대문구 마포구 양천구 강서구 구로구 금천구 영등포구 동작구 관악구 서초구 강남구 송파구 강동구'.split(),
    '부산': '중구 서구 동구 영도구 부산진구 동래구 남구 북구 해운대구 사하구 금정구 강서구 연제구 수영구 사상구 기장군'.split(),
}
for k in ['대구', '인천', '광주', '대전', '울산']: GUS[k] = [p['name'] for p in R[k]['parts']]
for k, v in R.items():
    if v['level'] == 'city' and v.get('gus') and k != '마산': GUS[k] = [g['name'].split(' ', 1)[1] for g in v['gus']]
cnt = {}
for k, gs in GUS.items():
    for g in gs: cnt[g] = cnt.get(g, 0) + 1

out = []; seen = set()
def add(kw, kind, word, topic=None, region=None, place=None):
    if kw in have or kw in seen: return
    seen.add(kw); out.append({'kw': kw, 'slug': kw.replace(' ', '-'), 'kind': kind, 'word': word, **({'topic': topic} if topic else {}), **({'region': region} if region else {}), **({'place': place} if place else {})})
for w in TOPIC_WORDS:
    for tid, tn in TOPICS: add(f'{w} {tn}', 'wt', w, tid)
tn_of = dict(TOPICS)
for s in SIDO:
    for w in RWT_WORDS:
        for tid in REGION_TOPICS: add(f'{s} {w} {tn_of[tid]}', 'rwt', w, tid, s)
for k in R:
    if k == '마산': continue
    for w in NEW: add(f'{k} {w}', 'rw', w, None, k)
for k, gs in GUS.items():
    for g in gs:
        place = g if cnt[g] == 1 else f'{k} {g}'
        for w in GU_WORDS: add(f'{place} {w}', 'gw', w, None, k, place)

for root in (ROOT, FR):
    json.dump(out, open(os.path.join(root, 'data', 'fr-extra.json'), 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
from collections import Counter
print('새 키워드', len(out), dict(Counter(x['kind'] for x in out)), '· 기존 창업', len(pages['franchise']), '· 합계', len(out) + len(pages['franchise']))
print('구', sum(len(v) for v in GUS.values()))
try:
    from openpyxl import Workbook
    wb = Workbook(); ws = wb.active; ws.title = '키워드'
    ws.append(['키워드', '주소(슬러그)', '유형', '업종어', '주제', '지역'])
    kn = {'wt': '업종×주제', 'rwt': '시도×업종×주제', 'rw': '지역×새 업종어', 'gw': '구×업종어'}
    for x in out: ws.append([x['kw'], x['slug'], kn[x['kind']], x['word'], tn_of.get(x.get('topic'), ''), x.get('place') or x.get('region') or ''])
    wb.save(os.path.join(ROOT, 'keywords', '도로시펫_창업확장.xlsx')); print('엑셀 저장')
except Exception as e: print('엑셀 실패', e)
