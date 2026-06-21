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

# Copy the finished files back into the repo.
mkdir -p "$REPO/output"
cp -p "$BUILD"/output/*.pptx "$REPO/output/" 2>/dev/null || true

echo
echo "Output in $REPO/output/:"
ls -la "$REPO"/output/*.pptx

exit $failed
