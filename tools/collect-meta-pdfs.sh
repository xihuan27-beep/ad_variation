#!/usr/bin/env bash
# 업로드된 PDF 중 Meta 광고 가이드만 골라 모은다.
#
# 파일 이름은 한글이 깨져 들어와 쓸 수 없고, PDF 제목도 브라우저 탭에서 남은
# 값이라 실제 내용과 다르다. 본문의 ads-guide/update/<형식>/<게재위치> 경로가
# 유일하게 믿을 수 있는 식별자이므로 그것으로 이름을 붙인다.
# 같은 페이지를 다시 받으면 덮어써서 중복이 쌓이지 않는다.
#
# 사용법: tools/collect-meta-pdfs.sh <업로드_디렉터리> <수집_디렉터리>
set -euo pipefail

SRC="${1:?업로드 디렉터리를 지정하세요}"
DEST="${2:?수집 디렉터리를 지정하세요}"
mkdir -p "$DEST"

found=0
for f in "$SRC"/*.pdf; do
  [ -e "$f" ] || continue
  url=$(pdftotext -raw "$f" - 2>/dev/null | grep -o 'ads-guide/update/[a-z/-]*' | head -1 || true)
  [ -n "$url" ] || continue
  # 게재위치가 없는 경로는 기본 게재위치(Facebook 피드) 페이지다.
  # 이름을 맞춰 두어야 같은 페이지의 국문·영문판이 한 파일로 합쳐진다.
  slug=$(echo "$url" | sed 's|ads-guide/update/||; s|/|__|g')
  case "$slug" in
    *__*) ;;
    *) slug="${slug}__facebook-feed" ;;
  esac
  cp "$f" "$DEST/${slug}.pdf"
  found=$((found + 1))
done

echo "Meta 가이드 PDF ${found}건 확인 · 고유 페이지 $(ls -1 "$DEST"/*.pdf 2>/dev/null | wc -l)건"
