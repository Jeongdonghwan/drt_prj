# 도로시펫 분양 매장 SEO 사이트 — 이어서 작업하는 Claude에게

먼저 `SITE.md`를 읽는다. 키워드 원본·추가 규칙, 데이터 출처, 넣지 않은 문구, 디자인, 색인 지표, 확인 필요 항목이 모두 거기 있다.

## 현재 상태 (2026-10-27)
- 매장 1,050(CSV 953 + 추가 97) + 메인·전체 안내 빌드. check_all 전부 통과.
- 가맹 창업은 별도 사이트 `C:\side_Prj\dorothypet_franchise_prj`(사용자 요청 2026-10-28: 창업은 따로 랜딩 사이트). 이 사이트에는 창업 페이지를 두지 않고 헤더·하단 바에서 `FRANCHISE_SITE`로 링크만. 키워드·지역 데이터(`data/pages.json`·`regions.json`)는 여기서 만들어 창업 사이트로 복사한다.
- 로컬: `npx next build` 후 `python -I -m http.server 18938 --bind 127.0.0.1 --directory out`

## 규칙
- 대답과 중간 안내는 한국어.
- 매장 키워드는 사용자가 준 CSV를 빼지 않고 쓴다. 추가는 사용자가 요청한 만큼만(현재 97개, `scripts/select_keywords.py` STORE_TARGET).
- 분양 목록 건수('○○건') 표시 안 함(사용자 요청 2026-10-28). 견종 페이지에는 그 견종 사진만 — 그외특수견·묘 분류는 분양 글 제목이 그 견종인 사진만(`build_breeds.py`).
- 분양가·창업 비용 숫자, 할인, 비교 수치('1/3') 넣지 않기. 사실은 공식 사이트·공공데이터에 있는 것만.
- 디자인 AI 티 금지(`~/.claude/skills/web-design`), 대량 페이지는 `~/.claude/skills/programmatic-seo`, 출시 전 `~/.claude/skills/site-launch` check_all 통과.
- 커튼명장(curtain_prj) 등 다른 업체 프로젝트와 섞지 않는다.
