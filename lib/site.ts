// 도로시펫 사이트 설정 — 연락처·지점·공식 사이트 표기 사실. 출처: dorothypet.co.kr (2026-10-27 수집, raw/site/text/)
// 넣지 않는 것: 팝업 '90% 할인' 이벤트, '타 브랜드 대비 1/3 비용' 같은 비교 수치(근거 확인 불가), 분양가(사이트도 '상담 문의').

export const SITE_URL = process.env.SITE_URL || 'https://dorothypet.example'; // TODO: SEO 사이트 도메인 확정 시 변경
export const FRANCHISE_SITE = process.env.FRANCHISE_SITE || 'https://dorothypet-franchise.example'; // 가맹 창업 사이트(dorothypet_franchise_prj) — 도메인 확정 시 변경
export const BRAND = '도로시펫';
export const BRAND_EN = 'DOROTHY PET';

export const LINKS = {
  home: 'https://dorothypet.co.kr/',
  franchise: 'https://dorothypet.co.kr/franchise',
  kakao: 'http://pf.kakao.com/_AxjExkb',
  instagram: 'https://www.instagram.com/dorothypet_puppy',
  youtube: 'https://www.youtube.com/channel/UCYJaxE_5nCmSgZt9J9TSkcQ',
  blog: 'https://blog.naver.com/dorothypet37',
};

export const CONTACT = { phone: '010-2236-8276' };
export const tel = `tel:${CONTACT.phone.replace(/[^0-9]/g, '')}`;

export const BUSINESS = {
  name: '도로시펫 부산본점',
  owner: '김경호',
  bizNumber: '651-42-00604',
  address: '부산광역시 사상구 가야대로 336 A동 (주례동)',
};

export const BRANCHES = [
  { name: '부산본점', address: '부산광역시 사상구 가야대로 336 A동 (주례동)', phone: '010-2236-8276' },
  { name: '대구점', address: '대구광역시 남구 명덕로 100, 1층', phone: '010-2178-2433' },
  { name: '광주점', address: '광주광역시 남구 서문대로 801(주월동) 2층', phone: '010-8544-8584' },
];

// 사이트 분양 목록 기준 (2026-10-27)
export const LISTED = { dogs: 1360, cats: 809 };

// 분양 안내 5단계 (adoption-guide)
export const ADOPT_STEPS = [
  { t: 'SNS·전화로 방문 예약', d: '전화, 오픈카톡, 인스타그램 DM으로 방문 날짜를 잡습니다.' },
  { t: '1:1 맞춤 상담', d: '매장에서 전문 펫플래너가 아이의 성격·특징·생활 습관을 설명하고 집 환경에 맞는 아이를 함께 고릅니다.' },
  { t: '동물병원 건강 확인', d: '예비 견주·묘주님이 동물병원에 직접 가서 기본 건강검진으로 상태를 확인합니다.' },
  { t: '계약서 작성·주의사항', d: '소비자보호 기준에 맞춘 계약서를 쓰고 사료 급여, 적응·합사 기간 같은 주의사항을 안내합니다.' },
  { t: '분양 후 사후관리', d: '분양 뒤에도 궁금한 점은 전화·SNS로 상담합니다. 추가 비용은 없습니다.' },
];

// 홈딜리버리 6단계 (delivery)
export const DELIVERY_STEPS = [
  '매장 방문 후 상담·분양 결정',
  '출발 전 아이 상태 확인 사진 촬영·첨부',
  '배송 날짜 지정',
  '분양 관련 서류 지참해 출발',
  '집 앞 도착',
  '계약서 작성·주의사항 설명 후 완료',
];

// 애견호텔 (grooming-hotel) — 체크아웃 익일 12시
export const HOTEL = [
  { w: '4kg 미만', weekday: 20000, weekend: 25000 },
  { w: '4kg 이상', weekday: 25000, weekend: 30000 },
];
// 애견미용 소형견 기준 (grooming-hotel)
export const GROOMING = [
  { w: '0~4kg 미만', bath: 25000, full: 45000, face: 50000, sporting: 75000, scissor: 80000 },
  { w: '4~6kg', bath: 30000, full: 50000, face: 55000, sporting: 80000, scissor: 90000 },
  { w: '6~8kg 미만', bath: 35000, full: 55000, face: 60000, sporting: 85000, scissor: 100000 },
];

// 매장 약속 (about·상세 페이지 공통 문구)
export const PROMISES = [
  { t: '건강 상태 확인', d: '입양 전 예비 견주·묘주님이 직접 기본검사로 건강 상태를 확인한 뒤 분양합니다.' },
  { t: '합법적인 분양 절차', d: '정부 규정을 지키는 분양 절차로 계약합니다.' },
  { t: '1:1 맞춤 상담', d: '매장 방문 예약 후 전문 상담사가 1:1로 상담합니다.' },
  { t: '분양 후 사후관리', d: '분양 뒤 사후관리·후케어를 추가 비용 없이 돕습니다.' },
  { t: '확실한 출신', d: '전문 켄넬과 캐터리에서 태어난 출처가 명확한 아이들입니다.' },
  { t: '동물등록 대행', d: '사상구에서 지정한 동물등록 대행업체입니다(동물보호법 제12조 제4항).' },
];

// 가맹 (franchise)
export const FR_CORE = [
  { t: '실전 기반 운영 노하우', d: '여러 매장 오픈 경험과 현장 중심 교육으로 처음 창업하는 분도 매장을 운영할 수 있게 돕습니다.' },
  { t: '지속적인 본사 지원·교육', d: '오픈 전 교육부터 오픈 후 정기 점검, 매월 프로모션 지원까지 이어집니다.' },
  { t: '인테리어 가이드', d: '브랜드 아이덴티티를 담은 인테리어 가이드를 제공하고, 부담 없는 금액으로 공간을 만듭니다.' },
  { t: '점주와 상생', d: '동일 상권 중복 가맹 제한, 정기 소통, 점주 의견 반영으로 본사와 점주가 함께 성장합니다.' },
];
export const FR_WHY = [
  { t: '전방위 창업 지원', d: '창업 컨설팅부터 교육, 오픈, 운영관리까지 전 과정을 함께합니다.' },
  { t: '검증된 건강 분양 시스템', d: '건강검진·병력·혈통 정보를 투명하게 제공하는 분양 관리.' },
  { t: '통합 마케팅 대행', d: '블로그·인스타그램·유튜브 마케팅을 본사가 직접 기획·운영합니다.' },
  { t: '상권 보호', d: '입지 분석으로 동일 상권 안 중복 가맹을 막습니다.' },
  { t: '부담을 줄인 창업 비용', d: '공급망과 운영 시스템을 본사가 갖추고 있어 개인이 처음부터 구축하는 부담을 줄입니다.' },
  { t: '표준화된 매뉴얼', d: '매출·고객 응대·운영 가이드를 초보자도 따라 할 수 있게 정리했습니다.' },
];
export const FR_STEPS = ['온라인·전화 미팅 예약', '미팅 후 상담', '가맹 신청', '상권 분석·점포 개발', '인허가 점검', '점포 계약', '실측·도면 협의', '가맹 계약 체결', '인테리어 공사', '점주 교육', '오픈'];
export const FR_MOTTO = '지점이 잘되어야 본사가 함께 성장할 수 있다';
