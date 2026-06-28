# Next steps

Handoff notes for the lanyard work.

_Last updated: 2026-06-28_

## Current state — new HTML→PDF pipeline is live

Both cards (**Tākaro wai**, **Papa honohono**) now build through one pipeline,
on branch `html-pdf-redesign`:

```
content.json  --(node composer)-->  <card>.html  --(WeasyPrint)-->  PDF
```

- **Build:** `./run.sh` (all cards) or `./run.sh wai-takaro` (one). No
  `npm install` / node_modules — composers use only Node built-ins. Runs
  directly in the repo.
- **Edit surface:** `src/cards/<card>/content.json` (words, palette, tunables).
  Change it and re-run, or ask Claude to.
- **Shared look:** `src/lib/card.css` (one stylesheet; palette + per-card
  tunables are `:root` CSS vars) + `src/lib/cardKit.js` (HTML helpers).
- **Design system:** `DESIGN.md` (components, rules, WeasyPrint constraints).
- **Committed artifact:** the generated `src/cards/<card>/<card>.html`
  (deterministic, browser-viewable, what WeasyPrint renders). The **PDF is a
  regenerable build output** — gitignored, because WeasyPrint randomises
  font-subset tags so PDFs aren't byte-stable. (If we decide we want a
  committed printable, revisit committing them and accept the churn.)

## One-time system requirements

- `node`
- `weasyprint` — `sudo apt-get install -y weasyprint`
- Carlito font (Calibri metric-twin) — `fonts-crosextra-carlito`
- `python3-pil` (Pillow) — renders the Amatic SC bracket from
  `assets/AmaticSC-Regular.ttf`
- `poppler-utils` — only for rasterising PDFs to preview/verify

## What's left

1. **Kaiako te reo pass** (small, content-only in `content.json`):
   - Tākaro wai: `mai te kapu` vs `mai i te kapu`; the `whakamākū … i te papa`
     example wording.
   - (The `Kei te pēhea` and `…ā, kei hea?` questions were already dropped on
     earlier reo advice.)
2. **Velcro physical spec** — the inside-spread guide circle is ~15mm at a
   matched height (wai 70mm, papa 68mm). Confirm the real dot diameter +
   placement; the guide is currently printed as an assembly mark.
3. **Papa inside-left asymmetry** — its kupu lists are de-boxed (to free the
   velcro band) while the phrases keep their box. Confirm that's fine or
   de-box the phrases too.
4. **Merge** `html-pdf-redesign` to `main` once happy; decide whether to keep
   the branch's history or squash.
5. **New cards** — add `src/cards/<slug>/{content.json, <slug>.js}` reusing
   cardKit; add an icon path to `ICONS` in `cardKit.js` if needed.
