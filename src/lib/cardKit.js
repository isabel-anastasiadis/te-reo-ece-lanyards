/**
 * src/lib/cardKit.js
 *
 * Shared toolkit for building a lanyard card. Holds the layout primitives and
 * styling every card shares (border, headers, cover, kupu rows, phrases,
 * footer) plus setup/teardown: A5 layout, palette, icon + bracket rendering,
 * and reproducible output.
 *
 * A per-card script loads its content.json, calls createCard(data), then
 * composes the four panels using these primitives — including any bespoke
 * "equation" box, which lives in the card script because it differs per card.
 *
 * Geometry: A5 landscape (8.268" x 5.827"); each panel is the left/right half
 * (A6 portrait). For the right panel, add PW to every x. Coordinates match the
 * design spec (DESIGN_SPEC-style measurements).
 */
const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");
const { renderBracket } = require("./renderBracket");
const { normalizePptx } = require("./normalizePptx");

const ROOT = path.resolve(__dirname, "../..");

const W = 8.268;          // A5 landscape width
const H = 5.827;          // height
const PW = W / 2;         // panel (A6 portrait) width
const M = 0.22;           // inner margin
const contentW = PW - 2 * M;
const WHITE = "FFFFFF";
const GRAY = "666666";    // English translations + footer
const STAR = "★";

// "Papa honohono" -> "Papa Honohono"
function titleCase(s) {
  return s.replace(/\b\w/g, (c) => c.toUpperCase());
}

// "TbDroplet" -> require("react-icons/tb").TbDroplet
function resolveIcon(name) {
  const prefix = name.match(/^[A-Z][a-z0-9]*/)[0].toLowerCase();
  const Icon = require(`react-icons/${prefix}`)[name];
  if (!Icon) throw new Error(`Icon "${name}" not found in react-icons/${prefix}`);
  return Icon;
}

async function iconToBase64Png(IconComponent, color, size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}

async function createCard(data) {
  const C = data.meta.colour; // { dark, mid, light, bg }
  const Icon = resolveIcon(data.meta.icon);

  const pres = new pptxgen();
  pres.defineLayout({ name: "A5L", width: W, height: H });
  pres.layout = "A5L";
  pres.author = "Playcentre";
  const coverTitle = titleCase(data.meta.name);
  pres.title = `${coverTitle} - ${data.meta.nameEnglish}`;

  const iconMid = await iconToBase64Png(Icon, "#" + C.mid, 256);
  const iconWhite = await iconToBase64Png(Icon, "#ffffff", 256);

  // Bracket in this card's mid colour; cached to assets/bracket.b64 (gitignored).
  const bracketData = renderBracket("#" + C.mid);
  fs.writeFileSync(path.join(ROOT, "assets", "bracket.b64"), bracketData);

  return {
    pres, data, C, coverTitle,
    iconMid, iconWhite, bracketData,
    W, H, PW, M, contentW, WHITE, GRAY, STAR,
    shapes: pres.shapes,

    newSlide() {
      const s = pres.addSlide();
      s.background = { color: WHITE };
      return s;
    },

    centreFold(slide) {
      slide.addShape(pres.shapes.LINE, {
        x: PW, y: 0.1, w: 0, h: H - 0.2,
        line: { color: C.light, width: 0.5, dashType: "dash" },
      });
    },

    border(slide, x) {
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: x + 0.04, y: 0.04, w: PW - 0.08, h: H - 0.08,
        rectRadius: 0.15,
        fill: { color: WHITE, transparency: 100 },
        line: { color: C.mid, width: 4.5 },
      });
    },

    insideHeader(slide, x) {
      const iconSize = 0.42;
      slide.addImage({ data: iconMid, x: x + M, y: 0.16, w: iconSize, h: iconSize });
      slide.addText([
        { text: data.meta.name,        options: { fontSize: 15, fontFace: "Calibri", bold: true, color: C.dark, breakLine: true } },
        { text: data.meta.nameEnglish, options: { fontSize: 12, fontFace: "Calibri", color: C.mid } },
      ], { x: x + M + iconSize + 0.08, y: 0.14, w: 2.5, h: 0.5, margin: 0 });
      slide.addShape(pres.shapes.LINE, {
        x: x + M, y: 0.72, w: contentW, h: 0,
        line: { color: C.light, width: 0.5 },
      });
    },

    // Big header for the beginner (outside-back) panel. Returns the divider y.
    beginnerHeader(slide) {
      const bigIconSize = 0.55;
      const bigHeaderY = 0.18;
      slide.addImage({ data: iconMid, x: M, y: bigHeaderY, w: bigIconSize, h: bigIconSize });
      slide.addText([
        { text: data.meta.name,        options: { fontSize: 20, fontFace: "Calibri", bold: true, color: C.dark, breakLine: true } },
        { text: data.meta.nameEnglish, options: { fontSize: 14, fontFace: "Calibri", color: C.mid } },
      ], { x: M + bigIconSize + 0.1, y: bigHeaderY, w: 2.6, h: 0.62, margin: 0 });
      const headerDivY = bigHeaderY + 0.68;
      slide.addShape(pres.shapes.LINE, {
        x: M, y: headerDivY, w: contentW, h: 0,
        line: { color: C.light, width: 0.5 },
      });
      return headerDivY;
    },

    // Full cover panel (right side of slide 1): border + colour fill + icon + titles.
    cover(slide) {
      this.border(slide, PW);
      slide.addShape(pres.shapes.ROUNDED_RECTANGLE, {
        x: PW + 0.04, y: 0.04, w: PW - 0.08, h: H - 0.08,
        rectRadius: 0.15, fill: { color: C.mid }, line: { color: C.mid, width: 0 },
      });
      const circleSize = 1.0;
      const circleX = PW + (PW - circleSize) / 2;
      const circleY = 0.8;
      slide.addShape(pres.shapes.OVAL, {
        x: circleX, y: circleY, w: circleSize, h: circleSize,
        fill: { color: "FFFFFF", transparency: 80 },
        line: { color: "FFFFFF", width: 1.5, transparency: 50 },
      });
      slide.addImage({ data: iconWhite, x: circleX + 0.15, y: circleY + 0.15, w: circleSize - 0.3, h: circleSize - 0.3 });
      slide.addText(coverTitle, {
        x: PW, y: circleY + circleSize + 0.4, w: PW, h: 0.55,
        fontSize: 28, fontFace: "Calibri", bold: true, color: WHITE, align: "center", margin: 0,
      });
      slide.addText(data.meta.nameEnglish.toUpperCase(), {
        x: PW, y: circleY + circleSize + 0.92, w: PW, h: 0.3,
        fontSize: 16, fontFace: "Calibri", bold: true, color: WHITE, align: "center", charSpacing: 4, margin: 0,
      });
    },

    sectionLabel(slide, x, y, text) {
      slide.addText(text, {
        x: x + M, y, w: contentW, h: 0.22,
        fontSize: 11, fontFace: "Calibri", bold: true,
        color: C.mid, charSpacing: 1, margin: 0,
      });
    },

    // One kupu (vocab) row: te reo left, English right, dotted underline. Returns next y.
    kupuRow(slide, x, curY, item, maoriColW, englishX) {
      const rowH = 0.31;
      const parts = item.starred
        ? [{ text: item.maori + " ", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.dark } },
           { text: STAR,            options: { fontSize: 11, fontFace: "Calibri", color: C.mid } }]
        : [{ text: item.maori,      options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.dark } }];
      slide.addText(parts, { x: x + M, y: curY, w: maoriColW, h: rowH, margin: 0 });
      slide.addText(item.english, {
        x: x + englishX, y: curY, w: contentW - englishX + M, h: rowH,
        fontSize: 12, fontFace: "Calibri", italic: true, color: GRAY, align: "right", margin: 0,
      });
      slide.addShape(pres.shapes.LINE, {
        x: x + M, y: curY + rowH - 0.03, w: contentW, h: 0,
        line: { color: C.light, width: 0.3, dashType: "dot" },
      });
      return curY + rowH;
    },

    // One phrase block: accent bar + te reo + English. Returns next y.
    phrase(slide, x, curY, item) {
      const accentW = 0.03;
      const phraseX = x + M + accentW + 0.08;
      const phraseW = contentW - accentW - 0.08;
      const isLong = item.maori.length > 40;
      const maoriH = isLong ? 0.42 : 0.28;
      const englishH = 0.2;
      const blockH = maoriH + englishH;
      slide.addShape(pres.shapes.RECTANGLE, {
        x: x + M, y: curY, w: accentW, h: blockH - 0.04,
        fill: { color: C.light },
      });
      const parts = item.starred
        ? [{ text: item.maori + " ", options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.dark } },
           { text: STAR,            options: { fontSize: 11, fontFace: "Calibri", color: C.mid } }]
        : [{ text: item.maori,      options: { fontSize: 13, fontFace: "Calibri", bold: true, color: C.dark } }];
      slide.addText(parts, { x: phraseX, y: curY, w: phraseW, h: maoriH, margin: 0, valign: "top" });
      slide.addText(item.english, {
        x: phraseX, y: curY + maoriH - 0.06, w: phraseW, h: englishH,
        fontSize: 12, fontFace: "Calibri", italic: true, color: GRAY, margin: 0, valign: "top",
      });
      return curY + blockH + 0.1;
    },

    // Attribution footer (right panel of slide 2). Skip when attribution is null.
    footer(slide, x, attribution) {
      if (!attribution) return;
      const footerY = H - 0.54;
      slide.addShape(pres.shapes.LINE, { x: x + M, y: footerY, w: contentW, h: 0, line: { color: C.light, width: 0.5 } });
      slide.addText([
        { text: STAR + " ", options: { color: C.mid, fontSize: 8 } },
        { text: `${attribution} — ${coverTitle}`, options: { fontSize: 8, color: GRAY } },
      ], { x: x + M, y: footerY + 0.04, w: contentW, h: 0.44, margin: 0, valign: "top" });
    },

    async finish(slug) {
      const outFile = path.join(ROOT, "output", `${slug}-lanyard.pptx`);
      fs.mkdirSync(path.dirname(outFile), { recursive: true });
      await pres.writeFile({ fileName: outFile });
      await normalizePptx(outFile); // byte-reproducible for committing
      console.log(`Done! -> output/${slug}-lanyard.pptx`);
      return outFile;
    },
  };
}

module.exports = { createCard, W, H, PW, M, contentW, WHITE, GRAY, STAR };
