# Next steps

Handoff notes — picking up the lanyard work.

_Last updated: 2026-06-27_

## Big picture: we're switching output from PowerPoint to HTML → PDF

The pptxgenjs/PowerPoint pipeline is being **retired**. PowerPoint constrained the
design too much, and the real "easy to edit" surface is `content.json` (plus a
"ask Claude to change it" note), not a hand-editable .pptx. New pipeline:

- **HTML/CSS → PDF via WeasyPrint** (installed: `sudo apt-get install -y weasyprint`, v61.1).
- **Font: Carlito** (metric-compatible Calibri twin, already on the system) — so it
  reads like the old Calibri cards.
- **Format kept:** A5 landscape, two A6 panels per sheet, printed double-sided and
  folded down the centre. Two pages (sheet 1 = beginner | cover, sheet 2 = aha te
  wai | aha koe).

## Where the work currently lives (NOT yet in the repo)

The proven wai-takaro design is a standalone POC on the native filesystem:

- `~/.te-reo-pdf-poc/wai-takaro.html` — the print template (hand-written HTML+CSS).
- `~/.te-reo-pdf-poc/extract.js` — strips it to an artifact/browser version.
- Render: `cd ~/.te-reo-pdf-poc && weasyprint wai-takaro.html wai-takaro.pdf`
- Current preview committed for viewing: `output/wai-takaro-PREVIEW.pdf`
  (open from Windows at `C:\github\te-reo-ece-lanyards\output\`).
- HTML render (browser, shows the real drop-shadow etc.): the claude.ai artifact
  link in the chat.

## WeasyPrint 61 gotchas (its flexbox is broken — use block + CSS tables)

Learned the hard way, all verified by rendering:

- **No `box-shadow`** (silently ignored). The chip/tile "shadow" is faked with a
  light-teal `border-bottom` ledge. If a truer soft shadow is wanted, use an
  offset `::after` pseudo-element behind the tile (needs testing).
- **No flex `gap`**, **no `calc()` widths**, and flex column
  `align-items:stretch` / `justify-content:center` / `margin:auto` all fail.
- **Even table-cell `vertical-align:middle` fails** for "centre in remaining
  space". What works: block layout (full-width, predictable), CSS `display:table`
  for rows (header, chips via `border-spacing`, te-reo/English two-cell rows),
  `inline-block`+`font-size:0` for the 2×2 tile grid, `text-align:center` for
  horizontal, `position:absolute` for pin-to-bottom (Key kupu), and **manual
  `margin-top`** for vertical positioning (e.g. Mīharo kē!, cover content).
- **Verify by rendering on an oversized canvas with outlines** (`@page` bigger
  than 210×148 + `outline` on `.sheet`/`.card`/`.eq`). A normal raster clips
  overflow at the page edge so a broken layout looks fine.

## Open design items for wai-takaro (before integrating)

1. **Velcro dots (NOT done — needs a layout pass).** Each card gets a velcro dot
   centred vertically on its left & right edges (inside). So **reserve the
   vertical-centre of both side edges on every panel** — no important content
   there. Concretely: float the aha-te-wai **location box to the bottom** (above
   Key kupu) so the middle clears, and check the other three panels' edge
   midpoints. Need from Isabel: velcro dot diameter + exact placement.
2. **Drop shadow.** box-shadow is impossible in WeasyPrint; current stand-in is a
   teal bottom-edge ledge. Decide: keep the ledge, or build the `::after` offset
   shadow. (It looks correct in the browser/HTML preview either way.)
3. **Cover height.** Was rendering too high; now manually centred (`.circle
   margin-top:36mm`). Confirm it's not too low.
4. **Kaiako te reo pass** (small): `mai te kapu` vs `mai i te kapu`; the
   `whakamākū … i te papa` example wording. (The `Kei te pēhea` and `…ā, kei hea?`
   questions were already dropped on reo advice.)

Done this round: particles `i/mai/ki` now **bold black**; beginner tiles taller +
inside chips trimmed so aspect ratios match; "Water play" lowercased; "What" teal
bold; translation line + dashed divider under the beginner phrase; Mīharo kē!
centred in the lower space.

## Repo cleanup needed (the name is still backwards)

The committed `src/cards/wai-takaro/content.json` and
`output/wai-takaro-lanyard.{pptx,pdf}` still say **"Wai tākaro"**. The correct
name (reo feedback) is **"Tākaro wai"**, English **"Water play"**. Fix on
integration. The old pptxgenjs `wai-takaro.js` is the stale first design and will
be replaced.

## Integration plan (the recommended process)

Recommended order (matches Isabel's instinct — mock both, then rewrite once):

1. **Mock papa-honohono in HTML too**, the same way. It has content types
   wai-takaro doesn't — phrase blocks (accent bar), kupu rows (dotted leaders),
   an attribution footer, starred items — so the shared CSS must cover them.
   Doing this first means we design the generator for *both* cards, not one then
   rework.
2. **When both static HTMLs look right**, build the new pipeline once:
   - Shared CSS (a `cardKit.css` or a JS that emits the `<style>`), with colours
     driven by each card's palette.
   - Per-card `content.json` (the edit surface) + a small per-card composer
     `.js` that reads JSON and emits the card's `.html` (mirrors today's
     cardKit + composer split).
   - A render step: `weasyprint <card>.html <card>.pdf`.
   - Update `run.sh`: run composers → weasyprint, drop the LibreOffice pptx→pdf
     step and the pptxgenjs deps. Add the "edit content.json / ask Claude" note.
3. **Retire** pptxgenjs, `cardKit.js` (pptx version), `normalizePptx.js`, and the
   committed `.pptx` files once both cards render from the new pipeline.

## How this repo works (still current)

- **Run:** `./run.sh` (builds on the native FS to avoid `/mnt/c` corruption).
- Card name correction, palette, icon etc. live in each `content.json`.
- See the auto-memory note `wai-takaro-redesign.md` for the full design rationale
  and decisions.
