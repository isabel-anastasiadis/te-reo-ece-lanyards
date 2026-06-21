const data = require("./content.json");
const { createCard } = require("../../lib/cardKit");

async function main() {
  const card = await createCard(data);
  const { C, M, PW, H, contentW, shapes } = card;

  // ───────────────────────────────────────────── SLIDE 1: OUTSIDE
  const s1 = card.newSlide();
  card.centreFold(s1);

  // ── LEFT: beginner panel ──
  card.border(s1, 0);
  const headerDivY = card.beginnerHeader(s1);

  const givingY = headerDivY + 0.14;
  card.sectionLabel(s1, 0, givingY, data.beginner.sectionLabel);

  // Build-a-phrase equation box (bespoke): verb options  {  +  noun
  const eq = data.beginner.equation;
  const bbX = M, bbY = givingY + 0.28, bbW = contentW, bbH = 2.0;
  s1.addShape(shapes.ROUNDED_RECTANGLE, {
    x: bbX, y: bbY, w: bbW, h: bbH, rectRadius: 0.08,
    fill: { color: C.bg }, line: { color: C.bg, width: 0 },
  });

  // Verb options column (each: te reo 20pt + English 13pt, blank line between)
  const verbRuns = [];
  eq.left.forEach((opt, i) => {
    const last = i === eq.left.length - 1;
    verbRuns.push({ text: opt.maori,   options: { fontSize: 20, fontFace: "Calibri", bold: true, color: C.dark, breakLine: true } });
    verbRuns.push({ text: opt.english, options: { fontSize: 13, fontFace: "Calibri", italic: true, color: C.mid, breakLine: !last } });
    if (!last) verbRuns.push({ text: " ", options: { fontSize: 8, breakLine: true } });
  });
  s1.addText(verbRuns, { x: bbX + 0.14, y: bbY + 0.2, w: 1.5, h: bbH - 0.35, margin: 0, valign: "middle" });

  // Bracket (Amatic SC rendered as image)
  s1.addImage({ data: card.bracketData, x: bbX + 1.74, y: bbY + 0.275, w: 0.36, h: bbH - 0.30 });

  // Plus sign
  s1.addText("+", {
    x: bbX + 2.025, y: bbY + 0.1, w: 0.24, h: bbH - 0.18,
    fontSize: 22, fontFace: "Calibri", bold: true, color: C.mid, align: "center", valign: "middle", margin: 0,
  });

  // Noun
  s1.addText([
    { text: eq.noun.maori,   options: { fontSize: 20, fontFace: "Calibri", bold: true, color: C.dark, breakLine: true } },
    { text: eq.noun.english, options: { fontSize: 13, fontFace: "Calibri", italic: true, color: C.mid } },
  ], { x: bbX + 2.34, y: bbY + 0.2, w: 1.4, h: bbH - 0.35, margin: 0, valign: "middle" });

  // Divider above the celebration phrase
  const dividerY = bbY + bbH + 0.28;
  s1.addShape(shapes.LINE, { x: M, y: dividerY, w: contentW, h: 0, line: { color: C.light, width: 0.5 } });

  // Celebration phrase, centred in remaining space
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

  // ── LEFT: kupu ──
  card.border(s2, 0);
  card.insideHeader(s2, 0);

  // Nouns
  let curY = 0.82;
  card.sectionLabel(s2, 0, curY, "KUPU — NOUNS");
  curY += 0.26;
  for (const item of data.insideLeft.nouns) {
    curY = card.kupuRow(s2, 0, curY, item, contentW * 0.6, contentW * 0.6);
  }

  // Verbs — pinned to bottom so the last dotted line aligns with the footer divider
  const verbs = data.insideLeft.verbs;
  const verbStartY = H - 0.54 - 0.26 - verbs.length * 0.31 + 0.03;
  card.sectionLabel(s2, 0, verbStartY, "KUPU MAHI — VERBS");
  let verbY = verbStartY + 0.26;
  for (const item of verbs) {
    verbY = card.kupuRow(s2, 0, verbY, item, contentW * 0.48, contentW * 0.42);
  }

  // ── RIGHT: phrases ──
  card.border(s2, PW);
  card.insideHeader(s2, PW);

  let curY2 = 0.82;
  card.sectionLabel(s2, PW, curY2, "KĪANGA — PHRASES");
  curY2 += 0.26;
  for (const item of data.insideRight.phrases) {
    curY2 = card.phrase(s2, PW, curY2, item);
  }

  // Attribution footer
  card.footer(s2, PW, data.meta.attribution);

  await card.finish(data.meta.slug);
}

main().catch(console.error);
