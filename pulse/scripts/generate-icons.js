#!/usr/bin/env node
// Draws the PULSE logo (a thin circle with a heartbeat line) into the app's icon and splash PNGs.
// Pure Node: no packages, so nothing native is added. Run with: node scripts/generate-icons.js
//
// The logo's shape must match src/components/Logo.tsx (LOGO_HEARTBEAT and LOGO_STROKE_RATIO).

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const HEARTBEAT = [
  [0.14, 0.52],
  [0.36, 0.52],
  [0.42, 0.44],
  [0.47, 0.56],
  [0.53, 0.22],
  [0.6, 0.76],
  [0.66, 0.52],
  [0.86, 0.52],
];
const STROKE_RATIO = 0.035;
const BACKGROUND = [0x0b, 0x0e, 0x11]; // bgBottom
const WHITE = [0xff, 0xff, 0xff];
const SAMPLES = 4; // 4×4 samples per pixel for smooth edges

function distanceToSegment(px, py, [ax, ay], [bx, by]) {
  const dx = bx - ax;
  const dy = by - ay;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy)));
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

// Is this point on the logo? The logo fills a `logoSize` square starting at (`offset`, `offset`).
function onLogo(x, y, logoSize, offset) {
  const half = (logoSize * STROKE_RATIO) / 2;
  const radius = logoSize / 2 - logoSize * STROKE_RATIO;
  const center = offset + logoSize / 2;
  if (Math.abs(Math.hypot(x - center, y - center) - radius) <= half) return true;
  const points = HEARTBEAT.map(([px, py]) => [offset + px * logoSize, offset + py * logoSize]);
  for (let i = 0; i < points.length - 1; i++) {
    if (distanceToSegment(x, y, points[i], points[i + 1]) <= half) return true;
  }
  return false;
}

// Returns RGBA pixels: the logo in `color` over `background` (or transparent when null).
function render(size, logoScale, color, background) {
  const pixels = Buffer.alloc(size * size * 4);
  const logoSize = size * logoScale;
  const offset = (size - logoSize) / 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hits = 0;
      for (let sy = 0; sy < SAMPLES; sy++) {
        for (let sx = 0; sx < SAMPLES; sx++) {
          if (onLogo(x + (sx + 0.5) / SAMPLES, y + (sy + 0.5) / SAMPLES, logoSize, offset)) hits++;
        }
      }
      const coverage = hits / (SAMPLES * SAMPLES);
      const i = (y * size + x) * 4;
      if (background === null) {
        pixels.set([...color, Math.round(coverage * 255)], i);
      } else {
        const mix = (channel) => Math.round(background[channel] + (color[channel] - background[channel]) * coverage);
        pixels.set([mix(0), mix(1), mix(2), 255], i);
      }
    }
  }
  return pixels;
}

const CRC_TABLE = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) c = CRC_TABLE[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

function encodePng(size, rgba) {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(size, 0);
  header.writeUInt32BE(size, 4);
  header.set([8, 6, 0, 0, 0], 8); // 8-bit RGBA, no interlace
  const rows = Buffer.alloc(size * (size * 4 + 1));
  for (let y = 0; y < size; y++) rgba.copy(rows, y * (size * 4 + 1) + 1, y * size * 4, (y + 1) * size * 4);
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', header),
    chunk('IDAT', zlib.deflateSync(rows)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

const OUTPUTS = [
  { file: 'icon.png', size: 1024, scale: 0.62, color: WHITE, background: BACKGROUND },
  { file: 'splash-icon.png', size: 512, scale: 1, color: WHITE, background: null },
  // Android crops adaptive icons to a circle, so the logo stays inside the middle 66%.
  { file: 'android-icon-foreground.png', size: 1024, scale: 0.5, color: WHITE, background: null },
  { file: 'android-icon-monochrome.png', size: 1024, scale: 0.5, color: WHITE, background: null },
  { file: 'android-icon-background.png', size: 1024, scale: 0, color: WHITE, background: BACKGROUND },
  { file: 'favicon.png', size: 48, scale: 0.8, color: WHITE, background: BACKGROUND },
];

const outputDir = path.join(__dirname, '..', 'assets', 'images');
for (const output of OUTPUTS) {
  const pixels = render(output.size, output.scale, output.color, output.background);
  fs.writeFileSync(path.join(outputDir, output.file), encodePng(output.size, pixels));
  console.log(`wrote assets/images/${output.file} (${output.size}×${output.size})`);
}
