const data = require("./content.json");
const { createCard } = require("../../lib/cardKit");

async function main() {
  const card = await createCard(data);
  const { C, M, PW, H, contentW, shapes } = card;

  // ─────────────────────────────────────────────
  // Bespoke equation boxes for this card
  // ─────────────────────────────────────────────

  // Beginner box (slide 1 left): a stem with a blank + grid of fill-in options.
  function beginnerEquation(slide, x, y, w, h, eq) {
    slide.addShape(shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.08, fill: { color: C.bg }, line: { color: C.bg, width: 0 },
    });
    slide.addText(eq.stem, {
      x: x + 0.2, y: y + 0.16, w: w - 0.4, h: 0.34,
      fontSize: 17, fontFace: "Calibri", bold: true, color: C.dark, align: "center", margin: 0,
    });
    slide.addText(eq.stemEnglish, {
      x: x + 0.2, y: y + 0.52, w: w - 0.4, h: 0.24,
      fontSize: 12, fontFace: "Calibri", italic: true, color: C.mid, align: "center", margin: 0,
    });
    // 2 x 2 grid of options
    const colW = (w - 0.4) / 2;
    const rowH = 0.56;
    const gridTop = y + 0.8;
    eq.options.forEach((opt, i) => {
      const col = i % 2, row = Math.floor(i / 2);
      const ox = x + 0.2 + col * colW;
      const oy = gridTop + row * rowH;
      slide.addText([
        { text: opt.maori,   options: { fontSize: 16, fontFace: "Calibri", bold: true, color: C.dark, breakLine: true } },
        { text: opt.english, options: { fontSize: 11, fontFace: "Calibri", italic: true, color: C.mid } },
      ], { x: ox, y: oy, w: colW, h: rowH, align: "center", margin: 0, valign: "top" });
    });
  }

  // Inside-left box: stem with a highlighted verb + numbered preposition options + result.
  function prepositionEquation(slide, x, y, w, h, eq) {
    slide.addShape(shapes.ROUNDED_RECTANGLE, {
      x, y, w, h, rectRadius: 0.08, fill: { color: C.bg }, line: { color: C.bg, width: 0 },
    });
    // Stem with the highlight word in mid colour
    const [before, after] = eq.stem.split(eq.highlightWord);
    slide.addText([
      { text: before, options: { color: C.dark } },
      { text: eq.highlightWord, options: { color: C.mid, bold: true } },
      { text: after, options: { color: C.dark } },
    ], {
      x: x + 0.18, y: y + 0.14, w: w - 0.36, h: 0.3,
      fontSize: 15, fontFace: "Calibri", bold: true, align: "center", margin: 0,
    });
    slide.addText(eq.stemEnglish, {
      x: x + 0.18, y: y + 0.44, w: w - 0.36, h: 0.22,
      fontSize: 11, fontFace: "Calibri", italic: true, color: C.mid, align: "center", margin: 0,
    });
    // Numbered options
    const optTop = y + 0.78;
    const optH = 0.4;
    const badge = 0.26;
    eq.options.forEach((opt, i) => {
      const oy = optTop + i * optH;
      slide.addShape(shapes.OVAL, {
        x: x + 0.22, y: oy, w: badge, h: badge,
        fill: { color: C.mid }, line: { color: C.mid, width: 0 },
      });
      slide.addText(String(opt.number), {
        x: x + 0.22, y: oy, w: badge, h: badge,
        fontSize: 12, fontFace: "Calibri", bold: true, color: "FFFFFF", align: "center", valign: "middle", margin: 0,
      });
      slide.addText([
        { text: opt.maori + "  ", options: { fontSize: 14, fontFace: "Calibri", bold: true, color: C.dark } },
        { text: opt.english,      options: { fontSize: 11, fontFace: "Calibri", italic: true, color: card.GRAY } },
      ], { x: x + 0.22 + badge + 0.12, y: oy, w: w - badge - 0.6, h: badge, valign: "middle", margin: 0 });
    });
    // Result line at the bottom of the box
    const resY = optTop + eq.options.length * optH + 0.06;
    slide.addText([
      { text: eq.footer.maori + "   ", options: { fontSize: 14, fontFace: "Calibri", bold: true, color: C.dark } },
      { text: eq.footer.english,       options: { fontSize: 11, fontFace: "Calibri", italic: true, color: C.mid } },
    ], { x: x + 0.22, y: resY, w: w - 0.44, h: 0.3, align: "center", margin: 0 });
  }

  // Inside-right: a verb with an example sentence underneath. Returns next y.
  function verbExample(slide, x, curY, item) {
    slide.addText([
      { text: item.maori + "  ", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.dark } },
      { text: item.english,      options: { fontSize: 12, fontFace: "Calibri", italic: true, color: card.GRAY } },
    ], { x: x + M, y: curY, w: contentW, h: 0.24, margin: 0 });
    slide.addText(item.example, {
      x: x + M + 0.06, y: curY + 0.24, w: contentW - 0.06, h: 0.22,
      fontSize: 10, fontFace: "Calibri", italic: true, color: C.mid, margin: 0,
    });
    slide.addShape(shapes.LINE, {
      x: x + M, y: curY + 0.5, w: contentW, h: 0,
      line: { color: C.light, width: 0.3, dashType: "dot" },
    });
    return curY + 0.56;
  }

  // ───────────────────────────────────────────── SLIDE 1: OUTSIDE
  const s1 = card.newSlide();
  card.centreFold(s1);

  // ── LEFT: beginner panel ──
  card.border(s1, 0);
  const headerDivY = card.beginnerHeader(s1);

  const bbY = headerDivY + 0.2, bbH = 2.0;
  beginnerEquation(s1, M, bbY, contentW, bbH, data.beginner.equation);

  const dividerY = bbY + bbH + 0.28;
  s1.addShape(shapes.LINE, { x: M, y: dividerY, w: contentW, h: 0, line: { color: C.light, width: 0.5 } });

  const remainingTop = dividerY + 0.08;
  const remainingBottom = H - 0.2;
  const celebMidY = remainingTop + (remainingBottom - remainingTop) / 2 - 0.3;
  s1.addText(data.beginner.celebration.maori, {
    x: M, y: celebMidY, w: contentW, h: 0.36,
    fontSize: 20, fontFace: "Calibri", bold: true, color: C.dark, align: "center", margin: 0,
  });
  s1.addText(data.beginner.celebration.english, {
    x: M, y: celebMidY + 0.34, w: contentW, h: 0.26,
    fontSize: 14, fontFace: "Calibri", italic: true, color: C.mid, align: "center", margin: 0,
  });

  // ── RIGHT: cover ──
  card.cover(s1);

  // ───────────────────────────────────────────── SLIDE 2: INSIDE
  const s2 = card.newSlide();
  card.centreFold(s2);

  // ── LEFT: nouns + preposition equation ──
  card.border(s2, 0);
  card.insideHeader(s2, 0);

  let curY = 0.82;
  card.sectionLabel(s2, 0, curY, "KUPU — NOUNS");
  curY += 0.26;
  for (const item of data.insideLeft.nouns) {
    curY = card.kupuRow(s2, 0, curY, item, contentW * 0.34, contentW * 0.34);
  }

  const ebY = curY + 0.2;
  const ebH = (H - 0.3) - ebY;
  prepositionEquation(s2, M, ebY, contentW, ebH, data.insideLeft.equation);

  // ── RIGHT: verbs (with examples) + describing words ──
  card.border(s2, PW);
  card.insideHeader(s2, PW);

  let curY2 = 0.82;
  card.sectionLabel(s2, PW, curY2, "KUPU MAHI — VERBS");
  curY2 += 0.26;
  for (const item of data.insideRight.verbs) {
    curY2 = verbExample(s2, PW, curY2, item);
  }

  curY2 += 0.12;
  card.sectionLabel(s2, PW, curY2, "KUPU ĀHUA — DESCRIBING");
  curY2 += 0.26;
  for (const item of data.insideRight.describingWords) {
    curY2 = card.kupuRow(s2, PW, curY2, item, contentW * 0.5, contentW * 0.5);
  }

  card.footer(s2, PW, data.meta.attribution); // null → skipped

  await card.finish(data.meta.slug);
}

main().catch(console.error);
