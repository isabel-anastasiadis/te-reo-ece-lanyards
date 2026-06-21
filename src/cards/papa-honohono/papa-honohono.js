const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { TbPuzzle } = require("react-icons/tb");
const { renderBracket } = require("../../lib/renderBracket");
const { normalizePptx } = require("../../lib/normalizePptx");

// Repo root, resolved from this file's location (src/cards/<name>/<name>.js).
// Keeps asset/output paths correct no matter what directory we run from.
const ROOT = path.resolve(__dirname, "../../..");

// ─────────────────────────────────────────────
// Icon helpers
// ─────────────────────────────────────────────
function renderIconSvg(IconComponent, color, size = 256) {
  return ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = renderIconSvg(IconComponent, color, size);
  const pngBuffer = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + pngBuffer.toString("base64");
}

async function main() {
  const pres = new pptxgen();

  // A5 landscape = 210mm x 148mm = 8.268" x 5.827"
  const W = 8.268;
  const H = 5.827;
  const PW = W / 2;
  pres.defineLayout({ name: "A5L", width: W, height: H });
  pres.layout = "A5L";
  pres.author = "Playcentre";
  pres.title = "Papa Honohono - Puzzles";

  // ── Colour palette ──
  const AMBER_DARK  = "633806";
  const AMBER_MID   = "BA7517";
  const AMBER_LIGHT = "EF9F27";
  const AMBER_BG    = "FAEEDA";
  const WHITE       = "FFFFFF";
  const GRAY        = "666666";
  const STAR        = "★";
  const M           = 0.22; // inner margin

  const iconDataAmber = await iconToBase64Png(TbPuzzle, "#BA7517", 256);
  const iconDataWhite = await iconToBase64Png(TbPuzzle, "#ffffff", 256);

  // Generate the Amatic SC bracket fresh, then cache it to assets/bracket.b64.
  // The cached file is gitignored — regenerated on every run for repeatability.
  const bracketData = renderBracket("#" + AMBER_MID);
  fs.writeFileSync(path.join(ROOT, "assets", "bracket.b64"), bracketData);

  const contentW = PW - 2 * M;

  // ─────────────────────────────────────────────
  // Shared helpers
  // ─────────────────────────────────────────────
  function addBorder(slide, x) {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
      x: x + 0.04, y: 0.04, w: PW - 0.08, h: H - 0.08,
      rectRadius: 0.15,
      fill: { color: WHITE, transparency: 100 },
      line: { color: AMBER_MID, width: 4.5 }
    });
  }

  function addInsideHeader(slide, x) {
    const iconSize = 0.42;
    slide.addImage({ data: iconDataAmber, x: x + M, y: 0.16, w: iconSize, h: iconSize });
    slide.addText([
      { text: "Papa honohono", options: { fontSize: 15, fontFace: "Calibri", bold: true, color: AMBER_DARK, breakLine: true } },
      { text: "Puzzles",       options: { fontSize: 12, fontFace: "Calibri", color: AMBER_MID } }
    ], { x: x + M + iconSize + 0.08, y: 0.14, w: 2.5, h: 0.5, margin: 0 });
    slide.addShape(pres.shapes.LINE, {
      x: x + M, y: 0.72, w: contentW, h: 0,
      line: { color: AMBER_LIGHT, width: 0.5 }
    });
  }

  function addSectionLabel(slide, x, y, text) {
    slide.addText(text, {
      x: x + M, y, w: contentW, h: 0.22,
      fontSize: 11, fontFace: "Calibri", bold: true,
      color: AMBER_MID, charSpacing: 1, margin: 0
    });
  }

  function addKupuRow(slide, x, curY, maori, english, starred, maoriColW, englishX) {
    const rowH = 0.31;
    const textParts = starred
      ? [{ text: maori + " ", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: AMBER_DARK } },
         { text: STAR,        options: { fontSize: 11, fontFace: "Calibri", color: AMBER_MID } }]
      : [{ text: maori,       options: { fontSize: 13, fontFace: "Calibri", bold: true, color: AMBER_DARK } }];
    slide.addText(textParts, { x: x + M, y: curY, w: maoriColW, h: rowH, margin: 0 });
    slide.addText(english, {
      x: x + englishX, y: curY, w: contentW - englishX + M, h: rowH,
      fontSize: 12, fontFace: "Calibri", italic: true, color: GRAY, align: "right", margin: 0
    });
    slide.addShape(pres.shapes.LINE, {
      x: x + M, y: curY + rowH - 0.03, w: contentW, h: 0,
      line: { color: AMBER_LIGHT, width: 0.3, dashType: "dot" }
    });
    return curY + rowH;
  }

  function addPhrase(slide, x, curY, maori, english, starred) {
    const accentW = 0.03;
    const phraseX = x + M + accentW + 0.08;
    const phraseW = contentW - accentW - 0.08;
    const isLong = maori.length > 40;
    const maoriH = isLong ? 0.42 : 0.28;
    const englishH = 0.2;
    const blockH = maoriH + englishH;
    slide.addShape(pres.shapes.RECTANGLE, {
      x: x + M, y: curY, w: accentW, h: blockH - 0.04,
      fill: { color: AMBER_LIGHT }
    });
    const maoriParts = starred
      ? [{ text: maori + " ", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: AMBER_DARK } },
         { text: STAR,        options: { fontSize: 11, fontFace: "Calibri", color: AMBER_MID } }]
      : [{ text: maori,       options: { fontSize: 13, fontFace: "Calibri", bold: true, color: AMBER_DARK } }];
    slide.addText(maoriParts, { x: phraseX, y: curY, w: phraseW, h: maoriH, margin: 0, valign: "top" });
    slide.addText(english, {
      x: phraseX, y: curY + maoriH - 0.06, w: phraseW, h: englishH,
      fontSize: 12, fontFace: "Calibri", italic: true, color: GRAY, margin: 0, valign: "top"
    });
    return curY + blockH + 0.1;
  }

  // ─────────────────────────────────────────────
  // SLIDE 1: OUTSIDE
  // ─────────────────────────────────────────────
  const s1 = pres.addSlide();
  s1.background = { color: WHITE };

  // Centre fold guide
  s1.addShape(pres.shapes.LINE, {
    x: PW, y: 0.1, w: 0, h: H - 0.2,
    line: { color: AMBER_LIGHT, width: 0.5, dashType: "dash" }
  });

  // ── LEFT: beginner panel ──
  addBorder(s1, 0);

  // Header (~2x size)
  const bigIconSize = 0.55;
  const bigHeaderY  = 0.18;
  s1.addImage({ data: iconDataAmber, x: M, y: bigHeaderY, w: bigIconSize, h: bigIconSize });
  s1.addText([
    { text: "Papa honohono", options: { fontSize: 20, fontFace: "Calibri", bold: true, color: AMBER_DARK, breakLine: true } },
    { text: "Puzzles",       options: { fontSize: 14, fontFace: "Calibri", color: AMBER_MID } }
  ], { x: M + bigIconSize + 0.1, y: bigHeaderY, w: 2.6, h: 0.62, margin: 0 });
  const headerDivY = bigHeaderY + 0.68;
  s1.addShape(pres.shapes.LINE, {
    x: M, y: headerDivY, w: contentW, h: 0,
    line: { color: AMBER_LIGHT, width: 0.5 }
  });

  // "Giving instructions" section label
  const givingY = headerDivY + 0.14;
  s1.addText("GIVING INSTRUCTIONS", {
    x: M, y: givingY, w: contentW, h: 0.22,
    fontSize: 11, fontFace: "Calibri", bold: true,
    color: AMBER_MID, charSpacing: 1, margin: 0
  });

  // Build-a-phrase block
  const bbX = M;
  const bbY = givingY + 0.28;
  const bbW = contentW;
  const bbH = 2.0;
  s1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: bbX, y: bbY, w: bbW, h: bbH,
    rectRadius: 0.08,
    fill: { color: AMBER_BG },
    line: { color: AMBER_BG, width: 0 }
  });

  // Verbs column
  s1.addText([
    { text: "hurihia",     options: { fontSize: 20, fontFace: "Calibri", bold: true, color: AMBER_DARK, breakLine: true } },
    { text: "turn it",     options: { fontSize: 13, fontFace: "Calibri", italic: true, color: AMBER_MID, breakLine: true } },
    { text: " ",           options: { fontSize: 8, breakLine: true } },
    { text: "nekenekehia", options: { fontSize: 20, fontFace: "Calibri", bold: true, color: AMBER_DARK, breakLine: true } },
    { text: "wiggle it",   options: { fontSize: 13, fontFace: "Calibri", italic: true, color: AMBER_MID } },
  ], { x: bbX + 0.14, y: bbY + 0.2, w: 1.5, h: bbH - 0.35, margin: 0, valign: "middle" });

  // Bracket (Amatic SC rendered as image)
  s1.addImage({ data: bracketData, x: bbX + 1.74, y: bbY + 0.275, w: 0.36, h: bbH - 0.30 });

  // Plus sign
  s1.addText("+", {
    x: bbX + 2.025, y: bbY + 0.1, w: 0.24, h: bbH - 0.18,
    fontSize: 22, fontFace: "Calibri", bold: true, color: AMBER_MID, align: "center", valign: "middle", margin: 0
  });

  // Noun
  s1.addText([
    { text: "te piriri", options: { fontSize: 20, fontFace: "Calibri", bold: true, color: AMBER_DARK, breakLine: true } },
    { text: "the piece", options: { fontSize: 13, fontFace: "Calibri", italic: true, color: AMBER_MID } },
  ], { x: bbX + 2.34, y: bbY + 0.2, w: 1.4, h: bbH - 0.35, margin: 0, valign: "middle" });

  // Divider above koia
  const dividerY = bbY + bbH + 0.28;
  s1.addShape(pres.shapes.LINE, { x: M, y: dividerY, w: contentW, h: 0, line: { color: AMBER_LIGHT, width: 0.5 } });

  // Koia kei a koe — centred in remaining space, no star
  const remainingTop    = dividerY + 0.08;
  const remainingBottom = H - 0.2;
  const koiaMidY        = remainingTop + (remainingBottom - remainingTop) / 2 - 0.3;
  s1.addText("Koia kei a koe!", {
    x: M, y: koiaMidY, w: contentW, h: 0.36,
    fontSize: 20, fontFace: "Calibri", bold: true, color: AMBER_DARK, align: "center", margin: 0
  });
  s1.addText("You got it!", {
    x: M, y: koiaMidY + 0.34, w: contentW, h: 0.26,
    fontSize: 14, fontFace: "Calibri", italic: true, color: AMBER_MID, align: "center", margin: 0
  });

  // ── RIGHT: amber cover ──
  addBorder(s1, PW);
  s1.addShape(pres.shapes.ROUNDED_RECTANGLE, {
    x: PW + 0.04, y: 0.04, w: PW - 0.08, h: H - 0.08,
    rectRadius: 0.15,
    fill: { color: AMBER_MID },
    line: { color: AMBER_MID, width: 0 }
  });

  const circleSize = 1.0;
  const circleX    = PW + (PW - circleSize) / 2;
  const circleY    = 0.8;
  s1.addShape(pres.shapes.OVAL, {
    x: circleX, y: circleY, w: circleSize, h: circleSize,
    fill: { color: "FFFFFF", transparency: 80 },
    line: { color: "FFFFFF", width: 1.5, transparency: 50 }
  });
  s1.addImage({ data: iconDataWhite, x: circleX + 0.15, y: circleY + 0.15, w: circleSize - 0.3, h: circleSize - 0.3 });

  s1.addText("Papa Honohono", {
    x: PW, y: circleY + circleSize + 0.4, w: PW, h: 0.55,
    fontSize: 28, fontFace: "Calibri", bold: true, color: WHITE, align: "center", margin: 0
  });
  s1.addText("PUZZLES", {
    x: PW, y: circleY + circleSize + 0.92, w: PW, h: 0.3,
    fontSize: 16, fontFace: "Calibri", bold: true, color: WHITE, align: "center", charSpacing: 4, margin: 0
  });

  // ─────────────────────────────────────────────
  // SLIDE 2: INSIDE
  // ─────────────────────────────────────────────
  const s2 = pres.addSlide();
  s2.background = { color: WHITE };

  s2.addShape(pres.shapes.LINE, {
    x: PW, y: 0.1, w: 0, h: H - 0.2,
    line: { color: AMBER_LIGHT, width: 0.5, dashType: "dash" }
  });

  // ── LEFT: kupu ──
  addBorder(s2, 0);
  addInsideHeader(s2, 0);

  // Nouns
  let curY = 0.82;
  addSectionLabel(s2, 0, curY, "KUPU — NOUNS");
  curY += 0.26;

  const nouns = [
    ["papa honohono", "puzzle", true],
    ["piriri",        "piece",  true],
    ["āhua",     "shape",  true],
    ["tapa",          "edge",   false],
    ["kokonga",       "corner", false],
  ];
  for (const [m, e, s] of nouns) {
    curY = addKupuRow(s2, 0, curY, m, e, s, contentW * 0.6, contentW * 0.6);
  }

  // Verbs — pinned to bottom, aligned with footer divider on phrases side
  const verbRowH    = 0.31;
  const verbs = [
    ["rapu(a)",            "search",                    false],
    ["huri(hia)",          "turn it",                   true],
    ["hurirapa(tia)",      "turn upside down, over, up", true],
    ["nekeneke(hia)",      "wiggle / jiggle",            false],
    ["whakanō(hia)",  "place it",                   true],
  ];
  const verbSectionH = 0.26 + verbs.length * verbRowH;
  // Align last dotted line with footer divider (H - 0.54)
  const verbStartY = H - 0.54 - 0.26 - verbs.length * verbRowH + 0.03;

  addSectionLabel(s2, 0, verbStartY, "KUPU MAHI — VERBS");
  let verbY = verbStartY + 0.26;
  for (const [m, e, s] of verbs) {
    verbY = addKupuRow(s2, 0, verbY, m, e, s, contentW * 0.48, contentW * 0.42);
  }

  // ── RIGHT: phrases ──
  addBorder(s2, PW);
  addInsideHeader(s2, PW);

  let curY2 = 0.82;
  addSectionLabel(s2, PW, curY2, "KĪANGA — PHRASES");
  curY2 += 0.26;

  const phrases = [
    ["Rapua ngā kokonga.",                               "Find the corners.",                      false],
    ["Kua kitea!",                                             "Found it!",                              false],
    ["Paku hurihia anō.",                                 "Turn it just a little more.",            false],
    ["Karawhiua!",                                             "Give it a go!",                          false],
    ["Koia kei a koe!",                                        "You got it!",                            true],
  ];
  for (const [m, e, s] of phrases) {
    curY2 = addPhrase(s2, PW, curY2, m, e, s);
  }

  // Attribution footer
  const footerY = H - 0.54;
  s2.addShape(pres.shapes.LINE, { x: PW + M, y: footerY, w: contentW, h: 0, line: { color: AMBER_LIGHT, width: 0.5 } });
  s2.addText([
    { text: STAR + " ", options: { color: AMBER_MID, fontSize: 8 } },
    { text: "Ki te Hoe: Indigenising Practice (Williams & Te Rongopatahi, 2023, Ako Aotearoa) — Papa Honohono", options: { fontSize: 8, color: GRAY } }
  ], { x: PW + M, y: footerY + 0.04, w: contentW, h: 0.44, margin: 0, valign: "top" });

  const outFile = path.join(ROOT, "output", "papa-honohono-lanyard.pptx");
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  await pres.writeFile({ fileName: outFile });
  await normalizePptx(outFile); // make output byte-reproducible for committing
  console.log("Done! -> output/papa-honohono-lanyard.pptx");
}

main().catch(console.error);
