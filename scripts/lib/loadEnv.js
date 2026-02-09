import { existsSync, readFileSync } from 'fs';
import path from 'path';

function parseDotEnv(content) {
  const env = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;

    const eq = line.indexOf('=');
    if (eq === -1) continue;

    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (!key) continue;

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    env[key] = value;
  }
  return env;
}

/**
 * Carrega `.env` no `process.env` (sem depender de dotenv).
 * Mantém valores já definidos no ambiente.
 */
export function loadEnv({ cwd = process.cwd(), filename = '.env' } = {}) {
  const envPath = path.resolve(cwd, filename);
  if (!existsSync(envPath)) return;

  const content = readFileSync(envPath, 'utf8');
  const parsed = parseDotEnv(content);

  for (const [key, value] of Object.entries(parsed)) {
    if (process.env[key] == null) process.env[key] = value;
  }
}

