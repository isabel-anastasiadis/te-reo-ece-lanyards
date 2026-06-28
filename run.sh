#!/usr/bin/env bash
#
# run.sh — generate the lanyard cards.
#
#   content.json --(node composer)--> <card>.html --(WeasyPrint)--> PDF
#
# The composers use only Node built-ins, so there's no `npm install` and no
# node_modules — this runs directly in the repo (no /mnt/c corruption issue).
#
# System requirements (one-time):
#   - node            (the composers)
#   - weasyprint      sudo apt-get install -y weasyprint
#   - Carlito font    (Calibri metric-twin; fonts-crosextra-carlito)
#   - python3-pil     (Pillow — renders the Amatic SC bracket; assets/AmaticSC-Regular.ttf)
#
# Committed artifact is the generated src/cards/<card>/<card>.html (deterministic);
# the PDF is a regenerable build output (gitignored — WeasyPrint randomises font
# subset tags, so PDFs aren't byte-stable).
#
# Usage:
#   ./run.sh                  # all cards
#   ./run.sh wai-takaro       # one card
set -euo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO"
NODE=node; [ -x /usr/bin/node ] && NODE=/usr/bin/node

if [ "$#" -ge 1 ]; then
  CARDS=("$@")
else
  CARDS=()
  for d in src/cards/*/; do [ -d "$d" ] && CARDS+=("$(basename "$d")"); done
fi

mkdir -p output
for CARD in "${CARDS[@]}"; do
  SCRIPT="src/cards/$CARD/$CARD.js"
  if [ ! -f "$SCRIPT" ]; then echo "Skipping '$CARD': $SCRIPT not found" >&2; continue; fi
  echo "==> $CARD"
  "$NODE" "$SCRIPT"
  weasyprint "src/cards/$CARD/$CARD.html" "output/$CARD-lanyard.pdf"
done

echo
echo "Output:"
ls -la "$REPO"/output/*-lanyard.pdf 2>/dev/null
