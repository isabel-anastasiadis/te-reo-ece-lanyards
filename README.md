# te-reo-ece-lanyards

Project for generating and sharing lanyard templates for different areas of play
at early childhood education centres, in te reo Māori.

Each generator script produces a printable A5-landscape PowerPoint (`.pptx`) — a
fold-in-half lanyard card with an amber cover, a "build-a-phrase" panel, and
kupu (vocabulary) and kīanga (phrases) for that area of play.

## Lanyards

| Area of play            | Card name       | Output                              |
| ----------------------- | --------------- | ----------------------------------- |
| Papa Honohono (Puzzles) | `papa-honohono` | `output/papa-honohono-lanyard.pptx` |

## Project structure

```
src/
  cards/
    papa-honohono/
      papa-honohono.js   # one generator per area of play
  lib/
    renderBracket.js     # shared Amatic SC bracket renderer
    normalizePptx.js     # makes .pptx output byte-reproducible
assets/                  # bundled font (+ generated bracket cache)
output/                  # generated .pptx files (committed)
run.sh                   # WSL build/run helper
```

Each card generator lives in `src/cards/<card-name>/<card-name>.js`.

## Requirements

- **Node.js** (for the generator scripts)
- **Python 3 + Pillow** — used by `src/lib/renderBracket.js` to render the curly
  bracket in the Amatic SC font (`pip install Pillow`)

The Amatic SC font (`assets/AmaticSC-Regular.ttf`) is included in the repo.

## Running under WSL (recommended)

If you're on Windows and this repo lives on a Windows drive (`/mnt/c/...`)
accessed through WSL, use the helper script:

```bash
./run.sh                 # generate ALL cards (default)
./run.sh papa-honohono   # generate one card
./run.sh card-a card-b   # generate a specific subset
```

The `.pptx` files are written to `output/` and are committed to the repo (see
[Output files](#output-files)).

### Why a helper script?

Two WSL gotchas make running directly painful:

1. **npm corrupts native modules on `/mnt/c`.** Installing `node_modules`
   (which includes the native `sharp` module) onto a Windows-mounted drive
   corrupts files. `run.sh` keeps `node_modules` on the native Linux
   filesystem (`~/.te-reo-build`), runs the generator there, and copies the
   finished `.pptx` back into `output/`.
2. **Mixed Windows/Linux toolchains on PATH.** `run.sh` explicitly prefers the
   Linux `node`/`npm` (`/usr/bin/...`) so the bracket renderer reaches the
   Linux Python/Pillow rather than the Windows Python stub.

One-time setup it relies on:

```bash
sudo apt-get install -y npm python3-pil   # Linux npm + Pillow
```

`run.sh` installs the npm dependencies itself on first run (and re-installs
only when `package.json` changes).

## Running elsewhere (macOS / Linux / native Windows)

No `/mnt/c` issue applies, so you can run directly:

```bash
npm install
# Pillow: pip install Pillow   (or your OS package, e.g. apt install python3-pil)
npm run papa-honohono
```

## How it works

- Icons are pulled from [`react-icons`](https://react-icons.github.io/react-icons/),
  rendered to SVG and converted to PNG with [`sharp`](https://sharp.pixelplumbing.com/).
- The decorative `{` bracket is rendered from the Amatic SC font by
  `src/lib/renderBracket.js` (via Python/Pillow) and cached to `assets/bracket.b64`.
  This cache is regenerated on every run and is gitignored.
- The slides are assembled with [`pptxgenjs`](https://gitbrent.github.io/PptxGenJS/).

## Output files

The generated `output/*.pptx` files **are committed** — they're how the lanyards
are published for now, and committing them means a git diff shows whenever a
card's shape changes.

To keep those diffs meaningful, `src/lib/normalizePptx.js` rewrites each `.pptx`
with fixed timestamps after generation, so re-running a card with no design
changes produces a byte-identical file (no spurious diffs). Regenerating on the
same machine is reproducible; output may differ across machines/dependency
versions.

The cached bracket image (`assets/bracket.b64`) is regenerated on every run and
is **not** committed.

## Attribution

Te reo Māori content draws on *Ki te Hoe: Indigenising Practice*
(Williams & Te Rongopatahi, 2023, Ako Aotearoa).
