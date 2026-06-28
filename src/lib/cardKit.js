/**
 * src/lib/cardKit.js — HTML building blocks shared by every card.
 *
 * A per-card composer (src/cards/<slug>/<slug>.js) loads its content.json,
 * builds the four panels with these helpers (plus its own bespoke pieces),
 * and calls writeCard(). run.sh then renders the HTML to PDF with WeasyPrint.
 *
 * Geometry/styles live in src/lib/card.css; palette + per-card tunables are
 * injected as :root vars from content.json meta.{colour,layout}.
 */
const fs = require("fs");
const path = require("path");
const { renderBracket } = require("./renderBracket");

const ROOT = path.resolve(__dirname, "../..");
const CSS = fs.readFileSync(path.join(__dirname, "card.css"), "utf8");

// icon name -> inline SVG inner path(s) (Tabler outlines)
const ICONS = {
  droplet: '<path d="M6.8 11a6 6 0 1 0 10.4 0l-5.2 -8z"/>',
  puzzle:  '<path d="M4 7h3a1 1 0 0 0 1 -1v-1a2 2 0 0 1 4 0v1a1 1 0 0 0 1 1h3a1 1 0 0 1 1 1v3a1 1 0 0 0 1 1h1a2 2 0 0 1 0 4h-1a1 1 0 0 0 -1 1v3a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-1a2 2 0 0 0 -4 0v1a1 1 0 0 1 -1 1h-3a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1h1a2 2 0 0 0 0 -4h-1a1 1 0 0 1 -1 -1v-3a1 1 0 0 1 1 -1"/>',
};

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const STAR = ' <span class="star">★</span>';

function icon(name, colour) {
  const p = ICONS[name];
  if (!p) throw new Error(`Unknown icon "${name}" (have: ${Object.keys(ICONS).join(", ")})`);
  return `<svg viewBox="0 0 24 24" fill="none" stroke="${colour}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${p}</svg>`;
}

function header(data, { big = false } = {}) {
  const C = data.meta.colour;
  return `<div class="chead${big ? " big" : ""}"><div class="ic">${icon(data.meta.icon, "#" + C.mid)}</div>` +
    `<div class="t"><b>${esc(data.meta.name)}</b><span>${esc(data.meta.nameEnglish)}</span></div></div>\n<div class="cdiv"></div>`;
}

function cover(data) {
  return `<div class="card cover"><div class="covercell">\n` +
    `  <div class="circle">${icon(data.meta.icon, "#ffffff")}</div>\n` +
    `  <div class="ctitle">${esc(data.meta.name)}</div>\n` +
    `  <div class="csub">${esc(data.meta.nameEnglish.toUpperCase())}</div>\n` +
    `</div></div>`;
}

function celebrate(item) {
  return `<div class="celebrate"><b>${esc(item.maori)}</b><i>${esc(item.english)}</i></div>`;
}

// "rapu(a)" -> 'rapu<span class="tail">(a)</span>' (+ star if starred)
function headword(maori, starred = false) {
  const m = String(maori).match(/^(.*?)(\(.*\))?\s*$/);
  const base = esc(m[1]);
  const tail = m[2] ? `<span class="tail">${esc(m[2])}</span>` : "";
  return `<b>${base}</b>` + tail + (starred ? STAR : "");
}

function bracketImg(midColourHex) {
  return `<img class="brace-img" src="${renderBracket(midColourHex)}">`;
}

const card = (inner, cls = "") => `<div class="card${cls ? " " + cls : ""}">${inner}</div>`;
const sheet = (first, leftCard, rightCard) =>
  `<div class="sheet${first ? " first" : ""}"><div class="panel left">\n${leftCard}\n</div><div class="panel right">\n${rightCard}\n</div></div>`;

function doc(data, body) {
  const C = data.meta.colour, L = data.meta.layout || {};
  const vars = [`--ink:#${C.ink}`, `--mid:#${C.mid}`, `--light:#${C.light}`, `--box:#${C.box}`, `--note:#${C.note}`];
  for (const [k, v] of Object.entries({ "celebrate-gap": L.celebrateGap, "velcro-top": L.velcroTop, "cover-title": L.coverTitle, "cover-sub": L.coverSub }))
    if (v) vars.push(`--${k}:${v}`);
  return `<!doctype html>\n<html><head><meta charset="utf-8"><style>\n@page { size: 210mm 148mm; margin: 0; }\n:root{${vars.join(";")}}\n${CSS}</style></head><body>\n${body}\n</body></html>\n`;
}

function writeCard(data, sheet1, sheet2) {
  const body = sheet(true, sheet1.left, sheet1.right) + "\n" + sheet(false, sheet2.left, sheet2.right);
  const out = path.join(ROOT, "src", "cards", data.meta.slug, `${data.meta.slug}.html`);
  fs.writeFileSync(out, doc(data, body));
  console.log(`Wrote ${path.relative(ROOT, out)}`);
  return out;
}

module.exports = { esc, STAR, icon, header, cover, celebrate, headword, bracketImg, card, sheet, doc, writeCard };
