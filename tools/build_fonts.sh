#!/usr/bin/env bash
# Rebuild the subset WOFF2 fonts used by the game from the Google Fonts (OFL) sources.
# Requires: curl, and uv or python3 with fonttools + brotli. Usage: bash tools/build_fonts.sh
set -euo pipefail
GAME="$(cd "$(dirname "$0")/../app" && pwd)"
WORK="$(mktemp -d)"
BASE=https://raw.githubusercontent.com/google/fonts/main/ofl
curl -sSfo "$WORK/dela.ttf" "$BASE/delagothicone/DelaGothicOne-Regular.ttf"
curl -sSfo "$WORK/zen-bold.ttf" "$BASE/zenmarugothic/ZenMaruGothic-Bold.ttf"
curl -sSfo "$WORK/zen-black.ttf" "$BASE/zenmarugothic/ZenMaruGothic-Black.ttf"
python3 - "$GAME" "$WORK/chars.txt" <<'PY'
import sys, pathlib
game = pathlib.Path(sys.argv[1])
chars = {chr(c) for c in range(0x20, 0x7f)}
for f in [*game.glob('*.html'), *game.glob('*.css'), *game.glob('js/*.js')]:
    chars |= set(f.read_text(encoding='utf-8'))
# Russian edition: Cyrillic, typographic punctuation and the spaces ru-RU number formatting uses.
chars |= set('АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯабвгдеёжзийклмнопрстуфхцчшщъыьэюя')
chars |= set('−×÷≈«»—–…№·\u00a0\u202f')
pathlib.Path(sys.argv[2]).write_text(''.join(sorted(c for c in chars if ord(c) >= 0x20)), encoding='utf-8')
PY
for pair in "dela dela-gothic-one" "zen-bold zen-maru-gothic-bold" "zen-black zen-maru-gothic-black"; do
  set -- $pair
  if command -v uv >/dev/null; then SUBSET=(uv run --no-project --with fonttools --with brotli pyftsubset); else SUBSET=(python3 -m fontTools.subset); fi
  "${SUBSET[@]}" "$WORK/$1.ttf" --text-file="$WORK/chars.txt" --flavor=woff2 --layout-features='*' --output-file="$GAME/fonts/$2.woff2"
done
rm -rf "$WORK"
echo "fonts rebuilt in $GAME/fonts"
