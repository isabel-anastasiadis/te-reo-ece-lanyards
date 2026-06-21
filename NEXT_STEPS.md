# Next steps

Handoff notes — picking up the lanyard work.

_Last updated: 2026-06-21_

## Where we got to

- **Phase 1 — DONE & committed.** Refactored `papa-honohono` onto a shared
  toolkit:
  - `src/lib/cardKit.js` — shared layout primitives + styling + setup/teardown
    (palette, icon, bracket, reproducible output).
  - `src/cards/papa-honohono/content.json` — the editable card data.
  - `src/cards/papa-honohono/papa-honohono.js` — thin composer.
  - Verified **byte-identical** to the previous output, so it was a pure
    refactor with no design change.

- **Phase 2 — wai-takaro v1, IN PROGRESS (committed, not yet reviewed).**
  - `src/cards/wai-takaro/content.json` — data (teal palette, `TbDroplet`,
    no attribution → no footer/stars).
  - `src/cards/wai-takaro/wai-takaro.js` — composer with three **bespoke**
    layouts that were a first attempt, not yet visually checked:
    1. Beginner panel: "fill-the-blank" stem (`Kei te ... te wai`) + 2×2 grid
       of options.
    2. Inside-left: numbered preposition equation (`rere` highlighted, options
       1/2/3 = i/mai/ki, result `...te kōrere`).
    3. Inside-right: verbs **with example sentences** + a describing-words
       section.
  - Generated `output/wai-takaro-lanyard.{pptx,pdf}`.

## Immediate next step: review wai-takaro visually

The layout math passed a bounds check, but it has **not been seen rendered**.
PDF rasterization needs poppler:

```bash
sudo apt-get install -y poppler-utils
```

Then render and look at both slides (or just open `output/wai-takaro-lanyard.pdf`
in Google Drive). Things to check / likely to need tweaking:

- Beginner 2×2 option grid — spacing/centring within the box.
- Numbered preposition box — badge alignment, vertical balance (lots of empty
  space at the bottom of the box right now; may want to centre the content).
- Verb-with-example rows — the longer examples
  (`Kei te whakakīia te kapu (ki te wai)`) may be tight; check they don't clip.
- Describing-words section near the bottom of the right panel — fits but is a
  bit tight (~5.19" of 5.53" usable).
- Inside-left noun glosses are long (`pipe / funnel / channel`); confirm the
  right-aligned English doesn't wrap/clip.

**Is there a takaro-wai mockup?** If one exists (e.g. in the Claude chat as
HTML), compare against it — the bespoke layouts above were inferred from the
design spec, not a mockup.

## After wai-takaro looks right

- Commit the reviewed version.
- Consider lifting the genuinely reusable bespoke pieces (numbered equation,
  verb-with-example) into `cardKit.js` if a third card needs them — keep
  one-off layouts in the card script until then.

## Reminders (how this repo works)

- **Run:** `./run.sh` builds ALL cards; `./run.sh wai-takaro` builds one.
  Always use `./run.sh` under WSL (it builds on the native FS to avoid
  `/mnt/c` corruption and forces the Linux node/npm/python toolchain).
- **Output is committed and reproducible:** `output/*.pptx` and `output/*.pdf`
  are byte-stable on this machine (normalized by `normalizePptx.js` /
  `normalize_pdf.py`), so a git diff only appears when a card actually changes.
- **Adding a card:** create `src/cards/<slug>/content.json` and
  `<slug>.js` (load JSON → `createCard` → compose with cardKit → `card.finish`).
  Any new card MUST go through `card.finish` (it calls normalizePptx).
- **One-time setup deps:**
  `sudo apt-get install -y npm python3-pil libreoffice-impress fonts-crosextra-carlito python3-pikepdf poppler-utils`
- **Spec:** the design spec the cards follow is in the conversation; consider
  saving it as `DESIGN_SPEC.md` if useful.
