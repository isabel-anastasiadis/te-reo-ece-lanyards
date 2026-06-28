/**
 * lib/renderBracket.js
 *
 * Renders a curly bracket "}" using Amatic SC via Python/Pillow and returns a
 * base64 PNG **data URI** ready for an HTML <img src>. Autocropped to the glyph
 * so it scales cleanly. Cached per colour in assets/ (gitignored).
 *
 * Requires: Python 3 with Pillow, and assets/AmaticSC-Regular.ttf
 */
const { execSync } = require("child_process");
const fs = require("fs");
const os = require("os");
const path = require("path");

const ROOT = path.resolve(__dirname, "../..");
const FONT_PATH = path.join(ROOT, "assets", "AmaticSC-Regular.ttf");

function renderBracket(colour = "#BA7517") {
  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(`Font not found at ${FONT_PATH} (AmaticSC-Regular.ttf)`);
  }
  const cache = path.join(ROOT, "assets", `bracket-${colour.slice(1)}.b64`);
  if (fs.existsSync(cache)) return fs.readFileSync(cache, "utf8");

  const r = parseInt(colour.slice(1, 3), 16);
  const g = parseInt(colour.slice(3, 5), 16);
  const b = parseInt(colour.slice(5, 7), 16);

  const script = `from PIL import Image, ImageDraw, ImageFont
import base64, io
img = Image.new('RGBA', (80, 400), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
font = ImageFont.truetype(r'${FONT_PATH}', 320)
draw.text((-10, -30), '}', font=font, fill=(${r}, ${g}, ${b}, 255))
img = img.crop(img.getbbox())
buf = io.BytesIO(); img.save(buf, format='PNG')
print('data:image/png;base64,' + base64.b64encode(buf.getvalue()).decode(), end='')`;

  const tmp = path.join(os.tmpdir(), `bracket_${process.pid}.py`);
  fs.writeFileSync(tmp, script);
  try {
    const uri = execSync(`python3 ${tmp}`).toString();
    fs.writeFileSync(cache, uri);
    return uri;
  } finally {
    fs.unlinkSync(tmp);
  }
}

module.exports = { renderBracket };
