/**
 * Tākaro wai — composes the card HTML from content.json using cardKit,
 * then writeCard() emits src/cards/wai-takaro/wai-takaro.html.
 * Render to PDF via run.sh (WeasyPrint).
 */
const data = require("./content.json");
const ck = require("../../lib/cardKit");
const { esc } = ck;

// te reo question with the question-word styled per its answers (chip vs text)
function question(q) {
  const w = q.style === "chip"
    ? `<span class="qchip">${esc(q.word)}</span>`
    : `<span class="target">${esc(q.word)}</span>`;
  return `<div class="ask"><b>${esc(q.pre)}${w}${esc(q.post)}</b>` +
    `<span class="sub"><span class="ew">${esc(q.englishWord)}</span>${esc(q.englishRest)}</span></div>`;
}

// ── Sheet 1 left: beginner slot equation ──
function beginnerCard() {
  const b = data.beginner;
  const tiles = b.tiles.map(t => `<div class="tile"><b>${esc(t.maori)}</b><i>${esc(t.english)}</i></div>`).join("");
  const inner = ck.header(data, { big: true }) +
    `<div class="eq">` +
      `<div class="answerline">${esc(b.frame.pre)} <span class="slot">?</span> ${esc(b.frame.post)}</div>` +
      `<div class="answersub">${esc(b.translation)} <span class="ublank"></span></div>` +
      `<div class="qadiv"></div>` +
      `<div class="grid2">${tiles}</div>` +
    `</div>` +
    ck.celebrate(b.celebration);
  return ck.card(inner);
}

// ── Sheet 2 left: aha te wai (question + chips, floated location list, key kupu) ──
function ahaTeWaiCard() {
  const a = data.ahaTeWai;
  const chips = a.chips.map(c => `<div class="chip"><b>${esc(c.maori)}</b><i>${esc(c.english)}</i></div>`).join("");
  const locs = a.locations.map((l, i) => {
    const last = i === a.locations.length - 1 ? " last" : "";
    return `<div class="wline${last}"><span class="mi">…<b>${esc(l.prep)}</b> ${esc(l.place)}</span>` +
      `<span class="en">…<b>${esc(l.englishPrep)}</b> ${esc(l.englishPlace)}</span></div>`;
  }).join("");
  const k = a.keyKupu;
  const inner = ck.header(data) +
    `<div class="eq">${question(a.question)}<div class="qadiv"></div><div class="chips">${chips}</div></div>` +
    `<div class="eq loc">${locs}</div>` +
    `<div class="kupu"><div class="lbl">Key kupu</div>` +
      `<div class="krow"><span class="kl">${esc(k.word)}</span><span class="kr">${esc(k.meanings)}</span></div></div>`;
  return ck.card(inner);
}

// ── Sheet 2 right: aha koe (verb list with examples) ──
function ahaKoeCard() {
  const a = data.ahaKoe;
  const verbs = a.verbs.map((v, i) => {
    const last = i === a.verbs.length - 1 ? " last" : "";
    const ex = esc(v.example).replace(/\{(.+?)\}/g, '<span class="target">$1</span>');
    return `<div class="vrow${last}"><div class="vh">${ck.headword(v.maori)} <i>${esc(v.gloss)}</i></div><div class="eg">${ex}</div></div>`;
  }).join("");
  const inner = ck.header(data) +
    `<div class="eq">${question(a.question)}<div class="vlist">${verbs}</div></div>`;
  return ck.card(inner);
}

ck.writeCard(data,
  { left: beginnerCard(),  right: ck.cover(data) },
  { left: ahaTeWaiCard(),  right: ahaKoeCard() });
