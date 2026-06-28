/**
 * Papa honohono — composes the card HTML from content.json using cardKit,
 * then writeCard() emits src/cards/papa-honohono/papa-honohono.html.
 * Render to PDF via run.sh (WeasyPrint).
 */
const data = require("./content.json");
const ck = require("../../lib/cardKit");
const { esc } = ck;
const C = data.meta.colour;

// ── Sheet 1 left: beginner build-a-phrase ──
function beginnerCard() {
  const eq = data.beginner.equation;
  const verbs = eq.left.map(o => `<div class="vopt"><b>${esc(o.maori)}</b><i>${esc(o.english)}</i></div>`).join("");
  const bap =
    `<div class="bap">` +
      `<div class="bap-verbs">${verbs}</div>` +
      `<div class="bap-brace">${ck.bracketImg("#" + C.mid)}</div>` +
      `<div class="bap-plus">+</div>` +
      `<div class="bap-noun"><b>${esc(eq.noun.maori)}</b><i>${esc(eq.noun.english)}</i></div>` +
    `</div>`;
  const inner = ck.header(data, { big: true }) +
    `<div class="eq beg"><div class="seclabel">${esc(data.beginner.sectionLabel)}</div>${bap}</div>` +
    ck.celebrate(data.beginner.celebration);
  return ck.card(inner);
}

// ── Sheet 2 left: two kupu lists (de-boxed; 2nd floated to the bottom) ──
function kupuList(items, label, extraCls) {
  const rows = items.map((it, i) => {
    const last = i === items.length - 1 ? " last" : "";
    return `<div class="kupurow${last}"><span class="km">${ck.headword(it.maori, it.starred)}</span><span class="ke">${esc(it.english)}</span></div>`;
  }).join("");
  return `<div class="eq list${extraCls}"><div class="seclabel">${esc(label)}</div>${rows}</div>`;
}
function kupuCard() {
  const inner = ck.header(data) +
    kupuList(data.insideLeft.nouns, "Kupu — nouns", "") +
    kupuList(data.insideLeft.verbs, "Kupu mahi — verbs", " foot");
  return ck.card(inner);
}

// ── Sheet 2 right: phrases + attribution footer ──
function phrasesCard() {
  const phrases = data.insideRight.phrases.map(p =>
    `<div class="phrase"><div class="pm">${esc(p.maori)}${p.starred ? ck.STAR : ""}</div><div class="pe">${esc(p.english)}</div></div>`
  ).join("");
  const footer = data.meta.attribution
    ? `<div class="footer"><span class="star">★</span> ${esc(data.meta.attribution)}</div>` : "";
  const inner = ck.header(data) +
    `<div class="eq"><div class="seclabel">Kīanga — phrases</div>${phrases}</div>` + footer;
  return ck.card(inner);
}

ck.writeCard(data,
  { left: beginnerCard(), right: ck.cover(data) },
  { left: kupuCard(),     right: phrasesCard() });
