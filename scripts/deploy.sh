#!/usr/bin/env bash
# 빌드 결과(out/)만 deploy 브랜치로 올린다. 서버는 deploy 브랜치를 받아 nginx로 서빙.
#   bash scripts/deploy.sh <주소>   (GitHub Actions 가 lib/site.ts 의 SITE_URL 로 호출. og 이미지는 저장소에 있음 — 바꿀 때 로컬에서 make_og.py --force 후 커밋)
# 서버 갱신: cd /var/www/dorothypet && git fetch -q origin deploy && git reset -q --hard origin/deploy
set -euo pipefail
URL=${1:?주소}
cd "$(dirname "$0")/.."
rm -rf ./out
SITE_URL=$URL npx next build
grep -q "$URL" out/sitemap.xml || { echo "sitemap에 주소가 없음"; exit 1; }
REMOTE=$(git remote get-url origin)
cd out
git init -q -b deploy && git add -A
git -c user.name="$(git -C .. config user.name || echo deploy-bot)" -c user.email="$(git -C .. config user.email || echo deploy-bot@users.noreply.github.com)" commit -q -m "deploy: $URL $(date +%F)"
git push -q -f "$REMOTE" deploy
rm -rf ./.git
echo "deploy 브랜치 갱신 완료: $(find . -name '*.html' | wc -l) html, $(du -sh . | cut -f1)"
