#!/usr/bin/env bash
#
# run.sh — generate a lanyard from this repo under WSL.
#
# Why this exists: npm installs native modules (sharp) into node_modules, and
# writing those many small files onto a Windows-mounted drive (/mnt/c/...)
# corrupts them under WSL. This script keeps node_modules on the native Linux
# filesystem (~/.te-reo-build), runs the generator there, and copies the
# finished .pptx back into this repo's output/ folder.
#
# Usage:
#   ./run.sh                    # runs papa-honohono.js (default)
#   ./run.sh some-other.js      # runs a different generator script
#
set -euo pipefail

SCRIPT="${1:-papa-honohono.js}"
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUILD="${TE_REO_BUILD_DIR:-$HOME/.te-reo-build}"

# Prefer the Linux node/npm over any Windows ones that may be on PATH.
NODE=node; [ -x /usr/bin/node ] && NODE=/usr/bin/node
NPM=npm;   [ -x /usr/bin/npm ]  && NPM=/usr/bin/npm

if [ ! -f "$REPO/$SCRIPT" ]; then
  echo "Error: generator script not found: $REPO/$SCRIPT" >&2
  exit 1
fi

echo "Repo:   $REPO"
echo "Build:  $BUILD"
echo "Script: $SCRIPT"
echo

# Sync source into the native build dir (never node_modules or output).
mkdir -p "$BUILD/lib" "$BUILD/assets" "$BUILD/output"
cp -p "$REPO"/*.js           "$BUILD/"          2>/dev/null || true
cp -p "$REPO"/package.json   "$BUILD/"
cp -p "$REPO"/lib/*.js       "$BUILD/lib/"      2>/dev/null || true
cp -p "$REPO"/assets/*.ttf   "$BUILD/assets/"   2>/dev/null || true

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
"$NODE" "$SCRIPT"

# Copy the finished file(s) back into the repo.
mkdir -p "$REPO/output"
cp -p "$BUILD"/output/*.pptx "$REPO/output/" 2>/dev/null || true

echo
echo "Output copied to $REPO/output/:"
ls -la "$REPO"/output/*.pptx
