#!/usr/bin/env node
/**
 * Gera a migration SQL que carrega (ou atualiza) o catálogo de feiras no
 * Supabase a partir de src/data/feiras.json.
 *
 * Uso:  npm run db:gerar-carga
 *
 * A migration usa "upsert": rodar de novo atualiza as feiras existentes sem
 * apagar as que vieram de sugestões aprovadas pela comunidade.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const { feiras } = JSON.parse(readFileSync(join(root, "src/data/feiras.json"), "utf8"));

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);
const arr = (a) => `array[${a.map(q).join(",")}]::text[]`;

const rows = feiras.map(
  (f) =>
    `  (${[
      q(f.id),
      q(f.name),
      q(f.city),
      q(f.neighborhood),
      f.lat,
      f.lng,
      arr(f.daysOfWeek),
      q(f.hours),
      q(f.address),
      q(f.source),
      q(f.accuracy),
      f.verified ? "true" : "false",
    ].join(", ")})`,
);

const sql = `-- Gerado por scripts/generate-feiras-migration.mjs — não edite à mão.
-- Fonte: src/data/feiras.json (${feiras.length} feiras)

insert into public.feiras
  (id, name, city, neighborhood, lat, lng, days_of_week, hours, address, source, accuracy, verified)
values
${rows.join(",\n")}
on conflict (id) do update set
  name = excluded.name,
  city = excluded.city,
  neighborhood = excluded.neighborhood,
  lat = excluded.lat,
  lng = excluded.lng,
  days_of_week = excluded.days_of_week,
  hours = excluded.hours,
  address = excluded.address,
  source = excluded.source,
  accuracy = excluded.accuracy,
  verified = excluded.verified;
`;

const out = join(root, "supabase/migrations/20261004120100_carga_feiras.sql");
writeFileSync(out, sql);
console.log(`Migration gerada com ${feiras.length} feiras: ${out}`);
