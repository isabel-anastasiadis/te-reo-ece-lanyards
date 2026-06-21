#!/usr/bin/env bash
#
# run.sh — generate a lanyard card from this repo under WSL.
#
# Why this exists: npm installs native modules (sharp) into node_modules, and
# writing those many small files onto a Windows-mounted drive (/mnt/c/...)
# corrupts them under WSL. This script keeps node_modules on the native Linux
# filesystem (~/.te-reo-build), runs the generator there, and copies the
# finished .pptx back into this repo's output/ folder.
#
# Usage:
#   ./run.sh                 # generates the papa-honohono card (default)
#   ./run.sh <card-name>     # generates src/cards/<card-name>/<card-name>.js
#
set -euo pipefail

CARD="${1:-papa-honohono}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="${TE_REO_BUILD_DIR:-$HOME/.te-reo-build}"
SCRIPT_REL="src/cards/$CARD/$CARD.js"

# Prefer the Linux node/npm over any Windows ones that may be on PATH.
NODE=node; [ -x /usr/bin/node ] && NODE=/usr/bin/node
NPM=npm;   [ -x /usr/bin/npm ]  && NPM=/usr/bin/npm

if [ ! -f "$REPO/$SCRIPT_REL" ]; then
  echo "Error: card generator not found: $SCRIPT_REL" >&2
  echo "Available cards:" >&2
  ls "$REPO/src/cards" 2>/dev/null | sed 's/^/  /' >&2 || true
  exit 1
fi

echo "Repo:   $REPO"
echo "Build:  $BUILD"
echo "Card:   $CARD"
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

# Generate.
"$NODE" "$SCRIPT_REL"

# Copy the finished file(s) back into the repo.
mkdir -p "$REPO/output"
cp -p "$BUILD"/output/*.pptx "$REPO/output/" 2>/dev/null || true

echo
echo "Output copied to $REPO/output/:"
ls -la "$REPO"/output/*.pptx
