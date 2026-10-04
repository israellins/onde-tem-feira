#!/usr/bin/env node
/**
 * Gera os ícones PNG do app (PWA / Google Play / iOS) a partir de public/icon.svg.
 *
 * Uso:  npm run icons
 *
 * - icon-192.png / icon-512.png: ícones padrão ("any")
 * - maskable-512.png: com margem de segurança para Android recortar em círculo
 * - apple-touch-icon.png: 180x180 para iPhone
 */
import sharp from "sharp";
import { readFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const svg = readFileSync(join(root, "public/icon.svg"));
const out = join(root, "public/icons");
mkdirSync(out, { recursive: true });

async function plain(size, file) {
  await sharp(svg, { density: 384 }).resize(size, size).png().toFile(join(out, file));
}

async function maskable(size, file) {
  // Fundo sem cantos arredondados (o Android aplica a própria máscara);
  // o cesto já fica dentro da área segura de 80% do centro.
  const square = Buffer.from(svg.toString().replace(/rx="\d+"/, 'rx="0"'));
  await sharp(square, { density: 384 }).resize(size, size).png().toFile(join(out, file));
}

await plain(192, "icon-192.png");
await plain(512, "icon-512.png");
await maskable(512, "maskable-512.png");
await maskable(180, "apple-touch-icon.png");
console.log("Ícones gerados em public/icons/");
