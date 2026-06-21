#!/usr/bin/env bash
#
# run.sh — generate lanyard cards from this repo under WSL.
#
# Why this exists: npm installs native modules (sharp) into node_modules, and
# writing those many small files onto a Windows-mounted drive (/mnt/c/...)
# corrupts them under WSL. This script keeps node_modules on the native Linux
# filesystem (~/.te-reo-build), runs the generators there, and copies the
# finished .pptx files back into this repo's output/ folder.
#
# Usage:
#   ./run.sh                       # generate ALL cards (default)
#   ./run.sh papa-honohono         # generate one card
#   ./run.sh card-a card-b         # generate a specific subset
#
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="${TE_REO_BUILD_DIR:-$HOME/.te-reo-build}"

# Prefer the Linux node/npm over any Windows ones that may be on PATH.
NODE=node; [ -x /usr/bin/node ] && NODE=/usr/bin/node
NPM=npm;   [ -x /usr/bin/npm ]  && NPM=/usr/bin/npm

# Which cards to build: the names given as arguments, or all of them.
if [ "$#" -ge 1 ]; then
  CARDS=("$@")
else
  CARDS=()
  for d in "$REPO"/src/cards/*/; do
    [ -d "$d" ] && CARDS+=("$(basename "$d")")
  done
fi

if [ "${#CARDS[@]}" -eq 0 ]; then
  echo "No cards found under src/cards/." >&2
  exit 1
fi

echo "Repo:   $REPO"
echo "Build:  $BUILD"
echo "Cards:  ${CARDS[*]}"
echo

# Sync source into the native build dir (never node_modules or output).
mkdir -p "$BUILD/output"
cp -rp "$REPO/src" "$REPO/package.json" "$REPO/assets" "$BUILD/"

# Install dependencies only when missing or when package.json has changed
# (cp -p above preserves mtimes, so -nt is meaningful).
cd "$BUILD"
if [ ! -d node_modules ] || [ package.json -nt node_modules ]; then
  echo "Installing dependencies (native filesystem)..."
  "$NPM" install
  touch node_modules
else
  echo "Dependencies already installed."
fi
echo

# Generate each requested card.
failed=0
for CARD in "${CARDS[@]}"; do
  SCRIPT_REL="src/cards/$CARD/$CARD.js"
  if [ ! -f "$BUILD/$SCRIPT_REL" ]; then
    echo "Skipping '$CARD': $SCRIPT_REL not found" >&2
    failed=1
    continue
  fi
  echo "==> $CARD"
  "$NODE" "$SCRIPT_REL"
done

# Convert each .pptx to a reproducible .pdf (for quick viewing / Drive preview).
# Skipped with a warning if LibreOffice isn't installed.
if command -v soffice >/dev/null 2>&1; then
  echo
  echo "Converting to PDF..."
  for pptx in "$BUILD"/output/*.pptx; do
    soffice --headless -env:UserInstallation="file://$BUILD/.lo_profile" \
      --convert-to pdf --outdir "$BUILD/output" "$pptx" >/dev/null 2>&1
  done
  # Normalize PDFs so committed copies only change when the design does.
  python3 "$BUILD/src/lib/normalize_pdf.py" "$BUILD"/output/*.pdf >/dev/null
else
  echo "Note: LibreOffice (soffice) not found — skipping PDF export." >&2
fi

# Copy the finished files back into the repo.
mkdir -p "$REPO/output"
cp -p "$BUILD"/output/*.pptx "$REPO/output/" 2>/dev/null || true
cp -p "$BUILD"/output/*.pdf  "$REPO/output/" 2>/dev/null || true

echo
echo "Output in $REPO/output/:"
ls -la "$REPO"/output/*.pptx "$REPO"/output/*.pdf 2>/dev/null

exit $failed
