import { existsSync, readFileSync } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

function resolveServiceAccountPath() {
  // scripts/lib/firebaseAdmin.js -> repoRoot/.secrets/serviceAccountKey.json
  const here = path.dirname(fileURLToPath(import.meta.url));
  return path.resolve(here, '../../.secrets/serviceAccountKey.json');
}

export function initFirebaseAdmin() {
  const apps = getApps();
  if (apps.length) {
    const app = apps[0];
    return { app, db: getFirestore(app) };
  }

  const serviceAccountPath = resolveServiceAccountPath();
  const hasServiceAccount = existsSync(serviceAccountPath);

  const credential = hasServiceAccount
    ? cert(JSON.parse(readFileSync(serviceAccountPath, 'utf8')))
    : applicationDefault();

  const app = initializeApp({ credential });
  const db = getFirestore(app);

  return { app, db, serviceAccountPath, hasServiceAccount };
}

