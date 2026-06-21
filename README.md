# te-reo-ece-lanyards

Project for generating and sharing lanyard templates for different areas of play
at early childhood education centres, in te reo Māori.

Each generator script produces a printable A5-landscape PowerPoint (`.pptx`) — a
fold-in-half lanyard card with an amber cover, a "build-a-phrase" panel, and
kupu (vocabulary) and kīanga (phrases) for that area of play.

## Lanyards

| Area of play   | Script              | Output                                |
| -------------- | ------------------- | ------------------------------------- |
| Papa Honohono (Puzzles) | `papa-honohono.js` | `output/papa-honohono-lanyard.pptx` |

## Requirements

- **Node.js** (for the generator scripts)
- **Python 3 + Pillow** — used by `lib/renderBracket.js` to render the curly
  bracket in the Amatic SC font (`pip install Pillow`)

## Setup

```bash
npm install
pip install Pillow
```

The Amatic SC font (`assets/AmaticSC-Regular.ttf`) is included in the repo.

## Usage

```bash
npm run papa-honohono
```

The `.pptx` is written to `output/`.

## How it works

- Icons are pulled from [`react-icons`](https://react-icons.github.io/react-icons/),
  rendered to SVG and converted to PNG with [`sharp`](https://sharp.pixelplumbing.com/).
- The decorative `{` bracket is rendered from the Amatic SC font by
  `lib/renderBracket.js` (via Python/Pillow) and cached to `assets/bracket.b64`.
  This cache is regenerated on every run and is gitignored.
- The slides are assembled with [`pptxgenjs`](https://gitbrent.github.io/PptxGenJS/).

Generated output (`output/*.pptx`) and the cached bracket (`assets/bracket.b64`)
are not committed.

## Attribution

Te reo Māori content draws on *Ki te Hoe: Indigenising Practice*
(Williams & Te Rongopatahi, 2023, Ako Aotearoa).
