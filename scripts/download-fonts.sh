#!/usr/bin/env bash
# Downloads brand fonts from Google Fonts GitHub mirror to fonts/
# Run once (or after adding new fonts). fonts/ is gitignored.

set -euo pipefail

FONTS_DIR="$(cd "$(dirname "$0")/.." && pwd)/fonts"
mkdir -p "$FONTS_DIR"

BASE="https://github.com/google/fonts/raw/main/ofl"

download() {
  local url="$1"
  local dest_name="$2"
  local dest="$FONTS_DIR/$dest_name"
  if [[ -f "$dest" ]]; then
    echo "  already exists: $dest_name"
  else
    echo "  downloading: $dest_name"
    curl -fsSL "$url" -o "$dest"
  fi
}

# Variable fonts use brackets in filenames — URL-encode them for curl
echo "==> Cormorant (variable)"
download "$BASE/cormorant/Cormorant%5Bwght%5D.ttf"      "Cormorant-variable.ttf"
download "$BASE/cormorant/Cormorant-Italic%5Bwght%5D.ttf" "Cormorant-Italic-variable.ttf"

echo "==> Nunito (variable)"
download "$BASE/nunito/Nunito%5Bwght%5D.ttf"             "Nunito-variable.ttf"
download "$BASE/nunito/Nunito-Italic%5Bwght%5D.ttf"      "Nunito-Italic-variable.ttf"

echo "==> Space Mono (static)"
download "$BASE/spacemono/SpaceMono-Regular.ttf"         "SpaceMono-Regular.ttf"
download "$BASE/spacemono/SpaceMono-Bold.ttf"            "SpaceMono-Bold.ttf"
download "$BASE/spacemono/SpaceMono-Italic.ttf"          "SpaceMono-Italic.ttf"
download "$BASE/spacemono/SpaceMono-BoldItalic.ttf"      "SpaceMono-BoldItalic.ttf"

echo "Done. Fonts in $FONTS_DIR"
