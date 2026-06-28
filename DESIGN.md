# Lanyard card design system

Living doc — the components and rules every card follows. Derived from the
**Tākaro wai** card; adjust here as the design evolves, and keep both cards in
sync with it.

## Output & build

- **A5 landscape** sheet (210 × 148 mm) = two **A6 portrait** panels side by side.
  Printed double-sided, folded down the centre into an A6 card.
- Two sheets: **sheet 1** = beginner | cover, **sheet 2** = inside-left | inside-right.
- Rendered **HTML/CSS → PDF with WeasyPrint** (not PowerPoint). Font: **Carlito**
  (metric-compatible Calibri). See the WeasyPrint constraints at the bottom — they
  shape how everything is built.

## Geometry

- Panel: `105 × 148 mm`, padding `2mm` on the outer/top/bottom edges and `0` on the
  fold edge, so the two cards **touch at the fold**.
- Card: fills the panel; border `1.1mm` solid in the card's **mid** colour;
  corners `4mm` rounded on the outer side, **square on the fold side** (so the two
  halves form one continuous rounded rectangle with a seam at the fold). Inner
  padding `5mm`. `position:relative` (so things can pin to its edges).

## Palette (per card)

Each card defines four brand colours + neutrals as CSS vars:

| var | role | Tākaro wai | Papa honohono |
|-----|------|-----------|---------------|
| `--ink`   | te reo text, headings (near-black brand) | `#085041` | `#633806` |
| `--mid`   | English glosses, accents, borders, icon  | `#1D9E75` | `#BA7517` |
| `--light` | dividers, ledges, accent bars            | `#5DCAA5` | `#EF9F27` |
| `--box`   | pale content-box background              | `#E1F5EE` | `#FAEEDA` |
| `--note`  | footer / muted secondary                | `#41514B` | `#6E5A33` |

Cover background = `--mid`; white text/icon on it.

## Type scale (pt)

Header name 15 · header English 11 · cover title 28–30 · cover sub 14–15 (letter-spaced,
all-caps) · question/answer 15–18 · gloss/English 9.5–11 · tile/chip te reo 13–15 ·
celebration 20–21 · section label 9.5 · footer 7.5.

## Colour & emphasis rules

- **te reo** = `--ink`, bold for headwords. **English** = `--mid`, italic.
- **Question word** (aha/pēhea) is emphasised: a **dashed chip** when its answers
  are chips/tiles, plain **`--mid`** when the answers are a text list. Its English
  equivalent ("What") is `--mid` bold to match.
- **Practised verb** in an example is `--mid` bold.
- **Grammar particle** being taught (i / mai / ki) is **bold black** (`#000`) to
  stand out from the te reo around it.
- **Passive tail** in a headword — e.g. ringi**(hia)** — is shown but **un-bolded**
  so the base verb reads first.
- **Dashed line** = boundary between a question and its answers. **Dotted line** =
  divider between rows in a list. Nothing else uses lines.
- **★** marks an item sourced from the card's attribution; the footer carries the
  ★ + citation.

## Components

- **Header** (`.chead`) — icon (in `--mid`) + name (`--ink` bold) over English
  (`--mid`), then a full-width `--light` divider. A **bigger variant**
  (`.chead.big`, ~20pt) suits the back/beginner page, which carries less and can
  use the space; its equation text runs a bit larger too for readability.
- **Cover** (`.card.cover`) — solid `--mid` panel; a translucent-white circle with
  the white icon, the title, and an all-caps letter-spaced subtitle, the group
  centred (pushed down with a manual top margin — see constraints).
- **Pale box** (`.eq`) — the `--box` rounded container that holds a unit of
  content. Most things live in one.
- **Question heading** (`.ask`) — te reo question (bold, with the emphasised
  question word) + an italic English gloss, then a **dashed** divider before the
  answers.
- **Tiles** (2-up) / **chips** (3-up) — white, `--mid` border, a `--light`
  **bottom-edge ledge** standing in for a drop shadow (WeasyPrint can't do
  box-shadow). Padding tuned so the 2-up and 3-up shapes share a similar aspect
  ratio. te reo bold `--ink`, English small italic `--mid`.
- **Example / location rows** (`.wline`) — te reo left (particle bold black),
  English right (`--mid` italic), both leading with "…"; dotted row dividers.
- **Kupu rows** (`.kupurow`) — te reo bold `--ink` (+ optional ★) left, English
  `--mid` italic right, dotted dividers.
- **Phrases** (`.phrase`) — a `--light` left accent bar + te reo bold (+ ★) +
  English italic underneath.
- **Section label** (`.seclabel`) — small, uppercase, letter-spaced, `--mid`,
  **left-aligned**, sits inside its box.
- **Build-a-phrase equation** (`.bap`) — option column + curly brace + "+" + noun,
  for "combine these into a phrase" (Papa honohono beginner).
- **Pinned-bottom note** — Key kupu vocab note / attribution footer, absolutely
  positioned at the card's bottom edge.
- **Celebration** — large `--ink` bold te reo + italic English, centred in the
  space left below the content.

## WeasyPrint 61 constraints (why it's built this way)

- **No `box-shadow`** (silently dropped) → fake depth with a coloured bottom border.
- **Flexbox is unreliable for layout** → use **block flow** (full-width,
  predictable) + **CSS tables** (`display:table`/`table-cell`) for rows; `gap` and
  `calc()` are ignored.
- **2×2 grid** = `inline-block` tiles with `font-size:0` on the parent.
- **Centring**: horizontal via `text-align`; vertical only works via table-cell on
  a definite-height, non-absolute table (the cover) — otherwise use a **manual
  `margin-top`**. Pin-to-bottom via `position:absolute`.
- **Always verify on an oversized canvas with outlines** (`@page` larger than
  210×148 + `outline` on `.sheet`/`.card`/`.eq`) — a normal raster clips overflow
  at the page edge, so a broken layout can look fine.

## Layout patterns

- **Kupu lists max two-of-five.** A panel holds at most two kupu lists of five
  rows; box padding is tuned so 2 × 5 fit one A6 panel. This deliberately caps how
  much vocab a card carries.
- **Equation styles are a small library** — pick the one that fits the content:
  - _slot + tiles_ (Tākaro wai beginner) — fill one blank from 4 tiles.
  - _build-a-phrase brace_ (Papa honohono beginner) — option column **}** + noun,
    using the Amatic SC bracket image (rendered from `assets/AmaticSC-Regular.ttf`).
  - A chip-based variant of build-a-phrase is a possible future option.
- **The brace** is an embedded PNG of `}` in Amatic SC, tinted to `--mid`
  (~2.8 KB) — WeasyPrint draws it crisply and it survives in the artifact.

## Velcro

A ~15mm velcro dot holds the folded card shut, so:
- **Inside spread only**, on the **outer edge** of each panel (those edges meet
  when the card folds), at a **matched height** on both inside panels.
- Open a clear mid band by **floating one box to the bottom** (`.eq.loc`), and put
  the dot in that band. Doesn't need to be exactly centred — pick a clear spot.
- A faint dashed circle is printed as an assembly mark (kept on the final card).
- **Tight list panels may drop the pale box** entirely (saving its padding +
  margin) to free the vertical space for the band.

## Open conventions
