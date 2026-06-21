/**
 * lib/renderBracket.js
 *
 * Renders a curly bracket { using Amatic SC font via Python/Pillow,
 * returning a base64 PNG data URI ready for pptxgenjs addImage().
 *
 * Requires:
 *   - Python 3 with Pillow installed (pip install Pillow)
 *   - assets/AmaticSC-Regular.ttf
 *
 * Usage (from a card script at src/cards/<name>/<name>.js):
 *   const { renderBracket } = require('../../lib/renderBracket');
 *   const bracketData = renderBracket('#BA7517'); // amber
 *   const bracketData = renderBracket('#1D9E75'); // teal
 */

const { execSync } = require("child_process");
const fs   = require("fs");
const os   = require("os");
const path = require("path");

const FONT_PATH = path.resolve(__dirname, "../../assets/AmaticSC-Regular.ttf");

/**
 * Render a { bracket in the given hex colour.
 * @param {string} colour - Hex colour e.g. '#BA7517'
 * @returns {string} base64 data URI for use with pptxgenjs addImage()
 */
function renderBracket(colour = "#BA7517") {
  if (!fs.existsSync(FONT_PATH)) {
    throw new Error(
      `Font not found at ${FONT_PATH}\n` +
      "Download from: https://raw.githubusercontent.com/google/fonts/main/ofl/amaticsc/AmaticSC-Regular.ttf"
    );
  }

  const r = parseInt(colour.slice(1, 3), 16);
  const g = parseInt(colour.slice(3, 5), 16);
  const b = parseInt(colour.slice(5, 7), 16);

  const script = `from PIL import Image, ImageDraw, ImageFont
import base64, io
W, H = 80, 400
img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
draw = ImageDraw.Draw(img)
font = ImageFont.truetype(r'${FONT_PATH}', 320)
draw.text((-10, -30), '}', font=font, fill=(${r}, ${g}, ${b}, 255))
buf = io.BytesIO()
img.save(buf, format='PNG')
b64 = base64.b64encode(buf.getvalue()).decode()
print('image/png;base64,' + b64, end='')`;

  const tmpScript = path.join(os.tmpdir(), `bracket_${Date.now()}.py`);
  fs.writeFileSync(tmpScript, script);
  try {
    return execSync(`python3 ${tmpScript}`).toString();
  } finally {
    fs.unlinkSync(tmpScript);
  }
}

module.exports = { renderBracket };
