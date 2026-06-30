import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

if (!getApps().length) {
  let credentialConfig = null;

  // 1. Prioritize Environment Variables (Production / Google Cloud Run)
  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    credentialConfig = cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    });
  } else {
    // 2. Fallback to local serviceAccountKey.json if environment variables are not set (Local Dev)
    const serviceAccountPath = join(__dirname, '../serviceAccountKey.json');
    if (existsSync(serviceAccountPath)) {
      const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf8'));
      credentialConfig = cert(serviceAccount);
    } else {
      console.warn("⚠️ Warning: FIREBASE_PROJECT_ID/CLIENT_EMAIL/PRIVATE_KEY env vars not found and serviceAccountKey.json is missing. Attempting default Application Credentials...");
    }
  }

  initializeApp(credentialConfig ? { credential: credentialConfig } : {});
}

export const db = getFirestore();
