// 매장 키워드 페이지 조합기 (953개).
// 사실 근거: data/breeds.json(일반 품종 특징 + 사이트 분양 분류·등록 건수·사진), data/regions.json(반려동물 등록·주민등록 세대),
//           lib/site.ts(공식 사이트 문구: 분양 절차·홈딜리버리·지점). 미용·호텔은 넣지 않음(사용자 요청 2026-10-29).
// 하지 않는 것: 분양가 숫자(사이트도 '상담 문의'), 건강 보장 기간, 할인, 출처 없는 숫자, 경쟁 업체 이름.
import { StorePage, Intent, BREEDS, hash } from './data';
import { BRAND, CONTACT, BUSINESS, BRANCHES, ADOPT_STEPS, DELIVERY_STEPS, PROMISES } from './site';
import { j } from './ko';

const pick = <T,>(arr: T[], s: string, salt: string) => arr[hash(`${s}::${salt}`) % arr.length];
// 해시 뒤섞기 — 연속 묶음을 자르는 회전은 이웃 페이지끼리 대부분 겹쳐서 쓰지 않는다
const rotate = <T,>(arr: T[], s: string, salt: string) => arr.map((x, i) => [hash(`${s}::${salt}::${i}`), x] as [number, T]).sort((a, b) => a[0] - b[0]).map((x) => x[1]);
const n = (x: number) => x.toLocaleString();


// 부산본점 매장 사진 (네이버 플레이스 업체 사진, 2026-10-29 사용자 요청)
const PLACE_PHOTOS: [string, string][] = [['place-front', '매장 외관'], ['place-hall-1', '분양 공간'], ['place-hall-2', '상담 공간'], ['place-hall-3', '매장 내부'], ['place-hall-4', '매장 전경'], ['place-goods', '용품 공간']];

export function composeStore(p: StorePage) {
  const s = p.slug;
  const b = p.breed;
  const kind = b?.kind || p.generic || 'dog';
  const kindWord = kind === 'cat' ? '고양이' : '강아지';
  const name = b?.name || kindWord;
  const pl = p.place;
  const where = pl ? pl.label : '부산';
  const t: Intent = p.intent;
  const special = /special/.test(b?.site || '');
  const siteLine = b?.site && !special
    ? `${BRAND} 분양 목록의 '${b.siteName}' 분류에서 지금 있는 ${b.name} 아이들을 볼 수 있습니다.`
    : b?.site ? `${j(b.name, '은')} ${BRAND} 분양 목록에서 '${b.siteName}' 분류로 들어오고, 들어오는 시기는 상담으로 확인합니다.`
      : b ? `${j(b.name, '은')} ${BRAND} 분양 목록에 따로 분류가 없어, 그외 특수${kind === 'cat' ? '묘' : '견'}로 들어오는 시기를 상담으로 확인합니다.`
        : `${BRAND} 분양 목록에서 ${kindWord} 품종별로 지금 있는 아이들을 볼 수 있습니다.`;

  // ---- 메타 ----
  const intentWord: Record<Intent, string> = {
    price: '분양가 상담', shelter: '입양 전 알아둘 것', goods: '분양 후 준비물', cafe: '매장 방문',
    origin: '켄넬·캐터리 출신', trust: '분양 후기', info: '특징과 키우기', shop: '분양샵', adopt: '입양 절차', sale: '분양 상담', brand: '부산본점', breed: '분양·특징',
  };
  const title = pick([
    `${p.kw} | ${BRAND} ${intentWord[t]}`,
    `${p.kw} — ${where} ${name} ${intentWord[t]} | ${BRAND}`,
    `${p.kw} | ${BRAND} 부산본점 ${intentWord[t]}`,
  ], s, 'title').slice(0, 60);
  const description = `${p.kw}. ${b ? `${b.name}: ${b.size}·${b.coat}. ` : ''}${siteLine.replace(/\(.*?\)/, '')} ${BRAND} 부산본점 ${BUSINESS.address.split(' (')[0]}, 상담 ${CONTACT.phone}.`.slice(0, 158);

  // ---- 히어로 ----
  const lead = pick([
    `${where}에서 ${name} ${intentWord[t]}을 찾는 분께 ${BRAND} 부산본점의 분양 절차와 ${b ? `${b.name}의 특징` : `${kindWord} 고르는 기준`}을 정리했습니다.`,
    `${BRAND}은 ${where} 가까운 부산 사상구 주례동에서 ${kindWord} 분양을 상담합니다. ${b ? `${j(b.name, '은')} ${b.size} ${b.coat} ${kind === 'cat' ? '고양이' : '견종'}입니다.` : `방문 전 예약하면 1:1로 상담합니다.`}`,
    `${p.kw}, 방문 예약부터 동물병원 건강 확인·계약·사후관리까지 ${BRAND}이 함께합니다. ${b ? b.trait : ''}`,
  ], s, 'lead').trim();

  // ---- 핵심 요약 (답 먼저) ----
  const summary: string[] = [
    t === 'price' ? `${name} 분양가는 혈통·모색·성별·월령에 따라 달라 ${BRAND}은 아이를 보고 상담으로 안내합니다. 사이트 분양 목록도 가격 대신 '상담 문의'로 표기합니다.`
          : t === 'shelter' ? `${BRAND}은 보호소가 아니라 전문 켄넬·캐터리 출신 아이를 계약서와 함께 분양하는 분양샵입니다. 유기동물 입양은 국가동물보호정보시스템(animal.go.kr) 공고에서 확인합니다.`
            : `${BRAND} 부산본점은 ${BUSINESS.address}에 있고, 방문 예약 후 1:1로 ${j(kindWord, '를')} 소개합니다.`,
    siteLine,
    b ? `${j(b.name, '은')} ${b.size}, 털은 ${b.coat}, 털 빠짐은 ${b.shed}입니다.` : `${kind === 'cat' ? '고양이는 털 길이(단모·장모)와 성격' : '강아지는 성견 크기(소형·중형·대형)와 털 빠짐'}부터 정하면 고르기 쉽습니다.`,
    pl ? `${pl.label}에서 오기 어렵다면 상담·분양 결정 뒤 집까지 데려다주는 홈딜리버리를 신청할 수 있습니다.` : `직접 오기 어려우면 상담 뒤 홈딜리버리로 집까지 데려다줍니다.`,
  ];

  // ---- 견종 섹션 ----
  // 견종 페이지는 그 견종 사진만(특수견은 분양 글 제목으로 맞춘 사진), 사진 없는 견종은 갤러리 없음. 견종 없는 페이지만 여러 품종 사진
  const photos = b ? b.photos.map((x) => `/images/b/${x}.webp`)
    : BREEDS.filter((x) => x.kind === kind && x.photos.length && !/special/.test(x.site || '')).flatMap((x) => x.photos.slice(0, 1)).map((x) => `/images/b/${x}.webp`);
  const gallery = rotate(photos, s, 'gal').slice(0, 6);
  const topBreeds = BREEDS.filter((x) => x.kind === kind && x.siteCount && !/special/.test(x.site || '')).sort((a, c) => c.siteCount! - a.siteCount!).slice(0, 8);
  const breedSec = b ? {
    heading: pick([`${j(b.name, '는')} 이런 아이입니다`, `${b.name} 특징`, `${b.name} 키우기 전에`], s, 'bh'),
    body: rotate([
      b.trait, b.care, siteLine,
      `${b.size} ${kind === 'cat' ? '고양이' : '견종'}이라 ${/대형/.test(b.size) ? '넓은 공간과 하루 운동 시간' : '아파트·원룸 같은 실내 생활'}에 맞춰 준비합니다.`,
      `털은 ${b.coat}, 빠짐은 ${b.shed}이라 ${/많/.test(b.shed) ? '털갈이 철 빗질 시간을 따로 잡아야 합니다' : '털 날림 걱정은 덜하지만 엉킴과 미용 주기를 챙깁니다'}.`,
    ], s, 'bb').slice(0, 3),
    dl: [['크기', b.size], ['털', b.coat], ['털 빠짐', b.shed], [`${BRAND} 분류`, b.siteName || `그외 특수${kind === 'cat' ? '묘' : '견'} 상담`]] as [string, string][],
  } : {
    heading: pick([`${BRAND}에 많은 ${kindWord}`, `${kindWord} 분양 목록`, `어떤 ${j(kindWord, '가')} 있나요`], s, 'bh'),
    body: [
      `${BRAND} 사이트 분양 목록에서 ${kindWord} 중 많이 올라오는 품종은 ${topBreeds.slice(0, 3).map((x) => x.siteName).join(', ')}입니다.`,
      kind === 'cat' ? '처음 키우면 성격이 차분한 단모종, 털 빠짐이 걱정되면 털이 짧고 얇은 품종부터 봅니다.' : '아파트·원룸이면 소형견, 산책 시간이 넉넉하면 중형·대형견까지 넓혀 봅니다.',
    ],
    dl: topBreeds.map((x) => [x.siteName!, `${x.size} · ${x.coat} · 털 빠짐 ${x.shed}`]) as [string, string][],
  };

  // ---- 비슷한 품종 (같은 종류·크기) — 견종마다 다른 비교 문장 ----
  const similar = b ? rotate(BREEDS.filter((x) => x.kind === kind && x.id !== b.id && x.size === b.size), s, 'sim').slice(0, 3)
    : rotate(BREEDS.filter((x) => x.kind === kind && x.siteCount), s, 'sim').slice(0, 3);
  const similarSec = similar.length ? {
    heading: b ? pick([`${j(b.name, '와')} 비슷한 ${b.size} ${kind === 'cat' ? '고양이' : '견종'}`, `${b.name} 말고 함께 보는 품종`, `${b.size} ${kindWord} 비교`], s, 'simh') : pick([`${kindWord} 품종 고르는 예`, `처음 보는 분께 권하는 ${kindWord}`], s, 'simh'),
    items: similar.map((x) => ({ name: x.name, d: `${x.size} · ${x.coat} · 털 빠짐 ${x.shed}. ${x.trait}` })),
  } : null;

  // ---- 키우기 질문 — 12개 중 페이지마다 3개 (견종 크기·털·빠짐을 답에 넣는다, 숫자 일정은 쓰지 않음) ----
  const big = !!b && /대형/.test(b.size);
  const longCoat = !!b && /장모|곱슬|양털|솜|웨이브|실크|풍성/.test(b.coat);
  const sheds = !!b && /많/.test(b.shed);
  const nm = name;
  const TOPICS: { q: string; a: string }[] = kind === 'cat' ? [
    { q: `${nm} 데려온 첫날은 어떻게 하나요?`, a: `작은 방 하나에 화장실·물·숨을 곳을 두고 하루 이틀은 스스로 나오게 둡니다. ${BRAND}에서 먹던 사료를 그대로 이어 줍니다.` },
    { q: `${nm} 화장실은 어떤 걸 쓰나요?`, a: `${big ? '덩치가 커서 넉넉한 대형 화장실' : '몸이 들어가 한 바퀴 돌 수 있는 크기'}를 고르고, 처음엔 매장에서 쓰던 모래 종류를 맞춰 줍니다.` },
    { q: `${nm} 털 관리는요?`, a: `${b ? `털이 ${b.coat}이라 ` : ''}${longCoat ? '엉킴이 생기기 전에 주 2~3회 빗질합니다' : '주 1회 정도 죽은 털을 빗어 줍니다'}. ${sheds ? '털갈이 철엔 빗질 횟수를 늘립니다.' : ''}`.trim() },
    { q: `${nm} 혼자 있는 시간이 길어도 되나요?`, a: `${b ? b.trait + ' ' : ''}출근 시간이 길면 캣타워·창가 자리·장난감으로 혼자 노는 환경을 먼저 만듭니다.` },
    { q: `${j(nm, '와')} 다른 고양이 합사는요?`, a: '바로 한 공간에 두지 않고 방을 나눠 냄새부터 익히게 합니다. 합사 기간 주의사항은 분양 계약 때 안내합니다.' },
    { q: `${nm} 스크래처가 꼭 필요한가요?`, a: '발톱을 가는 건 본능이라 세로형·가로형을 하나씩 두면 가구 긁는 일이 줄어듭니다.' },
    { q: `${nm} 놀이는 얼마나 하나요?`, a: `${b && /활발|활동량|에너지/.test(b.trait) ? '활동량이 많은 편이라 낚싯대 장난감으로 하루 여러 번 짧게 놀아 줍니다' : '하루 두세 번 짧게 사냥 놀이를 해 주면 스트레스가 줄어듭니다'}.` },
    { q: `${nm} 건강검진은 어디서 하나요?`, a: `분양 전 예비 묘주님이 동물병원에서 기본검사로 직접 확인합니다. 이후 접종 일정은 다니실 동물병원과 정합니다.` },
    { q: `${nm} 동물등록도 해야 하나요?`, a: `고양이 동물등록은 의무는 아니지만 할 수 있습니다. ${BRAND} 부산본점은 사상구 지정 동물등록 대행업체라 매장에서 안내합니다.` },
    { q: `${nm} 사료는 언제 바꾸나요?`, a: '첫 주는 먹던 사료를 그대로 주고, 바꿀 때는 며칠에 걸쳐 섞어 가며 바꿉니다.' },
    { q: `${nm} 털 날림이 걱정돼요`, a: `${b ? `${b.name}의 털 빠짐은 ${b.shed}입니다. ` : ''}공기청정기와 정기 빗질로 날림을 줄이고, 걱정되면 상담 때 털이 덜 빠지는 품종을 함께 봅니다.` },
    { q: `원룸에서 ${nm} 키워도 되나요?`, a: `${big ? '대형묘라 수직 공간(캣타워)을 넉넉히 두면 원룸에서도 지냅니다' : '수직 공간만 있으면 원룸에서도 잘 지내는 편입니다'}. 창문 방묘창은 먼저 확인합니다.` },
  ] : [
    { q: `${nm} 데려온 첫날은 어떻게 하나요?`, a: `켄넬이나 울타리로 쉴 자리를 정해 주고 첫날은 조용히 둡니다. ${BRAND}에서 먹던 사료를 그대로 이어 줍니다.` },
    { q: `${nm} 배변 훈련은 어떻게 시작하나요?`, a: `잠에서 깬 뒤·밥 먹은 뒤 배변 패드로 데려가고, 성공하면 바로 칭찬합니다. ${big ? '대형견은 실외 배변으로 일찍 넘어가는 집도 많습니다.' : '소형견은 실내 패드 배변을 오래 쓰는 집이 많습니다.'}` },
    { q: `${nm} 산책은 언제부터 하나요?`, a: `접종이 끝나고 동물병원에서 괜찮다고 하면 짧게 시작합니다. ${big ? '운동량이 많아 점점 시간을 늘려 갑니다.' : '처음엔 안고 바깥 소리에 익숙해지게 하는 것부터 합니다.'}` },
    { q: `${nm} 첫 미용은 언제 하나요?`, a: `${longCoat ? '털이 계속 자라는 편이라 접종 뒤 위생미용부터 시작합니다' : '단모라 전체미용보다 목욕과 발톱·위생 관리 위주입니다'}.` },
    { q: `${nm} 털 빠짐은 어느 정도인가요?`, a: `${b ? `털은 ${b.coat}이고 빠짐은 ${b.shed}입니다. ` : ''}${sheds ? '털갈이 철엔 매일 빗질이 필요합니다.' : '빠짐은 적어도 엉킴 관리를 위해 빗질은 꾸준히 합니다.'}` },
    { q: `${nm} 혼자 있는 시간이 길어도 되나요?`, a: `${b ? b.trait + ' ' : ''}혼자 있는 연습은 짧은 시간부터 늘리고, 씹을 장난감을 두면 불안이 줄어듭니다.` },
    { q: `아파트에서 ${nm} 키워도 되나요?`, a: `${big ? '대형견이라 넓은 공간과 매일 충분한 산책이 전제입니다' : '실내 생활에 맞는 크기라 아파트에서 많이 키웁니다'}. 짖음은 어릴 때 사회화로 줄입니다.` },
    { q: `${nm} 동물등록은 어떻게 하나요?`, a: `반려견은 동물등록이 의무입니다. ${BRAND} 부산본점은 사상구 지정 동물등록 대행업체라 분양 때 매장에서 안내합니다.` },
    { q: `${nm} 건강검진은 어디서 하나요?`, a: '분양 전 예비 견주님이 동물병원에서 기본검사로 직접 확인합니다. 이후 접종 일정은 다니실 동물병원과 정합니다.' },
    { q: `${nm} 사료는 언제 바꾸나요?`, a: '첫 주는 먹던 사료를 그대로 주고, 바꿀 때는 며칠에 걸쳐 섞어 가며 바꿉니다.' },
    { q: `아이 있는 집에 ${nm} 괜찮나요?`, a: `${b ? b.trait + ' ' : ''}어린아이가 있으면 안는 법과 쉬는 시간을 먼저 정해 두고, 상담 때 가족 구성을 알려 주시면 맞는 아이를 권합니다.` },
  ];
  const care3 = rotate(TOPICS, s, 'topics').slice(0, 3);

  // ---- 의도 섹션 ----
  type Block = { heading: string; body: string[]; table?: { head: string[]; rows: string[][] }; steps?: { t: string; d: string }[] };
  const adoptBlock: Block = {
    heading: pick([`${name} 분양은 이렇게 진행됩니다`, '방문 예약부터 사후관리까지', `${BRAND} 분양 5단계`], s, 'ah'),
    body: [pick([
      `${BRAND}은 전화나 카톡으로 예약한 뒤 매장에서 아이를 직접 보고 결정합니다. 전화만으로 분양을 정하지 않습니다.`,
      `${where}에서 ${j(name, '를')} 알아보신다면 먼저 방문 날짜를 잡아 주세요. 상담 순서는 아래와 같습니다.`,
      `분양 전 건강 확인은 예비 보호자가 동물병원에 직접 가서 합니다. 그 결과를 보고 계약합니다.`,
    ], s, 'ab')],
    steps: ADOPT_STEPS.map((st, i) => ({ t: st.t, d: pick([
      st.d,
      [`${name} 상담은 전화나 카톡으로 방문 날짜부터 잡습니다.`, `매장에서 ${name}의 성격과 생활 습관을 직접 보고, 집 환경에 맞는지 펫플래너와 함께 판단합니다.`,
        `${name} 건강은 예비 보호자가 동물병원에서 기본검사로 직접 확인합니다.`, `${name} 계약서에는 상태와 주의사항을 적고, 사료 급여와 적응 기간을 설명합니다.`,
        `${j(name, '를')} 데려간 뒤에도 궁금한 점은 전화·SNS로 물어보시면 됩니다. 사후관리는 추가 비용이 없습니다.`][i],
    ], s, `st${i}`) })),
  };
  const intentBlock: Block = t === 'price' ? {
    heading: pick([`${name} 분양가가 달라지는 이유`, `${name} 분양 비용 상담`, '분양가는 상담으로 안내합니다'], s, 'ih'),
    body: [
      `${name} 분양가는 부모견·부모묘 혈통, 모색, 성별, 월령, 크기에 따라 차이가 납니다. ${BRAND}은 아이마다 다른 조건을 직접 보고 설명한 뒤 금액을 안내합니다.`,
      `분양 때는 동물병원 기본 건강 확인, 계약서 작성, 사료 급여·적응 기간 안내, 분양 후 사후관리가 함께 진행되고 사후관리는 추가 비용이 없습니다.`,
      `${BRAND} 부산본점은 사상구가 지정한 동물등록 대행업체라, 분양받은 ${kind === 'cat' ? '고양이' : '강아지'}의 동물등록도 매장에서 안내받을 수 있습니다.`,
    ],
  } : t === 'shelter' ? {
    heading: pick(['유기동물 입양과 분양샵 분양의 차이', '보호소 입양을 찾는다면', '입양 전 알아둘 것'], s, 'ih'),
    body: [
      `유기견·유기묘 입양은 지자체 동물보호센터에서 공고 기간이 지난 아이를 입양하는 방식입니다. 공고와 보호소 위치는 국가동물보호정보시스템(animal.go.kr)에서 지역별로 볼 수 있습니다.`,
      `${BRAND}은 보호소가 아니라 분양샵입니다. 전문 켄넬·캐터리 출신 아이를 계약서와 함께 분양하고, 분양 뒤 사후관리를 이어 갑니다. 무료 분양은 하지 않습니다.`,
      `어느 쪽이든 한 번 데려오면 끝까지 함께하는 것이 먼저입니다. ${BRAND}은 상담 단계에서 집 환경과 생활 시간을 묻고, 맞지 않으면 다른 아이를 권합니다.`,
    ],
  } : t === 'goods' ? {
    heading: pick([`${kindWord} 데려오기 전 준비물`, '분양 첫날 준비할 것', '처음 준비하는 용품'], s, 'ih'),
    body: [
      `${BRAND}은 분양 계약 때 지금 먹는 사료와 급여 방법, 적응·합사 기간 주의사항을 알려 드립니다. 첫 주는 사료를 바꾸지 않는 것이 좋습니다.`,
      kind === 'cat' ? '고양이는 화장실·모래, 스크래처, 숨을 수 있는 작은 공간을 먼저 준비합니다.' : '강아지는 켄넬이나 울타리, 배변 패드, 미끄럼 방지 매트를 먼저 준비합니다.',
    ],
  } : t === 'cafe' ? {
    heading: pick(['매장에 오시기 전에', `${BRAND} 매장 방문`, '방문 예약 안내'], s, 'ih'),
    body: [
      `${BRAND} 부산본점은 강아지·고양이 분양 매장입니다. 아이들 건강과 휴식 때문에 방문은 예약제로 받고, 예약 시간에 전문 상담사가 1:1로 안내합니다.`,
      `주소는 ${BUSINESS.address}이고 예약은 ${CONTACT.phone}, 오픈카톡, 인스타그램 DM으로 받습니다.`,
    ],
  } : t === 'origin' ? {
    heading: pick(['켄넬·캐터리 출신을 확인하세요', '어디서 태어난 아이인가', '출신이 확실한 아이'], s, 'ih'),
    body: [
      `${BRAND}의 아이들은 전문 켄넬과 캐터리에서 태어나 자란 아이들입니다. 상담 때 출신과 부모 정보를 설명하고, 건강 상태는 예비 보호자가 동물병원에서 직접 확인합니다.`,
      `${b ? `${j(b.name, '은')} ${b.size}라 부모견·부모묘 크기로 성장 크기를 가늠합니다. ` : ''}분양 뒤에도 궁금한 점은 전화·SNS로 상담합니다.`,
    ],
  } : t === 'info' && b ? {
    heading: pick([`${b.name} 키울 때 알아둘 것`, `${b.name} 성격과 관리`, `${j(b.name, '와')} 함께 사는 법`], s, 'ih'),
    body: [b.trait, b.care, `${b.size} ${kind === 'cat' ? '고양이' : '견종'}이라 ${/대형|초대형/.test(b.size) ? '넓은 공간과 운동 시간' : '실내 생활에 맞는 환경'}을 먼저 생각합니다.`],
  } : adoptBlock;

  // ---- 지역 섹션 ----
  const regionSec = pl ? {
    heading: pick([`${pl.label}에서 오시는 분께`, `${j(pl.label, '와')} ${BRAND}`, `${pl.label} ${kindWord} 분양`], s, 'rh'),
    body: [
      pl.scope === '시'
        ? `${pl.label}에는 주민등록 ${n(pl.households)}세대가 살고(2026년 9월), 반려견 ${n(pl.dogs)}마리·반려묘 ${n(pl.cats)}마리가 등록돼 있습니다(2022년 누계).`
        : `${pl.gu}에는 주민등록 ${n(pl.households)}세대(1인 세대 ${pl.onePct}%)가 살고, 반려견 ${n(pl.dogs)}마리·반려묘 ${n(pl.cats)}마리가 등록돼 있습니다(2022년 누계).`,
      pl.dongHouseholds ? `그중 ${pl.label.split(' ').slice(-1)[0]} 일대는 ${n(pl.dongHouseholds)}세대, 1인 세대 비율 ${pl.dongOnePct}%입니다. ${pl.dongOnePct! >= 45 ? `혼자 사는 집이 많아 ${kind === 'cat' ? '독립적인 고양이' : '소형견'} 상담이 잘 맞습니다.` : `가족 세대가 많아 아이와 함께 키울 ${j(kindWord, '를')} 찾는 상담이 잘 맞습니다.`}` : '',
      /경남|창원|김해|양산|거제|진해|마산|장유/.test(pl.label) || !/구/.test(pl.label)
        ? `${pl.label}에서 부산 사상구까지 오기 어려우면, 매장 상담으로 분양을 정한 뒤 홈딜리버리로 집까지 데려다줍니다.`
        : `${pl.label}에서는 부산본점(사상구 주례동)으로 방문 예약 후 오시면 됩니다.`,
    ].filter(Boolean),
  } : {
    heading: pick(['도로시펫 지점', '부산본점과 지점', '가까운 지점에서 상담'], s, 'rh'),
    body: [
      `${BRAND}은 부산본점 외에 대구점·광주점이 있습니다. 지점마다 분양 아이가 달라 방문 전 전화로 확인해 주세요.`,
      ...BRANCHES.map((br) => `${br.name}: ${br.address}, ${br.phone}.`),
      `부산본점이 있는 사상구는 반려견 ${n(10366)}마리가 등록된 지역입니다(2022년 누계). ${name} 상담은 본점 기준으로 안내합니다.`,
    ],
  };

  // ---- FAQ ----
  const faq = rotate([
    { q: `${name} 분양가는 얼마인가요?`, a: `혈통·모색·성별·월령에 따라 달라 아이를 보고 상담으로 안내합니다. 전화 ${CONTACT.phone}.` },
    { q: '건강은 어떻게 확인하나요?', a: '예비 견주·묘주님이 동물병원에 직접 가서 기본 건강검진으로 확인한 뒤 분양합니다.' },
    { q: '분양 뒤에도 상담해 주나요?', a: '분양 후 사후관리·후케어를 추가 비용 없이 돕습니다. 전화·SNS로 문의하시면 됩니다.' },
    { q: `${where}까지 데려다주나요?`, a: '매장 상담으로 분양을 정한 뒤 홈딜리버리를 신청하면, 출발 전 상태 사진을 보내고 지정한 날짜에 집 앞에서 계약서와 주의사항을 안내합니다.' },
    { q: '방문은 예약해야 하나요?', a: '네. 전화, 오픈카톡, 인스타그램 DM으로 예약하면 예약 시간에 1:1로 상담합니다.' },
    ...(b ? [{ q: `${j(b.name, '은')} 털이 많이 빠지나요?`, a: `${b.name}의 털은 ${b.coat}이고 털 빠짐은 ${b.shed}입니다. ${b.care}` }] : []),
    ...(t === 'shelter' ? [{ q: '무료 분양도 하나요?', a: `${BRAND}은 무료 분양을 하지 않습니다. 유기동물 입양은 animal.go.kr 공고를 확인해 주세요.` }] : []),
  ], s, 'faq').slice(0, 4);

  const promises = rotate(PROMISES, s, 'pr').slice(0, 3);
  // 같은 견종 페이지끼리 섹션 구성이 달라지도록 선택 섹션 7개 중 4개를 슬러그 해시로 고른다 (의도 섹션은 항상)
  const OPT = ['gallery', 'similar', 'adopt', 'promises', 'delivery', 'branches'] as const;
  const mods = new Set<string>(rotate([...OPT], s, 'mods').slice(0, 4));
  const showDelivery = !!pl && (/경남|창원|김해|양산|거제|진해|마산|장유/.test(pl.label) || pl.scope === '시') || t === 'sale' && hash(s) % 2 === 0;

  return {
    title, description, lead, summary: rotate(summary, s, 'sum').slice(0, 3), kindWord, mods, care3,
    name, where,
    eyebrow: `${BRAND} 부산본점 · ${pl ? pl.label : kindWord + ' 분양'}`,
    // 견종 페이지 첫 화면은 그 견종 사진, 그 밖은 부산본점 매장 사진(다른 견종 사진을 쓰지 않음)
    heroImg: b?.photos.length ? `b/${pick(b.photos, s, 'hero')}` : pick(['place-hall-1', 'place-hall-2', 'place-hall-3', 'place-hall-4'], s, 'hero'),
    specs: [['본점', '부산 사상구 주례동'], ['상담', CONTACT.phone], ['방문', '예약 후 1:1 상담']] as [string, string][],
    breedSec, gallery, similarSec, intentBlock, adoptBlock: intentBlock === adoptBlock ? null : adoptBlock, regionSec, faq, promises,
    delivery: showDelivery || mods.has('delivery') ? DELIVERY_STEPS : null,
    showRegion: !!pl || mods.has('branches'),
    rooms: rotate(PLACE_PHOTOS, s, 'room').slice(0, 3),
    branches: BRANCHES,
    closing: pick([`${name} 상담 예약`, `${where}에서 ${name} 찾으신다면`, '방문 날짜부터 잡아 주세요'], s, 'cl'),
  };
}
