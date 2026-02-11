/**
 * Generates logo192.png and logo512.png for PWA manifest (Lighthouse).
 * Sage green #87A96B = rgb(135, 169, 107)
 */
const fs = require('fs');
const path = require('path');
const { PNG } = require('pngjs');

const OUT_DIR = path.join(__dirname, '..', 'public');
const SAGE = { r: 135, g: 169, b: 107 };

function createPng(size) {
  const png = new PNG({ width: size, height: size });
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (size * y + x) << 2;
      png.data[i] = SAGE.r;
      png.data[i + 1] = SAGE.g;
      png.data[i + 2] = SAGE.b;
      png.data[i + 3] = 255;
    }
  }
  return png;
}

function writePngSync(png, filename) {
  const outPath = path.join(OUT_DIR, filename);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, PNG.sync.write(png));
  console.log('Written', outPath);
}

const png192 = createPng(192);
const png512 = createPng(512);
writePngSync(png192, 'logo192.png');
writePngSync(png512, 'logo512.png');
