/**
 * Génère les icônes de la PWA (public/icons/) à partir d'un dessin SVG
 * créé pour KODI : carré nuit, lettre K, point vert (comme le logo de l'app).
 * Rendu par Chromium (Playwright). Usage : node scripts/icons.mjs
 * Aucune image ni police tierce : police système sans empattement.
 */
import { writeFileSync } from "node:fs";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const { chromium } = require("@playwright/test");

const NIGHT = "#101b30";
const GREEN = "#32c89a";

/** padding : marge de sécurité des icônes « maskable » (zone utile centrale de 80 %). */
function svg(size, { padding = 0, rounded = true } = {}) {
  const inner = size * (1 - 2 * padding);
  const offset = size * padding;
  const radius = rounded ? size * 0.22 : 0;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${NIGHT}"/>
  <text x="${offset + inner * 0.5}" y="${offset + inner * 0.7}" text-anchor="middle" font-family="DejaVu Sans, Arial, Helvetica, sans-serif" font-weight="700" font-size="${inner * 0.62}" fill="#ffffff">K</text>
  <circle cx="${offset + inner * 0.84}" cy="${offset + inner * 0.16}" r="${inner * 0.065}" fill="${GREEN}"/>
</svg>`;
}

const targets = [
  { file: "icon-192.png", size: 192, options: {} },
  { file: "icon-512.png", size: 512, options: {} },
  { file: "icon-maskable-512.png", size: 512, options: { padding: 0.1, rounded: false } },
  { file: "apple-touch-icon.png", size: 180, options: { rounded: false } },
];

const browser = await chromium.launch({ executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH || undefined });
for (const { file, size, options } of targets) {
  const page = await browser.newPage({ viewport: { width: size, height: size } });
  await page.setContent(`<html><body style="margin:0;background:transparent">${svg(size, options)}</body></html>`);
  writeFileSync(`public/icons/${file}`, await page.screenshot({ omitBackground: true, clip: { x: 0, y: 0, width: size, height: size } }));
  await page.close();
  process.stdout.write(`${file}\n`);
}
await browser.close();
