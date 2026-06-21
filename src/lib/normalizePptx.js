/**
 * src/lib/normalizePptx.js
 *
 * Makes a generated .pptx byte-reproducible so it can be committed and only
 * shows a git diff when the design actually changes.
 *
 * pptxgenjs stamps the current time into docProps/core.xml, and the zip stores
 * a modification date per entry — both vary between runs. This rewrites the
 * archive with a fixed timestamp and fixed per-entry dates, in a stable order.
 *
 * Usage (after pres.writeFile):
 *   const { normalizePptx } = require('../../lib/normalizePptx');
 *   await normalizePptx(outFile);
 */

const fs = require("fs");
const JSZip = require("jszip");

// Fixed point in time for all timestamps. Arbitrary but constant.
const FIXED_ISO = "2020-01-01T00:00:00Z";
const FIXED_DATE = new Date(FIXED_ISO);

async function normalizePptx(file) {
  const src = await JSZip.loadAsync(fs.readFileSync(file));
  const out = new JSZip();

  // Stable, sorted entry order for reproducible output.
  for (const name of Object.keys(src.files).sort()) {
    const entry = src.files[name];
    if (entry.dir) continue;

    let content = await entry.async("nodebuffer");

    if (name === "docProps/core.xml") {
      content = Buffer.from(
        content
          .toString("utf8")
          .replace(/(<dcterms:created[^>]*>)[^<]*(<\/dcterms:created>)/, `$1${FIXED_ISO}$2`)
          .replace(/(<dcterms:modified[^>]*>)[^<]*(<\/dcterms:modified>)/, `$1${FIXED_ISO}$2`),
        "utf8"
      );
    }

    out.file(name, content, { date: FIXED_DATE });
  }

  const result = await out.generateAsync({ type: "nodebuffer", compression: "STORE" });
  fs.writeFileSync(file, result);
}

module.exports = { normalizePptx };
