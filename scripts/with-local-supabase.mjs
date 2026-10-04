#!/usr/bin/env node
/**
 * Roda um comando com as variáveis do Supabase LOCAL preenchidas
 * (SUPABASE_TEST_URL, SUPABASE_TEST_ANON_KEY, SUPABASE_TEST_SERVICE_KEY).
 *
 * Uso: node scripts/with-local-supabase.mjs <comando...>
 * Requer `npx supabase start` rodando.
 */
import { execSync, spawnSync } from "node:child_process";

let status;
try {
  status = execSync("npx supabase status -o env", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "ignore"],
  });
} catch {
  console.error("Supabase local não está rodando. Rode primeiro: npm run db:start");
  process.exit(1);
}

const vars = Object.fromEntries(
  status
    .split("\n")
    .map((l) => l.match(/^([A-Z_]+)="?([^"]*)"?$/))
    .filter(Boolean)
    .map((m) => [m[1], m[2]]),
);

const env = {
  ...process.env,
  SUPABASE_TEST_URL: vars.API_URL,
  SUPABASE_TEST_ANON_KEY: vars.ANON_KEY,
  SUPABASE_TEST_SERVICE_KEY: vars.SERVICE_ROLE_KEY,
  MAILPIT_URL: vars.MAILPIT_URL ?? vars.INBUCKET_URL,
};

const [cmd, ...args] = process.argv.slice(2);
const result = spawnSync("npx", [cmd, ...args], { stdio: "inherit", env });
process.exit(result.status ?? 1);
